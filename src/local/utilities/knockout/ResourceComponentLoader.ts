/// <amd-dependency path="./KnockoutOverrides" />

import ResourceScope = require("@ms/odsp-utilities/lib/resources/ResourceScope");
import Disposable from '../../base/Disposable';
import ViewModel = require('../../base/ViewModel');
import ko = require("knockout");

var COMPONENT_ID = 0;

class ResourceComponentLoader {
    static COMPONENT_SCOPE_KEY = "__ResourceComponentLoader$resources";
    static COMPONENT_NAME_KEY = "__ResourceComponentLoader$componentName";
    static COMPONENT_ID_KEY = "__ResourceComponentLoader$componentId";
    static COMPONENT_CHILD_COMPONENTS_KEY = "__ResourceComponentLoader$childComponents";
    static COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY = "__ResourceComponentLoader$parentComponentViewModel";
    static COMPONENT_BINDING_ELEMENT = "__ResourceComponentLoader$componentBindingElement";

    public static loadViewModel<T extends ViewModel>(name: string, templateConfig: (new (params: any) => T) | { createViewModel: (params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) => T; }, callback: (createViewModel: (params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) => T) => void) {
        callback((params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) => {
            // Get the context within which the component is being created. This context should
            // have a reference to a parent component.
            var bindingContext: KnockoutBindingContext = ko.contextFor(componentInfo.element);

            var parentScope: ResourceScope = (params && ko.utils.unwrapObservable<ResourceScope>(params.resources)) || this.getCurrentResourceScope(bindingContext) || null;

            params = ko.utils.extend({}, params || {});

            var resourceScope: ResourceScope = params.resources = new ResourceScope(parentScope);

            var viewModel: T;

            if (templateConfig['createViewModel'] instanceof Function) {
                // Create the view model using the factory function, passing the resources in the parameters.
                viewModel = (<{ createViewModel: (params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) => T; }>templateConfig).createViewModel(params, componentInfo);
            } else {
                // Create the view model by injecting the type with the resource scope.
                viewModel = new (resourceScope.injected(<new (params: any) => T>templateConfig))(params);
            }

            // Create component id
            viewModel[this.COMPONENT_ID_KEY] = COMPONENT_ID++;

            // Create component id
            viewModel[this.COMPONENT_BINDING_ELEMENT] = componentInfo.element;

            // Create child component hash
            viewModel[this.COMPONENT_CHILD_COMPONENTS_KEY] = {};

            // Attach the resource scope to the component since the component will be put into the binding.
            viewModel[this.COMPONENT_SCOPE_KEY] = resourceScope;

            // Attach the component name to the view model.
            viewModel[this.COMPONENT_NAME_KEY] = name;

            this.addToParentComponentContext(viewModel, bindingContext);

            return Disposable.hook(viewModel, () => {
                this.removeFromParentComponentContext(viewModel, bindingContext);

                resourceScope.dispose();
            });
        });
    }

    public static getCurrentResourceScope(bindingContext: KnockoutBindingContext): ResourceScope {
        var resourceScope: ResourceScope = null;
        var viewModel: any = null;

        if (bindingContext && bindingContext.$data && bindingContext.$data.resources) {
            return bindingContext.$data.resources;
        }

        // Find the closest component binding that has an associated resource scope.
        while ((!(viewModel = bindingContext.$data) || (typeof (viewModel) !== "object") || !(resourceScope = viewModel[ResourceComponentLoader.COMPONENT_SCOPE_KEY])) && bindingContext.$parentContext) {
            bindingContext = bindingContext.$parentContext;
        }

        return resourceScope;
    }

    private static findParentComponentContext(viewModel: any, bindingContext: KnockoutBindingContext) {
        // Find the closest component binding that has an associated component.
        while (bindingContext) {
            if (bindingContext.$data && bindingContext.$data !== viewModel && bindingContext.$data[ResourceComponentLoader.COMPONENT_NAME_KEY]) {
                return bindingContext;
            }

            bindingContext = bindingContext.$parentContext;
        }

        return null;
    }

    private static addToParentComponentContext(viewModel: any, bindingContext: KnockoutBindingContext) {
        var parentBindingContext = this.findParentComponentContext(viewModel, bindingContext);

        if (parentBindingContext) {
            var parentViewModel = parentBindingContext.$data;
            viewModel[this.COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY] = parentViewModel;

            var childComponents = parentViewModel[this.COMPONENT_CHILD_COMPONENTS_KEY];

            childComponents[viewModel[this.COMPONENT_ID_KEY]] = viewModel;
        }
    }

    private static removeFromParentComponentContext(viewModel: any, bindingContext: KnockoutBindingContext) {
        var parentViewModel = viewModel[this.COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY];
        if (parentViewModel) {
            var childComponents = parentViewModel[this.COMPONENT_CHILD_COMPONENTS_KEY];

            if (childComponents && childComponents[viewModel[this.COMPONENT_ID_KEY]]) {
                delete childComponents[viewModel[this.COMPONENT_ID_KEY]];
            }

            // Clear other reference
            viewModel[this.COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY] = null;
            viewModel[this.COMPONENT_CHILD_COMPONENTS_KEY] = null;
            viewModel[this.COMPONENT_BINDING_ELEMENT] = null;
        }
    }
}

// Give the component loader the highest order of precedence.
ko.components.loaders.unshift(ResourceComponentLoader);

export = ResourceComponentLoader;

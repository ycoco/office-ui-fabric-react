/// <amd-dependency path="./KnockoutOverrides" />

import { ResourceScope } from '@ms/odsp-utilities/lib/resources/Resources';
import Disposable from '../../base/Disposable';
import ViewModel = require('../../base/ViewModel');
import IViewModelParams = require('../../base/IViewModelParams');
import ko = require("knockout");

let componentId = 0;

class ResourceComponentLoader {
    public static COMPONENT_SCOPE_KEY = "__ResourceComponentLoader$resources";
    public static COMPONENT_NAME_KEY = "__ResourceComponentLoader$componentName";
    public static COMPONENT_ID_KEY = "__ResourceComponentLoader$componentId";
    public static COMPONENT_CHILD_COMPONENTS_KEY = "__ResourceComponentLoader$childComponents";
    public static COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY = "__ResourceComponentLoader$parentComponentViewModel";
    public static COMPONENT_BINDING_ELEMENT = "__ResourceComponentLoader$componentBindingElement";

    public static loadViewModel<T extends ViewModel>(name: string, templateConfig: (new (params: IViewModelParams) => T) | { createViewModel: (params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) => T; }, callback: (createViewModel: (params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) => T) => void) {
        callback((params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) => {
            // Get the context within which the component is being created. This context should
            // have a reference to a parent component.
            const bindingContext: KnockoutBindingContext = ko.contextFor(componentInfo.element);

            const parentScope: ResourceScope = (params && ko.utils.unwrapObservable<ResourceScope>(params.resources)) || this.getCurrentResourceScope(bindingContext) || undefined;

            params = ko.utils.extend({}, params || {});

            const resourceScope: ResourceScope = params.resources = new ResourceScope(parentScope);

            let viewModel: T;

            if (templateConfig['createViewModel'] instanceof Function) {
                // Create the view model using the factory function, passing the resources in the parameters.
                viewModel = (<{ createViewModel: (params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) => T; }>templateConfig).createViewModel(params, componentInfo);
            } else {
                // Create the view model by injecting the type with the resource scope.
                viewModel = new (resourceScope.injected(<new (params: any) => T>templateConfig))(params);
            }

            // Create component id
            viewModel[this.COMPONENT_ID_KEY] = componentId++;

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
        let resourceScope: ResourceScope;
        let viewModel: any;

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
    }

    private static addToParentComponentContext(viewModel: any, bindingContext: KnockoutBindingContext) {
        const parentBindingContext = this.findParentComponentContext(viewModel, bindingContext);

        if (parentBindingContext) {
            const parentViewModel = parentBindingContext.$data;
            viewModel[this.COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY] = parentViewModel;

            const childComponents = parentViewModel[this.COMPONENT_CHILD_COMPONENTS_KEY];

            childComponents[viewModel[this.COMPONENT_ID_KEY]] = viewModel;
        }
    }

    private static removeFromParentComponentContext(viewModel: any, bindingContext: KnockoutBindingContext) {
        const parentViewModel = viewModel[this.COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY];

        if (parentViewModel) {
            const childComponents = parentViewModel[this.COMPONENT_CHILD_COMPONENTS_KEY];

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

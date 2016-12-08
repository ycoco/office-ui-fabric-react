
import './KnockoutOverrides';

import { ResourceScope, IInjectedOptions } from '@ms/odsp-utilities/lib/resources/Resources';
import Disposable from '../../base/Disposable';
import ViewModel = require('../../base/ViewModel');
import IViewModelParams = require('../../base/IViewModelParams');
import ko = require("knockout");

let componentId = 0;

export type CreateViewModel<T> = (params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) => T;

export interface IViewModelFactory<T> {
    createViewModel: CreateViewModel<T>;
}

function isViewModelFactory<T>(templateConfig: (new (params: any) => T) | IViewModelFactory<T>): templateConfig is IViewModelFactory<T> {
    return typeof templateConfig['createViewModel'] === 'function';
}

export type ITemplateConfig<T> = (new (params: IViewModelParams) => T) | IViewModelFactory<T>;

export const COMPONENT_NAME_KEY = "__ResourceComponentLoader$componentName";
export const COMPONENT_ID_KEY = "__ResourceComponentLoader$componentId";
export const COMPONENT_CHILD_COMPONENTS_KEY = "__ResourceComponentLoader$childComponents";
export const COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY = "__ResourceComponentLoader$parentComponentViewModel";
export const COMPONENT_BINDING_ELEMENT = "__ResourceComponentLoader$componentBindingElement";

export function loadViewModel<T extends ViewModel>(name: string, templateConfig: ITemplateConfig<T>, callback: (createViewModel: CreateViewModel<T>) => void) {
    callback((params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) => {
        // Get the context within which the component is being created. This context should
        // have a reference to a parent component.
        const bindingContext: KnockoutBindingContext = ko.contextFor(componentInfo.element);

        const parentScope: ResourceScope = (params && ko.utils.unwrapObservable<ResourceScope>(params.resources)) || getCurrentResourceScope(bindingContext);

        params = params ? ko.utils.extend({}, params) : {};

        const resourceScopeOptions: IInjectedOptions = {
            owner: name
        };

        let viewModel: T;
        if (isViewModelFactory(templateConfig)) {
            // Create the view model using the factory function, passing the resources in the parameters.
            params.resources = parentScope ? new ResourceScope(parentScope, resourceScopeOptions) : new ResourceScope({
                owner: name,
                useFactoriesOnKeys: true
            });
            viewModel = templateConfig.createViewModel(params, componentInfo);
        } else if (parentScope) {
            // Create the view model by injecting the type with the resource scope.
            resourceScopeOptions.injectChildResourceScope = true;
            viewModel = new (parentScope.injected(templateConfig, resourceScopeOptions))(params);
        } else {
            viewModel = new (new ResourceScope(resourceScopeOptions).injected(templateConfig))(params);
        }

        const resourceScope = viewModel.resources;

        // Create component id
        viewModel[COMPONENT_ID_KEY] = componentId++;

        // Create component id
        viewModel[COMPONENT_BINDING_ELEMENT] = componentInfo.element;

        // Create child component hash
        viewModel[COMPONENT_CHILD_COMPONENTS_KEY] = {};

        // Attach the component name to the view model.
        viewModel[COMPONENT_NAME_KEY] = name;

        addToParentComponentContext(viewModel, bindingContext);

        return Disposable.hook(viewModel, () => {
            removeFromParentComponentContext(viewModel, bindingContext);

            resourceScope.dispose();
        });
    });
}

export function getCurrentResourceScope(bindingContext: KnockoutBindingContext): ResourceScope {
    let resourceScope: ResourceScope;
    let viewModel: any;

    if (bindingContext && bindingContext.$data && bindingContext.$data.resources) {
        return bindingContext.$data.resources;
    }

    // Find the closest component binding that has an associated resource scope.
    while ((!(viewModel = bindingContext.$data) || (typeof (viewModel) !== "object") || !(resourceScope = viewModel.resources)) && bindingContext.$parentContext) {
        bindingContext = bindingContext.$parentContext;
    }

    return resourceScope;
}

function findParentComponentContext(viewModel: any, bindingContext: KnockoutBindingContext) {
    // Find the closest component binding that has an associated component.
    while (bindingContext) {
        if (bindingContext.$data && bindingContext.$data !== viewModel && bindingContext.$data[COMPONENT_NAME_KEY]) {
            return bindingContext;
        }

        bindingContext = bindingContext.$parentContext;
    }
}

function addToParentComponentContext(viewModel: any, bindingContext: KnockoutBindingContext) {
    const parentBindingContext = findParentComponentContext(viewModel, bindingContext);

    if (parentBindingContext) {
        const parentViewModel = parentBindingContext.$data;
        viewModel[COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY] = parentViewModel;

        const childComponents = parentViewModel[COMPONENT_CHILD_COMPONENTS_KEY];

        childComponents[viewModel[COMPONENT_ID_KEY]] = viewModel;
    }
}

function removeFromParentComponentContext(viewModel: any, bindingContext: KnockoutBindingContext) {
    const parentViewModel = viewModel[COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY];

    if (parentViewModel) {
        const childComponents = parentViewModel[COMPONENT_CHILD_COMPONENTS_KEY];

        if (childComponents && childComponents[viewModel[COMPONENT_ID_KEY]]) {
            delete childComponents[viewModel[COMPONENT_ID_KEY]];
        }

        // Clear other reference
        viewModel[COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY] = null;
        viewModel[COMPONENT_CHILD_COMPONENTS_KEY] = null;
        viewModel[COMPONENT_BINDING_ELEMENT] = null;
    }
}

export const loader: KnockoutComponentTypes.Loader = {
    loadViewModel: loadViewModel
};

// Give the component loader the highest order of precedence.
ko.components.loaders.unshift(loader);

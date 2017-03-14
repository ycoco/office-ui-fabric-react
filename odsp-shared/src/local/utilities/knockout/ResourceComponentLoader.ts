
import './KnockoutOverrides';

import { ResourceScope, IInjectedOptions, IRootResourceScopeOptions } from '@ms/odsp-utilities/lib/resources/Resources';
import { hook } from '@ms/odsp-utilities/lib/disposable/Disposable';
import ViewModel, { IViewModelParams } from '../../base/ViewModel';
import AutomationHelper from './AutomationHelper';
import * as ko from 'knockout';

export type CreateViewModel<T> = (params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) => T;

export interface IViewModelFactory<T> {
    createViewModel: CreateViewModel<T>;
}

function isViewModelFactory<T>(templateConfig: (new (params: any) => T) | IViewModelFactory<T>): templateConfig is IViewModelFactory<T> {
    return typeof templateConfig['createViewModel'] === 'function';
}

export type ITemplateConfig<T> = (new (params: IViewModelParams) => T) | IViewModelFactory<T>;

export function loadViewModel<T extends ViewModel>(name: string, templateConfig: ITemplateConfig<T>, callback: (createViewModel: CreateViewModel<T>) => void) {
    callback((params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) => {
        // Get the context within which the component is being created. This context should
        // have a reference to a parent component.
        const bindingContext: KnockoutBindingContext = ko.contextFor(componentInfo.element);

        const parentScope: ResourceScope = (params && ko.utils.unwrapObservable<ResourceScope>(params.resources)) || getCurrentResourceScope(bindingContext);

        params = params ? { ...params } : {};

        const childScopeOptions: IInjectedOptions = {
            owner: name,
            injectChildResourceScope: true
        };
        const rootScopeOptions: IRootResourceScopeOptions = {
            owner: name,
            useFactoriesOnKeys: true
        };

        let viewModel: T;
        if (isViewModelFactory(templateConfig)) {
            // Create the view model using the factory function, passing the resources in the parameters.
            params.resources = parentScope ? new ResourceScope(parentScope, childScopeOptions) : new ResourceScope(rootScopeOptions);
            viewModel = templateConfig.createViewModel(params, componentInfo);
        } else if (parentScope) {
            // Create the view model by injecting the type with the resource scope.
            viewModel = new (parentScope.injected(templateConfig, childScopeOptions))(params);
        } else {
            viewModel = new (new ResourceScope(rootScopeOptions).injected(templateConfig))(params);
        }

        const resourceScope = viewModel.resources;

        const automationHelper = new AutomationHelper({
            name: name,
            viewModel: viewModel,
            element: componentInfo.element,
            bindingContext: bindingContext
        });

        return hook(viewModel, () => {
            automationHelper.dispose();

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

export const loader: KnockoutComponentTypes.Loader = {
    loadViewModel: loadViewModel
};

// Give the component loader the highest order of precedence.
ko.components.loaders.unshift(loader);

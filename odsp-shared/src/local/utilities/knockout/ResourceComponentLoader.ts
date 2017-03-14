
import './KnockoutOverrides';

import { ResourceScope, IRootResourceScopeOptions } from '@ms/odsp-utilities/lib/resources/Resources';
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
    callback((params: IViewModelParams = {}, componentInfo: KnockoutComponentTypes.ComponentInfo) => {
        // Get the context within which the component is being created. This context should
        // have a reference to a parent component.
        const bindingContext: KnockoutBindingContext = ko.contextFor(componentInfo.element);

        const parentScope = ko.utils.unwrapObservable(params.resources) || getCurrentResourceScope(bindingContext);

        const scopeOptions: IRootResourceScopeOptions = {
            owner: name,
            useFactoriesOnKeys: true
        };

        const resources = parentScope ?
            new ResourceScope(parentScope, scopeOptions) :
            new ResourceScope(scopeOptions);

        // Copy the params and update with the final resources.
        params = {
            ...params,
            resources: resources
        };

        let viewModel: T;

        if (isViewModelFactory(templateConfig)) {
            // Create the view model using the factory fun
            viewModel = templateConfig.createViewModel(params, componentInfo);
        } else {
            viewModel = new (resources.injected(templateConfig))(params);
        }

        const automationHelper = new AutomationHelper({
            name: name,
            viewModel: viewModel,
            element: componentInfo.element,
            bindingContext: bindingContext
        });

        return hook(viewModel, () => {
            automationHelper.dispose();

            resources.dispose();
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

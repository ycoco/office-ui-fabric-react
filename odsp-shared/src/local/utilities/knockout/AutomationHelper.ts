
import { IDisposable } from '@ms/odsp-utilities/lib/disposable/Disposable';

// Export these key types to ensure their consistency, since automation will rely on them.
export type ComponentNameKey = '__ResourceComponentLoader$componentName';
export type ComponentIdKey = '__ResourceComponentLoader$componentId';
export type ComponentChildComponentsKey = '__ResourceComponentLoader$childComponents';
export type ComponentParentComponentViewModelKey = '__ResourceComponentLoader$parentComponentViewModel';
export type ComponentBindingElementKey = '__ResourceComponentLoader$componentBindingElement';

const COMPONENT_NAME_KEY: ComponentNameKey = '__ResourceComponentLoader$componentName';
const COMPONENT_ID_KEY: ComponentIdKey = '__ResourceComponentLoader$componentId';
const COMPONENT_CHILD_COMPONENTS_KEY: ComponentChildComponentsKey = '__ResourceComponentLoader$childComponents';
const COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY: ComponentParentComponentViewModelKey = '__ResourceComponentLoader$parentComponentViewModel';
const COMPONENT_BINDING_ELEMENT_KEY: ComponentBindingElementKey = '__ResourceComponentLoader$componentBindingElement';

export type IAutomationModel = {
    [P in ComponentNameKey]?: string;
} & {
    [P in ComponentIdKey]?: string;
} & {
    [P in ComponentChildComponentsKey]?: {
        [componentId: string]: IAutomationModel;
    }
} & {
    [P in ComponentParentComponentViewModelKey]?: IAutomationModel;
} & {
    [P in ComponentBindingElementKey]?: Node;
};

export interface IAutomationHelperParams {
    name: string;
    viewModel: IAutomationModel;
    element: Node;
    bindingContext: KnockoutBindingContext;
}

let lastComponentId = 0;

export default class AutomationHelper implements IDisposable {
    private _viewModel: IAutomationModel;
    private _parentViewModel: IAutomationModel;

    constructor(params: IAutomationHelperParams) {
        const viewModel = this._viewModel = params.viewModel;

        const componentId = viewModel[COMPONENT_ID_KEY] = `${++lastComponentId}`;
        viewModel[COMPONENT_BINDING_ELEMENT_KEY] = params.element;
        viewModel[COMPONENT_CHILD_COMPONENTS_KEY] = {};
        viewModel[COMPONENT_NAME_KEY] = params.name;

        let parentBindingContext = params.bindingContext;

        while (parentBindingContext && !(
            parentBindingContext.$data &&
            parentBindingContext.$data !== viewModel &&
            parentBindingContext.$data[COMPONENT_CHILD_COMPONENTS_KEY])) {
            parentBindingContext = parentBindingContext.$parentContext;
        }

        if (parentBindingContext) {
            const parentViewModel = this._parentViewModel = parentBindingContext.$data;

            parentViewModel[COMPONENT_CHILD_COMPONENTS_KEY][componentId] = viewModel;
            viewModel[COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY] = parentViewModel;
        }
    }

    public dispose(): void {
        const viewModel = this._viewModel;
        const parentViewModel = this._parentViewModel;

        const id = viewModel[COMPONENT_ID_KEY];

        const childComponents = parentViewModel && parentViewModel[COMPONENT_CHILD_COMPONENTS_KEY];

        if (id && childComponents) {
            delete childComponents[id];
        }

        if (viewModel) {
            delete viewModel[COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY];
            delete viewModel[COMPONENT_CHILD_COMPONENTS_KEY];
            delete viewModel[COMPONENT_BINDING_ELEMENT_KEY];
            delete viewModel[COMPONENT_NAME_KEY];
        }
    }
}

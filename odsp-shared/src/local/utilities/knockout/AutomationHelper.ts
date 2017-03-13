
import { IDisposable } from '@ms/odsp-utilities/lib/disposable/Disposable';

const COMPONENT_NAME_KEY = '__ResourceComponentLoader$componentName';
const COMPONENT_ID_KEY = '__ResourceComponentLoader$componentId';
const COMPONENT_CHILD_COMPONENTS_KEY = '__ResourceComponentLoader$childComponents';
const COMPONENT_PARENT_COMPONENT_VIEWMODEL_KEY = '__ResourceComponentLoader$parentComponentViewModel';
const COMPONENT_BINDING_ELEMENT_KEY = '__ResourceComponentLoader$componentBindingElement';

export interface IAutomationModel {
    '__ResourceComponentLoader$componentName'?: string;
    '__ResourceComponentLoader$componentId'?: string;
    '__ResourceComponentLoader$childComponents'?: {
        [componentId: string]: IAutomationModel;
    };
    '__ResourceComponentLoader$parentComponentViewModel'?: IAutomationModel;
    '__ResourceComponentLoader$componentBindingElement'?: Node;
}

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

        if (childComponents) {
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

// OneDrive:IgnoreCodeCoverage

import BaseModel, { IBaseModelParams, IBaseModelDependencies } from './BaseModel';
import { format } from '@ms/odsp-utilities/lib/string/StringHelper';
import IKnockoutBindingHandlers = require("../utilities/knockout/IKnockoutBindingHandlers");
import AutomationBinding = require("../bindings/automation/AutomationBinding");
import AutomationTypeBinding = require("../bindings/automation/AutomationTypeBinding");
import { extend } from '@ms/odsp-utilities/lib/object/ObjectUtil';

export interface IViewModelParams extends IBaseModelParams {
    automationId?: string;
}

export interface IViewModelDependencies extends IBaseModelDependencies {
    // Nothing added.
}

/**
 * ViewModel is a BaseModel subclass that encapsulates anything view model sepecific. ViewModels subclass from this.
 */
export class ViewModel extends BaseModel {
    /**
     * Used for WebDriver automated tests. Should be globally unique.
     */
    public automationId: string;

    /**
     * A mapping of keys (to be used by the view) to static binding handler classes.
     */
    public bindingHandlers: IKnockoutBindingHandlers = {};

    constructor(params?: IViewModelParams, dependencies?: IViewModelDependencies) {
        super(params, dependencies);

        this.automationId = params && params.automationId || '';

        this.addBindingHandlers({
            automation: AutomationBinding,
            automationType: AutomationTypeBinding
        });
    }

    /**
     * Gets the automation element from automation name.
     *
     * @param name The name of the element to get.
     */
    public getAutomationElement(name: string): HTMLElement {
        let element: HTMLElement;

        const elements = this[AutomationBinding.AUTOMATION_ELEMENTS_KEY];

        if (elements) {
            element = elements[name];
        }

        return element;
    }

    public format(s: string, ...values: string[]): string {
        return format(s, values);
    }

    /**
     * Adds binding handlers to this view model accessible by the given keys to the component's view.
     *
     * @param bindingHandlers a mapping of keys (to be used by the view) to static binding handler classes.
     */
    protected addBindingHandlers(bindingHandlers: IKnockoutBindingHandlers) {
        extend(this.bindingHandlers, bindingHandlers);
    }
}

export default ViewModel;

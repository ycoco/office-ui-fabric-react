// OneDrive:IgnoreCodeCoverage

import BaseModel = require('./BaseModel');
import IViewModelParams = require('./IViewModelParams');
import IViewModelDependencies from './IViewModelDependencies';
import StringHelper = require('../utilities/string/StringHelper');
import IKnockoutBindingHandlers = require("../utilities/knockout/IKnockoutBindingHandlers");
import AutomationBinding = require("../bindings/automation/AutomationBinding");
import AutomationTypeBinding = require("../bindings/automation/AutomationTypeBinding");
import ko = require("knockout");

/**
 * ViewModel is a BaseModel subclass that encapsulates anything view model sepecific. ViewModels subclass from this.
 */
class ViewModel extends BaseModel {
    /**
     * Used for WebDriver automated tests. Should be globally unique.
     */
    automationId: string;

    constructor(params?: IViewModelParams, dependencies?: IViewModelDependencies) {
        super(params, dependencies);

        this.automationId = params && params.automationId || '';

        this.addBindingHandlers({
            automation: AutomationBinding,
            automationType: AutomationTypeBinding
        });
    }

    /**
     * A mapping of keys (to be used by the view) to static binding handler classes.
     */
    public bindingHandlers: IKnockoutBindingHandlers = {};

    /**
     * Adds binding handlers to this view model accessible by the given keys to the component's view.
     * 
     * @param bindingHandlers a mapping of keys (to be used by the view) to static binding handler classes.
     */
    protected addBindingHandlers(bindingHandlers: IKnockoutBindingHandlers) {
        ko.utils.extend(this.bindingHandlers, bindingHandlers);
    }

    /**
     * Gets the automation element from automation name.
     * 
     * @param name The name of the element to get.
     */
    public getAutomationElement(name: string): HTMLElement {
        var el;
        var elements = this[AutomationBinding.AUTOMATION_ELEMENTS_KEY];
        if (elements) {
            el = elements[name];
        }

        return el;
    }

    public format(s: string, ...values: string[]): string {
        return StringHelper.format(s, values);
    }
}

export = ViewModel;
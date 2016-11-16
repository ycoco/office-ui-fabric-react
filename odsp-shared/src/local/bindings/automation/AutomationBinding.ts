// OneDrive:IgnoreCodeCoverage

import ko = require("knockout");

/** Adds a data-automationId to the target element for use with WebDriver. */
class AutomationBinding implements KnockoutBindingHandler {
    public static AUTOMATION_ELEMENTS_KEY = "__automationBinding$elements";

    public static init(element: HTMLElement, valueAccessor: () => string,
        allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) {

        ko.applyBindingsToNode(element, { attr: { 'data-automationId': valueAccessor() } }, bindingContext);

        if (bindingContext) {
            var componentViewModel = bindingContext['$component'];

            if (componentViewModel) {
                var bindingValue = ko.utils.unwrapObservable<string>(<any>valueAccessor());

                if (bindingValue) {
                    var automationElements = componentViewModel[AutomationBinding.AUTOMATION_ELEMENTS_KEY];

                    if (!automationElements) {
                        automationElements = componentViewModel[AutomationBinding.AUTOMATION_ELEMENTS_KEY] = {};
                    }

                    automationElements[bindingValue] = element;

                    ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                        if (automationElements[bindingValue]) {
                            delete automationElements[bindingValue];
                        }
                    });
                }
            }
        }
    }
};

export = AutomationBinding;
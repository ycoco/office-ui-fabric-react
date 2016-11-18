// OneDrive:IgnoreCodeCoverage

import ko = require("knockout");

/** Adds a data-automationType to the target element. */
class AutomationTypeBinding implements KnockoutBindingHandler {
    public static AUTOMATION_TYPE_ELEMENTS_KEY = "__automationTypeBinding$elements";

    public static init(element: HTMLElement, valueAccessor: () => string,
        allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: KnockoutBindingContext) {

        ko.applyBindingsToNode(element, { attr: { 'data-automationType': valueAccessor() } }, bindingContext);

        if (bindingContext) {
            var componentViewModel = bindingContext['$component'];

            if (componentViewModel) {
                var bindingValue = ko.utils.unwrapObservable<string>(<any>valueAccessor());

                if (bindingValue) {
                    var automationElements = componentViewModel[AutomationTypeBinding.AUTOMATION_TYPE_ELEMENTS_KEY];

                    if (!automationElements) {
                        automationElements = componentViewModel[AutomationTypeBinding.AUTOMATION_TYPE_ELEMENTS_KEY] = {};
                    }

                    var sameTypeElements = automationElements[bindingValue];

                    if (!sameTypeElements) {
                        sameTypeElements = automationElements[bindingValue] = [];
                    }

                    sameTypeElements.push(element);

                    ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                        var index = sameTypeElements.indexOf(element);
                        if (-1 !== index) {
                            delete sameTypeElements[index];
                            sameTypeElements.splice(index, 1);
                        }
                    });
                }
            }
        }
    }
};

export = AutomationTypeBinding;
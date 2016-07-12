/// <reference path="../../../../chai/chai.d.ts" />
/// <reference path="../../../../mocha/mocha.d.ts" />

import LocalBindingProvider = require("../../../../odsp-shared/utilities/knockout/LocalBindingProvider");
import chai = require("chai");
import ko = require("knockout");
var expect = chai.expect;

describe("LocalBindingProvider", () => {
    var element: HTMLElement;
    var viewModel: any;
    var bindingHandler: KnockoutBindingHandler = {
        init: () => {
            // Do nothing.
        }
    };

    beforeEach(() => {
        element = document.createElement("div");
        element.setAttribute("data-bind", "example1: { foo: 'bar' }");

        viewModel = {
            bindingHandlers: {
                example1: bindingHandler
            }
        };
    });

    it("is current binding provider", () => {
        expect(ko.bindingProvider.instance).to.be.instanceof(LocalBindingProvider);
    });

    it("applies binding from view model", () => {
        var foo;

        bindingHandler.init = (element: HTMLElement, valueAccessor: () => { foo: string }) => {
            foo = valueAccessor().foo;
        };

        ko.applyBindings(viewModel, element);

        expect(foo).to.equal("bar");
    });
});

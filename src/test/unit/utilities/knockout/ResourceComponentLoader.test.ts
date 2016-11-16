import { ResourceScope } from '@ms/odsp-utilities/lib/resources/Resources';
import { loader } from '../../../../odsp-shared/utilities/knockout/ResourceComponentLoader';
import ko = require("knockout");
import Promise from "@ms/odsp-utilities/lib/async/Promise";
import { expect } from 'chai';

class ExampleViewModel {
    public resources: ResourceScope;

    constructor(params: any) {
        params.callback(this);
    }
}

describe("ResourceComponentLoader", () => {
    var componentConfig = {
        tagName: "ms-test-resources-example",
        template: "<div></div>",
        viewModel: ExampleViewModel
    };

    var element: HTMLElement;

    var waitForComponent: Promise<ExampleViewModel>;

    before(() => {
        ko.components.register(componentConfig.tagName, componentConfig);
    });

    beforeEach(() => {
        element = document.createElement("div");
        element.setAttribute("data-bind", "component: { name: 'ms-test-resources-example', params: $data }");

        var completePromise: (component: ExampleViewModel) => void;

        waitForComponent = new Promise<ExampleViewModel>((complete: (result: ExampleViewModel) => void) => {
            completePromise = complete;
        });

        ko.applyBindings({
            callback: (viewModel: ExampleViewModel) => {
                completePromise(viewModel);
            }
        }, element);
    });

    afterEach(() => {
        ko.cleanNode(element);
    });

    after(() => {
        ko.components.unregister(componentConfig.tagName);
    });

    it("inserts into component loaders", () => {
        expect(ko.components.loaders).to.contain(loader);
    });

    it("provides view model", () => {
        return waitForComponent.then((component: ExampleViewModel) => {
            expect(component).to.be.instanceof(ExampleViewModel);
        });
    });

    it("injects resource scope", () => {
        return waitForComponent.then((component: ExampleViewModel) => {
            expect(component.resources).to.be.instanceof(ResourceScope);
        });
    });
});

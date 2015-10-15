// OneDrive:IgnoreCodeCoverage

import ko = require('knockout');
import IComponentDefinition = require('./IComponentDefinition');
import ViewModel = require("../../base/ViewModel");
import DomUtils = require('odsp-utilities/domUtils/DomUtils');

class ComponentFactory {
    static registerComponent<VM extends ViewModel>(component: IComponentDefinition<VM>): IComponentDefinition<VM> {
        ko.components.register(
            component.tagName,
            {
                viewModel: component.viewModel,
                template: component.template,
                // True injects synchronously if already loaded, otherwise still async
                // Default it to false
                synchronous: component.synchronous || false
            });

        return component;
    }

    static registerTemplate(id: string, template: string) {
        var scriptElement = document.createElement('script');

        scriptElement.setAttribute('type', 'text/html');
        scriptElement.id = id;

        DomUtils.setText(scriptElement, template);

        document.body.appendChild(scriptElement);
    }
}

export = ComponentFactory;

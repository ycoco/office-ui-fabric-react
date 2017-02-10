// OneDrive:IgnoreCodeCoverage

import ko = require('knockout');
import ViewModel from '../../base/ViewModel';
import DomUtils from '@ms/odsp-utilities/lib/domUtils/DomUtils';

export interface IComponentDefinition<VM extends ViewModel> {
    tagName: string;
    template: any;
    viewModel?: new (params: any) => VM;
    synchronous?: boolean;
}

export function registerComponent<VM extends ViewModel>(component: IComponentDefinition<VM>): IComponentDefinition<VM> {
    'use strict';

    let {
        tagName,
        template,
        viewModel,
        synchronous = false
    } = component;

    ko.components.register(
        tagName,
        {
            viewModel: viewModel,
            template: template,
            synchronous: synchronous
        });

    return component;
}

export function registerTemplate(id: string, template: string) {
    'use strict';

    let scriptElement = document.createElement('script');

    scriptElement.setAttribute('type', 'text/html');
    scriptElement.id = id;

    DomUtils.setText(scriptElement, template);

    document.head.appendChild(scriptElement);
}

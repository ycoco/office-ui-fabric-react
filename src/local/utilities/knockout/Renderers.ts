// OneDrive:IgnoreCodeCoverage

import ko = require('knockout');

/**
 * Renders the text produced by applying bindings to an HTML string.
 */
export function renderText<VM>(viewModel: VM, html: string) {
    'use strict';

    let element: HTMLElement = document.createElement('div');
    element.innerHTML = html;

    ko.applyBindings(viewModel, element);

    let text = element.textContent;

    ko.cleanNode(element);

    return text;
}

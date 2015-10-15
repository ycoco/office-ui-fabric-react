// OneDrive:IgnoreCodeCoverage

/// <reference path="../../../knockout/knockout" />

import ViewModel = require('../../base/ViewModel');

interface IComponentDefinition<VM extends ViewModel> {
    tagName: string;
    template: any;
    viewModel?: new (params: any) => VM;
    synchronous?: boolean;
}

export = IComponentDefinition;

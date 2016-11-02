// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import RequireJSErrorHandler from '@ms/odsp-utilities/lib/logging/RequireJSErrorHandler';
import ViewModel = require('../../base/ViewModel');
import IComponentDefinition = require('../knockout/IComponentDefinition');
import ko = require('knockout');

export function loadComponent(sourceRequire: (paths: string[], callback: (module: IComponentDefinition<ViewModel>) => void, handleError: (error: any) => void) => void,
    path: string,
    componentName: string): Promise<IComponentDefinition<ViewModel>> {
    return new Promise<IComponentDefinition<ViewModel>>(
        (complete: (result: IComponentDefinition<ViewModel>) => void,
        error: (error: any) => void) => {
        if (ko.components.isRegistered(componentName)) {
            ko.components.get(componentName, complete);
        } else {
            sourceRequire(
                [path],
                complete,
                (e: any) => {
                    RequireJSErrorHandler.log(e);
                    error(e);
                });
        }
    });
}

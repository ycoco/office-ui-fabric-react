// OneDrive:IgnoreCodeCoverage

import Promise from './Promise';
import RequireJSErrorHandler = require('../logging/RequireJSErrorHandler');
import ViewModel = require('../../base/ViewModel');
import IComponentDefinition = require('../knockout/IComponentDefinition');
import ko = require('knockout');

class RequireHelper {
    public static promiseComponent(sourceRequire: (paths: string[], callback: (module: IComponentDefinition<ViewModel>) => void, handleError: (error: any) => void) => void,
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

    public static promise<T>(sourceRequire: (paths: string[], callback: (module: T) => void, handleError: (error: any) => void) => void, path: string): Promise<T> {
        return new Promise<T>((complete: (result: T) => void, error: (error: any) => void) => {
            sourceRequire(
                [path],
                complete,
                (e: any) => {
                    RequireJSErrorHandler.log(e);
                    error(e);
                });
        });
    }

    public static deferred<T extends new (...args: any[]) => any>(type: T, sourceRequire: Require, path: string): T {
        // Define a proxy constructor which injects the deferred module info before invoking the real constructor.
        var creator = function (...args: any[]) {
            this.modulePath = path;
            this.sourceRequire = sourceRequire;

            type.apply(this, args);
        };

        // Set the prototype of the proxy constructor to the real prototype.
        creator.prototype = type.prototype;

        return <any>creator;
    }
}

export = RequireHelper;
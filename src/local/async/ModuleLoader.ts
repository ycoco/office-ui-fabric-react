// OneDrive:IgnoreCodeCoverage

/// <reference path='../../../typings/requirejs/require.d.ts' />

import Promise from './Promise';
import RequireHelper from './RequireHelper';

export interface IModule<T> {
    default?: T;
}

export default class ModuleLoader {
    public static load<T>(path: string, sourceRequire: typeof require = require): Promise<T | IModule<T>> {
        return RequireHelper.promise<T | IModule<T>>(sourceRequire, path);
    }

    public static loadDefault<T>(path: string, sourceRequire: typeof require = require, getModule?: (module: any) => T): Promise<T> {
        return this.load(path, sourceRequire).then((result: T | IModule<T>) => {
            return this.getDefaultValue(result, getModule);
        });
    }

    private static getDefaultValue<T>(result: T | IModule<T>, getModule?: (module: any) => T): T {
        if (!result) {
            return <T>result;
        }
        let {
            default: type = <T>result
        } = <IModule<T>>result;
        if (getModule && getModule(type)) {
            type = <T>getModule(type);
        }
        return type;
    }
}
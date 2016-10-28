
import RequireJSErrorHandler from '../logging/RequireJSErrorHandler';
import PerformanceCollection from '../performance/PerformanceCollection';
import Promise from '../async/Promise';
import Signal from '../async/Signal';
import { IRequire } from './IRequire';
import { IModule } from './IModule';
import * as ModuleHelper from './ModuleHelper';
import { IModuleDefinition, IExportDefinition } from './IModuleDefinition';

/**
 * Function to load a resource asynchronously which resolves the default export
 * from a given module.
 *
 * This function checks for the presense of a 'default' export in the loaded module
 * and resolves it if present. Otherwise, it assumes the module is a legacy module
 * and returns its identity export.
 *
 * @export
 * @template TExport
 * @param {IModuleDefinition<IModule<TExport>>} moduleDefinition
 * @returns {Promise<TExport>}
 */
export function loadModule<TExport>(moduleDefinition: IModuleDefinition<IModule<TExport>>): Promise<TExport> {
    const {
        path,
        require
    } = moduleDefinition;

    return loadModuleExport({
        path: path,
        require: require,
        getExport: ModuleHelper.getDefaultExport
    });
}

/**
 *
 *
 * @export
 * @template TModule
 * @param {IModuleDefinition<TModule>} exportDefinition
 * @returns {Promise<TModule>}
 */
export function loadModuleIdentity<TModule>(exportDefinition: IModuleDefinition<TModule>): Promise<TModule> {
    const {
        path,
        require
    } = exportDefinition;

    return load(require, path);
}

/**
 * Function to load a resource asynchronously which resolves a specific export
 * from a given module.
 *
 * @export
 * @template TModule
 * @template TExport
 * @param {IExportDefinition<TModule, TExport>} exportDefinition
 * @returns {Promise<TExport>}
 */
export function loadModuleExport<TModule, TExport>(exportDefinition: IExportDefinition<TModule, TExport>): Promise<TExport> {
    const {
        path,
        require,
        getExport
    } = exportDefinition;

    return load<TModule>(require, path).then((module: TModule) => {
        return getExport(module);
    });
}

/**
 * Internal helper to invoke `require` on the input path and log performance and errors.
 *
 * @template TModule
 * @param {IRequire<TModule>} require
 * @param {string} path
 * @returns {Promise<TModule>}
 */
function load<TModule>(require: IRequire<TModule>, path: string): Promise<TModule> {
    PerformanceCollection.mark(`Module_${path}`, 20);

    const signal = new Signal<TModule>();

    require([path], (module: TModule) => {
        signal.complete(module);
    }, (error: any) => {
        RequireJSErrorHandler.log(error);

        signal.error(error);
    });

    return signal.getPromise();
}

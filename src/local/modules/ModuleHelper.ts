
import { IModule, IModuleWithDefault } from './IModule';

/**
 * Attempts to extract the default export from a module.
 *
 * @export
 * @template TExport
 * @param {IModule<TExport>} module
 * @returns {TExport}
 */
export function getDefaultExport<TExport>(module: IModule<TExport>): TExport {
    let exportValue: TExport;

    if (isModuleWithDefault(module)) {
        exportValue = module.default;
    } else {
        exportValue = module;
    }

    return exportValue;
}

/**
 * Returns the module itself as its own export.
 *
 * @export
 * @template TModule
 * @param {TModule} module
 * @returns {TModule}
 */
export function getIdentityExport<TModule>(module: TModule): TModule {
    return module;
}

export function isModuleWithDefault<T>(module: IModule<T>): module is IModuleWithDefault<T> {
    return !!module && typeof module === 'object' && 'default' in module;
}


import { IModule, IModuleWithDefault } from './IModule';

export function getDefaultExport<TExport>(module: IModule<TExport>): TExport {
    let exportValue: TExport;

    if (isModuleWithDefault(module)) {
        exportValue = module.default;
    } else {
        exportValue = module;
    }

    return exportValue;
}

export function isModuleWithDefault<T>(module: IModule<T>): module is IModuleWithDefault<T> {
    return !!module && typeof module === 'object' && 'default' in module;
}

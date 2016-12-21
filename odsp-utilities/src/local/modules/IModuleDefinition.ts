
import { IRequire } from './IRequire';

/**
 * String variant which represents a path to a module.
 */
export type Path<TModule> = string & {
    _ResolvedType?: TModule;
};

export interface IModuleDefinition<TModule> {
    /**
     * The path to the module. This path will be resolved relative to the provided `require` object.
     *
     * @type {string}
     * @memberOf IModuleDefinition
     */
    path: Path<TModule>;
    /**
     * A `require` object used to resolve the module.
     *
     * @type {IRequire}
     * @memberOf IModuleDefinition
     */
    require: IRequire;
}

/**
 * An extension of `IModuleDefinition` to support selection of a single export
 * from a loaded module.
 *
 * @export
 * @interface IExportDefinition
 * @extends {IModuleDefinition<TModule>}
 * @template TModule
 * @template TExport
 */
export interface IExportDefinition<TModule, TExport> extends IModuleDefinition<TModule> {
    /**
     * A selector for an export from the module once loaded.
     *
     * @param {TModule} module
     * @returns {TExport}
     *
     * @memberOf IExportDefinition
     */
    getExport(module: TModule): TExport;
}

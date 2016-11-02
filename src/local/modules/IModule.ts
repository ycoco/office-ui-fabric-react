
/**
 * The layout of a module with a default export.
 *
 * @export
 * @interface IModuleWithDefault
 * @template T
 */
export interface IModuleWithDefault<T> {
    default: T;
}

/**
 * The layout of a module to export a type.
 */
export type IModule<T> = T | IModuleWithDefault<T>;

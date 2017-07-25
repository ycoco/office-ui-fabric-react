
export type IGraft5<T> = {
    [K in keyof T]?: T[K] | IGraftOperation<T[K]>;
};

export type IGraft4<T> = {
    [K in keyof T]?: T[K] | IGraftOperation<T[K]> | IGraft5<T[K]>;
};

export type IGraft3<T> = {
    [K in keyof T]?: T[K] | IGraftOperation<T[K]> | IGraft4<T[K]>;
};

export type IGraft2<T> = {
    [K in keyof T]?: T[K] | IGraftOperation<T[K]> | IGraft3<T[K]>;
};

export type IGraft1<T> = {
    [K in keyof T]?: T[K] | IGraftOperation<T[K]> | IGraft2<T[K]>;
};

/**
 * Represents a graftable version of a given type.
 * Each field of the target type is optional, and either a value of the field type
 * may be provided, or a graft operation.
 */
export type IGraft<T> = {
    // Note: this type is not recursive, due to a bug in TypeScript 2.1.6.
    [K in keyof T]?: T[K] | IGraftOperation<T[K]> | IGraft1<T[K]>;
};

/**
 * Available types of patches.
 * Should only be used internally by grafting and its helper functions.
 *
 * @enum {number}
 */
export const enum GraftOperationType {
    none,
    replace,
    optional,
    remove,
    backup
}

export interface IGraftOperation<T> {
    /**
     * Special field used to distinguish a patch from a vanilla object.
     *
     * @type {PatchType}
     */
    graftOperationType: GraftOperationType;
    valueType: T;
}

interface IOptionalGraftOperation<T> extends IGraftOperation<T> {
    value?: T;
}

interface IReplaceGraftOperation<T> extends IGraftOperation<T> {
    value: T;
}

interface IBackupGraftOperation<T> extends IGraftOperation<T> {
    value: T;
}

/**
 * Attaches a placeholder to a graft extension to remove the target field.
 * Once the graft is applied, the target object will have the key removed.
 *
 * @export
 * @template T
 * @returns {T}
 *
 * @example
 *  let item = {
 *      name: 'Test',
 *      upload: {
 *          percent: 50
 *      }
 *  };
 *
 *  graft(item, {
 *      upload: Graft.remove()
 *  });
 *
 *  expect(item).to.deep.equal({
 *      name: 'Test'
 *  });
 */
export function remove<T>(): IGraftOperation<T> {
    return <IGraftOperation<T>>{
        graftOperationType: GraftOperationType.remove
    };
}

/**
 * Attaches a wrapper to a graft extension to ensure that the target field
 * is only replaced or added if the extension value is defined.
 *
 * @export
 * @template T
 * @param {T} [value]
 * @returns {T}
 *
 * @example
 *  let item = {
 *      name: 'Test'
 *  };
 *
 *  let childCount: number = undefined;
 *
 *  graft(item, {
 *      childCount: Graft.optional(childCount)
 *  });
 *
 *  expect(item).to.deep.equal({
 *      name: 'Test'
 *      // Note the lack of a 'childCount' key at all.
 *  });
 */
export function optional<T>(value?: T): IGraftOperation<T> {
    return <IOptionalGraftOperation<T>>{
        graftOperationType: GraftOperationType.optional,
        value: value
    };
}

/**
 * Attaches a wrapper to a graft extension to ensure that the target field
 * is only added, and never replaced if already defined.
 *
 * If the extension value is an object but the target already defines the field,
 * the extension values will not be merged with the target values.
 *
 * @export
 * @template T
 * @param {T} value
 * @returns {T}
 *
 * @example
 *  let item = {
 *      name: 'Test',
 *      displayName: 'Existing'
 *  };
 *
 *  graft(item, {
 *      displayName: Graft.backup('Backup')
 *  });
 *
 *  expect(item).to.deep.equal({
 *      name: 'Test',
 *      displayName: 'Existing'
 *  });
 */
export function backup<T>(value: T): IGraftOperation<T> {
    return <IBackupGraftOperation<T>>{
        graftOperationType: GraftOperationType.backup,
        value: value
    };
}

/**
 * Attaches a wrapper to a graft extension value to ensure that the target field
 * is only ever replaced or added, never merged.
 *
 * The extension value will be used directly, and not copied. Subsequent modifications
 * to the target item may result in changes to the extension value if it is an object.
 *
 * @export
 * @template T
 * @param {T} value
 * @returns {T}
 *
 * @example
 *  let item = {
 *      name: 'Test',
 *      photo: {
 *          width: 500,
 *          height: 300
 *      }
 *  };
 *
 *  graft(item, {
 *      photo: Graft.replace({
 *          originalUrl: 'http://test/unknown/jpg'
 *      })
 *  });
 *
 *  expect(item).to.deep.equal({
 *      name: 'Test',
 *      photo: {
 *          // Note that width and height are no longer present.
 *          originalUrl: 'http://test/unknown.jpg'
 *      }
 *  });
 */
export function replace<T>(value: T): IGraftOperation<T> {
    return <IReplaceGraftOperation<T>>{
        graftOperationType: GraftOperationType.replace,
        value: value
    };
}

/**
 * Grafts new updates to an existing object.
 * By default, `graft` deep-copies all values from `extension` onto `base`,
 * overriding new primitive and function fields, merging matching object fields, and concatenating
 * matching array fields.
 *
 * This function only copies fields defined on the `extension` object and its sub-objects, leaving
 * existing fields on the `base` tree which are not part of `extension` intact.
 *
 * The default merge behavior can be modified by wrapping the values supplied to fields of
 * the `extension` object.
 *
 * @export
 * @template B
 * @template E
 * @param {B} base
 * @param {E} extension
 * @returns {(B & E)}
 *
 * @example
 *  let base = {
 *      id: 'test',
 *      name: 'Test item',
 *      photo: {
 *          width: 400,
 *          height: 300
 *      },
 *      childCount: 7
 *  };
 *
 *  graft(base, {
 *      name: 'Renamed item',
 *      photo: {
 *          originalUrl: 'http://thumbnail/test.jpg'
 *      }
 *  });
 *
 *  expect(base).to.deep.equal({
 *      id: 'test',
 *      name: 'Renamed item',
 *      photo: {
 *          width: 400,
 *          height: 300,
 *          originalUrl: 'http://thumbnail/test.jpg'
 *      },
 *      childCount: 7
 *  });
 */
export default function graft<B extends {}>(base: B, extension: IGraft<B>): B {
    if (!isObject(base)) {
        throw new Error(`Value for 'base' passed to 'graft' is not an object.`);
    }

    if (!isObject(extension)) {
        throw new Error(`Value for 'extension' passed to 'graft' is not an object`);
    }

    if (<{}>extension === <{}>base) {
        // If the extension is the same object, do nothing.
        return <B>base;
    }

    // Use Object.keys to copy the key list before iterating.
    for (let key of <(keyof B)[]>Object.keys(extension)) {
        let extensionValue = <{} | IGraftOperation<{}> | IGraft<{}>>extension[key as any];
        let baseValue = <{} | {}[]><any>base[key];

        if (extensionValue === baseValue) {
            // If the base value is the same value, skip this key.
            continue;
        }

        let patch = extensionValue;

        if (isGraftOperation(patch)) {
            // A patch may perform an override action and skip to the next key,
            // or it may simply produce a new value to use for default grafting.
            if (isReplaceGraftOperation(patch)) {
                let {
                    value
                } = patch;

                baseValue = undefined;

                extensionValue = value;
            } else if (isBackupGraftOperation(patch)) {
                let {
                    value
                } = patch;

                let baseValue = base[key];

                if (baseValue === void 0) {
                    extensionValue = value;
                } else {
                    continue;
                }
            } else if (isOptionalGraftOperation(patch)) {
                let {
                    value
                } = patch;

                if (value === void 0) {
                    continue;
                } else {
                    extensionValue = value;
                }
            } else if (isRemoveGraftOperation(patch)) {
                delete base[key];

                continue;
            } else {
                // Not a valid patch.
                // This would imply a caller assembled an object marked as a patch by circumventing the
                // exported functions of this module.
                throw new Error('Unknown patch specified for grafting. Only use exported functions from Graft to create patches.');
            }
        }

        let newValue: {};

        if (isDate(extensionValue)) {
            // The extension value is a date.
            // Dates are objects, but should be treated like primitives.
            // Since they are mutable, they should be copied instead of reused.
            newValue = new Date(extensionValue.getTime());
        } else if (isArray(extensionValue)) {
            // The extension value is an array, and the contents
            // should be used in place of the base values.
            let baseValueAsArray: {}[] = <{}[]>baseValue;

            if (!isArray(baseValueAsArray)) {
                // Start with a new base value.
                baseValueAsArray = [];
            }

            // Replace the old array values with the new array values.
            baseValueAsArray.splice(0, baseValueAsArray.length, ...extensionValue);

            newValue = baseValueAsArray;
        } else if (isObject(extensionValue)) {
            // The extension value is an object (and not null), and the properties
            // should be merged with the base value.
            let baseValueAsObject: {} = baseValue;

            if (!isObject(baseValueAsObject)) {
                // Start with a new base object.
                baseValueAsObject = {};
            }

            // Merge the new properties.
            graft(baseValueAsObject, extensionValue);

            newValue = baseValueAsObject;
        } else {
            // The extension value is a primitive, so the value should be replaced.
            // Note that function values are also handled here. Ultimately, there is no
            // way to copy a function precisely since they may contain closure references.
            newValue = extensionValue;
        }

        // Always re-assign the new value.
        // If the base uses property mutators, it will have a chance to inspect
        // the final value.
        base[key] = <any>newValue;
    }

    return <B>base;
}

// Use of type guards facilitates the type safety of the graft function.

function isObject(value: {}): value is {} {
    return typeof value === 'object' && !!value;
}

function isDate(value: {} | Date): value is Date {
    return value instanceof Date;
}

function isArray(value: {} | {}[]): value is {}[] {
    return Array.isArray(value);
}

function isGraftOperation<T>(value: {} | IGraftOperation<T>): value is IGraftOperation<T> {
    return isObject(value) && !!(<IGraftOperation<T>>value).graftOperationType;
}

function isBackupGraftOperation<T>(graftOperation: IGraftOperation<T> | IBackupGraftOperation<T>): graftOperation is IBackupGraftOperation<T> {
    return graftOperation.graftOperationType === GraftOperationType.backup;
}

function isRemoveGraftOperation<T>(graftOperation: IGraftOperation<T>): boolean {
    return graftOperation.graftOperationType === GraftOperationType.remove;
}

function isOptionalGraftOperation<T>(graftOperation: IGraftOperation<T> | IOptionalGraftOperation<T>): graftOperation is IOptionalGraftOperation<T> {
    return graftOperation.graftOperationType === GraftOperationType.optional;
}

function isReplaceGraftOperation<T>(graftOperation: IGraftOperation<T> | IReplaceGraftOperation<T>): graftOperation is IReplaceGraftOperation<T> {
    return graftOperation.graftOperationType === GraftOperationType.replace;
}

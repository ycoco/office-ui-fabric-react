/**
 * Verifies that a and b are the same object via ===.
 * O(1) comparison
 * @param a The first object
 * @param b The second object
 */
export function objectStrictEquality(a: any, b: any) {
    return a === b;
}

/**
 * Verifies that a and b have the same enumerable properties. Properties are compared via ===.
 * Keys mapped to undefined and keys that are not present are treated as equivalent.
 * O(A + B) comparison, where A is the number of keys in a and B is the number of keys in B.
 * @param a The first object
 * @param b The second object
 */
export function objectShallowEquality(a: {}, b: {}) {
    // If they are the same object, short circuit
    if (a === b) {
        return true;
    }

    // If either does not exist, since they were not strict equal, they are not equal.
    if (!a || !b) {
        return false;
    }

    // If they are not the same type, they cannot be equal
    if (typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }

    // Verify that all elements in a have an equal element in b
    for (let key in a) {
        if (a[key] !== b[key]) {
            return false;
        }
    }

    // Verify that all elements in b have an equal element in a
    for (let key in b) {
        if (a[key] !== b[key]) {
            return false;
        }
    }

    return true;
}

export function arrayStrictEquality(a: Array<any>, b: Array<any>) {
    // If they are the same object, short circuit
    if (a === b) {
        return true;
    }

    // If either does not exist, since they were not strict equal, they are not equal.
    if (!a || !b) {
        return false;
    }

    // If the lengths do not match, they cannot be equal
    let length = a.length;
    if (length !== b.length) {
        return false;
    }

    // Verify that all elements match. Not optimized for sparse arrays.
    while (length) {
        --length;
        if (a[length] !== b[length]) {
            return false;
        }
    }

    // Same length, all entries match. Arrays are equal.
    return true;
}

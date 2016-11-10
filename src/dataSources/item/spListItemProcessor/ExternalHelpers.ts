/**
 * TODO:
 * This file contains code and interfaces duplicated from odsp-next and other repo's
 * that need to be consumed from both odsp-datasources and odsp-next.
 * Need to move the parent modules to odsp-utilities, and then remove this code and fix up references.
 * This file should eventually be deleted entirely.
 */

/**
 * From: Double from odsp-shared.
 */
export interface IDouble {
    /**
     * Low 32 bits. Will be converted to a 32-bit signed integer for bitwise operations,
     * so the max safe value (to avoid the sign bit) is 0x7FFFFFFF.
     */
    Low: number;
    /**
     * High 32 bits. Will be converted to a 32-bit signed integer for bitwise operations,
     * so the max safe value (to avoid the sign bit) is 0x7FFFFFFF.
     */
    High: number;
}

/**
 * From: Double from odsp-shared. Move to utilities or consume odsp-shared.
 */
export function fromHexString(str: string, defaultAll?: boolean): IDouble {
    let result: IDouble = defaultAll ? { High: 0x7FFFFFFF, Low: 0x7FFFFFFF } : { High: 0, Low: 0 };
    let match = str && str.match(/^(0x)?([0-9a-f]*)$/i);
    if (match) {
        str = match[2] || '0'; // || '0' handles input '0x'
        // take lowest 16 digits if string has more than that
        str = str.slice(-16);

        let high;
        let low;
        if (str.length <= 8 /* 'FFFFFFFF' */) {
            high = 0;
            low = parseInt(str, 16);
        } else {
            high = parseInt(str.slice(0, -8), 16);
            low = parseInt(str.slice(-8), 16);
        }

        if (!isNaN(high) && !isNaN(low)) {
            result.High = high;
            result.Low = low;
        }
    }
    return result;
}

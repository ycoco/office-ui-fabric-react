import IDouble = require('./IDouble');

export class Double {
    /**
     * Converts a hexadecimal string to an IDouble.
     * Takes lowest 16 digits of numbers that are too long.
     * Returns a default value if input is null or contains invalid characters.
     * @param str - The hexadecimal string. Leading "0x" optional.
     * @param defaultAll - If true, default to full mask/max value, { High: 0x7FFFFFFF, Low: 0x7FFFFFFF}.
     * Otherwise, default to 0.
     */
    public static fromHexString(str: string, defaultAll?: boolean): IDouble {
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

    /**
     * Returns the bitwise Or of an array of IDouble values (0 for empty/null array).
     */
    public static or(values: IDouble[]): IDouble {
        return (values || []).reduce(
            (prev: IDouble, curr: IDouble) => ({ High: prev.High | curr.High, Low: prev.Low | curr.Low }),
            { High: 0, Low: 0 });
    }

    /**
     * Returns the bitwise And of an array of IDouble values (0 for empty/null array).
     */
    public static and(values: IDouble[]): IDouble {
        if (!values || !values.length) {
            return { High: 0, Low: 0 };
        }
        return values.reduce(
            (prev: IDouble, curr: IDouble) => ({ High: prev.High & curr.High, Low: prev.Low & curr.Low }));
    }
}

export default Double;
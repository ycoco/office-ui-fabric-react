import * as StringHelper from './StringHelper';
import { strings as Strings } from './StringUtilities.resx';

interface IIntermediateValue {
    template: string;
    value: number;
}

export interface IDisplayOptions {
    // Removes trailing zeroes after the decimal points
    trimDecimal?: boolean;

    // Returns empty string if the value is zero
    ignoreZero?: boolean;
}

const oneKiloByte = 1024;
const oneMegaByte = 1048576;
const oneGigaByte = 1073741824;
const oneTeraByte = 1099511627776;

export default class DriveSpaceHelper {
    /**
     * Creates a display string for the given number in bytes.
     * This function produces a string value meant to mimic that displyed by file explorer.
     */
    public static getDisplayString(value: number, options: IDisplayOptions = {}): string {
        if (typeof value !== 'number' || (options.ignoreZero && value === 0) || value < 0) {
            return '';
        }

        if (value === 1) {
            return StringHelper.format(Strings.fileSizeBytesSingular);
        }

        let info = this._getInfo(value);
        let numberString = this._trimNumber(info.value, options.trimDecimal);
        return StringHelper.format(info.template, numberString);
    }

    private static _getInfo(value: number): IIntermediateValue {
        // 1 byte is already handled

        // 0 bytes, 2 bytes - 1023 bytes
        if (value < oneKiloByte) {
            return { template: Strings.fileSizeBytesPlural, value };
        }

        // 1KB - 999 KB
        if (value < 1000 * oneKiloByte) {
            return { template: Strings.fileSizeKB, value: value / oneKiloByte };
        }

        // 0.97 MB - 999 MB
        if (value < 1000 * oneMegaByte) {
            return { template: Strings.fileSizeMB, value: value / oneMegaByte };
        }

        // 0.97 GB - 999 GB
        if (value < 1000 * oneGigaByte) {
            return { template: Strings.fileSizeGB, value: value / oneGigaByte };
        }

        // 0.97 TB ->
        return { template: Strings.fileSizeTB, value: value / oneTeraByte };
    }

    private static _trimZeroes(value: number, decimalPlaces: number): string {
        let str = value.toFixed(decimalPlaces);
        for (let i = 0; i < decimalPlaces; i++) {
            if (str[str.length - 1] === '0') {
                 str = str.substring(0, str.length - 1);
            } else {
                break;
            }
        }
        if (str[str.length - 1] === '.') {
            str = str.substring(0, str.length - 1);
        }
        return str;
    }

    private static _trimNumber(value: number, trimDecimal: boolean): string {
        // 12.00 -> 12
        if (value === Math.floor(value)) {
            return value.toFixed(0);
        }

        // Removes the mantissa from the value (ex: 456.789 -> 457)
        if (value >= 100) {
            return value.toFixed(0);
        }

        // 45.678 -> 45.7
        if (value >= 10) {
            return trimDecimal ? this._trimZeroes(value, 1) : value.toFixed(1);
        }

        // 4.5678 -> 4.57
        return trimDecimal ? this._trimZeroes(value, 2) : value.toFixed(2);
    }
}
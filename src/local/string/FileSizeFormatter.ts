// OneDrive:IgnoreCodeCoverage

import { format } from './StringHelper';
import StringUtilitiesResx = require('./StringUtilities.resx');

const Strings = StringUtilitiesResx.strings;

const BYTES_IN_KILOBYTE = 1024;
const BYTES_IN_MEGABYTE = BYTES_IN_KILOBYTE * 1024;
const BYTES_IN_GIGABYTE = BYTES_IN_MEGABYTE * 1024;

export function formatSize(byteSize: number, allowZeroBytes?: boolean): string {
    'use strict';

    let sizeString = '';

    if (typeof byteSize === 'number' && (byteSize > 0 || allowZeroBytes)) {
        if (byteSize >= BYTES_IN_GIGABYTE) {
            sizeString = format(Strings.fileSizeGB, _preciseRound(byteSize / BYTES_IN_GIGABYTE, 2));
        } else if (byteSize >= BYTES_IN_MEGABYTE) {
            sizeString = format(Strings.fileSizeMB, _preciseRound(byteSize / BYTES_IN_MEGABYTE, 2));
        } else if (byteSize >= BYTES_IN_KILOBYTE) {
            sizeString = format(Strings.fileSizeKB, _preciseRound(byteSize / BYTES_IN_KILOBYTE, 2));
        } else if (byteSize === 1) {
            sizeString = format(Strings.fileSizeBytesSingular, byteSize);
        } else if (byteSize !== undefined && !isNaN(byteSize)) {
            sizeString = format(Strings.fileSizeBytesPlural, byteSize);
        }
    }

    return sizeString;
}

function _preciseRound(num: number, decimals: number): string {
    'use strict';

    return String(Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals));
}

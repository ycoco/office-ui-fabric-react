import StringHelper = require('odsp-shared/utilities/string/StringHelper');
import StringUtilitiesResx = require('./StringUtilities.resx');

var Strings = StringUtilitiesResx.strings;

var BYTES_IN_KILOBYTE = 1024;
var BYTES_IN_MEGABYTE = BYTES_IN_KILOBYTE * 1024;
var BYTES_IN_GIGABYTE = BYTES_IN_MEGABYTE * 1024;

class FileSizeFormatter {

    static formatSize(byteSize: number, allowZeroBytes?: boolean): string {
        var sizeString = '';

        if (typeof byteSize === 'number' && (byteSize > 0 || allowZeroBytes)) {
            if (byteSize >= BYTES_IN_GIGABYTE) {
                sizeString = StringHelper.format(Strings.fileSizeGB, FileSizeFormatter._preciseRound(byteSize / BYTES_IN_GIGABYTE, 2));
            } else if (byteSize >= BYTES_IN_MEGABYTE) {
                sizeString = StringHelper.format(Strings.fileSizeMB, FileSizeFormatter._preciseRound(byteSize / BYTES_IN_MEGABYTE, 2));
            } else if (byteSize >= BYTES_IN_KILOBYTE) {
                sizeString = StringHelper.format(Strings.fileSizeKB, FileSizeFormatter._preciseRound(byteSize / BYTES_IN_KILOBYTE, 2));
            } else if (byteSize === 1) {
                sizeString = StringHelper.format(Strings.fileSizeBytesSingular, byteSize);
            } else if (byteSize !== undefined && !isNaN(byteSize)) {
                sizeString = StringHelper.format(Strings.fileSizeBytesPlural, byteSize);
            }
        }

        return sizeString;
    }

    private static _preciseRound(num: number, decimals: number): string {
        return String(Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals));
    }
}


export = FileSizeFormatter;
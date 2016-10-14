function generateUuidPart(length: number): string {
    "use strict";

    var str = '';

    while (str.length < length) {
        var num = Math.random() * 16;
        num = num | 0; // clear decimal
        str += num.toString(16);
    }

    return str;
}

export default class Guid {
    public static Empty = "00000000-0000-0000-0000-000000000000";

    /**
     * Return a v4 UUID as specified by RFC 4122 http://tools.ietf.org/html/rfc4122
     */
    public static generate(): string {

        var parts = [];
        parts.push(generateUuidPart(8));
        parts.push(generateUuidPart(4));

        // first digit must be 4 since we are using pseudorandom numbers
        var timeHighAndVersion = '4' + generateUuidPart(3);
        parts.push(timeHighAndVersion);

        // first digit must have first two bits set to 10
        var clockSeqHiAndReserved = generateUuidPart(4);
        var intVal = parseInt(clockSeqHiAndReserved[0], 10);
        intVal = intVal & 3; // clear out first two bits
        intVal = intVal | 8; // set first bit to 1
        clockSeqHiAndReserved = intVal.toString(16) + clockSeqHiAndReserved.substr(1);
        parts.push(clockSeqHiAndReserved);

        parts.push(generateUuidPart(12));
        return parts.join('-');
    }

    /**
     * Normalizes a GUID to lowercase. Returns '' if guid is not given.
     * @param includeBrackets - if true, add or keep brackets; if false, strip brackets
     */
    public static normalizeLower(guid: string, includeBrackets?: boolean): string {
        return guid ? Guid._normalizeBrackets(guid.toLowerCase(), includeBrackets) : '';
    }

    /**
     * Normalizes a GUID to uppercase. Returns '' if guid is not given.
     * @param includeBrackets - if true, add or keep brackets; if false, strip brackets
     */
    public static normalizeUpper(guid: string, includeBrackets?: boolean): string {
        return guid ? Guid._normalizeBrackets(guid.toUpperCase(), includeBrackets) : '';
    }

    private static _normalizeBrackets(guid: string, includeBrackets: boolean): string {
        let match = guid.match(/^\{(.*)\}$/);
        if (match) {
            return includeBrackets ? match[0] : match[1];
        }
        return includeBrackets ? '{' + guid + '}' : guid;

    }
}

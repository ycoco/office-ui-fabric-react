// encode <>&'"
const ENCODE_HTML_TEXT_REGEX = /[<>&'"\\]/g;
const CODES = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#39;',
    '\\': '&#92;'
};

function replacer(match: string) {
    return CODES[match];
}

export default class HtmlEncoding {
    /**
     * Encodes a string for use in HTML text. Not recommended for attribute values
     * or anything that might be used in a URL.
     */
    public static encodeText(inputString: string) {
        if (!inputString) {
            return "";
        }
        return inputString.replace(ENCODE_HTML_TEXT_REGEX, replacer);
    }
}

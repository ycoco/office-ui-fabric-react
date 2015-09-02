// encode <>&'"
var ENCODE_HTML_TEXT_REGEX = /[<>&'"\\]/g;
var CODES = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#39;'
};

class HtmlEncoding {
    /**
     * Encodes a string for use in HTML text. Not recommended for attribute values
     * or anything that might be used in a URL.
     */
    static encodeText(inputString: string) {
        if (!inputString) {
            return "";
        }
        return inputString.replace(ENCODE_HTML_TEXT_REGEX, (_match: string) => CODES[_match]);
    }
}

export = HtmlEncoding;
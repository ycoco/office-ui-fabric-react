// OneDrive:IgnoreCodeCoverage

class UriEncoding {
    /////////////////////////////
    // This file is more clean of all unneeded pollutants. It only contains the minimum amount of code required for someone to use the URI class.
    // You should think twice before adding anything else into this file because you will be causing unneeded bloat from someone else.
    /////////////////////////////

    /**
     * This function performs an aggressive unicode URL-encoding.
     * Convert non alphanum character into UTF-8 code string in format %XX%XX%XX.
     *
     * Escape unsafe characters
     *   CTL | SP | <"> | "#" | "%" | "<" | ">" | "'" | "&"
     * in the URL path (before "?", "#")
     * No encoding on query string.
     *
     * @param {string} str - String to encode
     * @param {boolean} bAsUrl - Encode in the same way as the code in unmanaged (Url::UrlEncode) code and
     *                           SP OM (SPHttpUtility.UrlKeyValueEncode and SPHttpUtility.UrlPathEncode).
     * @param {boolean} bForFilterQuery
     * @param {boolean} bForCallback - Only escape the characters after 0x7F to workaround bug O12: 452191
     */
    static encodeURIComponent(str: string, bAsUrl?: boolean, bForFilterQuery?: boolean, bForCallback?: boolean): string {
        var strOut = "";
        var strByte: number;
        var ix = 0;
        var strEscaped = " \"%<>\'&";
        if (!str) { // making this more robust
            return "";
        }
        var len = str.length;
        for (ix = 0; ix < len; ix++) {
            var charCode = str.charCodeAt(ix);
            var curChar = str.charAt(ix);
            if (bAsUrl && (curChar === '#' || curChar === '?') ) {
                strOut += str.substr(ix);
                break;
            }
            if (bForFilterQuery && curChar === '&') {
                strOut += curChar;
                continue;
            }
            if (charCode <= 0x7f) {
                if (bForCallback) {
                    strOut += curChar;
                } else {
                    if ( (charCode >= 97 && charCode <= 122) ||
                            (charCode >= 65 && charCode <= 90) ||
                            (charCode >= 48 && charCode <= 57) ||
                            (bAsUrl && (charCode >= 32 && charCode <= 95) && strEscaped.indexOf(curChar) < 0))    {
                        strOut += curChar;
                    } else if (charCode <= 0x0f)    {
                        strOut += "%0" + charCode.toString(16).toUpperCase();
                    } else if (charCode <= 0x7f)    {
                        strOut += "%" + charCode.toString(16).toUpperCase();
                    }
                }
            } else if (charCode <= 0x07ff) {
                strByte = 0xc0 | (charCode >> 6);
                strOut += "%" + strByte.toString(16).toUpperCase();
                strByte = 0x80 | (charCode & 0x003f);
                strOut += "%" + strByte.toString(16).toUpperCase();
            } else if ((charCode & 0xFC00) !== 0xD800) {
                strByte = 0xe0 | (charCode >> 12);
                strOut += "%" + strByte.toString(16).toUpperCase();
                strByte = 0x80 | ((charCode & 0x0fc0) >> 6);  // middle 6 bits
                strOut += "%" + strByte.toString(16).toUpperCase();
                strByte = 0x80 | (charCode & 0x003f);         // lower 6 bits
                strOut += "%" + strByte.toString(16).toUpperCase();
            } else if (ix < str.length - 1) {
                charCode = (charCode & 0x03FF) << 10;           // lower 10 bits of first char
                ix ++;
                var nextCharCode = str.charCodeAt(ix);
                charCode |= nextCharCode & 0x03FF;                  // lower 10 bits of second char
                charCode += 0x10000;
                strByte = 0xf0 | (charCode >> 18);
                strOut += "%" + strByte.toString(16).toUpperCase();
                strByte = 0x80 | ((charCode & 0x3f000) >> 12); // upper 6 bits
                strOut += "%" + strByte.toString(16).toUpperCase();
                strByte = 0x80 | ((charCode & 0x0fc0) >> 6);   // middle 6 bits
                strOut += "%" + strByte.toString(16).toUpperCase();
                strByte = 0x80 | (charCode & 0x003f);          // lower 6 bits
                strOut += "%" + strByte.toString(16).toUpperCase();
            }
        }
        return strOut;
    }

    static escapeUrlForCallback(str: string) {
        // Callbacks do not work if a #bookmark is in the URL. If there is a bookmark then we need to remove it. We also need to
        // deal with the scenario where there is not a bookmark but there is an unencoded # as a part of a name/value after the '?'.
        // This is how things should work here:
        //      .../foo.aspx -> .../foo.aspx (unchanged)
        //      .../foo.aspx#bookmark -> .../foo.aspx (bookmark is removed)
        //      .../foo.aspx#bookmark?name=value -> .../foo.aspx?name=value (bookmark is removed)
        //      .../foo.aspx#bookmark?name1=value#extra1&name2=value2 -> .../foo.aspx?name1=value#extra1&name2=value2 (only the bookmark # is removed)
        //      .../foo.aspx?name1=value#extra1&name2=value2 -> .../foo.aspx?name1=value#extra1&name2=value2 (unchanged)
        var iPound = str.indexOf("#");
        var iQues = str.indexOf("?");
        if ((iPound > 0) && ((iQues === -1) || (iPound < iQues))) {
            var strNew = str.substr(0, iPound);
            if (iQues > 0)    {
                strNew += str.substr(iQues); // Need to include the '?' along with the "name=value" pairs.
            }
            str = strNew;
        }
        return UriEncoding.encodeURIComponent(str, true, false, true);
    }

    static encodeRestUriStringToken(stringToken: string) {
        if (stringToken) {
            // SharePoint REST processor expect single quote ' to be escaped to '' in tokens.
            // Example: getFolderByServerRelativeUrl('don't know.txt') should became getFolderByServerRelativeUrl('don''t know.txt')

            stringToken = stringToken.replace(/'/g, "''");
            stringToken = UriEncoding.encodeURIComponent(stringToken);
        }

        return stringToken;
    }
}

export = UriEncoding;
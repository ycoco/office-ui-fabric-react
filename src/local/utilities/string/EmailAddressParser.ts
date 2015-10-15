// OneDrive:IgnoreCodeCoverage

/**
 * Matches strings that look like email addresses. 
 * Note that this regex will also match surrounding brackets and double-quotes; e.g. all of the following will match:
 * a@b.com "a@b.com" <a@b.com> 'a@b.com "a@b.com> a@b.com> <a@b.com etc.
 */
class EmailAddressParser {

    // WinLive 839729 - In order to avoid parsing issues with characters above ASCII range, the regex accepts any unicode 
    // charactes above ASCII range wherever it would also accept alphanumeric characters. Ideally, it'd exclude 
    // non-word characters, but the regex engine in Javascript doesn't provide enough unicode support for that, 
    // so we use the blunt instrument of including \u0080-\uFFFF as valid. 
    // Email addresses that contain characters in the \u0080-\uFFFF range aren't actually valid, but we still want to  
    // recognize them as part of the email address so that it's even possible to detect the email address as invalid.  
    // Otherwise, the algorithm would merely truncate to the valid part of the email address.
    // It is up to clients to validate their email addresses if they want stricter checking.
    private static EmailRegexPattern = "(?:[<\"]\\s*)?[a-z0-9\\u0080-\\uFFFF!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9\\u0080-\\uFFFF!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9\\u0080-\\uFFFF](?:[a-z0-9\\u0080-\\uFFFF-]*[a-z0-9\\u0080-\\uFFFF])?\\.)+[a-z0-9\\u0080-\\uFFFF](?:[a-z0-9\\u0080-\\uFFFF-]*[a-z0-9\\u0080-\\uFFFF])?(?:\\s*[>\"])?";
    private static EmailRegex = new RegExp(EmailAddressParser.EmailRegexPattern, "i");

    // RegEx pattern used to test if a string has valid email syntax (RFC822).
    private static ValidEmailRegexPattern = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)";
    private static ValidEmailRegex = new RegExp(EmailAddressParser.ValidEmailRegexPattern, "i");

    // Regex used for stripping off the extra quote marks and brackets that the above regex matches
    private static StripBracketsAndQuotesRegex = /^[<"]?([^<>"]*)[>"]?$/;
    private static DelimiterRegex = /[,;](?=(?:[^"]*"[^"]*")*(?![^"]*"))/;
    private static EmailMatchTypes = { None: 0, Quoted: 1, Bare: 2, Bracketed: 3 };

    private _email: string;
    private _raw: string;
    private _name: string;

    /**
     * Parses text input into name and address properties.
     * @param {string} text - The string to parse.
     * @returns {EmailAddressParser} EmailAddressParser instances.
     */
    constructor(text: string) {
        var email;

        this._raw = text;

        if (!text) {
            return;
        }

        // WinLive: 656427: AutoComplete: Replying to message with no friendly name fails to populate the reply-to address in the To box for BiDi languages
        // Remove Unicode left-to-right and right-to-left markers (invisible chars)
        text = text.replace(/\u200e|\u200f/g, "");

        text = text.trim();

        // Match an email address out of the string.
        // In order to do iterative matching, we need a regex with the global flag which is private to this method.
        // There would be errors in subsequent uses of the regex if EmailRegex had the global flag.
        var emailRegex = new RegExp(EmailAddressParser.EmailRegexPattern, "gi");
        var addrMatch, currMatch;
        var addrMatchType = EmailAddressParser.EmailMatchTypes.None;
        var currMatchType = EmailAddressParser.EmailMatchTypes.None;
        while ((currMatch = emailRegex.exec(text)) != null) {
            var currMatchString = currMatch[0];
            var firstChar = currMatchString.charAt(0);
            var lastChar = currMatchString.charAt(currMatchString.length - 1);

            // Figure out what kind of email address we have
            if (firstChar === '<' && lastChar === '>') {
                currMatchType = EmailAddressParser.EmailMatchTypes.Bracketed;
            } else if (firstChar === '"' && lastChar === '"') {
                currMatchType = EmailAddressParser.EmailMatchTypes.Quoted;
            } else {
                currMatchType = EmailAddressParser.EmailMatchTypes.Bare;
            }

            if (currMatchType > addrMatchType) {
                // If this address is more desirable than what we currently have, replace it.
                addrMatch = currMatch;
                addrMatchType = currMatchType;
                if (currMatchType === EmailAddressParser.EmailMatchTypes.Bracketed) {
                    // Since Bracketed emails are the most desirable, we break on the first one we find
                    // to avoid unneccesary processing.
                    break;
                }
            }
        }

        // Clean up the email address and parse out the name, if possible.
        var rawName = text;
        if (addrMatch) {
            email = addrMatch[0];

            // Split the text into three parts based on the address (before/address/after):
            var startIndex = addrMatch.index;
            var endIndex = startIndex + email.length;
            var before = startIndex > 0 ? text.substr(0, startIndex).trim() : "";
            var after = endIndex < text.length ? text.substr(endIndex) : "";

            // Remove surrounding quote marks and brackets.
            var cleanEmail = EmailAddressParser.StripBracketsAndQuotesRegex.exec(email);
            email = cleanEmail[1];

            // Remove leading quote mark if there's also a trailing quote mark.
            if (email.charAt(0) === "'" && after && after.charAt(0) === "'") {
                email = email.slice(1);
                after = after.slice(1).trim();
            }

            // Choose the first non-empty string to parse the name from:
            rawName = before === "" ? after : before;

            this._email = email.trim();
        }

        // Clean up the name next...
        rawName = rawName.replace(/^\s*"\s*/, "").trim();
        if ((rawName.length > 1) && (rawName.charAt(rawName.length - 2) !== "/")) {
            // Last double-quote is not escaped; remove it:
            rawName = rawName.replace(/\s*"$/, "");
        }

        // Remove all escapes:
        rawName = rawName.replace(/\//g, "");
        if (rawName !== "" && rawName !== email) {
            this._name = rawName;
        }
    }

    /**
     * Checks if the given string is a valid email address format.
     * @param {string} token - A string (potentially) containing an email address.
     * @param {boolean} checkRfcCompliant - If true, also checks to make sure that the 
     * string contains an address that is nominally RFC822-compliant. Otherwise, only checks whether the 
     * EmailAddressParser recognizes a parsable email address inside the string. Defaults to false
     * @returns {boolean} True if the string represents a parsable email address.
     */
    public static isValidEmailSyntax(token: string, checkRfcCompliant: boolean): boolean {
        if (!token) {
            return false;
        }

        return !!(checkRfcCompliant ? EmailAddressParser.ValidEmailRegex : EmailAddressParser.EmailRegex).exec(token.trim());
    }

    /**
     * Factory method that parses a text string into an array of EmailAddressParser instances.
     * @param {string} text - The string to parse.
     * @returns {EmailAddressParser} An array of EmailAddressParser instances.
     */
    public static parse(text: string): Array<EmailAddressParser> {
        if (!text) {
            return [];
        }

        var entries = EmailAddressParser._splitAddresses(text);
        var addresses = [];
        for (var i = 0, len = entries.length; i < len; i++) {
            addresses.push(new EmailAddressParser(entries[i]));
        }

        return addresses;
    }

    /**
     * Answers whether the last email address has a delimiter at the end of it.
     * @param {string} text - The string to parse.
     * @returns {boolean} True if the last email address ends with a delimiter, false otherwise
     */
    public static endsWithDelimiter(text: string): boolean {
        if (text) {
            var parts = text.split(EmailAddressParser.DelimiterRegex);
            return !parts[parts.length - 1].trim();
        } else {
            return false;
        }
    }

    /**
     * Parses a string containing semicolon- or comma-delimited email addresses into entries.
     * Separators within double-quotes are not active, allowing names such as "Last, First".
     * @param {string} s - The string to parse.
     * @returns {String} An array of address strings
     */
    private static _splitAddresses(s: string) {
        var parts = s.split(EmailAddressParser.DelimiterRegex);

        // Trim entries of whitespace and remove empty entries:
        for (var i = parts.length - 1; i >= 0; i--) {
            parts[i] = parts[i].trim();
            if (parts[i].length === 0) {
                parts.splice(i, 1);
            }
        }

        return parts;
    }

    /**
     * Gets the parsed email address of the contact
     * @returns {String}
     */
    public getEmail(): string {
        return this._email;
    }

    /**
     * Gets the display name of the contact
     * @returns {String}
     */
    public getName(): string {
        return this._name;
    }


    /**
     * Gets the raw value of the contact
     * @returns {String}
     */
    public getRaw(): string {
        return this._raw;
    }
}

export = EmailAddressParser;
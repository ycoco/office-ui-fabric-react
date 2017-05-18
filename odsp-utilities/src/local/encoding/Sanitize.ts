const TAG_BODY = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

/** Regex that matches all non-text in an HTML string. */
const NONTEXT_PATTERN = new RegExp(
        '<(?:'
        // remove comments
        + '!--(?:(?:-*[^->])*--+|-?)'
        // remove script and style tags, and their contents
        + '|script\\b' + TAG_BODY + '>[\\s\\S]*?</script\\s*'
        + '|style\\b' + TAG_BODY + '>[\\s\\S]*?</style\\s*'
        // all other element tags
        + '|/?[a-z]' + TAG_BODY
        + ')>',
    'gi');

/**
 * Contains utility functions to sanitize user input.
 * This should only be used for DISPLAYING user input, not for sending it to the server. The server itself
 * also needs to sanitize user input to avoid security risks.
 */
export class Sanitize {
    /**
     * Takes a string with HTML elements and returns only the text contents that the user would read.
     * This differs from .innerText in that it also removes the contents of script tags, and other similar differences.
     */
    public static getTextFromHtml(html: string) {
        let oldHtml = '';

        do {
            oldHtml = html;
            html = oldHtml.replace(NONTEXT_PATTERN, '');
        } while (oldHtml !== html);
        return html;
    }

    /**
     * Sanitizes the text by calling getTextFromHtml(), then decodes the HTML Entities, for example "&lt" to "<"
     */
    public static decodeHtmlEntities(text: string): string {
        text = Sanitize.getTextFromHtml(text);
        let element: HTMLElement = document.createElement('div');
        element.innerHTML = text;
        return element.textContent;
    }
}

export default Sanitize;
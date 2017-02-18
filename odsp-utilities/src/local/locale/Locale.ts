// OneDrive:IgnoreCodeCoverage

class Locale {
    public static isRightToLeft: boolean;
    public static safeLeft: string;
    public static safeRight: string;
    public static language: string;

    public static invalidate() {
        Locale.isRightToLeft = (document.documentElement.getAttribute('dir') === 'rtl');
        Locale.safeLeft = Locale.isRightToLeft ? 'right' : 'left';
        Locale.safeRight = Locale.isRightToLeft ? 'left' : 'right';

        /** Robert Chen has the detailed explanation here : The most magic thing here is that OneDrive page and teamsite page has exactly the same line of code with regard to html tag Lang attribute.
         * <SharePoint:SPHtmlTag lang="<%$Resources:wss,language_value%>" dir="<%$Resources:wss,multipages_direction_dir_value%>" ID="SPHtmlTag" runat="server">
         * And in teamsite doclib, this lang gets executed to the current user locale. And that is actually already a magic------What happens here is the in order to get the doclib page in ContentDB, we had a standard MondoSproc call which gets the page and the SPWeb. In constructing the web, SP *  * code has smart logic to set Thread.CurrentThread.CurrentUICulture to match the MUI language! And with that magic, ="<%$Resources:wss,language_value%> actually gets sets properly to the user language, not the pre-defined web language.
         * For OneDrive.aspx which lives inside _layouts folder, the order of code execution changes. We must have executed this line of ASPX code first ="<%$Resources:wss,language_value%> before SPWeb was opened and did the magic to set Thread.CurrentThread.CurrentUICulture.
         * So the Thread.CurrentThread.CurrentUICulture affecting ="<%$Resources:wss,language_value%> with SPWeb magic end up not working in Onedrive.aspx! And there’s really nothing that we can do about it unless we rewrite the page!
         * So the conclusion is that the lang attribute is by design (of implementation) different from the regular team site pages which live inside content db.
         */
        let language = window["_spPageContextInfo"] && window["_spPageContextInfo"].currentCultureName;

        // fallback of xml:lang for IE9
        Locale.language = language ||
            document.documentElement.getAttribute('lang') ||
            document.documentElement.getAttribute('xml:lang') ||
            'en-us';
    }
}

Locale.invalidate();

export default Locale;

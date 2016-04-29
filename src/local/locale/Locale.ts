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
        // fallback of xml:lang for IE9
        Locale.language = document.documentElement.getAttribute('lang') || document.documentElement.getAttribute('xml:lang');
    }
}

Locale.invalidate();

export default Locale;

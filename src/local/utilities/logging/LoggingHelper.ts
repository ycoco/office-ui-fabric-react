// OneDrive:IgnoreCodeCoverage

class LoggingHelper {
    public static ClickName = 'Click';

    public static capitalizeFirstLetter(tagPiece: string) {
        return tagPiece.charAt(0).toUpperCase() + tagPiece.slice(1);
    }
}

export = LoggingHelper;
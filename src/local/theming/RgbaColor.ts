/**
 * A color represented by red, green, blue, and alpha (opacity) components.
 */
class RgbaColor {
    public static maxComponent: number = 255;

    public R: number;
    public G: number;
    public B: number;
    public A: number;

    /** Constructs a default RgbaColor. Use RgbaColor.fromRgba to specify components. */
    constructor() {
        this.R = 0;
        this.G = 0;
        this.B = 0;
        this.A = RgbaColor.maxComponent; // Default to fully opaque.
    }

    /**
     * Creates an RgbaColor from red, green, blue, and alpha component values.
     * @param {number} r The red component value (between 0 and 255).
     * @param {number} g The green component value (between 0 and 255).
     * @param {number} b The blue component value (between 0 and 255).
     * @param {number} a The alpha component value (between 0 and 255).
     */
    public static fromRgba(r: number, g: number, b: number, a?: number) : RgbaColor {
        var colorObj : RgbaColor = new RgbaColor;
        colorObj.R = Math.round(r);
        colorObj.G = Math.round(g);
        colorObj.B = Math.round(b);
        colorObj.A = a != null ? Math.round(a) : RgbaColor.maxComponent;
        return colorObj;
    }

    /**
     * Parses an HTML color string in the formats #AARRGGBB, #RRGGBB, or #RGB.
     * @param {string} htmlColor The HTML color string to parse.
     */
    public static fromHtmlColor(htmlColor: string) : RgbaColor {
        function TwoHexCharsToNumber(str: string, index1: number, index2: number) : number {
            return parseInt(str.charAt(index1) + str.charAt(index2), 16);
        }

        var resultColor: RgbaColor = new RgbaColor;
        if (typeof htmlColor === "string" && htmlColor.charAt(0) === "#") {
            switch (htmlColor.length) {
                case 9: // #AARRGGBB
                    resultColor.A = TwoHexCharsToNumber(htmlColor, 1, 2);
                    resultColor.R = TwoHexCharsToNumber(htmlColor, 3, 4);
                    resultColor.G = TwoHexCharsToNumber(htmlColor, 5, 6);
                    resultColor.B = TwoHexCharsToNumber(htmlColor, 7, 8);
                    break;
                case 7: // #RRGGBB
                    resultColor.R = TwoHexCharsToNumber(htmlColor, 1, 2);
                    resultColor.G = TwoHexCharsToNumber(htmlColor, 3, 4);
                    resultColor.B = TwoHexCharsToNumber(htmlColor, 5, 6);
                    break;
                case 4: // #RGB
                    resultColor.R = TwoHexCharsToNumber(htmlColor, 1, 1);
                    resultColor.G = TwoHexCharsToNumber(htmlColor, 2, 2);
                    resultColor.B = TwoHexCharsToNumber(htmlColor, 3, 3);
                    break;
            }
        }

        return resultColor;
    }

    /**
     * Converts an RgbaColor into an HTML string suitable for use as a CSS color value.
     * @param {RgbaColor} c The color to convert.
     * @param {boolean} bFilterValue If true, this produces a string to in the #AARRGGBB format.
     */
    public static toHtmlString(c: RgbaColor, bFilterValue?: boolean) : string {
        function ByteToHexString(/*@type(Number)*/b: number): string  {
            var byte: number = Number(b);
            if (!(byte >= 0 && byte <= RgbaColor.maxComponent)) {
                throw new Error("Argument must be a Number in [0, 255]");
            }

            var hex: string = byte.toString(16);
            if (byte < 16) {
                hex = "0" + hex;
            }
            return hex;
        }

        if (c.A < RgbaColor.maxComponent && !bFilterValue) {
            return "rgba(" +
                c.R.toString(10) + ", " +
                c.G.toString(10) + ", " +
                c.B.toString(10) + ", " +
                (c.A / RgbaColor.maxComponent).toFixed(2) + ")";
        } else {
            return "#" +
                (bFilterValue ? ByteToHexString(c.A) : "") +
                ByteToHexString(c.R) +
                ByteToHexString(c.G) +
                ByteToHexString(c.B);
        }
    }
}

export default RgbaColor;
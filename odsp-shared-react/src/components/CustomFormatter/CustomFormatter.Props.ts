//Documentation at https://view.officeapps.live.com/op/view.aspx?src=http%3A%2F%2Fcyrusb.blob.core.windows.net%2Fplayground%2FfieldRendererJson.docx

/**
 * Defines the main structure of fieldRenderer JSON format.
 */
export interface ICustomFormatterProps {
    /**
     * Specifies the type of element type to create. Valid elements are
     * div
     * span
     * a
     * img
     * svg
     * path
     * */
    elmType: "div" | "span" | "a" | "img" | "svg" | "path";

    /**
     * Optional text content of the element. Specify an IExpression object or a string literal.
     * IExpression objects will be evaluated at runtime to obtain the final string.
     * */
    txtContent?: IExpression | string;

    /**
     * Optional style object for the element. An associative array of name/value pairs.
     * Values can be string literals or IExpression
    */
    style?: IDictionaryExpression;

    /**
     * Optional attribute collection for the element if any. An associative array of name/value pairs.
     * Values can be string literals or IExpression
     */
    attributes?: IDictionaryExpression;

    /**
     * Optional children elements for this element if any, expressed as an array of ICustomFormatterProps.
     * This allows you to create nested element structures just as you would with html.
     * */
    children?: ICustomFormatterProps[];

    /**
     * If this is set to true, then errors are made more prominent, so that it's easier to debug your
     * fieldRenderer JSON.
     * */
    debugMode?: boolean;

    /** Remote REST request to make before rendering this field
     * Not supported yet because it could be used for XSS type attacks
     */
    //remoteRestJsonUrl?: IExpression;

}

/**
 * A tree notation for an expression
 */
export interface IExpression {
    /**
     * Operation to perform. Allowed operators are
     * +
     * -
     * *
     * /
     * <
     * >
     * <=
     * >=
     * toString()
     * cos
     * sin
     * : For tertiary operations. e.g. a ? b : c
    */
    operator: "+" | "-" | "*" | "/" | "<" | ">" | "<=" | ">=" | "toString()" | "cos" | "sin" | ":";

    /**
     * The array of operands that this operator will operate on.
     * For uniary operators like toString(), cos, sin, just one operand is needed.
     * For binary operators like +, -, *, / etc., 2 operands are needed
     * For the tertiary operator (:), 3 operands are needed. The condition operator, and the 2 choices.
     * For + and * operators, you will be allowed to specify more than 2 operands. This can help in
     *          long string concatinations etc.
    */
    operands: (IExpression | number | string | boolean)[];
}

/**
 * Declares an associative array of name/value pairs.
 * Values can either be string literals or IExpression.
 */
export interface IDictionaryExpression {
    [index: string]: IExpression | string;
}

/**
 * An associative array of name/value pairs. The value specified is a boolean.
 * This is used as a quick dictionary lookup to see if a string is in the approved list.
 */
export interface IDictionaryBool {
    [index: string]: boolean;
}

export interface IDictionary {
    [index: string]: string;
}

import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';

//Documentation at https://view.officeapps.live.com/op/view.aspx?src=http%3A%2F%2Fcyrusb.blob.core.windows.net%2Fplayground%2FfieldRendererJson.docx

/**
 * Defines the parameters that are passed to the CustomFormatter class constructor.
 */
export interface ICustomFormatter {
    /** JSON string that conforms to the ICustomFormatterProps JSON format.
     * This JSON blob describes the intended UI.
     */
    fieldRendererFormat: string,

    /** The row data that this filed renderer will act on */
    row: any,

    /** Optional  name of the current field. If this is being used as a field renderer*/
    currentFieldName?: string,

    /** A fieldName to type associative array. Current types supported are
     * Text and Number */
    rowSchema?: IDictionary,

    /**
     * Context info of the hosting page that has information like current user email,
     * current user display name. Etc.
     */
    pageContextInfo?: ISpPageContext

    // errorStrings is not an interface now because of the convenience of not having a
    // breaking change every time an error string is added.
    // When the component is settled, it'll be very easy to convert errorStrings
    // into an interface. The code at CustomFormatter._err is robust enough to
    // handle the case where a value is missing.

    /** A list of error strings if the caller wants detailed error information.
     * A caller provided set of known name/value pairs that will be used by CustomFormatter
     * when thigns go wrong. Current valid names are:
     *
     * elmTypeMissing: "Must specify elmType",
     * elmTypeInvalid: "Invalid elmType:  {0}. Must be one of {1}.",
     * operatorMissing: "Missing operator in expression: {0}.",
     * operatorInvalid: "'{0}' is not a valid operator. It must be one of {1} in the expression {2}. ",
     * operandMissing: "There must be at least 1 operand in the expression {0}",
     * operandNOnly: "Expecting {0} operand(s) for the expression {1}",
     * nan: "{0} is not a number. Number expected in the expression {1}"
     * unsupportedType : "The type of field {0} is unsupported at this time."
     *
     * ariaError: No aria- tags found. As such, the field will not be accessible via a screen reader.
     * invalidProtocol: Only http, https and mailto protocols are allowed.
     * invalidStyleValue: The style values '{0}' contains one or more of the following disallowed characters ( : & ; ! .
     * invalidStyleAttribute: '{0}' is not a valid style attribute.
     */
    errorStrings?: IDictionary
}

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
     * Names are normal html style attributes like "color" or "background-color"
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
     * Number()
     * cos
     * sin
     * : For tertiary operations. e.g. a ? b : c
    */
    operator: "+" | "-" | "*" | "/" | "<" | ">" | "<=" | ">=" | "toString()" | "Number()" | "cos" | "sin" | ":";

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
 *
 * Certain string literals have special meaning and are treated as
 * variables instead of constants
 *
 * "[$MarchSales]" :        Specifies the value of the field with name "MarchSales"
 * "[$AssignedTo.Title]" :  Specifies the "Title" sub-property of the field with name "AssignedTo"
 * "@currentField" :        Specifies the value of the current field.
 * "@me" :                  Specifies the value of the current user
 * "@now" :                 Specifies the current time
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

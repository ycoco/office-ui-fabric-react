/**
 * The main purpose of this class is to allow for a declerative JSON blob to
 * specify the layout/UI of a blob of aribitary JSON data.
 *
 * At it's core, the JSON blob that declares the layout is a hierarchiecal description of
 * elements, coupled with some basic data-binding and expression evaluation that makes it
 * a completely codeless way to specify layout. The current intent is to have this class
 * be used for no-code custom field renderers in SharePoint lists.
 */

import { ICustomFormatter, ICustomFormatterProps, IExpression, IDictionaryBool } from './CustomFormatter.Props'

/* odsp-utilities */
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import HtmlEncoding from '@ms/odsp-utilities/lib/encoding/HtmlEncoding';

//Operators
const EQUAL = '==';
const GE = '>=';
const LE = '<=';
const GREATER = '>';
const LESS = '<';
const PLUS = '+';
const MINUS = '-';
const MULT = '*';
const DIVISION = '/';
const TOSTRING = 'toString()';
const TONUMBER = 'Number()';
const COS = 'cos';
const SIN = 'sin'
const TERNARY = ':';

//List of Unary Operators
const UNARY_OPERATORS: IDictionaryBool = {
    [TOSTRING]: true,
    [COS]: true,
    [SIN]: true,
    [TONUMBER]: true
};

//list of allowed operators
const ALL_OPERATORS: IDictionaryBool = {
    ...UNARY_OPERATORS,
    [EQUAL]: true,
    [GE]: true,
    [LE]: true,
    [GREATER]: true,
    [LESS]: true,
    [PLUS]: true,
    [MINUS]: true,
    [MULT]: true,
    [DIVISION]: true,
    [TERNARY]: true
};

//List of allowed elements
const OK_ELMS: IDictionaryBool = {
    "div": true,
    "span": true,
    "a": true,
    "img": true,
    "svg": true,
    "path": true
    // SECURITY ALERT
    // Be careful about what elements you add here. Primary concern is security,
    // so certainly don't be adding script etc. Secondly, keep in mind that this
    // list needs to be short so that mobile clients can deal with these attributes
    // in a reasonable way.
};

const HREF = 'href';

//List of allowed attributes
const OK_ATTRS: IDictionaryBool = {
    'href': true,
    'src': true,
    'class': true,
    'target': true,
    'd': true // for SVG path element
    // SECURITY ALERT
    // Be careful about what attributes you add here. Primary concern is security,
    // so certainly don't be adding onclick, onmouseover or an event handler attribute
    // because browsers will honor even encoded strings in these attributes.
};

//Field Types
const NUMBER = "Number";
const TEXT = "Text";
const DATE = "DateTime";
const USER = "User";
const CHOICE = "Choice";
const BOOL = "Boolean";
const NOTE = "Note";
const LOOKUP = "Lookup";

/**
 * The list of supported fields that we allow for data binding.We can keep adding to this list, but we don't
 * have to finish them all at once. We'll have a simple error message for the field types we don't support.
 */
const SUPPORTED_FIELDS: IDictionaryBool = {
    [NUMBER]: true,
    [TEXT]: true,
    [DATE]: true,
    [USER]: true,
    [CHOICE]: true,
    [BOOL]: true,
    [NOTE]: true,
    [LOOKUP]: true
};


//Field prefix and field syntax

// Used in expressions to specify the value of a field. e.g. [$MarchSales] signifies the field "MarchSales"
const FIELD_PREFIX = "$";

//Used in expressions to specify the value of the current field
const CUR_FIELD = "@currentField";

//Used in expressions to specify the login id of the current user
const CUR_USER = "@me";

//Used in expressions to specify "now"
const NOW = "@now";

export class CustomFormatter {
    private _cfr: ICustomFormatterProps;
    private _error: string;
    private _params: ICustomFormatter;

    constructor(params: ICustomFormatter) {
        this._params = params;
    }

    /**
     * Main public function that generates the final field HTML that is returned to the caller.
     * If any errors happened, then exceptions are caught in this function and a null string
     * is returned to the caller.
     * If we're in debug mode, the error string is rendered in the field html.
     */
    public evaluate(): string {
        let arrOutput: string[] = [];
        let cfr: ICustomFormatterProps;
        try {
            this._cfr = JSON.parse(this._params.fieldRendererFormat);
            cfr = this._cfr;
            //Synchronously generate the field element.
            this._createElementHtml(cfr, arrOutput);
        } catch (e) {
            let exceptionMsg = (typeof (e) === 'string') ? e : e.message;
            let errMsg = 'Failure: ' + exceptionMsg;
            console.log(errMsg);
            arrOutput = [];
            if (cfr && cfr.debugMode) {
                arrOutput.push(HtmlEncoding.encodeText(errMsg));
            }
            this._error = errMsg;
        }
        return arrOutput.join('');
    }

    /**
     * Public function to get an error string if any for this field renderer.
     */
    public errors(): string {
        return this._error || '';
    }

    /**
     * Creates the HTML for a single element. This function will go through and
     * generate the attributes, styles and child elements. Child elements are called
     * recursively, so this function is recursive.
     *
     * This function will only create elements of type DIV, SPAN, ANCHOR, IMG
     *
     * All generated HTML is pushed to the string array arrOutput, which will finally be
     * 'joined'
     */
    private _createElementHtml(cfr: ICustomFormatterProps, arrOutput: string[]) {
        if (!cfr.elmType) {
            this._err('elmTypeMissing');
        }
        let elmType = cfr.elmType.toLowerCase();
        if (!OK_ELMS[elmType]) {
            //Only certain elements are allowed to be created, so if it's not
            //in the approved list, throw an error.
            let allowedElementTypes: string = '';
            for (let elmType in OK_ELMS) {
                allowedElementTypes += elmType + " ";
            }
            this._err('elmTypeInvalid', elmType, allowedElementTypes);
        }
        arrOutput.push('<' + elmType + ' ');    //<div
        if (cfr.style) {
            //Style is specified, so generate the styles
            arrOutput.push('style="');
            for (let styleAttr in cfr.style) {
                //for each style attribute...
                this._createStyleAttr(styleAttr, cfr.style[styleAttr], arrOutput);
            }
            arrOutput.push('" ');
        }

        //Generate the attributes. Only white-listed attributes are allowed.
        if (cfr.attributes) {
            for (let attrName in cfr.attributes) {
                if (!OK_ATTRS[attrName]) {
                    //If the attribute is not on the whilte list, simply bail out
                    console.log('ignoring non-whitelisted attribute ' + attrName);
                    continue;
                }
                arrOutput.push(' ' + attrName + '="');
                let val: IExpression | string = cfr.attributes[attrName];
                this._createValue(val, arrOutput, attrName.toLowerCase() === HREF);
                arrOutput.push('" ')
            }
        }
        arrOutput.push('>');                    // >

        if (cfr.txtContent) {
            //If we just have text content, then generate it here
            this._createValue(cfr.txtContent, arrOutput);
        } else {
            //else, if we have sub elements, generate them here...
            if (cfr.children) {
                for (let i = 0; i < cfr.children.length; i++) {
                    this._createElementHtml(cfr.children[i], arrOutput);
                }
            }

        }

        arrOutput.push('</' + elmType + '>');
    }

    /**
     * This creates a single style attribute.
     * The generated name-value pair are added to the arrOutput string array.
     */
    private _createStyleAttr(propName: string, value: IExpression | string, arrOutput: string[]) {
        arrOutput.push(propName + ':');
        this._createValue(value, arrOutput);
        arrOutput.push(';');
    }

    /**
     * Creates a value string for an attribute or textContent.
     * The input is either a string or an Expression that needs to be evaluated.
     * Once evaluated, it is appended to the arrOutput array of strings.
     */
    private _createValue(val: IExpression | string, arrOutput: string[], isHrefEncodingNeeded?: boolean) {
        let exprVal = this._eval(val);
        if (exprVal === null || exprVal === undefined) {
            //expression resulted in a null value, so empty string.
            exprVal = '';
        }
        //Convert the raw value to a string. For date values, use the toDateString to get a prettier value.
        //At some point, we should probably use the field.FriendlyDisplay, but it's returning null at this point..
        let exprStr = (exprVal instanceof Date) ? exprVal.toDateString() : exprVal.toString();
        //HTML encode the string so that we don't have XSS issues
        let encodedVal: string = HtmlEncoding.encodeText(exprStr);
        if (isHrefEncodingNeeded) {
            //Special encoding needed for the href attribute because href attributes can start with javascript: which
            //allows another vector to run javascript. So remove it.
            encodedVal = encodedVal.trim();
            if (encodedVal.toLowerCase().indexOf('javascript:') === 0) {
                //no good, remove the javascript: part
                encodedVal = encodedVal.substr(11);
            }
        }
        arrOutput.push(encodedVal);
    }

    /**
     * The main guts of expression evaluation. Expressions are represented by a tree
     * of IExpression objects.
     *
     */
    private _eval(val: IExpression | string | number | boolean): any {
        if (val === undefined) {
            return undefined;
        }
        if (typeof (val) === 'string') {
            //string value, so it's either a variable or a constant
            if (val.indexOf(CUR_FIELD) === 0) {
                //variable for the value of the current field.
                let curField = this._params.currentFieldName;
                if (val === CUR_FIELD) {
                    //value is @currentField exactly
                    return this._evalJsonPath(this._params.row, curField);
                } else {
                    let dotIndex = val.indexOf('.');
                    if (dotIndex !== CUR_FIELD.length) {
                        //it's just a random string literal. So just return it
                        return val;
                    } else {
                        //value is something like @currentField.Title
                        //so convert it into fieldName.Title
                        let jPath = curField + val.substr(CUR_FIELD.length);
                        return this._evalJsonPath(this._params.row, jPath);
                    }

                }
            } else if (val === CUR_USER && this._params.pageContextInfo) {
                //variable for the current user
                return this._params.pageContextInfo.userLoginName;
            } else if (val === NOW) {
                //return the current time
                return new Date();
            } else if ((val.indexOf('[' + FIELD_PREFIX)) === 0 && (val[val.length - 1] === ']')) {
                //variable for row object, so use the row obj to get the real value
                //variable is of the form [$foo], so extract the foo part
                let rowProp = val.substr(2, val.length - 3);
                return this._evalJsonPath(this._params.row, rowProp);
            } else {
                //It's a constant, so just return it
                return val;
            }
        } else if (typeof (val) === 'number' || typeof (val) === 'boolean') {
            return val;
        }

        //It's an expression
        let exprVal: IExpression = <IExpression>val;
        let operator: string = exprVal.operator;
        let operands = exprVal.operands;

        //Handle base invalid case... We need an operator and at least one operand
        if (!operator) {
            this._err('operatorMissing', JSON.stringify(exprVal));
        }
        if (!ALL_OPERATORS[operator]) {
            //We don't have a valid operator
            let allowedOperators: string = '';
            for (let oprs in ALL_OPERATORS) {
                allowedOperators += oprs + " ";
            }
            this._err('operatorInvalid', operator, allowedOperators, JSON.stringify(exprVal));
        }
        if (operands === undefined || operands[0] === undefined) {
            //not a valid expression, so throw.
            this._err('operandMissing', JSON.stringify(exprVal));
        }
        if (UNARY_OPERATORS[operator]) {
            if (operands.length !== 1) {
                this._err('operandNOnly', (1).toString(), JSON.stringify(val));
            }
            if (operator === TOSTRING) {
                return this._toString(this._eval(operands[0]));
            } else if (operator === TONUMBER) {
                let rawVal: any = this._eval(operands[0]);
                return Number(rawVal);
            } else if (operator === COS) {
                return Math.cos(this._eval(operands[0]));
            } else if (operator === SIN) {
                return Math.sin(this._eval(operands[0]));
            }
        } else {
            //Binary or ternary operator
            if (operator === ':') {
                //It's a ternary operator
                return this._ternaryEval(exprVal, this._eval(operands[1]), this._eval(operands[2]), this._eval(operands[0]));
            } else if (operator === '+' || operator === '*') {
                return this._multiOpEval(exprVal);
            }
            else {
                return this._twoOpEval(exprVal, this._eval(operands[0]), operator, this._eval(operands[1]));
            }
        }
    }

    private _toString(val: string | number | boolean) {
        return val ? val.toString() : '';
    }

    private _ternaryEval(exprVal: IExpression, first: string | number | boolean, second: string | number | boolean, ternary: boolean): any {
        if (first === undefined || second === undefined || ternary === undefined) {
            this._err('operandNOnly', (3).toString(), JSON.stringify(exprVal));
        }
        return ternary ? first : second;
    }

    /**
     * An operator that can handle more than 2 operands. e.g. + and *
     * Just iterate through the list of operands and perform the same operation
     * over and over.
     */
    private _multiOpEval(exp: IExpression): (number | string) {
        let operator: string = exp.operator;
        let operands: (IExpression | number | string | boolean)[] = exp.operands;
        if (operands === undefined || operands.length < 2) {
            this._err('operandNOnly', (2).toString(), JSON.stringify(exp));
        }
        let result = this._eval(operands[0]);
        for (let i = 1; i < operands.length; i++) {
            let val = this._eval(operands[i]);
            result = this._twoOpEval(exp, result, operator, val);
        }
        return result;
    }
    private _twoOpEval(exp: IExpression, first: string | number | boolean, operator: string, second: string | number | boolean): any {
        if (first === undefined || second === undefined) {
            this._err('operandNOnly', (2).toString(), JSON.stringify(exp));
        }
        if (operator === EQUAL) {
            return (first === second);
        } else if (operator === GE) {
            return (first >= second);
        } else if (operator === LE) {
            return (first <= second);
        } else if (operator === GREATER) {
            return (first > second);
        } else if (operator === LESS) {
            return (first < second);
        } else if (operator === PLUS) {
            return (<string>first + <string>second);
        } else if (operator === MINUS) {
            this._validateIsNum(exp, first);
            this._validateIsNum(exp, second);
            return (<number>first - <number>second);
        } else if (operator === MULT) {
            this._validateIsNum(exp, first);
            this._validateIsNum(exp, second);
            return (<number>first * <number>second);
        } else if (operator === DIVISION) {
            this._validateIsNum(exp, first);
            this._validateIsNum(exp, second);
            return (<number>first / <number>second);
        } else {
            //should never get here because we've already validated that the operator is valid
            throw ('');
        }
    }

    private _validateIsNum(exp: IExpression, num: any) {
        if (typeof (num) !== 'number') {
            this._err('nan', num.toString(), JSON.stringify(exp));
        }
    }

    /**
     * Given an object 'obj' and a path string (e.g. row.name.first)
     * this function will try to get the value of row.name.first from the object
     * by going through the object hierarchy. Currently, the jpath only supports '.'
     */
    private _evalJsonPath(obj: any, jpath: string) {
        let result = obj;
        let jpathLength: number;
        try {
            //split the jpath into sub objects that are separated by .
            let jpathArr = jpath.split('.');
            let schema = this._params.rowSchema;
            let fieldType: string = schema[jpathArr[0]];
            jpathLength = jpathArr.length;

            if (schema && fieldType) {
                if (!SUPPORTED_FIELDS[fieldType]) {
                    this._err('unsupportedType', jpath);
                }
            }
            let isFieldTypeUser: boolean = (fieldType === USER);
            let isFieldTypeLookup: boolean = (fieldType === LOOKUP);

            for (let i = 0; i < jpathLength; i++) {
                //iterate through the jpath terms one at a time...
                result = result[jpathArr[i]];
                if ((isFieldTypeUser || isFieldTypeLookup) && i === 0 && this.isArray(result)) {
                    // if this is a User field or lookup field, then get the first entry in the array
                    // because user fields are of the format [{ "id": "33", "title": "Alex Burst", "email": "alexburs@microsoft.com", "sip": "alexburs@microsoft.com", "picture": "" }]
                    // and lookup fields are of the format [{"lookupId":2,"lookupValue":"Chicken","isSecretFieldValue":false}]
                    result = result[0];
                }
            }
        } catch (e) {
            console.log('could not evaluate ' + jpath);
            return null;
        }
        //If the result is undefined, error out
        if (result === undefined) {
            let err = jpath + ' was not found on the data object.'
            console.log(err);
            if (this._cfr.debugMode) {
                throw (err);
            }
        }
        if (jpathLength === 1) {
            //This is the most common case... When you have a jpath that's just the direct field name like
            // ~$MarchSales. For this specific case, do special schema conversion, because SharePoint returns
            // all its data as strings. So, try to convert these values to the values that they were intended
            // to be.
            return this._convertValue(result, jpath);
        }
        return result;
    }

    /**
     * Tries to coerce the value to the specified type
     */
    private _convertValue(val: any, jpath: string): any {
        let schema = this._params.rowSchema;
        if (schema && schema[jpath]) {
            //If there is a schema, validate that we support the
            //types.
            switch (schema[jpath]) {
                case TEXT:
                case LOOKUP: //For the case where we have a lookup field with additional columns, it always returns text.
                    return val;

                case NUMBER:
                    let num: any;
                    if (typeof (val) === 'string') {
                        //remove all commas etc.
                        //TODO: what about the case where separator is .?
                        num = parseFloat(val.replace(/,/g, ''));
                    } else {
                        num = Number(val);
                    }
                    return (isNaN(num) ? '' : num);

                case DATE:
                    if (typeof (val) === 'string') {
                        //TODO: Is this the right thing? Can the server pass us the real date?
                        //coerce the string value to a date
                        return (new Date(val));
                    } else {
                        return val;
                    }

                default:
                    this._err('unsupportedType', jpath);
                    break;
            }
        } else {
            // No schema specified, so return the default value.
            return val;
        }
    }

    /**
     * Is the object of type array
     */
    private isArray(obj: any): boolean {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    /**
     * Handle errors with the correct error strings
     */
    private _err(templateKey: string, ...args: string[]) {
        let errorStrings = this._params.errorStrings;
        let throwError = '';
        if (errorStrings && templateKey && errorStrings[templateKey]) {
            let templateVal: string = errorStrings[templateKey];
            throwError = StringHelper.format(templateVal, ...args);
        } else if (templateKey) {
            //If no error strings were provided to us, output the error Key
            throwError = "FieldRenderer Error: " + templateKey;
        }
        throw (throwError);
    }
}
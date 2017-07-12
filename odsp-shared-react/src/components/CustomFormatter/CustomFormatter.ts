import { ICustomFormatter, ICustomFormatterProps, IExpression, IDictionaryBool } from './CustomFormatter.Props'

/* odsp-utilities */
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import HtmlEncoding from '@ms/odsp-utilities/lib/encoding/HtmlEncoding';

//Operators
const EQUAL = '==';
const NOTEQUAL = '!=';
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
const TODATE = 'Date()';
const COS = 'cos';
const SIN = 'sin'
const TERNARY = ':';
const OR = "||";
const AND = "&&";

//List of Unary Operators
const UNARY_OPERATORS: IDictionaryBool = {
    [TOSTRING]: true,
    [COS]: true,
    [SIN]: true,
    [TODATE]: true,
    [TONUMBER]: true
};

//list of allowed operators
const ALL_OPERATORS: IDictionaryBool = {
    ...UNARY_OPERATORS,
    [EQUAL]: true,
    [NOTEQUAL]: true,
    [GE]: true,
    [LE]: true,
    [GREATER]: true,
    [LESS]: true,
    [PLUS]: true,
    [MINUS]: true,
    [MULT]: true,
    [DIVISION]: true,
    [TERNARY]: true,
    [OR]: true,
    [AND]: true
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
    'rel': true, // for anchor attributes
    'src': true,
    'class': true,
    'target': true,
    'title': true,
    'role' : true, //for accessibility
    'd': true // for SVG path element
    // SECURITY ALERT
    // Be careful about what attributes you add here. Primary concern is security,
    // so certainly don't be adding onclick, onmouseover or an event handler attribute
    // because browsers will honor even encoded strings in these attributes.
};

const OK_STYLE_ATTRS: IDictionaryBool = {
    // CSS Properties borrowed from http://www.w3schools.com/cssref/default.asp

    // Background properties
    //'background-attachment': true,
    'background-color': true,
    'fill': true,
    'background-image': true,
    //'background-position': true,
    //'background-repeat': true,
    //'background-clip': true,
    //'background-origin': true,
    //'background-size': true,

    // Border and outline properties
    'border': true,
    'border-bottom': true,
    'border-bottom-color': true,
    'border-bottom-style': true,
    'border-bottom-width': true,
    'border-color': true,
    'border-left': true,
    'border-left-color': true,
    'border-left-style': true,
    'border-left-width': true,
    'border-right': true,
    'border-right-color': true,
    'border-right-style': true,
    'border-right-width': true,
    'border-style': true,
    'border-top': true,
    'border-top-color': true,
    'border-top-style': true,
    'border-top-width': true,
    'border-width': true,
    'outline': true,
    'outline-color': true,
    'outline-style': true,
    'outline-width': true,
    'border-bottom-left-radius': true,
    'border-bottom-right-radius': true,
    'border-radius': true,
    'border-top-left-radius': true,
    'border-top-right-radius': true,
    'box-decoration-break': true,
    'box-shadow': true,
    'box-sizing': true,

    // Box properties
    'overflow-x': true,
    'overflow-y': true,
    'overflow-style': true,
    'rotation': true,
    'rotation-point': true,

    // Color properties
    'opacity': true,

    // Dimension properties
    'height': true,
    'max-height': true,
    'max-width': true,
    'min-height': true,
    'min-width': true,
    'width': true,

    // Flexible box properties
    'align-items': true,
    'box-align': true,
    'box-direction': true,
    'box-flex': true,
    'box-flex-group': true,
    'box-lines': true,
    'box-ordinal-group': true,
    'box-orient': true,
    'box-pack': true,

    // Font properties
    'font': true,
    'font-family': true,
    'font-size': true,
    'font-style': true,
    'font-variant': true,
    'font-weight': true,
    'font-size-adjust': true,
    'font-stretch': true,

    // Grid properties
    'grid-columns': true,
    'grid-rows': true,

    // Margin properties
    'margin': true,
    'margin-bottom': true,
    'margin-left': true,
    'margin-right': true,
    'margin-top': true,

    // Multi-column properties
    'column-count': true,
    'column-fill': true,
    'column-gap': true,
    'column-rule': true,
    'column-rule-color': true,
    'column-rule-style': true,
    'column-rule-width': true,
    'column-span': true,
    'column-width': true,
    'columns': true,

    // Padding properties
    'padding': true,
    'padding-bottom': true,
    'padding-left': true,
    'padding-right': true,
    'padding-top': true,

    // Positioning properties
    'bottom': true,
    'clear': true,
    'clip': true,
    'display': true,
    'float': true,
    'left': true,
    'overflow': true,
    'position': true, // The value of position is regulated in code below so as to mitigate overlay attacks
    'right': true,
    'top': true,
    'visibility': true,
    'z-index': true,

    // Table properties
    'border-collapse': true,
    'border-spacing': true,
    'caption-side': true,
    'empty-cells': true,
    'table-layout': true,

    // Text properties
    'color': true,
    'direction': true,
    'letter-spacing': true,
    'line-height': true,
    'text-align': true,
    'text-decoration': true,
    'text-indent': true,
    'text-transform': true,
    'unicode-bidi': true,
    'vertical-align': true,
    'white-space': true,
    'word-spacing': true,
    'hanging-punctuation': true,
    'punctuation-trim': true,
    'text-align-last': true,
    'text-justify': true,
    'text-outline': true,
    'text-shadow': true,
    'text-wrap': true,
    'word-break': true,
    'word-wrap': true
};


//List of protocols that are OK...
// We might think of making the data: protocol valid, but it needs an extra
// layer of security understanding. For example, per Hidetake Jo
// data:text/html,payload <- bad
// data:image/png <- probably ok
// data:image/svg <- bad (because unbounded SVG strings can have script in them.)
const OK_PROTOCOLS: string[] = [
    'http://',
    'https://',
    'mailto:'
];

//Field Types
const NUMBER = "Number";
const TEXT = "Text";
const TITLE = "Title";
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
    [TITLE]: true,
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

/**
 * The main purpose of this class is to allow for a declerative JSON blob to
 * specify the layout/UI of a blob of aribitary JSON data.
 *
 * At it's core, the JSON blob that declares the layout is a hierarchiecal description of
 * elements, coupled with some basic data-binding and expression evaluation that makes it
 * a completely codeless way to specify layout. The current intent is to have this class
 * be used for no-code custom field renderers in SharePoint lists.
 *
 * This class generates HTML and inserts it into the DOM (with innerHTML). As such, this component
 * has been reviewed a few times for security vulnaribilities. For more info, see https://html5sec.org/
 */
export class CustomFormatter {
    private _cfr: ICustomFormatterProps;
    private _error: string;
    private _params: ICustomFormatter;
    private _fAria: boolean;

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
            if (!this._fAria) {
                //If no aria-* tags were specified, we warn the user that
                //their markup is not accessible.
                let errorStrings = this._params.errorStrings;
                let noAriaError = errorStrings['ariaError'] || 'ariaError';
                console.error(noAriaError);
            }
        } catch (e) {
            let exceptionMsg = (typeof (e) === 'string') ? e : e.message;
            let errMsg = 'Failure: ' + exceptionMsg;
            console.error(errMsg);
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
        let isAnchor: boolean = elmType === 'a';

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
        let elementAttributes = cfr.attributes;
        if (elementAttributes) {
            if (isAnchor){
                //SECURITY:
                //To handle the target=_blank vulnaribility, make sure that
                //we specify rel="noopener noreferrer"
                //see https://dev.to/ben/the-targetblank-vulnerability-by-example
                let oldRel = elementAttributes['rel']
                elementAttributes['rel'] = "noopener noreferrer " + (oldRel ? oldRel : '');
            }
            for (let attrName in elementAttributes) {
                if (!this._isValidAttr(attrName)) {
                    //If the attribute is not on the white-list, simply bail out
                    console.log('ignoring non-approved attribute ' + attrName);
                    continue;
                }
                arrOutput.push(' ' + attrName + '="');
                let val: IExpression | string = elementAttributes[attrName];
                this._createValue(val, arrOutput, (attrName === HREF || attrName === 'src') );
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
     * Is attrName an attribute that we allow
     */
    private _isValidAttr(attrName: string) : boolean {
        let isValidAttr = Boolean(OK_ATTRS[attrName]);
        let isAriaTag = Boolean((new RegExp('^aria\-[a-z]+$', 'g')).exec(attrName));
        if (isAriaTag) {
            //If there is at least 1 aria tag, then it's passed the accessibility checker
            this._fAria = true;
        }
        return (isValidAttr || isAriaTag);
    }

    /**
     * This creates a single style attribute.
     * The generated name-value pair are added to the arrOutput string array.
     */
    private _createStyleAttr(propName: string, value: IExpression | string, arrOutput: string[]) {
        //SECURITY:
        //Only allow a subset of names as style attributes.
        if (!OK_STYLE_ATTRS[propName]) {
            //Invalid style attribute. So ignore it.
            console.log('Unsupported style attribute: ' + propName);
            return;
        }
        arrOutput.push(propName + ':');
        this._createValue(value, arrOutput, false /*href encoding needed*/, true/*is style attribute*/);
        arrOutput.push(';');
    }

    /**
     * Creates a value string for an attribute or textContent.
     * The input is either a string or an Expression that needs to be evaluated.
     * Once evaluated, it is appended to the arrOutput array of strings.
     */
    private _createValue(val: IExpression | string, arrOutput: string[], isHrefEncodingNeeded?: boolean, isStyleValue?: boolean) {
        let exprVal = this._eval(val);
        if (exprVal === null || exprVal === undefined) {
            //expression resulted in a null value, so empty string.
            exprVal = '';
        }
        let lineBreakNewVal = '<br/>';
        //Convert the raw value to a string. For date values, use the toDateString to get a prettier value.
        //At some point, we should probably use the field.FriendlyDisplay, but it's returning null at this point..
        let exprStr = (exprVal instanceof Date) ? exprVal.toLocaleDateString() : exprVal.toString();
        //HTML encode the string so that we don't have XSS issues
        let encodedVal: string = HtmlEncoding.encodeText(exprStr);
        if (isHrefEncodingNeeded) {
            if (!this._validateUrl(encodedVal)) {
                this._err('invalidProtocol');
            }
            //For the href attribute, replace \r\n with the appropriate encoded value
            //so that a something like <a href="mailto:foo@contoso.com&body=line1\r\nline2\r\nline3">link</a>
            //will show line breaks in the mail message. See https://tools.ietf.org/html/rfc2368
            lineBreakNewVal = '%0D%0A';
        }
        if (isStyleValue && !this._validateStyleValue(encodedVal)) {
            this._err('invalidStyleValue', encodedVal);
        }
        //replace line breaks with the appropriate line break value
        encodedVal = encodedVal.replace(/\r\n|\r|\n/g, lineBreakNewVal);
        arrOutput.push(encodedVal);
    }

    /**
     * Style values can be an XSS vector, so be careful to validate the values
     * To ensure that we are not allowing behaviors, expressions, and unsafe data URIs
     * See http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
     * and http://stackoverflow.com/questions/3607894/cross-site-scripting-in-css-stylesheets
     * for details.
     * For now, we'll block a few special characters that can help in creating expressions,
     * behaviors and javascript injection. We'll tweak this as needed
     *
     */
    private _validateStyleValue(styleValue: string) : boolean {
        styleValue = styleValue.toLowerCase();
        let INVALID_STYLE_VALUES : string[] = [
            '(', //disable CSS expressions e.g expression(
            ':', //disable any use of javascript via expressions.. javascript:, behavior:, data:
            '&', //don't allow To escape special characters
            ';', //don't allow style separators.
            '!', //Also used as a separator.
        ];

        //Special case the rgba() macro, because we want to allow this specific macro
        //but no other macros. So, if the style value begins with rgba(, we start looking
        //for invalid strings from the 5th index... That is, after the rgba(
        let fBeginsWithRGBA = (styleValue.substr(0,5) === 'rgba(');
        let indexToStartLooking = fBeginsWithRGBA ? 5 : 0;

        for (let i = 0; i < INVALID_STYLE_VALUES.length; i++) {
            if (styleValue.indexOf(INVALID_STYLE_VALUES[i], indexToStartLooking) >= 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Given a URL, returns true if it's protocol scheme is in the list of valid protocols...
     * So for instance, javascript: will return false.
     *
     * Please be very careful when modifying this function to see that we don't inadvertently
     * allow a security hole. Please get changes carefully reviewed.
     */
    private _validateUrl(url: string) : boolean {
        //Special encoding needed for the href attribute because href attributes can start with javascript: which
        //allows another vector to run javascript. So remove it.
        if  (!url) {
            //empty value, so no security concern.
            return true;
        }

        url = url.trim().toLowerCase();
        for (let i = 0; i < OK_PROTOCOLS.length; i++) {
            let protocolToCheck = OK_PROTOCOLS[i];
            if (url.substr(0, protocolToCheck.length) === protocolToCheck) {
                //valid protocol
                return true;
            }
        }
        //not in the list of valid protocols.
        //Check to see if it's a relative URL
        //From a security perspective, simply check to see that it doesn't
        //contain : or \ to prevent any unknown protocol or UNC paths
        if ( (url.indexOf(':') >=0) ||
            //As part of HTML encoding, we convert \ to &#92, and IE, in all it's wisdom
            //treats &#92 as if it were a slash, so in IE we'd be able to
            //have a URL that translated to \\foo\bar\bull.txt. So specifically dis-allow
            //&#92
            (url.indexOf('\\') >=0) || (url.indexOf('&#92') >=0) ) {
            return false;
        }
        return true;
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
        if (val === null) {
            return null;
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
            } else if (operator === TODATE) {
                let rawVal: any = this._eval(operands[0]);
                return (new Date(rawVal));
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
            } else if (operator === PLUS || operator === MULT || operator === OR || operator === AND) {
                return this._multiOpEval(exprVal);
            }
            else {
                return this._twoOpEval(exprVal, this._eval(operands[0]), operator, this._eval(operands[1]));
            }
        }
    }

    private _toString(val: string | number | boolean) {
        //val could be 0 in which case, this should return '0'
        return (val === null || val === undefined) ? '' : val.toString();
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
    private _multiOpEval(exp: IExpression): (number | string | boolean) {
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
    private _twoOpEval(exp: IExpression, first: string | number | boolean | Date, operator: string, second: string | number | boolean | Date): any {
        if (first === undefined || second === undefined) {
            this._err('operandNOnly', (2).toString(), JSON.stringify(exp));
        }
        if (operator === EQUAL) {
            return (first === second);
        } if (operator === NOTEQUAL) {
            return (first !== second);
        }else if (operator === GE) {
            return (first >= second);
        } else if (operator === LE) {
            return (first <= second);
        } else if (operator === GREATER) {
            return (first > second);
        } else if (operator === LESS) {
            return (first < second);
        } else if (operator === OR) {
            return (first || second);
        } else if (operator === AND) {
            return (first && second);
        } else if (operator === PLUS) {
            //return (<string>first + <string>second);
            return this._doAddOrSubstract(exp, first, second, true);
        } else if (operator === MINUS) {
            //this._validateIsNum(exp, first);
            //this._validateIsNum(exp, second);
            //return (<number>first - <number>second);
            return this._doAddOrSubstract(exp, first, second, false);
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

    /**
     * We might be adding strings, numbers or dates, so this function
     * takes care of the various types of additions and substractions
     * To handle the date math case, we use the valueOf() function,
     * which works on dates, strings and numbers.
     */
    private _doAddOrSubstract(exp: IExpression, first:any, second: any, fPlus) {
        //If any one of the  parameters is a date, then do date math.
        //If one is a date, Then other one is then expected to be a number
        let doDateMath =  ((first instanceof Date ) || (second instanceof Date));
        let ret : any;
        if (fPlus) {
            //Addition case
            ret = (<string>first.valueOf() + <string>second.valueOf());
        } else {
            //Minus
            if (!doDateMath) {
                this._validateIsNum(exp, first);
                this._validateIsNum(exp, second);
            }
            ret = (<number>first.valueOf() - <number>second.valueOf());
        }
        return doDateMath ? (new Date(ret)) : ret;
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

            if (fieldType === NUMBER || fieldType === DATE || fieldType === BOOL) {
                //SharePoint returns NUMBER and DATE back as formatted strings. But it also
                //returns the true representation of the numbers in an object that has a '.'
                //For BOOL, it returns the actual value in .value
                //appended to the field name. So use that instead if it exists.
                let postFix = (fieldType === BOOL) ? '.value' : '.';
                let fieldNameWithDot: string = jpathArr[0] + postFix;
                if (result[fieldNameWithDot] != null && result[fieldNameWithDot] !== undefined) {
                    //use the dot version of the field name instead
                    jpathArr[0] = fieldNameWithDot;
                }
            }

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
                case TITLE:
                case NOTE:
                case CHOICE:
                case LOOKUP: //For the case where we have a lookup field with additional columns, it always returns text.
                    return val;

                case BOOL:
                    if (val === "1") {
                        //SP returns "1" for true
                        return true;
                    } else if (val === "0") {
                        //SP returns "0" for false
                        return false;
                    } else {
                        //SP returns empty string "" if not defined.
                        return val;
                    }

                case NUMBER:
                    let num: any;
                    if (typeof (val) === 'string') {
                        //remove all commas etc.
                        num = parseFloat(val.replace(/,/g, ''));
                    } else {
                        num = Number(val);
                    }
                    return (isNaN(num) ? '' : num);

                case DATE:
                    if (typeof (val) === 'string') {
                        //coerce the string value to a date
                        return (Boolean(val) ? new Date(val) : null);
                    } else {
                        return val;
                    }
                case USER:
                    //Can't use the USER object directly. Need to dereference the object...
                    //e.g. [$assignedTo.email] or [$assignedTo.title]
                    this._err('userFieldError', jpath);
                    break;
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

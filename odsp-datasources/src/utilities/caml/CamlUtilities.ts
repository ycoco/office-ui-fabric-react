// OneDrive:CoverageThreshold(90)

import { CamlTags as Tags, CamlAttributes as Attrs, CamlConstants } from './CamlConstants';
import { IOrderedField } from '../../interfaces/view/IViewArrangeInfo';

// This file contains various CAML-related functions that (for the most part) aren't exactly
// for "parsing" or "serialization," or that would cause circular dependencies if included
// in a different file.

const _parser = new DOMParser();

/**
 * Returns elem.attributes[attrName].value, converting attrName to lowercase if needed
 * to get the attribute but verifying that the casing of the attribute's actual name
 * matches the casing of attrName.
 */
export function getAttr(elem: Element, attrName: string): string {
    'use strict';

    let attr = elem.attributes[attrName] || elem.attributes[attrName.toLowerCase()];
    if (attr && attr.value && attr.name === attrName) {
        return attr.value;
    }
    return undefined;
}

/**
 * Returns a FieldRef element with the given properties.
 */
export function getFieldRefDom(xmlDoc: Document, params: { fieldName: string; isAscending?: boolean; }): Element {
    'use strict';

    let elem = xmlDoc.createElement(Tags.fieldRef);
    elem.setAttribute(Attrs.name, params.fieldName);
    if (typeof params.isAscending === 'boolean') {
        elem.setAttribute(Attrs.ascending, params.isAscending ? 'TRUE' : 'FALSE');
    }
    return elem;
}

/**
 * Update the value of a boolean attribute, or delete it if value is undefined.
 */
export function updateBooleanAttr(elem: Element, attribute: string, value: boolean) {
    'use strict';

    if (typeof value === 'boolean') {
        elem.setAttribute(attribute, value ? 'TRUE' : 'FALSE');
    } else {
        elem.removeAttribute(attribute);
    }
}

/**
 * If oldFieldElem's name does not match newField's name, replace oldFieldElem.
 * If the names do match, update the ascending attribute.
 */
export function replaceField(xmlDoc: Document, newField: IOrderedField, oldFieldElem: Element, parent: Element) {
    'use strict';

    if (!oldFieldElem || getAttr(oldFieldElem, Attrs.name) !== newField.fieldName) {
        // old element doesn't exist or names don't match
        let newFieldElem = getFieldRefDom(xmlDoc, newField);
        if (oldFieldElem) {
            parent.replaceChild(newFieldElem, oldFieldElem);
        } else {
            parent.appendChild(newFieldElem);
        }
    } else {
        // field is the same, so only set current ascending
        updateBooleanAttr(oldFieldElem, Attrs.ascending, newField.isAscending);
    }
}

/**
 * Combines a list of filter CAML strings using the given logic operator.
 * Returns '' if no filters are defined.
 *
 * @param filters: Individual CAML filter operations
 * @param logicOp: 'And' or 'Or' (defaults to 'And')
 */
export function combineFilters(filters: string[], logicOp: string = Tags.and): string {
    'use strict';

    if (filters && filters.length) {
        // Make a series of nested logic operation tags to combine the filters.
        // If there's only one filter, it will not be wrapped with a logic operation.
        let ops = new Array(filters.length).join(`<${logicOp}>`);
        let firstFilter = filters[0];
        let rest = filters
            .slice(1)
            .map((filter: string) => `${filter}</${logicOp}>`)
            .join('');
        return `${ops}${firstFilter}${rest}`;
    }
    return '';
}

/**
 * Parses the given XML and returns the XML document.
 * Throws if the XML is invalid.
 * (Do NOT log the XML if this throws, since it's PII...)
 */
export function xmlToDom(xml: string): Document {
    'use strict';

    let xmlDoc;
    try {
        // Per the spec, DOMParser shouldn't throw on errors (though it does in IE...)
        xmlDoc = _parser.parseFromString(xml, CamlConstants.doctype);
    } catch (ex) {
        throw new Error('Invalid XML (exception thrown)'); // unfortunately can't log the XML since it's PII
    }
    if (!xmlDoc.documentElement) {
        // Not sure if this can happen on error but doesn't hurt to check...
        throw new Error('Invalid XML (documentElement does not exist)');
    }
    if (xmlDoc.querySelector('parsererror')) {
        // In non-IE browsers, on parse errors it creates a "parsererror" node.
        // Throw an exception if a node like that is found anywhere.
        throw new Error('Invalid XML (parsererror found)');
    }
    return xmlDoc;
}

export function isTodayString(str: string): boolean {
    'use strict';
    return CamlConstants.todayRegex.test(str);
}

export function getTodayOffset(str: string): number {
    'use strict';
    let match = str && str.match(CamlConstants.todayRegex);
    if (match) {
        let result = parseInt(match[1], 10);
        return result || 0;
    }
    return null;
}

export function getTodayString(offset: number): string {
    'use strict';
    let result = '[Today]';
    if (offset) {
        result += `${offset > 0 ? '+' : ''}${offset}`;
    }
    return result;
}

// OneDrive:CoverageThreshold(88)

import { CamlTags as Tags, CamlAttributes as Attrs } from './CamlConstants';
import * as CamlUtilities from './CamlUtilities';
import { IViewDomParts } from '@ms/odsp-datasources/lib/interfaces/view/IViewArrangeInfo';

// Things in this file are needed by things in the PLT bundle.

/**
 * Gets the XML document and important child elements for a view.
 * If the XML doesn't have a Query tag or a ViewFields tag, they will be created.
 * (Other tags won't be created if they don't exist.)
 *
 * Throws if the XML is invalid or the root's tag name is not View.
 * If any fundamental tags occur more than once, the first instance will be used.
 */
export function getViewDomParts(viewXml: string = '<View/>'): IViewDomParts {
    'use strict';

    // This will throw if the XML is invalid
    let xmlDoc = CamlUtilities.xmlToDom(viewXml);

    // Typescript's typings incorrectly say that the child elements of a document are always
    // of type HTMLElement. In reality, if the document's MIME type is application/xml,
    // the children will only be of type Element.
    let view = xmlDoc.documentElement as Element;
    if (view.tagName !== Tags.view) {
        throw new Error('View XML outer element tag name must be "View" (case-sensitive)');
    }

    // Throughout, I'm using iteration over child nodes (direct or via map/filter) instead of
    // querySelector/querySelectorAll because there's no way to scope the querySelector methods
    // to the first level of children.

    let fields: Element;
    let query: Element;
    let rowLimit: Element;
    for (let i = 0, len = view.childNodes.length; i < len; i++) {
        let elem = <Element>view.childNodes[i];
        if (elem.nodeType !== Node.ELEMENT_NODE) {
            continue;
        } else if (elem.tagName === Tags.viewFields && !fields) {
            fields = elem;
        } else if (elem.tagName === Tags.query && !query) {
            query = elem;
        } else if (elem.tagName === Tags.rowLimit && !rowLimit) {
            rowLimit = elem;
        }
    }
    if (!fields) {
        fields = xmlDoc.createElement(Tags.viewFields);
        view.appendChild(fields);
    }
    if (!query) {
        query = xmlDoc.createElement(Tags.query);
        view.appendChild(query);
    }

    let result: IViewDomParts = {
        xmlDoc: xmlDoc,
        view: view,
        query: query,
        viewFields: fields,
        rowLimit: rowLimit
    };

    for (let i = 0, len = query.childNodes.length; i < len; i++) {
        let elem = <Element>query.childNodes[i];
        if (elem.nodeType !== Node.ELEMENT_NODE) {
            continue;
        } else if (elem.tagName === Tags.orderBy && !result.orderBy) {
            result.orderBy = elem;
        } else if (elem.tagName === Tags.groupBy && !result.groupBy) {
            result.groupBy = elem;
        } else if (elem.tagName === Tags.where && !result.where) {
            result.where = elem;
        }
    }

    return result;
}

/**
 * Parse a ViewFields tag and returns an array of field names.
 * Any tags besides FieldRef or FieldRefs without a Name are ignored.
 */
export function parseViewFields(viewFields: Element): string[] {
    'use strict';

    if (!viewFields) {
        return undefined;
    }
    // Get the name from each FieldRef element, and remove empty names
    let fieldNames = Array.prototype.map.call(viewFields.childNodes,
        (elem: Element) => elem.tagName === Tags.fieldRef ? CamlUtilities.getAttr(elem, Attrs.name) : undefined);
    return fieldNames.filter((name: string) => !!name);
}

/**
 * Check whether the viewDom contains smart filters.
 * For now, only smart filters has id attribute in the child elements of where.
 * This might be changed to more specific attribute name later.
 */
export function containSmartFilters(viewDom: IViewDomParts): boolean {
    'use strict';

    let result = false;
    let where = viewDom.where;

    if (where && where.childElementCount) {
        // only smart filter has id attribute.
        let elementsWithIdAttribute = where.querySelectorAll("[id]");
        if (elementsWithIdAttribute && elementsWithIdAttribute.length) {
            result = true;
        }
    }

    return result;
}

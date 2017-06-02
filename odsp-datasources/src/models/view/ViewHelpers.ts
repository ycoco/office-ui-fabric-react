// OneDrive:CoverageThreshold(92)

import { IFilter, ArrangeInfoType } from '../../interfaces/view/IViewArrangeInfo';
import IView from '../../interfaces/view/IView';
import * as CamlParsing from '../../utilities/caml/CamlParsing';
import * as CamlSerialization from '../../utilities/caml/CamlSerialization';
import * as CamlUtilities from '../../utilities/caml/CamlUtilities';
import ListFilterUtilities from '../../utilities/list/ListFilterUtilities';

// This file contains helper methods that reference CamlParsing or CamlSerialization and therefore
// should not be included in the PLT bundle (because CamlParsing/CamlSerialization are large).

/**
 * Gets the filter with the given id and attempts to parse it.
 * If it's not a structure we know how to parse into a single filter, returns undefined.
 * (Note that an <And> tag parses into multiple filters, which isn't supported for now.)
 *
 * Throws if multiple filters with the given ID exist.
 *
 * BE CAREFUL with the result: it might not "round trip" as expected if passed to updateFilter.
 * For example, if it's a partially recognized structure, it might contain things such as null
 * elements in values that won't re-serialize properly, or unrecognized attributes will be lost.
 */
export function getFilter(view: IView, id: string): IFilter {
    'use strict';

    let filter = _getFilter(view, id);
    if (filter) {
        let filters = CamlParsing.parseFilter(filter);
        if (filters && filters.length === 1 && filters[0]) {
            let ifilter = filters[0];
            ifilter.id = id;
            return ifilter;
        }
    }
    return undefined;
}

/**
 * Find the given filter in the view's CAML and update it.
 * The filter MUST have an id (in the IFilter and in the existing CAML).
 * If a filter with the given id is not found, it's AND-ed with the current filters.
 *
 * Throws if:
 * - the filter doesn't have an id
 * - the view has invalid XML
 * - more than one filter with the given id exists
 * - the filter couldn't be serialized
 * - the serialized filter was not valid XML
 *
 * This MAY BE UNSAFE (talk to Elizabeth for details).
 */
export function updateFilter(view: IView, filter: IFilter) {
    'use strict';

    if (!filter.id) {
        throw new Error('Must provide a filter with an id to use updateFilter');
    }

    let filterCaml = CamlSerialization.filterToCaml(filter);
    if (!filterCaml) {
        throw new Error('Filter could not be serialized');
    }

    let filterElem = _getFilter(view, filter.id);
    if (filterElem) {
        // Filter exists, so replace it with the serialized version of the new filter.
        let newFilter;
        try {
            newFilter = CamlUtilities.xmlToDom(filterCaml).documentElement;
        } catch (ex) {
            throw new Error('Generated filter was not valid XML!');
        }
        filterElem.parentNode.replaceChild(newFilter, filterElem);
        view.setIsDirty(true, ArrangeInfoType.filters);
    } else {
        // Filter didn't exist before, so add it.
        view.addFilters([filterCaml]);
    }
}

/**
 * Removes the filter with the given ID from the given view's CAML.
 * Throws if more than one element with the given id is found.
 * No-op if no elements with the given id are found.
 */
export function removeFilter(view: IView, id: string) {
    'use strict';

    let filter = _getFilter(view, id);
    if (filter) {
        // remove the child from the parent
        // ie11 parentElement is undefined, so need to use parentNode
        let parent = filter.parentNode as Element;
        parent.removeChild(filter);

        // if the parent is Or or And, we also need to replace the Or/And with the remaining child
        if (parent.tagName === 'Or' || parent.tagName === 'And') {
            parent.parentNode.replaceChild(parent.firstElementChild, parent);
        }

        view.setIsDirty(true, ArrangeInfoType.filters);
    }
}

/**
 * Get all smart filters in the current session.
 * Only SmartFilters in the current session has id attribute in the filter.
 * When the view is saved, we remove the id attribute.
 */
export function getAllSmartFilters(view: IView): IFilter[] {
    'use strict';

    let viewDom = view.getDomParts();
    if (!viewDom || !viewDom.where) {
        return undefined;
    }

    let filterElems = viewDom.where.querySelectorAll('[id]');
    let filters: IFilter[] = [];

    if (filterElems) {
        for (let i = 0; i < filterElems.length; i++) {
            let newFilters = CamlParsing.parseFilter(filterElems[i]);
            if (newFilters) {
                filters.push(...newFilters);
            }

        }
    }

    return filters;
}

/**
 * Remove all unsaved smart filters from the given view.
 */
export function removeSmartFilters(view: IView) {
    let smartFilters = getAllSmartFilters(view);
    if (smartFilters) {
        for (let filter of smartFilters) {
            removeFilter(view, filter.id);
        }
    }
}

/**
 * Get combined filterParams from the queryString and view
 */
export function getEffectiveFilterParams(queryString: string, view: IView): string {
    let filterParams = queryString;

    let viewFilters = getAllSmartFilters(view);
    if (viewFilters && viewFilters.length > 0) {
        viewFilters.forEach((filter: IFilter) => {
            filterParams = ListFilterUtilities.updateFilterInfo(filterParams, filter.fieldName, filter.values, filter.type, filter.lookupId);
        });
    }

    return filterParams;
}

/**
 * Gets the filter element with the given id from the given view.
 * Returns undefined if the filter doesn't exist.
 * Throws if multiple filters with the given id exist.
 */
function _getFilter(view: IView, id: string): Element {
    'use strict';

    let viewDom = view.getDomParts();
    if (!viewDom || !viewDom.where) {
        return undefined;
    }
    let filters = viewDom.where.querySelectorAll(`[id="${id}"]`);
    if (filters.length > 1) {
        // TODO: should this throw or just return undefined? probably return undefined
        // in case of weird but not technically invalid user modifications?
        throw new Error(`More than one filter found with id ${id}`);
    }
    return filters[0];
}

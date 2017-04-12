/**
 * Currently copied over from odsp-next/../datasources/url/odb/ItemUrlHelper.
 */

import { SiteRelation } from '../../../../Url';

/**
 * Specifies how the default site relates to the site specified in the item URL.
 */
export { SiteRelation }

/**
 * Represents the available URL parts extractable for an item.
 *
 * @export
 * @interface IItemUrlParts
 */
export interface IItemUrlParts {
    /**
     * Gets the fully-qualified path to the item.
     *
     * @type {string}
     */
    fullItemUrl: string;
    /**
     * Gets the server-relative path to the item.
     * If no path was provided, this will be undefined.
     *
     * Will be '/' for the server-relative root.
     * Otherwise, presence of a trailing '/' depends on the input path.
     *
     * @type {string}
     */
    serverRelativeItemUrl: string;
    /**
     * Gets the fully-qualified path to the list containing the item.
     *
     * @type {string}
     */
    fullListUrl: string;
    /**
     * Gets the normalized list URL for the item.
     * If the list is on the current server domain, this will be server-relative.
     * If the list is the current default list or no list is available, this will be undefined.
     *
     * Will be '/' for the server-relative root.
     * Otherwise, presence of a trailing '/' depends on the input path.
     *
     * @type {string}
     */
    normalizedListUrl: string;

    /**
     * Gets the server-relative path to the list.
     *
     * Will be '/' for the server-relative root.
     * Otherwise, presence of a trailing '/' depends on the input path.
     *
     * @type {string}
     */
    serverRelativeListUrl: string;

    /**
     * Gets the fully-qualified path to the item if on an alternate domain.
     * Gets the server-relative path to the item if on the same domain.
     *
     * Will be '/' for the server-relative root.
     * Otherwise, presence of a trailing '/' depends on the input path.
     *
     * @type {string}
     */
    normalizedItemUrl: string;

    /**
     * Gets the path to the item relative to the list.
     */
    listRelativeItemUrl: string;

    /**
     * Determines whether or not the item is on a different domain than the current app.
     *
     * @type {boolean}
     */
    isCrossDomain: boolean;

    /**
     * Determines the relation of the item to the current site.
     */
    siteRelation?: SiteRelation;

    /**
     * Determines whether or not the item is on a different site than the current app.
     *
     * @type {SiteRelation}
     */
    isCrossSite?: SiteRelation;

    /**
     * Determines whether or not the item is on a different list than the current app.
     *
     * @type {boolean}
     * @memberOf IItemUrlParts
     */
    isCrossList: boolean;
}

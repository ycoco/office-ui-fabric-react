import { ISPListItem } from '../item/spListItemProcessor/ISPListItemData';

/**
 * Corresponds to IRenameItemContext in odsp-next
 */

export interface ISPRenameItemContext {
    /**
     * new name that the item will be renamed to
     */
    newName: string;

    /**
     * Key of the parent container
     */
    parentKey: string;

    /**
     *  item that should be renamed
     */
    item: ISPListItem;

    /**
     *  Optional subsite facet on the item to be renamed.
     */
    siteRootItem?: { key: string };
}

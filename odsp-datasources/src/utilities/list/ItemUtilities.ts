import { ISPListItem } from '../../dataSources/item/spListItemProcessor/ISPListItemData';

module ItemUtilities {
    /**
     * Logic for determining an item's key. Taken from ItemSetSelectionModel.ts in odsp-next.
     */
    export function getItemKey(isDocLib: boolean, item: ISPListItem): string {
        // item.key for spo item is item server relative url. it will change when item is renamed.
        // Doclib item will always have uniqueId but not ID while generic list item will always have ID but not uniqueId.
        // In order to keep the item selected when rename the item,
        // we need to use uniqueId or ID in the properties based on whether it is DocLib
        return (item && item.properties && (isDocLib ? item.properties.uniqueId : item.properties.ID)) ||
            (item && item.key) ||
            undefined;
    }
}

export default ItemUtilities;

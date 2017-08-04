import { ISPListContext } from '../../dataSources/item/spListItemRetriever/interfaces/ISPListContext';
import { deserializeQuery } from '@ms/odsp-utilities/lib/navigation/AddressParser';

export function getFolderPath(parentKey: string, listContext: ISPListContext): string {
    const keyParts = deserializeQuery(parentKey);
    let folderPath: string = keyParts['id'];
    if (listContext && listContext.urlParts &&
        (folderPath === listContext.urlParts.fullListUrl ||
        folderPath === listContext.urlParts.serverRelativeListUrl)) {
        folderPath = undefined;
    }
    return folderPath;
}

/**
 * Logic for creating an item's key. Heavily simplified version from urlDataSource.getKey in odsp-next
 */
export function buildItemKey(id: string, listUrl?: string): string {
    let key: string = id;
    if (key.indexOf('id') !== 0) {
        // id and listUrl are already URI encoded. To avoid double encoding, we should not encode them again.
        key = 'id=' + id;
        if (listUrl) {
            key += '&listurl=' + listUrl;
        }
    }
    return key;
}

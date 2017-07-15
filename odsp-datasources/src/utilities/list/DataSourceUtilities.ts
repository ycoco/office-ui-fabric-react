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

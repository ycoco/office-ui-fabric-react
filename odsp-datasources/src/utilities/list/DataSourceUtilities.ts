import { ISPListContext } from '../../dataSources/item/spListItemRetriever/interfaces/ISPListContext';

export function getFolderPath(parentKey: string, listContext: ISPListContext): string {
    let folderPath: string = parentKey;
    if (listContext && listContext.urlParts &&
        (folderPath === listContext.urlParts.fullListUrl ||
        folderPath === listContext.urlParts.serverRelativeListUrl)) {
        folderPath = undefined;
    }
    return folderPath;
}

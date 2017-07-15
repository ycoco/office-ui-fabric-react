import { ISPListItem } from '../item/spListItemProcessor/ISPListItemData';

/**
 * Corresponds to ICreateFolderContext in odsp-next
 */
export interface ISPCreateFolderContext {
    /**
     * The parent item
     */
    parent: ISPListItem;

    /**
     * The name of the folder to be created
     */
    folderName: string;

    parentFolderUrl?: string;

    /**
     * boolean to indicate if we need detailed item information from the server
     */
    needItemDetails?: boolean;

    /**
     * Optional callback to parse the server response.
     */
    parseResponse?: (response: string) => { key: string };
}

export default ISPCreateFolderContext;
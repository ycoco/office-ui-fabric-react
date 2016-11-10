import { ISPListRow, ISPListData } from '../spListItemRetriever/interfaces/ISPGetItemResponse';
import ISPListContext from '../spListItemRetriever/interfaces/ISPListContext';
import { ISPListItem, ISPListColumn, ISPListGroup } from './ISPListItemData';
import { PolicyTipType } from './SPListItemEnums';
import { ListItemBuilderHelpers } from './ListItemBuilderHelpers';
import { GroupBuilder } from './GroupBuilder';
import * as ExternalHelpers from './ExternalHelpers';
import { getRelativeDateTimeStringForLists } from '@ms/odsp-utilities/lib/dateTime/DateTime';
import Guid from '@ms/odsp-utilities/lib/guid/Guid';
import ShortcutUtilities from '@ms/odsp-utilities/lib/list/ShortcutUtilities';
import * as IconSelector from '@ms/odsp-utilities/lib/icons/IconSelector';
import ItemType from '@ms/odsp-utilities/lib/icons/ItemType';
import SharingType from '@ms/odsp-utilities/lib/list/SharingType';
import ListTemplateType from '../../listCollection/ListTemplateType';

export namespace ListItemBuilder {
    export interface IProcessedItems {
        items: ISPListItem[];
        groups: ISPListGroup[];
        totalCount: number;
    }

    export function buildItems(itemsFromServer: ISPListRow[], listContext: ISPListContext): IProcessedItems {
        let items = undefined;
        let groups = undefined;
        let totalCount = 0;

        let numItemsFromServer = itemsFromServer.length;
        if (numItemsFromServer > 0) {
            items = [];
            totalCount = numItemsFromServer;
        }

        for (let i = 0; i < numItemsFromServer; i++) {
            let item = _buildItem(itemsFromServer[i], groups, listContext);
            items.push(item);
        }

        return {
            items: items,
            groups: groups,
            totalCount: totalCount
        };
    }

    export function buildRootItem(parentKey: string, listdata: ISPListData, listContext: ISPListContext): ISPListItem {
        let key = parentKey;
        let root: ISPListItem = {
            key: key
        };

        root.type = ItemType.Folder;
        root.isRootFolder = parentKey === listContext.listUrl;
        root.permissions = listdata.FolderPermissions ? ExternalHelpers.fromHexString(listdata.FolderPermissions) : undefined;

        return root;
    }

    /* tslint:disable: no-string-literal */
    function _buildItem(itemFromServer: ISPListRow, groups: ISPListGroup[], listContext: ISPListContext): ISPListItem {
        if (!itemFromServer) {
            return undefined;
        }

        let key = _getKey(itemFromServer, listContext);
        let item: ISPListItem = {
            key: key
        };

        item.id = itemFromServer.id || itemFromServer.FileRef;
        item.itemId = itemFromServer['name.FileSystemItemId'];

        let fileType = itemFromServer.File_x0020_Type;
        item.extension = fileType ? '.' + fileType : undefined;

        item.policyTip = itemFromServer._ip_UnifiedCompliancePolicyUIAction ? Number(itemFromServer._ip_UnifiedCompliancePolicyUIAction) : PolicyTipType.none;

        item.type = _getType(itemFromServer, item, listContext);

        item.isRootFolder = itemFromServer.isRootFolder;

        let name = ListItemBuilderHelpers.getItemName(itemFromServer, item.type, listContext);
        if (name) {
            item.displayName = item.name = name;
        }

        item.dateModifiedValue = itemFromServer.Modified;
        item.dateModified = itemFromServer['Modified.FriendlyDisplay'] ?
                getRelativeDateTimeStringForLists(itemFromServer['Modified.FriendlyDisplay']) :
                String(itemFromServer.Modified);

        item.permissions = itemFromServer.PermMask ? ExternalHelpers.fromHexString(itemFromServer.PermMask) : undefined;
        item.isPlaceholder = !itemFromServer.PermMask; // item remains a placeholder until permissions are set

        item.hasMissingMetadata = _hasMissingMetadata(itemFromServer, listContext);

        let openUrl: string = itemFromServer['serverurl.progid'];
        item.openUrl = !!openUrl ? openUrl.substring(1) : itemFromServer.FileRef;
        item.previewIFrameUrl = itemFromServer.ServerRedirectedEmbedUrl;

        item.appMap = itemFromServer['File_x0020_Type.mapapp'] || itemFromServer['HTML_x0020_File_x0020_Type.File_x0020_Type.mapall'];
        item.size = itemFromServer.File_x0020_Size ? Number(itemFromServer.File_x0020_Size) : undefined;
        item.totalSize = itemFromServer.SMTotalSize ? Number(itemFromServer.SMTotalSize) : undefined;

        if (item.type === ItemType.Folder) {
            item.folder = {};
            item.childCount = Number(itemFromServer.ItemChildCount) + Number(itemFromServer.FolderChildCount);
            let totalFileCount = Number(itemFromServer.SMTotalFileCount);
            item.folder.totalCount = totalFileCount > 0 ? totalFileCount : item.childCount;
            item.folder.childCount = item.childCount;
        }

        item.isDraggable = true; // Currently this code only executes for queryType === QueryType.Files;
        item.isDropEnabled = item.type === ItemType.Folder;

        item.properties = {};
        for (let keyVal in itemFromServer) {
            if (itemFromServer.hasOwnProperty(keyVal)) {
                item.properties[keyVal] = itemFromServer[keyVal];
            }
        }
        const uniqueId = itemFromServer.UniqueId && Guid.normalizeLower(itemFromServer.UniqueId);
        if (uniqueId) {
            item.properties.uniqueId = uniqueId;
        }
        let fileName = item.name;
        if (item.extension) {
            fileName = item.name.substring(0, item.name.toLowerCase().lastIndexOf(item.extension.toLowerCase()));
        }
        item.properties.FileName = fileName;

        if (Number(itemFromServer.PrincipalCount) > 0) {
            item.sharingType = SharingType.Shared;
        } else if (itemFromServer.PrincipalCount === undefined) {
            // in the case of a standard Document Library, PrincipalCount will come down as undefined because it was never implemented beyond OneDrive
            // using sharing type Unknown since we cannot determine the sharing state of the item
            item.sharingType = SharingType.Unknown;
        } else {
            item.sharingType = SharingType.Private;
        }

        GroupBuilder.buildGroupFromItem(itemFromServer, groups, listContext);

        // TODO: need to set ariaLabels and other text properties on the item.

        return item;
    }

    function _getKey(itemFromServer: ISPListRow, listContext: ISPListContext): string {
        // this is a heavily simplified version from odsp-next; let's see what parameters we really need in the key.
        return itemFromServer.id || itemFromServer.FileRef || itemFromServer.ServerRelativeUrl;
    }

    // Simplified version from odsp-next that doesn't (yet) support shortcuts, pdf/fbx, officeBundle and Features.
    function _getType(itemFromServer: ISPListRow, item: ISPListItem, listContext: ISPListContext): ItemType {
        let itemType: ItemType;

        if (itemFromServer.FSObjType === '1') {
            let mapApp = itemFromServer['File_x0020_Type.mapapp'];
            let mapAll = itemFromServer['HTML_x0020_File_x0020_Type.File_x0020_Type.mapall'];

            if ((mapApp && mapApp.substring(0, 7) === 'onenote') ||
                (mapAll && mapAll.indexOf('onenote') !== -1)) {
                itemType = ItemType.OneNote;
            } else {
                itemType = ItemType.Folder;
            }
        } else {
            let fileType = itemFromServer.File_x0020_Type;

            if (ShortcutUtilities.isShortcutEnabled() && ShortcutUtilities.isShortcutFileType(fileType)) {
                itemType = ItemType.Shortcut;
            } else if (fileType === 'pdf') {
                itemType = ItemType.Media;
            } else {
                itemType = IconSelector.getItemTypeFromExtension(fileType);
                if (itemType === ItemType.Unknown &&
                    Number(listContext.listTemplateType) === ListTemplateType.genericList) {
                    itemType = ItemType.File;
                }
            }
        }

        if ((item.extension === '.ai' || item.extension === '.eps' || item.extension === '.psd')) {
            itemType = ItemType.Media;
        }
        return itemType || ItemType.File;
    }
    /* tslint:enable: no-string-literal */

    function _hasMissingMetadata(itemFromServer: ISPListRow, listContext: ISPListContext): boolean {
        let requiredColumns = listContext.listSchema.filter((column: ISPListColumn) => (column.isRequired && Boolean(column.name)));
        let hasMissingMetadata = false;
        if (requiredColumns && requiredColumns.length > 0) {
            for (let colIndex in requiredColumns) {
                if (colIndex) {
                    let requiredColumn = requiredColumns[colIndex];
                    if (!itemFromServer[requiredColumn.internalName]) {
                        hasMissingMetadata = true;
                        break;
                    }
                }
            }
        }
        return hasMissingMetadata;
    }
}
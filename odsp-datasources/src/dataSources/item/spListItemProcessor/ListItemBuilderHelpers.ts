/**
 * Constains helper methods shared between odsp-next and odsp-datasources implementations.
 */

import ISPListContext from '../spListItemRetriever/interfaces/ISPListContext';
import ItemType from '@ms/odsp-utilities/lib/icons/ItemType';
import ISPGetItemResponse from '../spListItemRetriever/interfaces/ISPGetItemResponse';
import { isDocumentLibrary } from '../../listCollection/ListTemplateType';

export namespace ListItemBuilderHelpers {
    export function getItemName(itemFromServer: any, itemType: ItemType, listContext: ISPListContext): string {
        let name: string;

        if (listContext && !listContext.isDocLib && itemType !== ItemType.Folder) {
            name = itemFromServer.Title || itemFromServer.FileLeafRef;
        } else {
            name = itemFromServer.FileLeafRef;
        }

        return name;
    }

    export function updateListContext(spdata: ISPGetItemResponse, listContext: ISPListContext) {
        if (Number(spdata.ListTemplateType)) {
            listContext.listTemplateType = Number(spdata.ListTemplateType);
            listContext.isDocLib = isDocumentLibrary(listContext.listTemplateType);
        }

        if (spdata.ContentTypesEnabled) {
            listContext.contentTypesEnabled = spdata.ContentTypesEnabled;
        }

        if (spdata.ListSchema) {
            listContext.listId = spdata.listName;
            listContext.rawListSchema = spdata.ListSchema;
            listContext.viewTitle = spdata.viewTitle;
            listContext.openInClient = listContext.rawListSchema.DefaultItemOpen === '0'; // DefaultItemOpen.PreferClient
        }

        if (spdata.ListTitle) {
            listContext.listTitle = spdata.ListTitle;
        }

        if (spdata.EnableAttachments) {
            listContext.enableAttachments = spdata.EnableAttachments === 'true';
        }

        let permissions = spdata.BasePermissions;
        if (permissions) {
            listContext.permissions = {
                manageLists: permissions.ManageLists,
                managePersonalViews: permissions.ManagePersonalViews,
                openItems: permissions.OpenItems
            };
        }

        if (typeof spdata.ExcludeFromOfflineClient === 'boolean' || typeof spdata.WebExcludeFromOfflineClient === 'boolean') {
            // ExcludeFromOfflineClient takes into account list-level and tenant-level settings.
            // WebExcludeFromOfflineClient takes into account the web/site-level setting.
            listContext.excludeFromOfflineClient = !!(spdata.ExcludeFromOfflineClient || spdata.WebExcludeFromOfflineClient);
        }

        if (typeof spdata.TenantTagPolicyEnabled === 'boolean') {
            listContext.tenantTagPolicyEnabled = spdata.TenantTagPolicyEnabled;
        }

        if (typeof spdata.verEnabled === 'boolean') {
            listContext.enableVersions = spdata.verEnabled;
        }

        if (typeof spdata.EnableMinorVersions === 'boolean') {
            listContext.enableMinorVersions = spdata.EnableMinorVersions;
        }

        if (typeof spdata.NewWOPIDocumentEnabled === 'boolean') {
            listContext.newWOPIDocumentEnabled = spdata.NewWOPIDocumentEnabled;
        }

        if (typeof spdata.isModerated === 'boolean') {
            listContext.isModerated = spdata.isModerated;
        }

        if (typeof spdata.AllowCreateFolder === 'boolean') {
            listContext.allowCreateFolder = spdata.AllowCreateFolder;
        }

        if (typeof spdata.AllowGridMode === 'boolean') {
            listContext.allowGridMode = spdata.AllowGridMode;
        } else if (typeof listContext.allowGridMode !== 'boolean') {
            listContext.allowCreateFolder = true;
        }

        if (spdata.displayFormUrl) {
            listContext.displayFormUrl = spdata.displayFormUrl;
        }
        if (spdata.editFormUrl) {
            listContext.editFormUrl = spdata.editFormUrl;
        }
        if (spdata.newFormUrl) {
            listContext.newFormUrl = spdata.newFormUrl;
        }

        // this method doesn't set the following properties: listSchema, viewResult, leftNavigationData
    }
}
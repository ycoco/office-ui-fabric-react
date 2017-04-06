/**
 * Constains helper methods shared between odsp-next and odsp-datasources implementations.
 */

import ISPListContext from '../spListItemRetriever/interfaces/ISPListContext';
import ItemType from '@ms/odsp-utilities/lib/icons/ItemType';
import ISPGetItemResponse from '../spListItemRetriever/interfaces/ISPGetItemResponse';
import { isDocumentLibrary } from '../../listCollection/ListTemplateType';
import ListFilterUtilities from '../../../utilities/list/ListFilterUtilities';

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

    // This method is used in odsp-next. Do not modify without proper validation.
    // Doesn't set the following properties: listSchema, viewResult, leftNavigationData, grouping information
    export function updateListContext(spdata: ISPGetItemResponse, listContext: ISPListContext) {
        if (Number(spdata.ListTemplateType)) {
            listContext.listTemplateType = Number(spdata.ListTemplateType);
            listContext.isDocLib = isDocumentLibrary(listContext.listTemplateType);
        }

        // Check for null/undefined, but update ContentTypesEnabled even if it is false.
        // Otherwise, when switching from a list with content types enabled to one with content types disabled,
        // listContext.contentTypesEnabled will not be updated from true to false.
        if (typeof spdata.ContentTypesEnabled === 'boolean') {
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

        if (spdata.listUrlDir && !listContext.listUrl) {
            listContext.listUrl = spdata.listUrlDir;
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
    }

    export function updateListContextGroupInfo(listContext: ISPListContext) {
        // get group by
        let groupBy = undefined;
        if (listContext.groupByOverride) {
            groupBy = [ listContext.groupByOverride ];
        } else if (listContext.rawListSchema && listContext.rawListSchema.group1) {
            groupBy = [];
            groupBy.push(listContext.rawListSchema.group1);
            if (listContext.rawListSchema.group2) {
                groupBy.push(listContext.rawListSchema.group2);
            }
        }

        // get group level
        let groupByLevel = -1; // no groups
        let isAllGroupsCollapsed = listContext.rawListSchema && listContext.rawListSchema.Collapse === 'TRUE';
        if (groupBy && groupBy.length > 0) {
            groupByLevel = 0; // show level 0 groups: default for grouped views
            // always show groups for allCollapsed views, otherwise take into account current filter state
            if (listContext.filterParams && !isAllGroupsCollapsed) {
                let isFilteredByFirstLevelGroup = Boolean(ListFilterUtilities.getFilterFieldByName(listContext.filterParams, groupBy[0]));
                let isFilteredBySecondLevelGroup = isFilteredByFirstLevelGroup && groupBy[1] ?
                    Boolean(ListFilterUtilities.getFilterFieldByName(listContext.filterParams, groupBy[1])) : false;
                // show all levels of groups, except when we are filtered by all the group levels
                if (isFilteredByFirstLevelGroup && groupBy.length === 1 || isFilteredBySecondLevelGroup && groupBy.length === 2) {
                    groupByLevel = -1;
                }
            }
        }

        // save group info in listContext
        listContext.groupLevel = groupByLevel;
        listContext.groupBy = groupByLevel > -1 ? groupBy : undefined;
        listContext.isGrouped = Boolean(listContext.groupBy);
    }
}
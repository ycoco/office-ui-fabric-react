import { IItemUrlParts } from './IItemUrlHelper';
import ListTemplateType from '../../../../dataSources/listCollection/ListTemplateType';
import { ISPListSchema } from './ISPGetItemResponse';
import { ISPListColumn, ISPListGroup } from '../../spListItemProcessor/ISPListItemData';

export interface IGroupSchema {
    Name: string;
    Type: string;
    ReadOnly?: string;
}

export interface IGroupSchemaMap {
    [field: string]: IGroupSchema;
}

/**
 * Must be a subset of the IListContext interface in odsp-next.
 */
export interface ISPListContext {
    /**
     * Server-relative URL of the list, like /personal/elcraig_microsoft_com/Documents.
     * In workloads where the list URL is not constant (such as SPList), this URL will not
     * be available until after the first ListItemsDataSource.getItem call returns.
     * Will NOT be encoded and could contain spaces (an XHR will automatically encode the spaces).
     */
    listUrl?: string;
    /**
     * List ID GUID (sometimes known as list name)
     */
    listId?: string;
    /**
     * Object containing listUrl
     */
    urlParts?: IItemUrlParts;
    /**
     * Human-friendly name of the list
     */
    listTitle?: string;
    /**
     * List template type. ODB = 700.
     */
    listTemplateType?: ListTemplateType;
    /**
     * Based on list template, determines if this is a doclib (INCLUDING ODB) or a list.
     */
    isDocLib?: boolean;
    /**
     * Specifies view ID used for the most recent request.
     * If viewXmlForRequest is present, that will be used instead.
     */
    viewIdForRequest?: string;
    /**
     * Specifies view path used for the most recent request.
     * view path should be the decoded site relative url path of the targeted view, no query string
     * Ex: /teams/SPGroups/Lists/Shared Document/AllItems.aspx
     */
    viewPathForRequest?: string;
    /**
     * Specifies view XML used for the most recent request.
     * Takes precedence over viewIdForRequest.
     */
    viewXmlForRequest?: string;
    /**
     * Path to the currently open folder.
     */
    folderPath?: string;

    listSchema?: ISPListColumn[];
    rawListSchema?: ISPListSchema;
    groupSchema?: IGroupSchemaMap;
    viewTitle?: string;
    pageSize?: number;
    sortField?: string;
    isAscending?: string;
    filterParams?: string;
    requestToken?: string;
    needSchema?: boolean;
    needForm?: boolean;
    itemIds?: string[];
    /**
     * Boolean indicating whether the current list results are grouped
     */
    isGrouped?: boolean;
    /**
     * Details on the last group returned in the grouped result set
     */
    lastGroup?: ISPListGroup;
    /**
     * Field name to dynamically group the results by
     */
    groupByOverride?: string;
    /**
     * Field name(s) to group the results by as defined in the view
     */
    groupBy?: string[];

    /**
     * groupby level
     */
    groupLevel?: number;

    /** fetch items from a specific group */
    group?: ISPListGroup;

    /** Permissions the user has for the list */
    permissions?: {
        /** This also includes managing public views */
        manageLists: boolean;
        managePersonalViews: boolean;
        openItems: boolean;
    };

    /** Whether to hide sync action. Can be set at list, web, or tenant level. */
    excludeFromOfflineClient?: boolean;

    /** Whether tenant tag policy is enabled */
    tenantTagPolicyEnabled?: boolean;

    /** search term for searching within list (server-side InPlaceSearchQuery parameter) */
    searchTerm?: string;

    /** Whether to use recursive scope in query */
    recurseInFolders?: boolean;

    /** whether allow to create new document using WAC */
    newWOPIDocumentEnabled?: boolean;

    /** whether to open documents in the rich client by default (as opposed to WAC) */
    openInClient?: boolean;

    /** Whether versioning is enabled */
    enableVersions?: boolean;
    /** Whether minor versions (drafts) are enabled */
    enableMinorVersions?: boolean;
    /** Whether moderation (content approval) is enabled */
    isModerated?: boolean;

    /** Whether creating folders is enabled */
    allowCreateFolder?: boolean;

    /** The server specified displayform url */
    displayFormUrl?: string;
    /** The server specified editform url */
    editFormUrl?: string;
    /** The server specified newform url */
    newFormUrl?: string;

    /**
     * Additional field names required in the results.
     */
    fieldNames?: string[];

    /**
     * if this list has content types management enabled
     */
    contentTypesEnabled?: boolean;
    /**
     * if this list allows grid editing.
     */
    allowGridMode?: boolean;

    /**
     * Boolean indicating if attachments are enabled on the list.
     */
    enableAttachments?: boolean;

    /**
     * Boolean indicating if site metadata navigation feature is enabled
     */
    metadataNavFeatureEnabled?: boolean;
}

export default ISPListContext;
/**
 * Interfaces used in the processed list data
 */

import { ColumnFieldType, PolicyTipType, ShowInFiltersPaneStatus } from './SPListItemEnums';
import { IGroupSchema } from '../spListItemRetriever/interfaces/ISPListContext';
import { IDouble } from './ExternalHelpers';
import { IRecycleBinProperties } from './IRecycleBinProperties';
import { IItemState } from './IItemUploadState';
import ItemType from '@ms/odsp-utilities/lib/icons/ItemType';
import SharingType from '@ms/odsp-utilities/lib/list/SharingType';
import { ISPListFieldCustomizer } from '../spListItemRetriever/interfaces/ISPGetItemResponse';
import { IColumnAdapter } from '../../../interfaces/clientSideExtensions/ISpfxAdapter';
/**
 * Interface for a SP list column.
 * Corresponds to IColumnDefinition interface in odsp-next.
 */
export interface ISPListProcessedData {
    root: ISPListItem;
    items: ISPListItem[];
    groups: ISPListGroup[];
    totalCount: number;
    startIndex: number;
    columns: ISPListColumn[];
    contentTypes: any[];
    nextRequestToken: string;
    isAllGroupsCollapsed?: boolean;
}

/**
 * Interface for a SP list column.
 * Corresponds to IColumnDefinition interface in odsp-next.
 */
export interface ISPListColumn {
    /** Unique identifier for the column. This is the SP FieldName. */
    key: string;
    /** Display name used in rendering. */
    name: string;
    /** Internal FieldName in SP. */
    internalName?: string;
    /** Static FieldName in SP. */
    staticName?: string;
    /** ID or GUID of the field. Used by SP to do schema operations like rename a field or update a field definition. */
    id?: string;
    minWidth?: number;
    width: number;
    useCustomWidth?: boolean;
    customWidth?: number;
    canAutoResize?: boolean;
    isVisible: boolean;
    isVisibleMobile: boolean;
    isCollapsable: boolean;
    isIcon: boolean;
    sortable: boolean;
    filterable: boolean;
    resizable?: boolean;
    groupable?: boolean;
    editable?: boolean;
    isGrouped?: boolean;
    isSorted: boolean;
    isFiltered?: boolean;
    filterValues?: string;
    isAscending: boolean;
    isRowHeader?: boolean;
    fieldType?: ColumnFieldType;
    isHtml?: boolean;
    dispFormUrl?: string;
    index?: number;
    isRequired?: boolean;
    customRowNumber?: number;
    customFields?: ISPListColumn[];
    showTooltip?: boolean;
    sortDescFirst?: boolean;
    isAutoHyperLink?: boolean;
    /** If AppendOnly is true, new values are appended instead of replacing the old value. AppendOnly is available for multi-line text fields. */
    isAppendOnly?: boolean;
    pinnedToFiltersPane?: boolean;
    showInFiltersPane?: ShowInFiltersPaneStatus;
    clientSideComponentId?: string;
    clientSideComponentProperties?: string;
    fieldCustomizer?: ISPListFieldCustomizer; // to do deprecated
    clientSideColumnAdapter?: IColumnAdapter;
    /** A JSON blob that describes how the filed should be rendered */
    customFormatter?: string;
    /** This is data type of the field on server side. */
    serverFieldType?: string;
    isCalculated?: boolean;
    isNote?: boolean;
    sspId?: string; // GUID that identifies the term store which contains the EnterpriseKeywords for the site that this taxonomy field belongs to
    termSetId?: string; // GUID of the term set that contains the terms used by this taxonomy field
    anchorId?: string; // GUID of the anchor term for a taxonomy field
}

/**
 * Interface for a SP list group.
 * Corresponds to IItemGroup interface in odsp-next.
 */
export interface ISPListGroup {
    /** key to uniquely identify this group in the itemGroups array. */
    groupingId: string;

    /** determines the group header component (ODC shared and tags views use the groupingId for this purpose). */
    groupingType?: string;

    /** display name. */
    name?: string;

    startIndex?: number;

    count: number;

    /** SP only - the field/column definition by which grouping is done. */
    fieldSchema?: IGroupSchema;

    /** SP only - group data value to be used for metadata update. */
    fieldValue?: string;

    /** SP only - urlencoded identifier for this group to be used in server queries. */
    groupString?: string;

    /** can we drop items into this group. */
    isDropEnabled?: boolean;

    /** placeholder group: in SP, we use this as an end marker to enable paging. */
    isPlaceholder?: boolean;

    /** nested sub-groups inside the current group. */
    children?: ISPListGroup[];

    /** nesting level for the group (0 is the root level). */
    level?: number;

    /** groupingId of the parent itemGroup, if any. */
    parentKey?: string;

    /** Determines whether the group should show up expanded or collapsed. */
    isCollapsed?: boolean;
}

/**
 * Interface for a SP list item.
 * Corresponds to IOneDriveItem interface in odsp-next.
 */
export interface ISPListItem {
    /** The unique key for the item, which is a combination of item id, user id, etc. */
    key: string;

    /** The id of the item, which may not be unique across search queries, users, etc. */
    id?: string;

    /** The id of the item in its parent library. */
    itemId?: string;

    /** Display name for the item. */
    name?: string;

    /** Display name with extension for generic files. */
    displayName?: string;

    /** Type of item. */
    type?: ItemType;

    /**
     * A link to a location of the item if not available via the web application.
     * Most site actions should use IUrlDataSource.getDefaultClickUrl to provide a hyperlink
     * for an item. However, getDefaultClickUrl may fall back to item.openUrl.
     * @see urls property of IOneDriveItem
     */
    openUrl?: string;

    /** Display date modified. */
    dateModified?: string;

    /** Numeric date modified. */
    dateModifiedValue?: number;

    /** Display date deleted */
    dateDeleted?: string;

    /** Size of the item in bytes. */
    size?: number;

    /** Total size of the item in bytes. Includes version history. For folder, includes size of all items within the folder. */
    totalSize?: number;

    /** Default sub text to display for this item (for tile situations). */
    defaultSubText?: string;

    /** Sharing type. */
    sharingType?: SharingType;

    /** Parent. */
    parent?: ISPListItem;

    /** Parent key of the item. Useful when the parent property is a virtual parent (e.g. search root). */
    parentKey?: string;

    /** Properties. */
    properties?: ISPListItemProperties;

    /** AppMap. */
    appMap?: string;

    /** Gets the icon file name to use for the item. */
    iconName?: string;

    /** Icon url to use for the item. */
    iconUrl?: string;

    /** The original item from the server. Useful for shimming. */
    itemFromServer?: any;

    /** Gets the count of children if applicable as returned by itemfromserver. */
    childCount?: number;

    /** URL to "preview" of the document. This is usually a WAC URL hosted in an IFrame. */
    previewIFrameUrl?: string;

    /** Item extension. */
    extension?: string;

    /** Item revision. */
    revision?: number;

    /** Indicates whether the item is a root folder. */
    isRootFolder?: boolean;

    /** Indicates whether the item has been populated with server data or not. */
    isPlaceholder?: boolean;

    /** Urls applicable to the current item. */
    urls?: { [key: string]: string };

    /** Item level permissions bitmap. */
    permissions?: IDouble;

    /** Indicates that the item is a violation of OneDrive's code of conduct */
    isViolation?: boolean;

    /** Tooltip shown on the detailsrow for item and on the itemtile. */
    tooltipText?: string;

    /** recycleBinProperties */
    recycleBinProperties?: IRecycleBinProperties;

    /** Data loss prevention policy tip type. */
    policyTip?: PolicyTipType;

    /** Indicates that the item is draggable. */
    isDraggable?: boolean;

    /** Is drop enabled. */
    isDropEnabled?: boolean;

    /** Indicates whether item has missing required metadata. */
    hasMissingMetadata?: boolean;

    /** property bag containing state values writeable by the client */
    state?: IItemState;

    /** Ratings and Likes Properties. */
    reputationProperties?: IItemReputationProperties;

    /** Indicates that the item is DocumentSet special folder. */
    isDocSet?: boolean;

    /** Folder properties if the item is a folder. */
    folder?: { childCount?: number; folderCount?: number; totalCount?: number; };

    /** Facet for items have a registered file handler */
    fileHandler?: IFileHandlerFacet;

    /** Facet for list items */
    listItem?: IListItemFacet;
}

/**
 * Interface for all properties on the ISPListItem object.
 * Corresponds to the IOneDriveItemProperties in odsp-next.
 */
export interface ISPListItemProperties {
    /**
     * Corresponds to SPListItem.ID on the server (which is an int).
     * Here, it is the string form of that number.
     * @type {string}
     */
    ID?: string;

    /** Guid string that represents the unique id of the item. */
    uniqueId?: string;
    /** FileName without extension. */
    FileName?: string;
    /**
     * Whether the item is in a disabled (i.e. unavailable, not usable) state (ODB only)
     * @type {boolean}
     */
    isDisabled?: boolean;

    /** Specifies whether or not item is a Folder. '1' for Folder, '0' otherwise */
    FSObjType?: string;

    /**
     * Text string that represents the guid value of the Content type of the item.
     * @type {string}
     */
    ContentTypeId?: string;

    /**
     * User ID the item is checked out to (ODB only).
     * @type {string}
     */
    CheckedOutUserId?: string;

    /**
     * Returns the URL for previewing a document in the browser, often in an interactive way, if that feature exists
     * @type {string}
     */
    ServerRedirectedEmbedUrl?: string;

    /**
     * ARIA label for the icon field.
     * @type {string}
     */
    iconFieldAriaLabel?: string;
}

/**
 * Interface to describe the reputation properties on the ISPListItem object.
 */
export interface IItemReputationProperties {
    /** Text string that represents the average rating value. */
    AverageRating?: string;

    /** Users that rated the item. */
    RatedBy?: Array<{ id: string, value: string }>;

    /** Each user rating value for an item. */
    Ratings?: string;

    /** Each user Likes value for an item. */
    LikesCount?: string;

    /** Users that liked the item. */
    LikedBy?: Array<{ id: string, value: string }>;
}

export interface IFileHandlerFacet {
    canOpen?: boolean;
    canPreview?: boolean;
    icon?: string;
}

export interface IListItemFacet {
}
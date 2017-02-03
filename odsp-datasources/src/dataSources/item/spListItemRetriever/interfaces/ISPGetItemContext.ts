import { ISPListGroup } from '../../spListItemProcessor/ISPListItemData';

/** parameters need to construct the post data payload */
export interface ISPGetItemPostDataContext {
    needsSchema?: boolean;
    needsForms?: boolean;
    needsQuickLaunch?: boolean;
    needsSpotlight?: boolean;
    needsViewMetadata?: boolean;
    needsParentInfo?: boolean;
    viewXml?: string;
    firstGroupOnly?: boolean;
    expandGroups?: boolean;
    allowMultipleValueFilterForTaxonomyFields?: boolean;
    requestToken?: string;
    fieldNames?: string[];
    isListDataRenderOptionChangeFeatureEnabled?: boolean;
    isSpotlightFeatureEnabled?: boolean;
    groupByOverride?: string;
    requestDatesInUtc?: boolean;
    needUpdatePageContext?: boolean;
    needClientSideComponentManifest?: boolean;
    groupReplace?: boolean;	
}

/** This must be a subset of the IGetItemContext interface in odsp-next. */
export interface ISPGetItemContext {
    // List Root identifiers
    /** String representing the key for the parent folder */
    parentKey: string;

    // General settings
    /** True if we need to fetch schema for list query */
    needSchema?: boolean;

    /** parameters need to construct the post data payload */
    postDataContext?: ISPGetItemPostDataContext;

    /** Used when current item is folder, we have to construct getItem call url with RootFolder set to its parent folder */
    getRootFolderFromParentKey?: boolean;

    // Page identifiers
    /** Start index for the request */
    startIndex?: number;

    /** End index for the request */
    endIndex?: number;

    /** Page size for the request */
    pageSize?: number;

    /** String representing the token for the request */
    requestToken?: string;

    // view identifiers
    /** Name of the field to sort by */
    sortField?: string;

    /** True for results in ascending order, false otherwise */
    isAscending?: boolean;

    /** Object with key/value pairs representing filters/values */
    filters?: { [key: string]: string };

    /** Use this view ID to get data for a generic doclib/list. If viewXml is present, viewId will be ignored. */
    baseViewId?: string;

    /**
     * Use to specify overrides to the view XML for a generic doclib/list, such as field
     * modifications, that aren't represented elsewhere in the context.
     *
     * Takes precedence over baseViewId, but it's good to specify viewId as well if the
     * override XML is based on an existing view.
     */
    viewXml?: string;

    // group identifiers
    /** True if we should expand one or all the groups, false otherwise */
    expandGroup?: boolean;

    /** Field name to group the results by, if we are requesting for grouped results */
    groupBy?: string;

    /** The group from which returned items must be drawn. */
    group?: ISPListGroup;

    /** whether the listview supports nested groups */
    supportsNestedGroups?: boolean;
}

export default ISPGetItemContext;
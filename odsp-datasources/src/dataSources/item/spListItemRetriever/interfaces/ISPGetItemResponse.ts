import { IColumnAdapter } from '../../../../interfaces/clientSideExtensions/ISpfxAdapter';
import IServerView from '../../../../interfaces/view/IServerView';
/**
 * Interface for the JSON sent from SharePoint in response to RenderListDataAsStream call.
 */
export interface ISPGetItemResponse {
    AllowCreateFolder?: boolean;
    AllowGridMode?: boolean;
    BasePermissions?: {
        ManageLists?: boolean;
        ManagePersonalViews?: boolean;
        OpenItems?: boolean;
    };
    BaseViewID?: string;
    CanShareLinkForNewDocument?: boolean;
    ContentTypesEnabled?: boolean;
    CurrentUserId?: number;
    CurrentUserIsSiteAdmin?: boolean;
    displayFormUrl?: string;
    editFormUrl?: string;
    EnableMinorVersions?: boolean;
    ExcludeFromOfflineClient?: boolean;
    HttpRoot?: string;
    isModerated?: boolean;
    ListContenTypes?: ISPContentType[];
    ListData?: ISPListData;
    /** List GUID */
    listName?: string;
    ListSchema?: ISPListSchema;
    // listTemplate?: string;
    /** String of list template enum */
    ListTemplateType?: string;
    ListTitle?: string;
    listUrlDir?: string;
    Navigation?: INavigation;
    newFormUrl?: string;
    NewWOPIDocumentEnabled?: boolean;
    ParentInfo?: ISPParentInfo;
    rootFolder?: string;
    SiteTitle?: string;
    TenantTagPolicyEnabled?: boolean;
    verEnabled?: boolean;
    /** GUID of view used */
    view?: string;
    ViewMetadata?: IServerView;
    /** Name of view used */
    viewTitle?: string;
    VisualizationInfo?: string;
    WebExcludeFromOfflineClient?: boolean;
    /** Boolean indicating if attachments are enabled on the list. */
    EnableAttachments?: string;
    /** if list being rendered supports modern UX */
    NewExperienceRendering?: boolean;
    /** page context info needs to be refreshed when rendering a new list */
    PageContextInfo?: string;
    /** Boolean indicating if site metadata navigation feature is enabled */
    metadataNavFeatureEnabled?: boolean;
}

export interface IEditor {
    email: string;
    id: number;
    picture: string;
    sip: string;
    title: string;
}

export interface IMediaServiceMetadata {
    readonly audio?: {
        readonly format?: string;
    };
    readonly officeBundle?: {
        readonly ctag?: string;
        readonly version?: string;
        readonly fatalError?: boolean;
        readonly errorInfo?: string;
    };
    readonly media?: {
        readonly author?: string[];
        readonly duration?: number;
        readonly title?: string;
    };
    readonly photo?: {
        readonly cameraManufacturer?: string;
        readonly cameraModel?: string;
        readonly dateTaken?: string;
        readonly exposureTimeNumerator?: number;
        readonly exposureTimeDenominator?: number;
        readonly fNumber?: number;
        readonly focalLength?: number;
        readonly width?: number;
        readonly isoSpeed?: number;
        readonly lensModel?: string;
        readonly orientation?: number;
        readonly height?: number;
    };
    readonly video?: {
        readonly encodingBitrate?: number;
        readonly fourCC?: string;
        readonly frameHeight?: number;
        readonly frameRate?: number;
        readonly frameWidth?: number;
        readonly manifestMetadata?: string;
    };
}

export interface ISPListRow {
    _ip_UnifiedCompliancePolicyUIAction?: number;
    CheckoutUser?: IEditor[];
    ContentType?: string;
    Editor?: IEditor[];
    FSObjType?: string;
    FileLeafRef?: string;
    FileRef?: string;
    File_x0020_Size?: string;
    File_x0020_Type?: string;
    'File_x0020_Type.mapapp'?: string;
    'File_x0020_Type.progid'?: string;
    'File_x0020_Type.url'?: string;
    FolderChildCount?: string;
    'HTML_x0020_File_x0020_Type.File_x0020_Type.mapall'?: string;
    ID?: string;
    ItemChildCount?: string;
    ProgID?: string;
    SMTotalSize?: string;
    UniqueId?: string;
    ServerRelativeUrl?: string;
    MediaServiceFastMetadata?: string;
    Modified?: number;
    'Modified.FriendlyDisplay'?: string;
    PermMask?: string;
    SMTotalFileCount?: string;
    ServerRedirectedEmbedUrl?: string;
    PrincipalCount?: string;
    ProgId?: string;

    // Shortcut properties.
    '_ShortcutUrl'?: string;
    '_ShortcutSiteId'?: string;
    '_ShortcutWebId'?: string;
    '_ShortcutUniqueId'?: string;

    // MicroService metadata properties.
    '.spResourceUrl'?: string;
    '.fileType'?: string;
    '.spItemUrl'?: string;
    '.ctag'?: string;
    '.hasBxf'?: string;
    '.hasOfficePreview'?: string;
    '.hasPdf'?: string;
    '.hasThumbnail'?: string;
    '.hasVideoManifest'?: string;

    // Deprecated. These properties are not real!
    id?: string;
    mediaBaseUrl?: string;
    pdfConversionUrl?: string;
    spResourceUrl?: string;
    thumbnailUrl?: string;
    videoManifestUrl?: string;
    isRootFolder?: boolean;
}

export interface ISPListData {
    FilterLink?: string;
    FirstRow?: number;
    FolderPermissions?: string;
    ForceNoHierarchy?: string;
    HierarchyHasIndention?: string;
    LastRow?: number;
    NextHref?: string;
    Row?: ISPListRow[];
    FolderId?: string;
}

/** Copied over from odsp-next/../controls/list/interfaces/IContentType */
export interface ISPContentType {
    /**
     * fieldname: same as name in IOneDriveItem
     */
    displayName: string;

    /**
     * template url used in new command.
     */
    templateUrl: string;

    /**
     * ContentType Id used in new command.
     */
    cTypeId?: string;
    /**
     * maps the key (fieldName) with the internal fieldName
     */
    description: string;

    /**
     * optional docset new form url used in new command
     */
    docSetUrl?: string;
    /**
     * optional appMap param for new in client operation.
     */
    appMap?: string;
    /**
     * optional iconUrl param for icon Url of the content type.
     */
    iconUrl?: string;
}

export interface ISPListField {
    /** Field internal name */
    Name: string;
    /** Field display name */
    DisplayName?: string;
    /** GUID of the field */
    ID?: string;

    /** Data type of the field */
    FieldType?: string;
    /** Underlying(?) data type of the field (usually the same as FieldType) */
    Type?: string;
    /** For calculated fields, the type of the result data */
    ResultType?: string;

    /** TRUE/FALSE to indicate if field type is filterable */
    Filterable?: string;
    /** TRUE/FALSE to indicate if filtering by this field should be dsiabled */
    FilterDisable?: string;
    /** TRUE/FALSE to indicate if the field type is groupable */
    Groupable?: string;
    /** TRUE/FALSE to indicate to indicate this is actually a grouping field */
    GroupField?: string;
    /** TRUE/FALSE to indicate if field is sortable */
    Sortable?: string;
    /** TRUE/FALSE to indicate if field is added to filters pane */
    PinnedToFiltersPane?: string;
    /** ShowInFiltersPane status, it can be Auto, Pinned or Removed */
    ShowInFiltersPane?: string;
    /** TRUE/FALSE to indicate if this field type should have clickable hyperlinks */
    AutoHyperLink?: string;
    /** TRUE/FALSE to indicate if new values are appended */
    AppendOnly?: string;
    DispFormUrl?: string;
    /** Display format for the data in this field */
    Format?: string;
    /** TRUE/FALSE to indicate if this field has an associated menu/"callout invoker" */
    listItemMenu?: string;
    /** TRUE/FALSE to indicate whether this field is required to contain data */
    Required?: string;
    /** TRUE/FALSE to indicate if this is a rich text field */
    RichText?: string;

    AllowGridEditing?: string;
    ariaLabel?: string;
    ClassInfo?: string;
    ReadOnly?: string;
    RealFieldName?: string;
    role?: string;

    ClientSideComponentId?: string;
    ClientSideComponentProperties?: string;
    FieldCustomizer?: ISPListFieldCustomizer;
    ClientSideColumnAdapter?: IColumnAdapter;
    /** A JSON blob that describes how the filed should be rendered */
    CustomFormatter?: string;
    // properties that only belong to Taxonomy field
    /** GUID that identifies the term store which contains the EnterpriseKeywords for the site that this taxonomy field belongs to */
    SspId?: string;
    /** GUID of the term set that contains the terms used by this taxonomy field */
    TermSetId?: string;
    /** GUID of the anchor term for a taxonomy field */
    AnchorId?: string;
}

export interface ISPListSchema {
    Collapse?: string;
    /** String of enum specifying how to open items by default. "0" = client, "1" = browser */
    DefaultItemOpen?: string;
    /** First group field internal name */
    group1?: string;
    /** Second group field internal name */
    group2?: string;
    /** "1" if this is the Title field of the list...? */
    HasTitle?: string;
    /**
     * Fields in the requested view.
     * For grouped views, this will also contain an IClientFormFieldSchema entry for each group field.
     */
    Field?: ISPListField[];
    /** "1" if Tabular View --> Allow individual item checkboxes is true, "0" otherwise. */
    TabularView?: string;

    /**
     * Access token for accessing the user's Document space using Vroom.
     */
    '.accessToken'?: string;
    /**
     * Stack identifier to send to the MicroService for tracing.
     */
    '.callerStack'?: string;
    /**
     * CorrelationId of the list request for tracing on the MicroService.
     */
    '.correlationId'?: string;
    /**
     * Access token for the drive content using Vroom.
     */
    '.driveAccessToken'?: string;
    /**
     * Drive URL for the list root.
     */
    '.driveUrl'?: string;
    /**
     * Base URL for all MicroService calls.
     */
    '.mediaBaseUrl'?: string;
    /**
     * URL pattern for the API call to generate an Office bundle using the MicroService.
     */
    '.officeBundleGenerate'?: string;
    /**
     * URL pattern for the API call to ger an Office bundle fragment from the MicroService.
     */
    '.officeBundleGetFragment'?: string;
    /**
     * URL pattern for the API call to convert an item to a PDF via the MicroService.
     */
    '.pdfConversionUrl'?: string;
    /**
     * Base URL for the push-channel service to use during the user session.
     */
    '.pushChannelBaseUrl'?: string;
    /**
     * URL pattern for the API call to generate a thumbnail for an item via the MicroService.
     */
    '.thumbnailUrl'?: string;
    /**
     * URL pattern for the transform service for items via the MicroService.
     */
    '.transformUrl'?: string;
    /**
     * URL pattern for the API call to generate a video manifest for an item via the MicroService.
     */
    '.videoManifestUrl'?: string;
}

export interface INavigation {
    Nodes: any[]; /** Actually IQuickLaunchData[] */
}

export interface ISPParentInfo {
    ParentFolderInfo?: ISPListParent[];
}

export interface ISPListParent {
    ServerRelativeUrl?: string;
    Permissions?: string;
}

/* Placeholder for ISPListFieldCustomizer interface
   Actual definition is in sp-client
   Todo: move the interface to sp-common for sharing */
export interface ISPListFieldCustomizer {
    onRenderCell: (event: any) => void;
    onDisposeCell: (event: any) => void;
    context: any;
}
export default ISPGetItemResponse;

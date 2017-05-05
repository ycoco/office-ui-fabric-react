import IVisualization from '../list/IVisualization';

/**
 * Specifies the recursive scope of a view.
 * Corresponds to SPViewScope in sts\stsom\core\spview.cs.
 */
export const enum ViewScope {
    /** Show only files and subfolders of a specific folder. */
    defaultScope,
    /** Show all files in all folders. */
    recursive,
    /** Show all files and all subfolders of all folders. */
    recursiveAll,
    /** Show only the files of a specific folder. */
    filesOnly
}

export interface IServerView {
    /** [planned] XML specifying fields and functions that define totals shown in the view. */
    Aggregations?: string;
    /** [planned] Whether aggregations are on or off. Valid values: On, Off. */
    AggregationStatus?: string;

    /** [legacy?] Integer 0-255 specifying the base view of this view. */
    BaseViewId?: string;

    /** [legacy?] If defined, view is only available for folders of this content type. */
    ContentTypeId?: { StringValue: string };
    /** [legacy?] True if the view is the default for the content type specified by ContentTypeId. */
    DefaultViewForContentType?: boolean;

    /** True if the view is the default for the list. */
    DefaultView: boolean;

    /** True if the view has been modified in an editor. */
    EditorModified?: boolean;

    /** [legacy] XML specifying row and column formatting for the view. */
    Formats?: string;

    /** True if the view should be hidden in the UI. */
    Hidden: boolean;

    /** [legacy?] XML view definition. It appears ListViewXml is usually more relevant. */
    HtmlSchemaXml?: string;

    /** GUID of the view. */
    Id: string;

    /** [legacy] URL of the image for the view. */
    ImageUrl?: string;

    /** True if the current folder is displayed in the view. */
    IncludeRootFolder?: boolean;

    /** [legacy] JavaScript file used for this view. */
    JSLink?: string;

    /** XML view definition. This appears to usually be more relevant than HtmlScemaXml. */
    ListViewXml?: string;

    /** [legacy?] View method XML */
    Method?: string;

    /** [legacy] True if this is the default view for mobile. */
    MobileDefaultView?: boolean;
    /** [legacy] True if this view is available for mobile. */
    MobileView?: boolean;

    /** Content approval type for this view. */
    ModerationType?: any;

    /** [legacy?] True if items can be re-ordered in this view. */
    OrderedView?: boolean;

    /** If true, the view's row limit is per page. If false, the row limit is absolute. */
    Paged?: boolean;

    /** True if this is a personal view. */
    PersonalView?: boolean;

    /** True if this is a read-only view. */
    ReadOnlyView?: boolean;

    /** [legacy?] True if this view requires client integration rights. */
    RequiresClientIntegration?: boolean;

    /** Maximum number of list items to display on a page. */
    RowLimit?: number;

    /** Scope for this view. */
    Scope?: ViewScope;

    /** Server-relative URL of the view's aspx page. */
    ServerRelativeUrl: string;

    /** [legacy?] View style number. */
    StyleId?: string;

    /** [legacy] True if items in this view should be displayed in threads (for discussions). */
    Threaded?: boolean;

    /** Name of the view. */
    Title: string;

    /** [legacy] Toolbar for the view. */
    Toolbar?: string;

    /** [legacy] Template for the view's toolbar. */
    ToolbarTemplateName?: any;

    /** [legacy?] XML specifying data to display in the view (possibly just for calendars). */
    ViewData?: any;

    /** [legacy?] XML specifying joins for this view. */
    ViewJoins?: string;

    /** [legacy?] XML specifying projected fields (from joined lists) for this view. */
    ViewProjectedFields?: string;

    /** XML specifying the sort/filter/group query for this view. */
    ViewQuery?: string;

    /** Type of the view: HTML (default), GRID, CALENDAR, RECURRENCE, CHART, or GANTT. */
    ViewType: string;

    /** Information about the visualization of the view (type, application ID) */
    VisualizationInfo?: IVisualization;
}

/** Specifies only fields that are writable when updating a view. */
export interface IWritableServerView {
    Aggregations?: string;
    AggregationStatus?: string;
    ContentTypeId?: { StringValue: string };
    DefaultView?: boolean;
    DefaultViewForContentType?: boolean;
    EditorModified?: boolean;
    Formats?: string;
    Hidden?: boolean;
    IncludeRootFolder?: boolean;
    JSLink?: string;
    ListViewXml?: string;
    Method?: string;
    MobileDefaultView?: boolean;
    MobileView?: boolean;
    Paged?: boolean;
    RowLimit?: number;
    Scope?: ViewScope;
    Title?: string;
    Toolbar?: string;
    ViewData?: any;
    ViewJoins?: string;
    ViewProjectedFields?: string;
    ViewQuery?: string;

    /** Not part of the view definition, just for the REST call */
    __metadata: { 'type': string; };
}

export default IServerView;
import { IViewArrangeInfo, IOrderedField, IGroupBy, IRowLimit, ArrangeInfoType, IViewDomParts } from './IViewArrangeInfo';
import IVisualization from '../list/IVisualization';
import { IListPermissions } from '../list/IListPermissions';

/**
 * Types of list views. The only one we support in the new UI is "standard."
 * Enum values are from SPViewType in sts\stsom\core\spviews.cs.
 */
export const enum ViewType {
    standard = 0x1,
    datasheet = 0x800,
    calendar = 0x80000,
    recurrence = 0x2001,
    chart = 0x20000,
    gantt = 0x4000000,
    power = 0x8000000
}

/**
 * Represents a list view.
 *
 * All properties are effectively read-only: for properties derived from the view XML, changing the
 * property's value does not change the underlying view XML.
 */
export interface IView {
    /** View name */
    title: string;
    /** View GUID (normalized to lowercase with no brackets) */
    id: string;
    /** True if this is the default view for the library */
    isDefault?: boolean;
    /** True if the view should be hidden in the UI */
    isHidden?: boolean;
    /** True if this is a personal view (only visible to current user) */
    isPersonal?: boolean;
    /** True if the server says this view is read-only */
    isReadOnly?: boolean;
    /** True if the view CAML has been modified in an external editor */
    modifiedInEditor?: boolean;
    /**
     * Row limit, either per page or absolute. Updating the row limit in the XML using
     * updateRowLimit will update this, but not vice versa.
     */
    rowLimit?: number;
    /** Server-relative URL of the view's .aspx page */
    serverRelativeUrl?: string;
    /** Type of the view */
    viewType?: ViewType;
    visualizationInfo?: IVisualization;
    /**
     * This is probably not the property you're looking for. It's an old server concept that's
     * next to useless now, except that in a picture library "2" indicates "Slides" view.
     */
    baseViewId?: string;
    /**
     * Original view XML.
     * May not be defined due to optimizations when getting the list of views.
     */
    baseViewXml?: string;

    /**
     * Returns whether the user has permission to edit this view.
     * If the view is public, the user must have the manage lists permission.
     * If the view is personal, the user must have the manage personal views permission.
     */
    canUserEdit(permissions: IListPermissions): boolean;

    /**
     * Gets the current view XML, tracking modifications made with methods below.
     * Note that this does NOT take into account modifications made solely via query params.
     * Returns the baseViewXml if no modifications have been made.
     */
    getEffectiveViewXml(): string;

    /**
     * Gets the effective XML for the query tag (sort/group/filters), tracking modifications made
     * with the methods below. Returns undefined if baseViewXml is unknown.
     * @param includeQueryTag - if true, wrap the result with a <Query> tag
     */
    getEffectiveQueryXml(includeQueryTag: boolean): string;

    /**
     * Read-only friendly representation of current field names according to the current view XML.
     *
     * Returns undefined if baseViewXml is unknown.
     * Could throw if baseViewXml is invalid XML.
     */
    getEffectiveFieldNames(): string[];

    // For effective filters/sorts/group by/row limit see ViewHelpers.

    /**
     * Returns true if the view has been modified (using the methods below) in the specified way.
     * If specificModification is not given, returns true if the view has been modified at all.
     * Always false if the baseViewXml is unknown.
     */
    isDirty(specificModification?: ArrangeInfoType): boolean;

    /**
     * Sets that the view has been modified, presumably using a ViewHelpers method.
     * If isDirty is true, modificationType should also be provided to tell what kind of modification was made.
     * If isDirty is false, existing modification types are cleared.
     */
    setIsDirty(isDirty: boolean, modificationType?: ArrangeInfoType);

    /**
     * True if the latest baseViewXml contained invalid XML or invalid CAML.
     * Note that the baseViewXml may be parsed on demand, so it's possible that this flag will not
     * be set until an XML parsing or updating method has been called.
     */
    hasParseError(): boolean;

    /**
     * Get the DOM elements for this view.
     * If you make modifications to the DOM, you should also call setIsDirty.
     *
     * Could throw if baseViewXml is invalid XML or invalid CAML.
     * Returns undefined if baseViewXml is unknown.
     */
    getDomParts(): IViewDomParts;

    /**
     * Clear any overrides made to the baseViewXml.
     */
    clearXmlOverrides();

    /**
     * Prepare the view XML for saving to the server. Currently this means removing any
     * id attributes, which are used on the client to identify smart filters but aren't actually
     * part of the CAML spec.
     */
    prepareForSaving();

    /**
     * Modifies a sort field.
     *
     * - If removeSort is true, removes the field.
     * - If overwriteAll is true, the given sort will replace all existing sorts (if the sort
     *   existed previously, the same FieldRef element will be preserved).
     * - Null/undefined sort + overwriteAll removes all sort information.
     * - If the sort is already in the list of sorts, its direction is updated.
     * - If it's not in the list of sorts, it's added--at the beginning if prepend is true, or
     *   at the end if not.
     */
    updateSort(sort: IOrderedField, options?: { removeSort?: boolean; overwriteAll?: boolean; prepend?: boolean; });

    /**
     * Safely merges with the existing group by information.
     *
     * - If groupBy is null/undefined or no group1 is given, removes group information.
     * - Updates whether the groups are collapsed by default.
     * - For each of group1 and group2, if that grouping level previously existed, see if the
     *   field name is the same. If so, update the group sort direction. If not, replace the
     *   old grouping field with the new one.
     * - If the second grouping level was previously defined but is not now, remove it.
     */
    updateGroupBy(groupBy: IGroupBy);

    /**
     * Modifies a field in the view fields list. If the given field name already exists,
     * the FieldRef will be moved to the new location.
     *
     * - Index < 0 or not given removes the field
     * - Index >= fieldNames.length adds the field at the end.
     * - Other indices behave as expected.
     */
    updateField(name: string, index?: number);

    /**
     * Replace all the view fields with the given list of fields.
     * If any of the field names are already included in the view, the old field element will be used
     * so that any extra attributes on the element will be preserved.
     */
    replaceFields(fieldNames: string[]);

    /**
     * Clears any filters from the view.
     */
    clearFilters();

    /**
     * And the given CAML filters with any filters already present in the view.
     *
     * To call this method with IFilters, first convert them to strings using
     * CamlSerialization.filtersToCamlStrings. This is done to keep CamlSerialization
     * out of the PLT bundle.
     *
     * To update an existing filter, use ViewHelpers.updateFilter.
     * To remove an existing filter, use ViewHelpers.removeFilter.
     *
     * Serializing and adding IFilters MAY BE UNSAFE (talk to Elizabeth for details).
     */
    addFilters(filters: string[]);

    /**
     * Update the limit on the number of rows returned in a query, either per page or absolute.
     */
    updateRowLimit(rowLimit: IRowLimit);

    /**
     * Update sort/filter/group/fields from the given arrange info. Null/undefined values will be ignored.
     * TEMPORARY: Filters will also be ignored.
     */
    updateAll(arrangeInfo: IViewArrangeInfo);

    /**
     * CompareTo function for comparison with another IView type object
     * Return values:
     * -1 : this view instance should be ordered before the view it compares to
     *  0 : this view instance is identical in type and title
     *  1 : this view instance should be ordered after the view it compares to
     */
    compareTo(view: IView): number;
}

export default IView;
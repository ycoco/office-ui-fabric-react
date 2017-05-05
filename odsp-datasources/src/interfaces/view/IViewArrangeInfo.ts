export enum ArrangeInfoType {
    filters,
    sorts,
    groupBy,
    fieldNames,
    rowLimit
}

/**
 * Filter definition: show items where fieldName's value is one of values.
 */
export interface IFilter {
    /**
     * Internal name of the field the filter references.
     */
    fieldName: string;
    /**
     * Type of the values, REQUIRED for binary operators or In and irrelevant for unary operators.
     *
     * Can be any standard SP field type and is often the same as fieldName's type.
     * Text is usually a good default, or Lookup is a good default if using LookupId.
     */
    type?: string;
    /**
     * Arbitrary ID value that can be used to find and update this filter later.
     * Should only include characters that don't need to be HTML encoded.
     * (This is not in the CAML spec, it's just added for convenience.)
     *
     * TODO: Currently this is not returned when parsing due to complications.
     */
    id?: string;
    /**
     * Comparison operator to use. In a couple cases it may be translated to something else
     * in the output CAML:
     * - Eq with an empty value is translated to IsNull
     * - In is translated to a series of Or/Eq for DateTimes and certain other types
     */
    operator: string;
    /**
     * Filter values. Can contain any characters.
     */
    values: string[];
    /**
     * Optional: For lookup columns (which include User columns), this indicates that the filter
     * operation should be done based on numeric IDs rather than text values. For example, this is
     * useful for User columns because two people can have the same name.
     */
    lookupId?: boolean;
}

/**
 * Represents a field with ordering, such as for sorting or grouping.
 */
export interface IOrderedField {
    /** Internal name of the field. Must NOT contain ' or ". */
    fieldName: string;
    /** Whether the order should be ascending or descending. Defaults to true. */
    isAscending?: boolean;
}

/**
 * Defines how items should be grouped together.
 */
export interface IGroupBy {
    /** Whether groups should be displayed collapsed by default. Defaults to true. */
    isCollapsed?: boolean;
    /** Defines first level of grouping. isAscending determines the order of the groups. */
    group1: IOrderedField;
    /** Defines second level of grouping. isAscending determines the order of the groups. */
    group2?: IOrderedField;
}

export interface IRowLimit {
    /** Number of rows returned, either per page or absolute. */
    rowLimit: number;
    /** If true, rowLimit is per page. If false or unspecified, rowLimit is absolute. */
    isPerPage?: boolean;
}

/**
 * Defines how items are currently (or should be) arranged in a view.
 */
export interface IViewArrangeInfo {
    /**
     * Show items that satisfy all of the filters in this list.
     * Filters' fieldName (field internal name) and type must NOT contain ' or ".
     * Order matters because for large lists, the first column in the query must be indexed.
     */
    filters?: (IFilter | string)[];
    /**
     * Sort items by the given fields and directions.
     * Sorts' fieldName (field internal name) must NOT contain ' or ".
     */
    sorts?: IOrderedField[];
    /**
     * Defines how to group items together.
     * Groups' fieldName (field internal name) must NOT contain ' or ".
     */
    groupBy?: IGroupBy;
    /**
     * Internal names of the fields to include in the view.
     */
    fieldNames?: string[];
    /**
     * Per page or absolute row limit for the view.
     */
    rowLimit?: IRowLimit;
}

/** DOM elements representing parts of a view */
export interface IViewDomParts {
    xmlDoc: Document;
    view: Element;
    query: Element;
    where?: Element;
    groupBy?: Element;
    orderBy?: Element;
    viewFields: Element;
    rowLimit?: Element;
}

export default IViewArrangeInfo;
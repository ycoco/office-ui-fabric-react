export enum ColumnFieldType {
    Text,
    Hyperlink,
    Image,
    User,
    Boolean,
    DateTime,
    Currency,
    Counter,
    Number,
    Note,
    Computed,
    Name,
    FileSize,
    Shared,
    SharedWith,
    FileIcon,
    DotDotDot,
    Tag,
    Lookup,
    Taxonomy,
    Hashtag,
    Attachments,
    AverageRating,
    Title,
    WorkflowStatus,
    ProgressBar,
    RatedBy,
    Ratings,
    LikedBy,
    Likes,
    ComplianceRecordFlag,
    Custom,
    Activity,
    Choice
}

/**
 * This enum represents a the width of a given listview column.
 */
export enum ColumnWidth {
    icon = 16,
    iconMin = 16,
    bigIcon = 48,
    bigIconMin = 48,
    regularMin = 90,
    regular = 130,
    nameMin = 220,
    nameODC = 440,
    nameODB = 440,
    originalLocation = 300,
    custom = 900,
    sharedWith = 150,
    note = 250,
    /** Date Modified in the ml locale is a very long string */
    dateModifiedMl = 150,
    dotDotDot = 32,
    ratingsMin = 110
}

export enum MappedColumnType {
    none,
    icon,
    name,
    title,
    calloutInvoker,
    modified,
    url
}

/**
 * Policy tip type. This is actually a bit flag value.
 */
export enum PolicyTipType {
    none = 0,
    notify = 1,
    block = 2,
    notifyAndBlock = 3
}

/**
 * Represents status to determine whether filters pane will show the field.
 * This should be in sync with ShowInFiltersPaneStatus enum in //depot/sporel/sts/stsom/Core/spfield.cs
 */
export enum ShowInFiltersPaneStatus {
    Auto,
    Pinned,
    Removed
}

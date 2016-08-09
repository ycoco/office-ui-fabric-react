// OneDrive:IgnoreCodeCoverage

/**
 * List template types, from SPListTemplateType in sts\Core\splist.cs
 */
export enum ListTemplateType {
    genericList = 100,
    documentLibrary = 101
}

/**
 * Quick lauch options, specifies whether the list is displayed on the Quick Launch of the site.
 */
export enum QuickLaunchOptions {
    /** Enumeration whose values specify that the list is not displayed on the Quick Launch of the site. */
    off = 0,
    /** Enumeration whose values specify that the list is displayed on the Quick Launch of the site. */
    on = 1,
    /** Enumeration whose values specify that the list is displayed on the Quick Launch of the site if the OnQuickLaunch property of the list definition or list template of the associated list is true. */
    defaultVaule = 2
}

/**
 * Represents a ListCreationInformation members
 */
export interface ISPListCreationInformation {
    title: string;
    description: string;
    templateType: ListTemplateType;
    quickLauchOption: QuickLaunchOptions;
}

export default ISPListCreationInformation;
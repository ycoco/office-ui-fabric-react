/**
 * Represents information returned from SPO when requesting a group site be created.
 */
export interface IGroupSiteInfo {
    /**
     * If the siteStatus is GroupSiteStatus.Ready, the url of this group site
     */
    siteUrl?: string;

    /**
     * If the siteStatus is GroupSiteStatus.Ready, the url of this group site
     */
    documentsUrl?: string;

    /**
     * If the siteStatus is GroupSiteStatus.Error, the error message
     */
    errorMessage?: string;

    /**
     * The provisioning status of the site
     */
    siteStatus?: GroupSiteStatus;
}

/**
 * The status of a group site creation attempt
 */
export enum GroupSiteStatus {
    /**
     * The site does not exist and we aren't currently provisioning it
     */
    NotFound = 0,

    /**
     * The site is provisioning
     */
    Provisioning = 1,

    /**
     * The site is ready
     */
    Ready = 2,

    /*
     * There was an error provisioning the site
     */
    Error = 3
}

export default IGroupSiteInfo;

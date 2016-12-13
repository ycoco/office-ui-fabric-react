/**
 * Represents information returned from SPO when requesting a publishing site be created.
 */
export interface IPublishingSiteInfo {
    /**
     * If the siteStatus is PublishingSiteStatus.Ready, the url of this publishing site
     */
    siteUrl?: string;

    /**
     * The provisioning status of the site
     */
    siteStatus?: PublishingSiteStatus;
}

/**
 * The status of a publishing site creation attempt
 */
export enum PublishingSiteStatus {
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

export default IPublishingSiteInfo;

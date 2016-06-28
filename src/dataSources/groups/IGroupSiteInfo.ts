// OneDrive:IgnoreCodeCoverage

export interface IGroupSiteInfo {
    // if the siteStatus is GroupSiteStatus.Ready, the url of this group site
    siteUrl?: string;

    // if the siteStatus is GroupSiteStatus.Ready, the url of this group site
    documentsUrl?: string;

    // if the siteStatus is GroupSiteStatus.Error, the error message
    errorMessage?: string;

    // the provisioning status of the site
    siteStatus?: GroupSiteStatus;
}

export enum GroupSiteStatus {
    // the site does not exist and we aren't currently provisioning it
    NotFound = 0,

    // the site is provisioning
    Provisioning = 1,

    // the site is ready
    Ready = 2,

    // there was an error provisioning the site
    Error = 3
}

export default IGroupSiteInfo;
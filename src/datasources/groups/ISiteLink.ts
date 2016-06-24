// OneDrive:IgnoreCodeCoverage

/**
 * Interface for an object that is passed to the constructor of a Site
 * to initialize its properties.
 */
export interface ISiteLink {
    url?: string;
    pictureUrl?: string;
    name?: string;
    siteId?: string;
    webId?: string;
    groupId?: string;
    lastLoadTimeStampFromServer?: number;
}

export default ISiteLink;

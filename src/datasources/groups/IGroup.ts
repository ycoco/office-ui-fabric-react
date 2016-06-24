// OneDrive:IgnoreCodeCoverage

import IMembership from './IMembership';
import IGroupSiteInfo  from './IGroupSiteInfo';

/**
 * Interface for an object that is passed to the constructor of a Group
 * to initialize its properties.
 */
export interface IGroup {
    id?: string;
    name?: string;
    principalName?: string;
    alias?: string;
    mail?: string;
    description?: string;
    creationTime?: number;
    inboxUrl?: string;
    calendarUrl?: string;
    filesUrl?: string;
    /** Is a Group a favorite group? (From EXO) */
    isFavorite?: boolean;

    /**
     * Url to groups profile page
     */
    profileUrl?: string;

    notebookUrl?: string;
    pictureUrl?: string;
    sharePointUrl?: string;
    editUrl?: string;
    membersUrl?: string;
    isPublic?: boolean;

    /**
     * Site classification - user customizable but typically something like LBI, MBI, HBI.
     * This is a new AAD property and so not every group will have it.
     * If so this string will be undefined.
     */
    classification?: string;

    membership?: IMembership;
    siteInfo?: IGroupSiteInfo;

    lastLoadTimeStampFromServer?: number;
}

export default IGroup;

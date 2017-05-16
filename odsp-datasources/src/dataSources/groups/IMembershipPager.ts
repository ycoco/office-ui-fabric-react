import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IPerson } from '../peoplePicker/IPerson';

export interface IMembershipPagingOptions {
    /**
     * How many members to request per page.
     * Defaults to DEFAULT_PAGE_SIZE of 20 for best performance.
     */
    pageSize?: number;

    /**
     * Whether to set ownership information for each page of members.
     * Defaults to true because not loading the group ownership can lead to
     * inconsistencies.
     * 
     * May 2017 - In theory, the members list returned from the server should also contain all
     * group owners. However, this is not properly enforced, and sometimes a person might be
     * in the owners list but not present in the members list.
     * Only set to false if you wish to avoid the second server call to load owners,
     * and can live with the possibility of missing a member who is in the owners list but
     * not the members list.
     */
    ownershipInformation?: boolean;
}

export interface IMembershipPage {

    /**
     * The page of group members returned from the server.
     */
    page: IPerson[];

    /**
     * A function to obtain a promise for the next page of members.
     * Call this function when you are ready for the next page.
     */
    getNextPagePromise: () => Promise<IMembershipPage>;
}

/**
 * A MembershipPager allows you to load group members one page at a time.
 * To obtain the first page, call loadPage with your desired start index (probably zero).
 * When you're ready for the next page, call the getNextPagePromise function returned by loadPage.
 */
export interface IMembershipPager {

    /** True if the current user is an owner of the group. */
    isOwner: boolean;

    /** the total number of members of the group */
    totalNumberOfMembers: number;

    /** the total number of owners in the group */
    totalNumberOfOwners: number;

    /**
     * Any error messages encountered
     */
    error: any;

    /**
     * Loads a page of members, beginning with the specified starting index. Returns the page of members, along with a function
     * that provides a promise for the next page of members.
     * 
     * @param {number} membersToSkip Number of members to skip before the desired page begins. Defaults to zero.
     */
    loadPage(membersToSkip?: number): Promise<IMembershipPage>;

}
import { IMembership, IOwnership } from '../../dataSources/groups/IMembership';
import { IMembershipPagingOptions, IMembershipPage, IMembershipPager } from '../../dataSources/groups/IMembershipPager';
import IGroupsProvider from '../../providers/groups/GroupsProvider';
import IGroup from '../../dataSources/groups/IGroup';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IPerson } from '../../dataSources/peoplePicker/IPerson';

/**
 * Default page size to use when requesting a page of members.
 * For best performance, use a page size of 20.
 * This is because for pages of size <=20, FBI will use its cache. For larger pages, FBI will fetch from AAD.
 */
const DEFAULT_PAGE_SIZE: number = 20;

/**
 * A MembershipPager allows you to load group members one page at a time.
 * To obtain the first page, call loadPage with your desired start index (probably zero).
 * When you're ready for the next page, call the getNextPagePromise function returned by loadPage.
 */
export class MembershipPager implements IMembershipPager {

    /**
     * True if the current user is an owner of the group.
     */
    public isOwner: boolean;

    /**
     * The total number of members of the group.
     */
    public totalNumberOfMembers: number;

    /**
     * The total number of owners in the group.
     */
    public totalNumberOfOwners: number;

    /**
     * Any errors encountered.
     */
    public error: any;

    /**
     * Callback to load a page of members from the server.
     * 
     * Parameters to the callback are the group id, number of members to skip, and
     * number of members to load per page.
     */
    private _loadPageFromServerDelegate: (groupId: string, skip: number, top: number) => Promise<IMembership>

    /**
     * Dictionary of group owners used for reference during paging.
     * Keys are the userIds of each owner.
     */
    private _ownersDictionary: { [key: string]: IPerson };

    /**
     * Dictionary of userIds and booleans to track which group owners
     * were present in the members list. Used to detect a malformed members list.
     */
    private _foundOwnersDictionary: { [key: string]: boolean };

    /**
     * Number of owners that were found in the members list
     */
    private _numberOfOwnersFound;

    /**
     * The associated groups provider
     */
    private _groupsProvider: IGroupsProvider;

    /**
     * The associated group
     */
    private _parentGroup: IGroup;

    /**
     * The number of members per page. Default is DEFAULT_PAGE_SIZE.
     */
    private _pageSize: number;

    /**
     * Whether or not to add ownership information. Defaults to true.
     */
    private _shouldAddOwnershipInformation: boolean;

    /**
     * Principal name of the current user in the form of user@microsoft.com.
     */
    private _userLoginName: string;

    /**
     * Constructor sets up a new MembershipPager with the given options.
     * 
     * @param {IGroupsProvider} groupsProvider The groups provider associated with the group
     * @param {IGroup} group The associated group
     * @param {(groupId: string, skip: number, top: number) => Promise<IMembership>} loadPageFromServerDelegate Delegate method to load a page of members from
     * the server. Parameters are the id of the group, number of members to skip, and number of members per page.
     * @param {IMembershipPagingOptions} pagingOptions Optional special options including page size and ownership information. See IMembershipPagingOptions for more details.
     * @param {string} userLoginName Current user's login name in the form of user@microsoft.com. Used to determine whether the current user is a group owner.
     */
    constructor(groupsProvider: IGroupsProvider, group: IGroup, loadPageFromServerDelegate: (groupId: string, skip: number, top: number) => Promise<IMembership>,
                pagingOptions?: IMembershipPagingOptions, userLoginName?: string) {
        this._groupsProvider = groupsProvider;
        this._parentGroup = group;
        this._loadPageFromServerDelegate = loadPageFromServerDelegate;
        this._pageSize = (pagingOptions && typeof pagingOptions.pageSize === 'number') ? pagingOptions.pageSize : DEFAULT_PAGE_SIZE;
        this._shouldAddOwnershipInformation = (pagingOptions && typeof pagingOptions.ownershipInformation) ? pagingOptions.ownershipInformation : true;
        this._userLoginName = userLoginName;
        this._foundOwnersDictionary = {};
        this._numberOfOwnersFound = 0;
    }

    /**
     * Loads a page of members, beginning with the specified starting index. Returns the page of members, along with a function
     * that provides a promise for the next page of members.
     * 
     * @param {number} membersToSkip Number of members to skip before the desired page begins. Defaults to zero.
     */
    public loadPage(membersToSkip?: number): Promise<IMembershipPage> {
        let startingIndex = membersToSkip ? membersToSkip : 0;
        if (this._groupsProvider && this._parentGroup.id) {

            let promise: Promise<IMembership> = this._loadPageFromServerDelegate(
                this._parentGroup.id,
                startingIndex,
                this._pageSize
            );

            return promise.then(
                (page: IMembership) => {
                    return this._processPage(page, startingIndex);
                },
                (error: any) => {
                    this.error = error;
                    return Promise.wrapError(error);
                }
            );
        }
        return Promise.wrapError(undefined);
    }

    /**
     * Processes the page of members returned from the server. Returns the processed page of members, along with a function
     * that provides a promise for the next page of members.
     */
    private _processPage(page: IMembership, membersToSkip: number): Promise<IMembershipPage> {

        this.totalNumberOfMembers = page.totalNumberOfMembers;

        let isLastPage: boolean = membersToSkip + this._pageSize >= this.totalNumberOfMembers;
        let getNextPagePromise: () => Promise<IMembershipPage> = isLastPage ? undefined : this._computeGetNextPagePromise(membersToSkip + this._pageSize);

        // If ownership information was requested, add it.
        // We only load the owners list once, and keep it to reference during subsequent page requests.
        if (this._shouldAddOwnershipInformation) {
            if (!this._ownersDictionary) {
                return this._groupsProvider.loadOwnershipContainerFromServer(this._parentGroup.id).then((ownership: IOwnership) => {
                    this._addOwnershipInformationToPage(page, isLastPage, ownership);
                    return Promise.wrap({ page: page.membersList.members, getNextPagePromise: getNextPagePromise });
                });
            } else {
                this._addOwnershipInformationToPage(page, isLastPage);
                return Promise.wrap({ page: page.membersList.members, getNextPagePromise: getNextPagePromise });
            }
        } else {
            return Promise.wrap({ page: page.membersList.members, getNextPagePromise: getNextPagePromise });
        }
    }

    /**
     * Adds information about the group owners to the page. Sets totalNumberOfOwners and isOwner, creates a dictionary of group
     * owners for reference, marks each member in the page as an owner if that member is an owner,
     * and checks for a malformed members list.
     */
    private _addOwnershipInformationToPage(page: IMembership, isLastPage: boolean, ownership?: IOwnership): void {
        // If we loaded the group ownership, update general ownership properties
        if (ownership) {
            this.totalNumberOfOwners = ownership.totalNumberOfOwners;
            this._ownersDictionary = {};
            ownership.ownersList.members.forEach((owner: IPerson) => {
                if (owner.userId) {
                    this._ownersDictionary[owner.userId] = owner;
                }
            });
            this.isOwner = ownership.ownersList.containsUserByPrincipalName(this._userLoginName);
        }

        // For each member in the page, mark as an owner if the person is present in the owners list
        page.membersList.members.forEach((member: IPerson) => {
            member.isOwnerOfCurrentGroup = this._ownersDictionary && !!this._ownersDictionary[member.userId]; // Returns undefined if key not present
            if (member.isOwnerOfCurrentGroup) {
                // Remember which owners we have found in the members list
                this._numberOfOwnersFound++;
                this._foundOwnersDictionary[member.userId] = true;
            }
        });

        // If this is the last page, check for missing owners.
        // In theory, all group owners should also be present in the members list. However, this is not properly enforced.
        // When we reach the last page of members, we must check for any owners not found in the members list.
        // If we find any, we add them to the members list behind the scenes.
        if (isLastPage && this._ownersDictionary && this._numberOfOwnersFound < this.totalNumberOfOwners) {
            for (let key in this._ownersDictionary) {
                let owner = this._ownersDictionary[key];
                if (!this._foundOwnersDictionary[owner.userId]) {
                    owner.isOwnerOfCurrentGroup = true;
                    page.membersList.members.push(owner);
                    // If owners were missing from the members list, the totalNumberOfMembers count will be wrong.
                    // Try to fix this to the extent possible.
                    this.totalNumberOfMembers++;
                }
            };
        }
    }

    /**
     * Creates a function that returns a promise for the page of members starting with membersToSkip.
     */
    private _computeGetNextPagePromise(membersToSkip: number): () => Promise<IMembershipPage> {
        let getNextPagePromise: () => Promise<IMembershipPage> = () => {
            return this.loadPage(membersToSkip);
        }
        return getNextPagePromise;
    }
}

export default MembershipPager;

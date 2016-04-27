// OneDrive:IgnoreCodeCoverage

/**
 * Interface for a person in SPO
 */
export interface IPerson {
    userId: string;
    name: string;
    email: string;
    phone?: string;
    office?: string;
    job?: string;
    department?: string;
    image?: string;
    sip?: string;
    profilePage?: string;
    providerName?: string;
    isResolved?: boolean;
    multipleMatches?: Array<IPerson>;
    //sharingInfo?: ISharingInfo;
    decimalUserId?: string;
    //entityType?: EntityType;
    rawPersonData?: any;
    //principalType?: PrincipalType;
};

/**
 * Interface for an object that is passed to the constructor of a Membership
 * to initialize its properties.
 */
export interface IMembership {
    isMember?: boolean;
    isOwner?: boolean;
    isJoinPending?: boolean;
    membersList?: MembersList;
    ownersList?: MembersList;
    lastLoadTimeStampFromServer?: number;
}

export default class MembersList {

    /**
     * Total number of members
     */
    public totalCount: number;

    /**
     *  Array of members up to a limit
     */
    public members: IPerson[];

    constructor() {
        this.totalCount = 0;
        this.members = new Array<IPerson>();
    }

    /**
     * Add given user to the members list of the group
     */
    addUserToList(user: IPerson) {
        this.members.unshift(user);
        this.totalCount++;
    }

    /**
     * Remove user from members list of a group
     */
    removeUserFromList(user: IPerson) {
        var indexToRemove = -1; // not found by default
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i].userId === user.userId) {
                indexToRemove = i; // find the index
            }
        }

        // If user exists in members list then remove it
        if (indexToRemove >= 0) {
            this.members.splice(indexToRemove, 1);
            this.totalCount--;
        }
    }

}


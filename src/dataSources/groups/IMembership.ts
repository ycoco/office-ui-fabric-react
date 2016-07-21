import { IPerson } from '../peoplePicker/IPerson';

export interface IMembersList {
    /**
     *  Array of members up to a limit
     */
    members: IPerson[];

    /**
     * Add given user to the members list of the group
     */
    addUserToList(user: IPerson): void;

    /**
     * Remove user from members list of a group
     */
    removeUserFromList(user: IPerson): void;
}

/**
 * Interface for an object that is passed to the constructor of a Membership
 * to initialize its properties.
 */
export interface IMembership {
    isMember?: boolean;
    isOwner?: boolean;
    isJoinPending?: boolean;
    membersList?: IMembersList;

    /**
     * Represents the actual total number of members (that are part of the O365 Group).
     */
    totalNumberOfMembers: number;

    lastLoadTimeStampFromServer?: number;
}

export default IMembership;

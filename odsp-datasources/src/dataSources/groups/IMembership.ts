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

    /**
     * Returns true if the members list contains a user with the given
     * principalName, false otherwise. Comparison is case-insensitive.
     * 
     * Note this is O(n) operation. If performing frequent lookups,
     * use a dictionary for better performance.
     */
    containsUserByPrincipalName(principalName: string): boolean;
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

    /**
     * Represents the actual total number of owners (that are part of the O365 Group).
     * Only used if ownership information is requested.
     */
    totalNumberOfOwners?: number;

    lastLoadTimeStampFromServer?: number;
}

/**
 * Interface for an object that stores data about the owners of a Group
 */
export interface IOwnership {
    /**
     * Contains the owners loaded from the server
     */
    ownersList?: IMembersList;

    /**
     * Represents the actual total number of owners (that are part of the O365 Group).
     */
    totalNumberOfOwners: number;
}

export default IMembership;

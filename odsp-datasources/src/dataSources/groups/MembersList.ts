import { IMembersList } from './IMembership';
import { IPerson } from '../peoplePicker/IPerson';

export class MembersList implements IMembersList {

    /**
     *  Array of members up to a limit
     */
    public members: IPerson[];

    constructor() {
        this.members = new Array<IPerson>();
    }

    /**
     * Add given user to the members list of the group
     */
    public addUserToList(user: IPerson): void {
        this.members.unshift(user);
    }

    /**
     * Remove user from members list of a group
     */
    public removeUserFromList(user: IPerson): void {
        let indexToRemove = -1; // not found by default
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i].userId === user.userId) {
                indexToRemove = i; // find the index
            }
        }

        // If user exists in members list then remove it
        if (indexToRemove >= 0) {
            this.members.splice(indexToRemove, 1);
        }
    }

    /**
     * Returns true if the members list contains a user with the given
     * principalName, false otherwise. Comparison is case-insensitive.
     * 
     * Note this is O(n) operation. If performing frequent lookups,
     * use a dictionary for better performance.
     */
    public containsUserByPrincipalName(principalName: string): boolean {
        if (principalName) {
            // Comparison should be case-insensitive
            let principalNameLowerCase: string = principalName.toLowerCase();
            for (let i = 0; i < this.members.length; i++) {
                if (this.members[i].principalName &&
                    this.members[i].principalName.toLowerCase() === principalNameLowerCase) {
                    return true;
                }
            }
        }
        return false;
    }
}

export default MembersList;

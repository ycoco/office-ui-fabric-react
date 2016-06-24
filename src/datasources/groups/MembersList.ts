// OneDrive:IgnoreCodeCoverage

import { IMembersList } from './IMembership';
import { IPerson } from '../peoplePicker/IPerson';

export default class MembersList implements IMembersList {

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
}
import IDouble from '../../interfaces/IDouble';

export enum IdentityType {
    anonymous = 1,
    msa = 2,
    aad = 3
}

export class Identity {

    /**
     * The type of the current identity (e.g. MSA)
     */
    public type: IdentityType;

    /**
     * The user's email.
     */
    public email: string;

    /**
     * The user's login name.
     */
    public loginName: string;

    /**
     * A unique identifier for the user. Empty if anonymous.
     */
    public id: string;

    /**
     * Session state for the user.
     */
    public sessionState: string;

    /**
     * Web Permission Masks
     */
     public webPermMasks: IDouble;
}

export default Identity;
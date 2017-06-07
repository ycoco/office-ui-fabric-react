import IMembership from './IMembership';


/**
 * Interface for the yammerResources property on a Group.
 * This is a set of name/value pairs. For Groups not created by
 * Yammer, this will be null. For a Yammer Group, IGroup will have
 * a member variable yammerResources of type IYammerResource[]
 *
 * These properties are returned from the server. Notice the Pascal
 * case for the properties. I (Cyrus) thought about camel casing these
 * but decided against it because that would mean extra code for no other
 * purpose other than consistency.
 */
export interface IYammerResource {
    Key: string;
    Value: string;
    ValueType: string;
}

export interface IYammerResources {
    results: IYammerResource[];
}
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

    /** Is the EXO picture URL is available */
    hasPictureUrl?: boolean;

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
    /**
     * AllowToAddGuests - true if adding guests is permitted at the group level, false otherwise.
     * Adding guests may also be enabled/disabled at the tenant level.
     */
    allowToAddGuests?: boolean;
    /**
     * DynamicMembership - true if group membership is dynamic, false otherwise. Dynamic membership
     * means group membership is determined by a rule such as "Mary's direct reports"
     */
    dynamicMembership?: boolean;
    membership?: IMembership;

    /**
     * yammerResources is the property returned when the Group is a Yammer Group.
     * null if otherwise. It's a bunch of name-value pairs that detail yammer specific
     * resources for this group.
     */
    yammerResources?: IYammerResources;
    lastLoadTimeStampFromServer?: number;
}

export default IGroup;

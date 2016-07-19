/**
 * This interface types the JSON structure returned by RankedMembership API.
 */
interface IRankedMembershipResult {
    /** Display name of group. */
    displayName: string;
    /** URL path to group picture. */
    pictureUrl: string;
    /** URL path to files page, might be null if group site is not provisioned. */
    documentsUrl?: string;
    /** GroupID - GUID. */
    id: string;
    /** Whether a group is a EXO favorite group */
    isFavorite: boolean;
}

export default IRankedMembershipResult
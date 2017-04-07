import ISharingLink from './ISharingLink';
import ISharingPrincipal from './ISharingPrincipal';
import ISharingItemInformation from './ISharingItemInformation';
import Error from './enums/Error';

interface ISharingInformation {
    /**
     * Number of days admins allow anonymous links to be active for.
     * If no expiration is required, this value will be null.
     *
     * TODO (joem): Verify null value or empty value.
     */
    anonymousLinkExpirationRestrictionDays: number;

    /* Property determining user's permissioning rights. */
    canManagePermissions: boolean;

    /* Default sharing link to show in UI first. */
    defaultSharingLink: ISharingLink;

    /* Determines if item is currently shared. */
    isShared: boolean;

    /* Item properties required for the share UI to render. */
    item: ISharingItemInformation;

    /* Collection of sharing links available for the current item for the user. */
    sharingLinks: Array<ISharingLink>;

    /* Collection of principals that have access to current item. */
    sharingPrincipals: Array<ISharingPrincipal>;

    /* Settings for the people picker. */
    // TODO (joem): Probably move/copy existing people picker settings object in next.
    peoplePickerSettings: any;

    /* Friendly display name of the user (used for Outlook mail scenario). */
    userDisplayName: string;

    /* Property that tells us if there was an error while getting sharing information. */
    // TODO (joem): Potentially make this an enum so we can provide more specific error messages.
    error?: Error;
}

export default ISharingInformation;
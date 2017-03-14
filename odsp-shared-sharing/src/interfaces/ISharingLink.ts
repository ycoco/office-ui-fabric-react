import ISharingPrincipal from './ISharingPrincipal';
import SharingAudience from './enums/SharingAudience';
import SharingLinkKind from './enums/SharingLinkKind';

interface ISharingLink {
    /* Determines if sharing link allows anonymous access. */
    allowsAnonymousAccess: boolean;

    /* The audience the link is available to. */
    audience: SharingAudience;

    /* Date sharing link expires. */
    expiration: Date;

    /* Determines if sharing link is currently active. */
    isActive: boolean;

    /* Determines if sharing link allows edit. */
    isEdit: boolean;

    /* Collection of principals that have access via the link. */
    principals: Array<ISharingPrincipal>;

    /* The ID of the specific share. It's a GUID. */
    shareId: string;

    /* The link kind for the sharing link. */
    sharingLinkKind: SharingLinkKind;

    /* The URL of the sharing link. */
    url: string;

    /* Whether or not the link was created by a click on "Copy Link" command. */
    createdViaCopyLinkCommand?: boolean;
}

export default ISharingLink;
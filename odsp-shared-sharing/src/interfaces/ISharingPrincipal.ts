import PrincipalType from './enums/PrincipalType';
import SharingLinkKind from './enums/SharingLinkKind';
import SharingRole from './enums/SharingRole';

interface ISharingPrincipal {
    /* ID of the principal. */
    id: number;

    /* Determines if principal is an external user. */
    isExternal: boolean;

    /* The email address of the principal. */
    loginName: string;

    /* Primary text to display for principal (name). */
    primaryText: string;

    /* Sharing role of the principal. This applies to principals directly ACL'ed to item. */
    role?: SharingRole;

    /* Secondary text to display for principal (job title). */
    secondaryText: string;

    /* The link kind for the sharing link that the principal has access via. Does not apply
    to principals directly ACL'ed to item. */
    sharingLinkKind?: SharingLinkKind;

    /* Type of the principal (i.e. individaul or group). */
    type: PrincipalType;
}

export default ISharingPrincipal;
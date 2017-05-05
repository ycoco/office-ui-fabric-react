import { SharingLinkKind, SharingRole, PrincipalType } from './SharingInterfaces';

interface IGetSharingInformationResponse {
    d: {
        /**
         * Number of days admins allow anonymous links to be active for.
         * If no expiration is required, this value will be null.
         */
        anonymousLinkExpirationRestrictionDays: number;

        /**
         * Determines if people picker should be hidden (so certain users
         * can't see others within the tenant).
         */
        blockPeoplePickerAndSharing: boolean;

        /**
         * Determines if user can permission external users.
         */
        canAddExternalPrincipal: boolean;

        /**
         * Determines if user can permission internal users.
         */
        canAddInternalPrincipal: boolean;

        /**
         * Determines if user can send email.
         */
        canSendEmail: boolean;

        /**
         * Determines level of sharing roles allowed.
         */
        canUseSimplifiedRoles: boolean;

        /**
         * The sharing role of the caller for the given item.
         */
        currentRole: SharingRole;

        /**
         * The default link kind in the share UI (determined by admin
         * setting).
         */
        defaultLinkKind: SharingLinkKind;

        /**
         * The canonical sharing link for the given item.
         */
        directUrl: string;

        /**
         * Detailed permissioning information for the given item.
         */
        permissionsInformation: IPermissionsInformation;

        /* Settings for the people picker. */
        // TODO (joem): Probably move/copy existing people picker settings object in next.
        pickerSettings: any;
    };

    /**
     * Error from the API.
     */
    error: any;
}

export interface IPermissionsInformation {
    links: {
        results: Array<ISharingLinkFromAPI>;
    };
    principals: {
        results: Array<ISharingPrincipalFromAPI>;
    };
    siteAdmins: {
        results: Array<ISharingPrincipalFromAPI>
    };
}

export interface ISharingLinkFromAPI {
    isInherited: boolean;
    linkDetails: {
        AllowsAnonymousAccess: boolean;
        Expiration: string;
        IsActive: boolean;
        IsEditLink: boolean;
        LinkKind: SharingLinkKind;
        ShareId: string;
        Url: string;
    };
    linkMembers: {
        results: Array<ISharingPrincipalFromAPI>;
    }
}

export interface ISharingPrincipalFromAPI {
    principal: {
        email: string;
        id: number;
        isActive: boolean;
        isExternal: boolean;
        jobTitle: string;
        loginName: string;
        name: string;
        principalType: PrincipalType;
        userId: string;
    };
    role: SharingRole;
}

export default IGetSharingInformationResponse;
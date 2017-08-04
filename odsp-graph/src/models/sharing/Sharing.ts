
import { IIdentity, IIdentitySet } from '../identity/Identity';
import { IItemWrapper, IItemReference } from '../item/Item';

export type SharingLinkType = keyof {
    edit,
    view,
    embed
};

export type SharingLinkScope = keyof {
    anonymous,
    organization
};

export interface ISharingLink {
    application: IIdentity;
    type: SharingLinkType;
    scope: SharingLinkScope;
    webHtml: string;
    webUrl: string;
}

export interface ISharingInvitation {
    email: string;
    signInRequired: boolean;
    invitedBy: IIdentity;
}

export interface ISharedWithMeResponse {
    value: IItemWrapper[];
}

export interface ICreateSharingLinkRequest {
    type: SharingLinkType;
    scope?: SharingLinkScope;
}

export interface ICreateSharingLinkResponse {
    id: string;
    role: string[];
    link: ISharingLink;
    grantedTo: IIdentitySet;
    invition: ISharingInvitation;
    inheritedFrom: IItemReference;
    shareId: string;
}

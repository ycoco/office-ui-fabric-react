
import { IIdentitySet } from '../identity/Identity';
import { IPagedResponse } from '../base/Base';
import { IItem } from '../item/Item';

export interface IWebhookResponse {
    subscriptionId: string;
    subscriptionExpirationDateTime: string;
    userId: string;
    resource: string;
}

export interface ISubscription {
    id: string;
    muted: boolean;
    expirationDateTime: string;
    notificationUrl: string;
    resource: string;
    scenarios: SubscriptionScenario[];
    createdBy: IIdentitySet;
}

export type SubscriptionScenario = keyof {
    FollowAFile,
    SkyDriveFileSync,
    WindowsProfilePhoto,
    WindowsSettings
};

export interface ISubscriptionsResponse {
    value: ISubscription[];
}

export interface ISubscriptionRequestContext {
    muted?: boolean;
    expirationDateTime?: string;
    expiresAfterDuration?: string;
    notificationUrl: string;
    scenarios?: SubscriptionScenario[];
}

export interface IViewDeltaResponse extends IPagedResponse {
    value: IItem[];
    '@delta.token': string;
}

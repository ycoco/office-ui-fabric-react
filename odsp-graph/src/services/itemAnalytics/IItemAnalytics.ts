// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';

interface IItemAnalyticsService {
    getItemAnalytics(item: IItem): Promise<IItemAnalytics>;
}

export default IItemAnalyticsService;

export interface IItemAnalytics {
    activities: IActivity[];
    incompleteData?: IIncompleteData;
    interval?: string;
    lastActivityDateTime?: string;
    startDateTime?: string;
    viewCount: number;
    viewerCount: number;
}

export interface IIncompleteData {
    missingDataBeforeDateTime?: string;
    wasThrottled?: boolean;
}

export interface IActivity {
    activityDateTime: string;
    activityType?: string;
    actor: IActor;
    location?: string;
}

export interface IActor {
    application?: string;
    user: IUser;
}

export interface IUser {
    displayName: string;
    id: string;
    email: string;
    image?: string;
}

export interface IItem {
    /** The id of the item in its parent library. */
    itemId?: string;

    /**
     * Facet for the item's identity in Microsoft Graph (aka Vroom).
     */
    graph?: IGraphItemFacet;
}

export interface IGraphItemFacet {
    itemId: string;
    driveId: string;
}
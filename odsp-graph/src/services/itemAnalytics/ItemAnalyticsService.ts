// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IItem } from './IItemAnalytics';
import { IItemAnalyticsResponse, IActivity } from '../../base/dataRequestor/IDataRequestor';
import { VroomApiLoggingName } from '../../base/dataRequestor/IDataRequestor';
import { IDataRequestor } from '../../base/dataRequestor/DataRequestor';
import { IItemAnalytics } from '../../services/itemAnalytics/IItemAnalytics';
import { iso8601DateTimeToJsDate, getRelativeDateTimeStringPast } from '@ms/odsp-utilities/lib/dateTime/DateTime';
import IItemAnalyticsService from "./IItemAnalytics";

export interface IItemAnalyticsDataSourceDependencies {
    vroomDataRequestor: IDataRequestor;
}

/**
 * OneDrive for Business Data source for item analytics data fetch
 */
export class ItemAnalyticsService implements IItemAnalyticsService {
    private _dataRequestor: IDataRequestor;
    constructor(params: {}, dependencies: IItemAnalyticsDataSourceDependencies) {
        this._dataRequestor = dependencies.vroomDataRequestor;
    }

    /** Get item analytics from API and update it in item
     */
    public getItemAnalytics(item: IItem): Promise<IItemAnalytics> {
        if (!item.itemId) {
            return Promise.wrap<IItemAnalytics>();
        }

        return this._dataRequestor.send<IItemAnalyticsResponse>({
            apiName: VroomApiLoggingName[VroomApiLoggingName.subscriptions],
            path: `/drives/${item.graph.driveId}/items/${item.graph.itemId}/analytics/alltime?$expand=activities($filter=ActivityType%20eq%20%27Access%27)`
        }).then((response: IItemAnalyticsResponse) => {
            return this._parseResponse(response);
        });
    }

    private _parseResponse(response: IItemAnalyticsResponse): IItemAnalytics {
        const activities = response.activities.map((activity: IActivity) => {
            return {
                activityDateTime: getRelativeDateTimeStringPast(iso8601DateTimeToJsDate(activity.activityDateTime)),
                actor: {
                    user: {
                        displayName: activity.actor.user.displayName,
                        id: activity.actor.user.id
                    }
                }
            };
        });

        return {
            activities: activities,
            viewCount: response.viewCount,
            viewerCount: response.viewerCount
        };
    }
}

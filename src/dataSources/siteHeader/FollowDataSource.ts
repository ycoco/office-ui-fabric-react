
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { CachedDataSource } from '../base/CachedDataSource';
import { ISpPageContext, getSafeWebServerRelativeUrl } from '../../interfaces/ISpPageContext';

namespace JsonResult {
    'use strict';

    export type ItemReference = {
        SiteId: string;
        WebId: string;
        IndexId: number;
        Type: string;
    }

    export type Item = {
        ItemReference: ItemReference;
        Acronym?: any;
        BannerImageUrl?: any;
        BannerColor: string;
        WebTemplate?: any;
        Time: string;
        IsExternalContent: boolean;
        Url: string;
    }

    export type RootObject = {
        Items: Item[];
        Type: string;
    }
}

/**
 * Seperator for followed sites, in FollowDataSource.getFollowedSites call.
 */
export const SITES_SEPERATOR = '|';

/**
 * Key to use as cache request key for getFollowedSites. This is meant to be set to what SPHome
 * uses.
 */
const FOLLOWED_SITES_CACHE_REQ_KEY = 'Count:100,FillSiteData:false,OperationType:1,Start:0';

/**
 * This datasource calls the SPSocial Follow APIs through the SPHome Microservice.
 */
export class FollowDataSource extends CachedDataSource {
    constructor(pageContext: ISpPageContext) {
        super(pageContext, 'FavoriteFeed', { cacheIdPrefix: 'ms-oil-datasource-', cacheTimeoutTime: 300000 });
    }

    protected getDataSourceName() {
        return 'FollowDataSource';
    }

    /**
     * Given a web url, will add the web to the list of sites the user is following. No data is returned but the promise will complete.
     */
    public followSite(webUrl: string): Promise<void> {

        return this.getData<void>(
            () => getSafeWebServerRelativeUrl(this._pageContext) + `/_vti_bin/homeapi.ashx/sites/followed/add`,
            (responseText: string): void => {
                return;
            },
            'FollowSite',
            () => `"${webUrl}"`
        ).then(() => {
            this.flushCache(FOLLOWED_SITES_CACHE_REQ_KEY);
            return;
        });
    }

    /**
     * Given a web url, will remove the web from the list of sites the user is following. No data is returned but the promise will complete.
     */
    public unfollowSite(webUrl: string): Promise<void> {
        return this.getData<void>(
            () => getSafeWebServerRelativeUrl(this._pageContext) + `/_vti_bin/homeapi.ashx/sites/followed/remove`,
            (responseText: string): void => {
                return;
            },
            'UnfollowSite',
            () => `"${webUrl}"`
        ).then(() => {
            this.flushCache(FOLLOWED_SITES_CACHE_REQ_KEY);
            return;
        });
    }

    /**
     * Get the list of all the webs/sites the user is following, deliminated by SitesSeperator const.
     */
    public getFollowedSites(): Promise<string> {
        return this.getDataUtilizingCache<string>({
            getUrl: () => getSafeWebServerRelativeUrl(this._pageContext) + `/_vti_bin/homeapi.ashx/sites/followed`,
            parseResponse: (responseText: string): string => { // parse the responseText

                const response: JsonResult.RootObject = JSON.parse(responseText);
                return response.Items.map((item: JsonResult.Item) => item.Url).join(SITES_SEPERATOR);
            },
            qosName: 'GetFollowedSites',
            method: 'GET',
            cacheRequestKey: FOLLOWED_SITES_CACHE_REQ_KEY
        });
    }
}

export default FollowDataSource;

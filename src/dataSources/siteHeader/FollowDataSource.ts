
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataSource from '../base/DataSource';
import IContext from '../base/IContext';

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
export const SitesSeperator = '|';

/**
 * This datasource calls the SPSocial Follow APIs through the SPHome Microservice.
 */
export default class FollowDataSource extends DataSource {

    /**
     * @constructor
     */
    constructor(hostSettings: IContext) {
        super(hostSettings);
    }

    /**
     * @inheritDoc
     */
    protected getDataSourceName() {
        return 'FollowDataSource';
    }

    /**
     * Given a web url, will add the web to the list of sites the user is following. No data is returned but the promise will complete.
     */
    public followSite(webUrl: string): Promise<void> {
        return this.getData<void>(
            () => this._context.webServerRelativeUrl + `/_vti_bin/homeapi.ashx/sites/followed/add`,
            (responseText: string): void => {
                return;
            },
            'FollowSite',
            () => `"${webUrl}"`
        );
    }

    /**
     * Given a web url, will remove the web from the list of sites the user is following. No data is returned but the promise will complete.
     */
    public unfollowSite(webUrl: string): Promise<void> {
        return this.getData<void>(
            () => this._context.webServerRelativeUrl + `/_vti_bin/homeapi.ashx/sites/followed/remove`,
            (responseText: string): void => {
                return;
            },
            'UnfollowSite',
            () => `"${webUrl}"`
        );
    }

    /**
     * Get the list of all the webs/sites the user is following, deliminated by SitesSeperator const.
     */
    public getFollowedSites(): Promise<string> {
        return this.getData<string>(
            () => this._context.webServerRelativeUrl + `/_vti_bin/homeapi.ashx/sites/followed`,
            (responseText: string): string => { // parse the responseText

                const response: JsonResult.RootObject = JSON.parse(responseText);
                return response.Items.map((item: JsonResult.Item) => item.Url).join(SitesSeperator);
            },
            'GetFollowedSites',
            undefined,
            'GET'
        );
    }
}

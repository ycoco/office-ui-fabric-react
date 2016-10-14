
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
        Weight: number;
        Type: string;
        OriginalUrl?: any
        Title: string;
    }

    export type RootObject = {
        Items: Item[];
        Type: string;
    }
}

namespace IsFollowed {
    export type D = {
        IsFollowed: boolean;
    }

    export type RootObject = {
        d: D;
    }
}

namespace Internal {

    export interface ItemReference {
        id?: any;
        siteId: string;
        webId: string;
        indexId: number;
        type: string;
    }

    export interface ISpHomeResultFormat {
        title: string;
        acronym?: any;
        bannerColor: string;
        bannerImageUrl?: any;
        originalUrl?: any;
        url: string;
        weight: number;
        type: Internal.EntityType;
        itemReference: ItemReference;
    }

    /**
     * Represents the application entity types
     */
    export enum EntityType {
        /**
         * Default site
         */
        DefaultSite = 1,

        /**
         * Team Site Container
         */
        TeamSite = 2,

        /**
         * Group container
         */
        GroupSite = 3,

        /**
         * Video Channel container
         */
        VideoChannel = 4,

        /**
         * HashTag container
         */
        HashTag = 5,

        /**
         * Publishing site
         */
        PublishingSite = 6,

        /**
         * Blog
         */
        Blog = 7,

        /**
         * Recent site
         */
        RecentSite = 8,

        /**
         * Favorite site
         */
        FavoriteSite = 9,

        /**
         * Represents container activity entity
         */
        ContainerActivity = 99,

        /**
         * Represents a composable entity
         * All containers should be below this value
         */
        ComposableEntity = 100,

        /**
         * Generic document item
         */
        DocumentItem = 101,

        /**
         * Person item
         */
        PersonItem = 102,

        /**
         * Video item
         */
        VideoItem = 103,

        /**
         * Company promoted item
         */
        CompanyPromotedItem = 106,

        /**
         * Query suggestion item
         */
        QuerySuggestionItem = 107,

        /**
         * Result suggestion item
         */
        ResultSuggestionItem = 108,

        /**
         * Represents a individual item entity
         * All items should be below this value but above the Composable entity
         */
        ItemEntity = 200,

        /**
         * Bestbet Search item
         */
        BestBetSearchItem = 201,

        /**
         * Site Search item
         */
        SiteSearchItem = 202,

        /**
         * File Search item
         */
        FileSearchItem = 203,

        /**
         * People Search item
         */
        PeopleSearchItem = 204,

        /**
         * Represents a Search item entity
         * All search items should be below this value but above the ItemEntity
         */
        SearchItemEntity = 300,

        /**
         * Represents a settings entity
         * All items should be below this value correspond to different kinds of settings
         */
        SettingsEntity = 400,

        /**
         * Org Links settings
         */
        OrgLinksSettings = 401,

        /**
         * Unknown container
         */
        Unknown = 10000,
    }
}

/**
 * Seperator for followed sites, in FollowDataSource.getFollowedSites call.
 * @deprecated Was used for deprecated getFollowedSites method - new method is isSiteFollowed().
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
        super(pageContext, 'FavoriteFeed', { cacheTimeoutTime: 300000 });
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
            () => `'${webUrl}'`,
            undefined,
            undefined,
            undefined,
            undefined,
            true /* noRedirect */
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
            () => `'${webUrl}'`,
            undefined,
            undefined,
            undefined,
            undefined,
            true /* noRedirect */
        ).then(() => {
            this.flushCache(FOLLOWED_SITES_CACHE_REQ_KEY);
            return;
        });
    }

    /**
     * Get the list of all the webs/sites the user is following, deliminated by SitesSeperator const.
     * @deprecated Use isSiteFollowed() instead. Can be removed as non breaking change after 10/1/2016.
     */
    public getFollowedSites(): Promise<string> {
        return this.getDataUtilizingCache<Internal.ISpHomeResultFormat[]>({
            getUrl: () => getSafeWebServerRelativeUrl(this._pageContext) + `/_vti_bin/homeapi.ashx/sites/followed`,
            parseResponse: (responseText: string): Internal.ISpHomeResultFormat[] => {
                const response: JsonResult.RootObject = JSON.parse(responseText);
                return this._convertToSpHomeItemFormat(response.Items);
            },
            qosName: 'GetFollowedSites',
            method: 'GET',
            noRedirect: true,
            cacheRequestKey: FOLLOWED_SITES_CACHE_REQ_KEY
        }).then((results: Internal.ISpHomeResultFormat[]) => {
            return results.filter(
                (item: Internal.ISpHomeResultFormat) => item.type === Internal.EntityType.DefaultSite
            ).map((item: Internal.ISpHomeResultFormat) => item.url).join(SITES_SEPERATOR);
        });
    }

    /**
     * Returns a promise containing a boolean indicating whether a particular Site or Web is being followed.
     *
     * @param {string} webUrl e.g. https://microsoft.sharepoint.com/sites/OCWGroup
     * @param {boolean} onlyCache Optional boolean defaulting to false indicating whether to only use cached value. Takes precedence.
     * @param {boolean} bypassCache Optional boolean defaulting to false indicating whether to bypass the cache.
     */
    public isSiteFollowed(webUrl: string,  onlyCache = false, bypassCache = false): Promise<boolean> {
        return this.getDataUtilizingCache<boolean>({
            getUrl: () => `${getSafeWebServerRelativeUrl(this._pageContext)}/_api/social.following/IsFollowed`,
            parseResponse: (responseText: string): boolean => {
                const response: IsFollowed.RootObject = JSON.parse(responseText);
                return response.d.IsFollowed;
            },
            qosName: 'isSiteFollowed',
            noRedirect: true,
            method: 'POST',
            getAdditionalPostData: () => `{"actor": { "__metadata":{"type":"SP.Social.SocialActorInfo"}, "ActorType":1, "ContentUri":"${webUrl}", "Id":null}}`,
            bypassCache: bypassCache,
            onlyCache: onlyCache
        });
    }

    private _convertToSpHomeItemFormat(items: JsonResult.Item[]): Internal.ISpHomeResultFormat[] {
        /* tslint:disable:no-null-keyword */
        return items.map((item: JsonResult.Item) => {
            return <Internal.ISpHomeResultFormat>{
                acronym: item.Acronym,
                bannerColor: item.BannerColor,
                bannerImageUrl: item.BannerImageUrl,
                itemReference: {
                    id: null,
                    indexId: item.ItemReference.IndexId,
                    siteId: item.ItemReference.SiteId,
                    webId: item.ItemReference.WebId,
                    type: item.ItemReference.Type
                },
                originalUrl: null,
                title: item.Title,
                type: this._stringToEntityType(item.Type),
                url: item.Url,
                weight: item.Weight
            };
        });
        /* tslint:enable:no-null-keyword */
    }

    private _stringToEntityType(value: string): Internal.EntityType {
        if (!value || value === '') {
            return Internal.EntityType.Unknown;
        }

        let entityType: Internal.EntityType = Internal.EntityType.Unknown;
        switch (value.toUpperCase()) {
            case 'DOCUMENT':
            case 'SUGGESTEDDOCUMENT':
                entityType = Internal.EntityType.DocumentItem;
                break;

            case 'SITE':
            case 'SUGGESTEDSITE':
                entityType = Internal.EntityType.DefaultSite;
                break;

            case 'VIDEOCHANNEL':
                entityType = Internal.EntityType.VideoChannel;
                break;

            case 'BLOG':
                entityType = Internal.EntityType.Blog;
                break;

            case 'GROUP':
                entityType = Internal.EntityType.GroupSite;
                break;

            case 'USER':
                entityType = Internal.EntityType.PersonItem;
                break;

            case 'SUGGESTEDQUERY':
                entityType = Internal.EntityType.QuerySuggestionItem;
                break;

            case 'ORGLINKSCONTEXT':
                entityType = Internal.EntityType.OrgLinksSettings;
                break;
        }

        return entityType;
    }
}

export default FollowDataSource;

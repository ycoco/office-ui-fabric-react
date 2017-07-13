import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { CachedDataSource } from '../base/CachedDataSource';
import { ISpPageContext, getSafeWebServerRelativeUrl } from '../../interfaces/ISpPageContext';

namespace IsFollowEnabled {
    'use strict';

    export type D = {
        IsFollowingFeatureEnabled: boolean;
    }

    export type RootObject = {
        d: D;
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
 * Key to use as cache request key for followSite
 */
const IS_SITE_FOLLOWED_CACHE_REQ_KEY = 'isSiteFollowed';

/**
 * This datasource calls the SPSocial Follow APIs.
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
            this.flushCache(IS_SITE_FOLLOWED_CACHE_REQ_KEY);
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
            this.flushCache(IS_SITE_FOLLOWED_CACHE_REQ_KEY);
            return;
        });
    }

    /**
     * Returns a promise containing a boolean indicating whether a particular Site or Web is being followed.
     *
     * @param {string} webUrl e.g. https://microsoft.sharepoint.com/sites/OCWGroup
     * @param {boolean} onlyCache Optional boolean defaulting to false indicating whether to only use cached value. Takes precedence.
     * @param {boolean} bypassCache Optional boolean defaulting to false indicating whether to bypass the cache.
     */
    public isSiteFollowed(webUrl: string, onlyCache = false, bypassCache = false): Promise<boolean> {
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
            onlyCache: onlyCache,
            cacheRequestKey: IS_SITE_FOLLOWED_CACHE_REQ_KEY
        });
    }

    /**
     * Returns a promise containing a boolean indicating whether following feature is enabled.
     */
    public isFollowFeatureEnabled(): Promise<boolean> {
        return this.getDataUtilizingCache<boolean>({
            getUrl: () => `${this._pageContext.webAbsoluteUrl}/_api/SP.Utilities.SPSocialSwitch.IsFollowingFeatureEnabled`,
            cacheRequestKey: `followEnabled_${this._pageContext.webId}`,
            method: 'POST',
            noRedirect: true,
            qosName: 'isFollowFeatureEnabled',
            parseResponse: (responseText: string): boolean => {
                const response: IsFollowEnabled.RootObject = JSON.parse(responseText);
                return response.d.IsFollowingFeatureEnabled;
            }
        });
    }
}

export default FollowDataSource;

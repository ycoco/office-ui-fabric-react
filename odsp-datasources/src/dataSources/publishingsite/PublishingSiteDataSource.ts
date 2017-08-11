import IPublishingSiteInfo, { PublishingSiteStatus } from './IPublishingSiteInfo';
import SiteCreationDataSource from '../site/SiteCreationDataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Guid from '@ms/odsp-utilities/lib/guid/Guid';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');

/**
 * Default number of maximum retries when error occurs during rest call.
 */
const NUMBER_OF_RETRIES: number = 3;
const publishingSiteApiPrefix: string = '/_api/sitepages/publishingsite';
const createSiteUrl: string = publishingSiteApiPrefix + '/create';
const getSiteStatusUrlTemplate: string = publishingSiteApiPrefix + '/status?url=\'{0}\'';

/**
 * Use PublishingSiteDataSource to interact with publishing sites.
 * It supports actions like Create, checkSiteExists, etc.
 */
export interface IPublishingSiteDataSource {
    /**
     * Creates the publishing site according to the provided parameters.
     */
    createPublishingSite(title: string,
        url: string,
        description: string,
        classification: string,
        siteDesignId: Guid,
        lcid: Number,
        allowFileSharingForGuestUsers: boolean,
        webTemplateExtensionId?: Guid): Promise<IPublishingSiteInfo>;

    /**
     * Returns a promise of the publishing site provisioning status
     */
    getSiteStatus(url: string): Promise<IPublishingSiteInfo>;
    /**
    * Checks the existance of a site with site url.
    */
    checkSiteExists(siteUrl: string): Promise<boolean>;
}

/**
 * Use PublishingSiteDataSource to interact with publishing sites.
 * It supports actions like Create, CheckExistence, etc.
 */
export class PublishingSiteDataSource extends SiteCreationDataSource implements IPublishingSiteDataSource {

    private static _parsePublishingSiteInfoResponse(responseText: string, methodName: string): IPublishingSiteInfo {
        const response = JSON.parse(responseText);
        if (!response.d || !response.d[methodName]) {
            return {
                siteStatus: PublishingSiteStatus.Error
            };
        }
        const siteInfoResponse = response.d[methodName];
        return {
            siteUrl: siteInfoResponse.SiteUrl,
            siteStatus: siteInfoResponse.SiteStatus
        };
    }

    /**
     * Returns the publishing's site provisioning status in a PublishingSiteInfo promise
     */
    public getSiteStatus(url: string): Promise<IPublishingSiteInfo> {
        const restUrl = () => {
            return this._pageContext.webAbsoluteUrl + StringHelper.format(getSiteStatusUrlTemplate, url);
        };

        return this.getData(restUrl,
            (responseText: string) => {
                return PublishingSiteDataSource._parsePublishingSiteInfoResponse(responseText, 'Status');
            },
            'GetSiteStatus',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Creates a publishing site
     */
    public createPublishingSite(title: string, url: string, description: string, classification: string, siteDesignId: Guid,
        lcid: Number, allowFileSharingForGuestUsers: boolean, webTemplateExtensionId?: Guid): Promise<IPublishingSiteInfo> {
        const restUrl = () => {
            return this._pageContext.webAbsoluteUrl + createSiteUrl;
        };

        const additionalPostData = () => {
            const createPublishingSiteParamObj = {
                request: {
                    __metadata: { type: 'SP.Publishing.PublishingSiteCreationRequest' },
                    Title: title,
                    Url: url,
                    Description: description,
                    Classification: classification,
                    SiteDesignId: siteDesignId,
                    lcid: lcid ? lcid : undefined,
                    AllowFileSharingForGuestUsers: allowFileSharingForGuestUsers,
                    WebTemplateExtensionId: webTemplateExtensionId ? webTemplateExtensionId : Guid.Empty
                }
            };

            return JSON.stringify(createPublishingSiteParamObj);
        };

        return this.getData(restUrl,
            (responseText: string) => {
                return PublishingSiteDataSource._parsePublishingSiteInfoResponse(responseText, 'Create');
            },
            'CreatePublishingSite',
            additionalPostData,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }
}

export default PublishingSiteDataSource;

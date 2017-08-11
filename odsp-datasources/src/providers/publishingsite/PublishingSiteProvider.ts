
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Guid from '@ms/odsp-utilities/lib/guid/Guid';
import ISpPageContext from '../../interfaces/ISpPageContext';
import IPublishingSiteInfo from '../../dataSources/publishingsite/IPublishingSiteInfo';
import PublishingSiteDataSource, { IPublishingSiteDataSource } from '../../dataSources/publishingsite/PublishingSiteDataSource';

export interface IPublishingSiteProvider {
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

export interface IPublishingSiteProviderParams {
    pageContext?: ISpPageContext;
    dataSource?: IPublishingSiteDataSource;
}

/**
 * O365 publishing site service provider
 */
export class PublishingSiteProvider implements IPublishingSiteProvider {

    private _dataSource: IPublishingSiteDataSource;

    constructor(params: IPublishingSiteProviderParams) {
        this._dataSource = params.dataSource || new PublishingSiteDataSource(params.pageContext);
    }

    /**
     * Checks the existance of a site with site url.
     */
    public checkSiteExists(siteUrl: string): Promise<boolean> {
        return this._dataSource.checkSiteExists(siteUrl);
    }

    /**
     * Creates the publishing site according to the provided parameters.
     */
    public createPublishingSite(title: string, url: string, description: string, classification: string, siteDesignId: Guid,
        lcid: Number, allowFileSharingForGuestUsers: boolean, webTemplateExtensionId?: Guid): Promise<IPublishingSiteInfo> {

        return this._dataSource.createPublishingSite(title, url, description, classification, siteDesignId,
            lcid, allowFileSharingForGuestUsers, webTemplateExtensionId);
    }

    /**
     * Gets the publishing site provisioning status.
     */
    public getSiteStatus(url: string): Promise<IPublishingSiteInfo> {
        if (!url) {
            return Promise.wrapError('Missing site url.');
        }
        return this._dataSource.getSiteStatus(url);
    }
}

export default PublishingSiteProvider;
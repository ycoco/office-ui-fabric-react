import SiteCreationDataSource from '../site/SiteCreationDataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import WebTemplateType from '../web/WebTemplateType';
import { webTemplateEnumtoIdMap } from '../../providers/classicsite/WebTemplateProvider';

/**
 * Default number of maximum retries when error occurs during rest call.
 */
const NUMBER_OF_RETRIES: number = 3;
const ClassicSiteApiPrefix: string = '/_api/SPOInternalUseOnly.Tenant';
const createSiteUrl: string = ClassicSiteApiPrefix + '/CreateSite';

/**
 * Use ClassicSiteDataSource to interact with classic sites.
 * It supports Create action only.
 */
export interface IClassicSiteDataSource {
    /**
     * Creates the classic site according to the provided parameters.
     */
    createClassicSite(title: string, url: string, classicwebtemplate: WebTemplateType, lcid: Number, owner: string): Promise<void>;
}

/**
 * Use ClassicSiteDataSource to interact with classic sites.
 * It supports Create action only.
 */
export class ClassicSiteDataSource extends SiteCreationDataSource implements IClassicSiteDataSource {
    /**
     * Creates a classic site
     */
    public createClassicSite(title: string, url: string, classicwebtemplate: WebTemplateType,
        lcid: Number, owner: string): Promise<void> {
        const restUrl = () => {
            return this._pageContext.webAbsoluteUrl + createSiteUrl;
        };

        let classicwebtemplateName :string = webTemplateEnumtoIdMap[classicwebtemplate];

        const additionalPostData = () => {
            const createClassicSiteParamObj = {
                siteCreationProperties: {
                    __metadata: { type: 'Microsoft.Online.SharePoint.TenantAdministration.SiteCreationProperties' },
                    Title: title,
                    Url: url,
                    Template: classicwebtemplateName,
                    Lcid: String(lcid),
                    Owner: owner
                }
            };

            return JSON.stringify(createClassicSiteParamObj);
        };

        return this.getData(restUrl,
            () => { },
            'CreateClassicSite',
            additionalPostData,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }
}

export default ClassicSiteDataSource;

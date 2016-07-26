// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataSource from '../../dataSources/base/DataSource';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import ISPListCollectionDataSource from '../../dataSources/listCollection/ISPListCollectionDataSource';
import IContext from '../../dataSources/base/IContext';
import ISPList from './ISPList';
import { ISPListCreationInformation } from './ISPListCreationInformation';

/**
 * Data source for list collection-related operations (in SharePoint terms, web-related)
 */
export default class SPListCollectionDataSource extends DataSource implements ISPListCollectionDataSource {
    constructor(context: IContext) {
        super(context);
    }

    protected getDataSourceName() {
        return 'ListCollectionDataSource';
    }

    /**
     * Create a new list
     * @param {string} title - The title of the new list
     * @param {string} description - The description of the new list
     * @param {string} templateType - The template type value of the new list
     * @param {string} quickLauchOption - Whether the new list is displayed on the Quick Launch of the site.
     */
    public createList(listCreationInformation: ISPListCreationInformation): Promise<ISPList> {
        let _this = this;
        return super.getData<ISPList>(
            (): string => {
                return _this._getCreateListUrl(listCreationInformation);
            }/*getUrl*/,
            (responseText: string): any => {
                let respObj: any = JSON.parse(responseText);
                if (respObj && respObj.d) {
                    return _this._getSPList(respObj);
                }
                return undefined;
            }/*parseResponse*/,
            'CreateList');
    }

    /** Construct the REST call url for creating a new list */
    private _getCreateListUrl(listCreationInformation: ISPListCreationInformation): string {
        let _this = this;
        let rg = [];
        let str = UriEncoding.escapeUrlForCallback(_this._context.webAbsoluteUrl);
        rg.push(str);
        if (str[str.length - 1] !== '/') {
            rg.push('/');
        }

        rg.push("_api/web/lists/add(parameters=@par)?@par={Title:'");
        rg.push(UriEncoding.encodeURIComponent(listCreationInformation.title));
        rg.push("', Description:'");
        rg.push(UriEncoding.encodeURIComponent(listCreationInformation.description));
        rg.push("', TemplateType:");
        rg.push(listCreationInformation.templateType);
        rg.push(', QuickLaunchOption:');
        rg.push(listCreationInformation.quickLauchOption);
        rg.push('}');
        rg.push('&$expand=DefaultViewUrl');

        return rg.join('');
    }

    private _getSPList(respObj: any): ISPList {
        let newListObj = respObj.d; // List object returned by REST call

        return {
                    title: newListObj.Title,
                    description: newListObj.Description,
                    defaultViewUrl: newListObj.DefaultViewUrl,
                    baseTemplate: newListObj.BaseTemplate,
                    hidden: newListObj.Hidden
                };
    }
}
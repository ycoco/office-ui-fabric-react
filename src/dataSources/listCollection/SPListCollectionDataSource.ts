// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataSource from '../base/DataSource';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import ISPListCollectionDataSource from '../listCollection/ISPListCollectionDataSource';
import ISPList from './ISPList';
import { ISPListCreationInformation, QuickLaunchOptions } from './ISPListCreationInformation';

/**
 * Data source for list collection-related operations (in SharePoint terms, web-related).
 */
export class SPListCollectionDataSource extends DataSource implements ISPListCollectionDataSource {
    protected getDataSourceName() {
        return 'ListCollectionDataSource';
    }

    /**
     * Create a new list.
     *
     * @public
     * @param {ISPListCreationInformation} listCreationInformation
     * @returns {Promise<ISPList>}
     */
    public createList(listCreationInformation: ISPListCreationInformation): Promise<ISPList> {
        let result = super.getData<ISPList>(
            /*getUrl*/ (): string => {
                return this._getCreateListUrl(listCreationInformation);
            },
            /*parseResponse*/ (responseText: string): ISPList => {
                    return this._getSPList(responseText);
            },
            'CreateList'
        );

        if (listCreationInformation.quickLaunchOption === QuickLaunchOptions.on) {
            return result.then((list: ISPList) => {
                super.getData<string>(
                    /*getUrl*/ (): string => {
                        return this._getAddToQuickLaunchUrl(list.title);
                    },
                    /*parseResponse*/ (responseText: string): string => {
                        return responseText;
                    },
                    'AddToQuickLaunch',
                    /*getAdditionalPostData*/ (): string => {
                        return "{'__metadata': { 'type': 'SP.List' }, 'OnQuickLaunch': true}";
                    },
                    'POST',
                    /*additionalHeaders*/ {
                        'IF-MATCH': '*',
                        'X-HTTP-Method': 'MERGE'
                    }
                );
                return list;
            });
        } else {
            return result;
        }
    }

    /** Construct the REST call url for creating a new list. */
    private _getCreateListUrl(listCreationInformation: ISPListCreationInformation): string {
        return [
            UriEncoding.escapeUrlForCallback(this._pageContext.webAbsoluteUrl),
            '/_api/web/lists/add(parameters=@par)?@par={Title:\'',
            UriEncoding.encodeURIComponent(listCreationInformation.title),
            '\', Description:\'',
            UriEncoding.encodeURIComponent(listCreationInformation.description),
            '\', TemplateType:',
            listCreationInformation.templateType,
            ', QuickLaunchOption:',
            listCreationInformation.quickLaunchOption,
            '}',
            '&$expand=DefaultViewUrl'
        ].join('');
    }

    private _getAddToQuickLaunchUrl(listTitle: string): string {
        return [
            UriEncoding.escapeUrlForCallback(this._pageContext.webAbsoluteUrl),
            '/_api/web/lists/getbytitle(@title)?@title=\'',
            UriEncoding.encodeURIComponent(listTitle),
            '\''
        ].join('');
    }

    private _getSPList(responseText: string): ISPList {
        let respObj: any = JSON.parse(responseText);

        if (respObj && respObj.d) {
            let newListObj = respObj.d; // List object returned by REST call.

            return {
                title: newListObj.Title,
                description: newListObj.Description,
                defaultViewUrl: newListObj.DefaultViewUrl,
                baseTemplate: newListObj.BaseTemplate,
                hidden: newListObj.Hidden
            };
        }

        return undefined;
    }
}

export default SPListCollectionDataSource;

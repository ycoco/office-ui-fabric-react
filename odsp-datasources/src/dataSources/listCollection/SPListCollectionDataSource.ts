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
     * @inheritDoc
     * @see ISPListCollectionDataSource.createList()
     */
    public createList(listCreationInformation: ISPListCreationInformation): Promise<ISPList> {
        let result = super.getData<ISPList>(
            /*getUrl*/(): string => {
                return UriEncoding.escapeUrlForCallback(this._pageContext.webAbsoluteUrl) +
                    '/_api/web/lists' +
                    '?&$expand=DefaultViewUrl';
            },
            /*parseResponse*/(responseText: string): ISPList => {
                return this._getSPList(responseText);
            },
            'CreateList',
            /*getAdditionalPostData*/(): string => {
                return this._constructCreateListBody(listCreationInformation);
            }
        );
        return result;
    }

    /**
     * @inheritDoc
     * @see ISPListCollectionDataSource.ensureSiteAssetsLibrary()
     */
    public ensureSiteAssetsLibrary(): Promise<ISPList> {
        let result = super.getData<ISPList>(
            /*getUrl*/(): string => {
                return UriEncoding.escapeUrlForCallback(this._pageContext.webAbsoluteUrl) +
                    '/_api/web/lists/ensureSiteAssetsLibrary()';
            },
            /*parseResponse*/(responseText: string): ISPList => {
                return this._getSPList(responseText);
            },
            'EnsureSiteAssetsLibrary'
        );
        return result;
    }

    /** Construct the REST call body for creating a new list. */
    private _constructCreateListBody(listCreationInformation: ISPListCreationInformation): string {
        return JSON.stringify({
            __metadata: {
                type: 'SP.List'
            },
            BaseTemplate: listCreationInformation.templateType,
            Description: listCreationInformation.description,
            Title: listCreationInformation.title,
            OnQuickLaunch: listCreationInformation.quickLaunchOption !== QuickLaunchOptions.off
        });
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
                hidden: newListObj.Hidden,
                id: newListObj.Id
            };
        }

        return undefined;
    }
}

export default SPListCollectionDataSource;

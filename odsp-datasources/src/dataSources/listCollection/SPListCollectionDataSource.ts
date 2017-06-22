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
                return this._constructCreateListUrl();
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
                return this._constructEnsureSiteAssetsLibraryUrl();
            },
            /*parseResponse*/(responseText: string): ISPList => {
                return this._getSPList(responseText);
            },
            'EnsureSiteAssetsLibrary'
        );
        return result;
    }

    /** Construct the REST call url for creating a new list. */
    private _constructCreateListUrl(): string {
        return [
            UriEncoding.escapeUrlForCallback(this._pageContext.webAbsoluteUrl),
            '/_api/web/lists',
            '?&$expand=DefaultViewUrl'
        ].join('');
    }

    private _constructEnsureSiteAssetsLibraryUrl(): string {
        return [
            UriEncoding.escapeUrlForCallback(this._pageContext.webAbsoluteUrl),
            '/_api/web/lists/ensureSiteAssetsLibrary()'
        ].join('');
    }

    /** Construct the REST call body for creating a new list. */
    private _constructCreateListBody(listCreationInformation: ISPListCreationInformation): string {
        let onQuickLaunch: boolean;

        if (listCreationInformation.quickLaunchOption === QuickLaunchOptions.off) {
            onQuickLaunch = false;
        } else {
            onQuickLaunch = true;
        }
        return [
            '{ \'__metadata\': { \'type\': \'SP.List\' }, \'BaseTemplate\': ',
            listCreationInformation.templateType,
            ', \'Description\': \'',
            this._insertEscapeBeforeApostrophe(listCreationInformation.description),
            '\', \'Title\': \'',
            this._insertEscapeBeforeApostrophe(listCreationInformation.title),
            '\', \'OnQuickLaunch\': ',
            onQuickLaunch,
            '} '
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
                hidden: newListObj.Hidden,
                id: newListObj.Id
            };
        }

        return undefined;
    }

    private _insertEscapeBeforeApostrophe(stringToken: string) {
        if (stringToken) {
            stringToken = stringToken.replace(/'/g, "\\'");
        }

        return stringToken;
    }
}

export default SPListCollectionDataSource;

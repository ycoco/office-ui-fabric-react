import CachedDataSource from '../base/CachedDataSource';
import { getSafeWebServerRelativeUrl, ISpPageContext } from '../../interfaces/ISpPageContext';
import { IWeb } from './IWeb';
import ISpFile from '../../interfaces/ISpFile';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';

interface IWebPropertiesResult {
    d: {
        Description: string,
        SiteLogoUrl: string,
        Title: string
    }
}

interface IFilePropertiesResult {
    d: {
        Name: string,
        ServerRelativeUrl: string
    }
}

/**
 * This data source is for calls under "/_api/Web" (the context SPWeb).
 */
export class WebDataSource extends CachedDataSource {
    private static _dataSourceName = 'WebDataSource';

    constructor(pageContext: ISpPageContext) {
        super(pageContext, WebDataSource._dataSourceName +
            '(' + (pageContext ? pageContext.webId: '') + ')');
    }

    protected getDataSourceName() {
        return WebDataSource._dataSourceName;
    }

    /**
     * Uploads (and optionally overwrites) a File in a List under this Web
     * @param listId GUID of the List under the Web
     * @param fileData Binary data for the file to add to the list
     * @param overwrite Flag to overwrite an existing file with the same name
     */
    public addFileToWebList(listId: string, fileName: string, fileData: Blob, overwrite?: boolean): Promise<ISpFile> {
        const overwriteValue = overwrite ? 'true' : 'false';
        const encodedFileName = UriEncoding.encodeRestUriStringToken(fileName);
        const restUrl = `${getSafeWebServerRelativeUrl(this._pageContext)}/_api/Web/Lists('${listId}')/RootFolder/Files/Add(Overwrite=${overwriteValue},Url='${encodedFileName}')`;

        return this.dataRequestor.getData<ISpFile>({
            url: restUrl,
            qosName: 'AddFileToWebList',
            method: 'POST',
            noRedirect: true,
            additionalPostData: fileData,
            contentType: fileData.type,
            parseResponse: (responseText: string) => {
                const response: IFilePropertiesResult = JSON.parse(responseText);

                if (!response || !response.d) {
                    return {
                        name: undefined,
                        serverRelativeUrl: undefined
                    };
                }

                return {
                    name: response.d.Name,
                    serverRelativeUrl: response.d.ServerRelativeUrl
                };
            }
        });
    }

    /**
     * Deletes the website.
     */
    public delete(): Promise<void> {
        const restUrl = () => `${getSafeWebServerRelativeUrl(this._pageContext)}/_api/Web`;

        return this.getData<void>(
            restUrl,
            undefined /*parseResponse*/,
            'DeleteWeb' /*qosName*/,
            undefined /*getAdditionalPostData*/,
            'DELETE' /*method*/
        );
    }

    /**
     * Gets the basic properties (Title and Description) of the SPWeb associated with the current page context.
     */
    public getBasicWebProperties(bypassCache?: boolean): Promise<IWeb> {
        return this.getDataUtilizingCache<IWeb>({
            getUrl: () => `${getSafeWebServerRelativeUrl(this._pageContext)}/_api/Web?$select=Title,Description,SiteLogoUrl`,
            parseResponse: (responseText: string) => {
                const response: IWebPropertiesResult = JSON.parse(responseText);

                if (!response || !response.d) {
                    return {
                        description: undefined,
                        siteLogoUrl: undefined,
                        title: undefined
                    };
                }

                return {
                    description: response.d.Description,
                    siteLogoUrl: response.d.SiteLogoUrl,
                    title: response.d.Title
                };
            },
            qosName: 'GetBasicWebProperties',
            method: 'GET',
            noRedirect: true,
            bypassCache: !!bypassCache
        });
    }

    /**
     * Sets the basic properties (Title and Description) of the SPWeb associated with the current page context.
     */
    public setBasicWebProperties(web: IWeb): Promise<void> {
        const restUrl = () => `${getSafeWebServerRelativeUrl(this._pageContext)}/_api/Web`;

        const postData = () => {
            const data: any = {
                __metadata: {
                    type: 'SP.Web'
                },

                Description: web.description,
                SiteLogoUrl: web.siteLogoUrl,
                Title: web.title
            };

            return JSON.stringify(data);
        };

        return this.getData<void>(
            restUrl,
            undefined /*parseResponse*/,
            'SetBasicWebProperties' /*qosName*/,
            postData,
            'PATCH' /*method*/
        );
    }
}

export default WebDataSource;

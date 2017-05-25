import CachedDataSource from '../base/CachedDataSource';
import { getSafeWebServerRelativeUrl, ISpPageContext } from '../../interfaces/ISpPageContext';
import { IWeb } from './IWeb';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

interface IWebPropertiesResult {
    d: {
        Description: string,
        Title: string
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
     * Gets the basic properties (Title and Description) of the SPWeb associated with the current page context.
     */
    public getBasicWebProperties(bypassCache?: boolean): Promise<IWeb> {
        return this.getDataUtilizingCache<IWeb>({
            getUrl: () => `${getSafeWebServerRelativeUrl(this._pageContext)}/_api/Web?$select=Title,Description`,
            parseResponse: (responseText: string) => {
                const response: IWebPropertiesResult = JSON.parse(responseText);

                if (!response || !response.d) {
                    return {
                        description: undefined,
                        title: undefined
                    };
                }

                return {
                    description: response.d.Description,
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


import Promise from '@ms/odsp-utilities/lib/async/Promise';
import ISpPageContext from '../../interfaces/ISpPageContext';
import DataRequestor from './DataRequestor';
import { IErrorData } from './ServerData';

/* Use this as a base class for any generic data source */
/* For a data source that provides a list of items use the ItemDataSource */
export class DataSource {
    protected _pageContext: ISpPageContext;
    protected dataRequestor: DataRequestor;

    constructor(pageContext: ISpPageContext) {
        this._pageContext = pageContext;
        this.dataRequestor = new DataRequestor({
            qosName: this.getDataSourceName()
        }, {
                pageContext: pageContext
            });
    }

    protected getDataSourceName() {
        return 'DataSource';
    }

    protected needsRequestDigest(url: string): boolean {
        return true;
    }

    /**
     *
     *
     * @protected
     * @template T The type of the data returned by the parseResponse callback param.
     * @param {() => string} getUrl Lambda that returns the URL to which the datasource should make
     *                              the request.
     * @param {(responseText: string) => T} parseResponse Function that takes in the response.
     *
     * @param {string} qosName Named used to Qos Logging.
     * @param {() => string} getAdditionalPostData Lambda that returns the additional POST string blob.
     * @param {string} method Method used to make the request.
     * @param {{ [key: string]: string }} additionalHeaders Additional headers to send as part of the request.
     * @param {string} contentType defaults to application/json;odata=verbose.
     * @param {number} maxRetries Maximum number of times to retry the request, defaults to 0.
     * @param {boolean} noRedirect Optional, defaults to false. If true and user hits 403, will redirect to auth.
     * @param {boolean} crossSiteCollectionCall
     * @param {(qosName: string, errorData: IDataRequestorErrorData) => string} Optional override for qos error handler
     * @returns {Promise<T>}
     */
    protected getData<T>(
        getUrl: () => string,
        parseResponse: (responseText: string) => T,
        qosName: string,
        getAdditionalPostData?: () => string,
        method: string = 'POST',
        additionalHeaders?: { [key: string]: string },
        contentType?: string, // defaults to application/json;odata=verbose
        maxRetries?: number,
        noRedirect?: boolean,
        crossSiteCollectionCall?: boolean,
        qosHandler?: (errorData: IErrorData) => string): Promise<T> {
        let url = getUrl();


        return this.dataRequestor.getData({
            url: url,
            parseResponse: parseResponse,
            qosName: qosName,
            qosHandler: qosHandler,
            additionalPostData: getAdditionalPostData && getAdditionalPostData(),
            method: method,
            additionalHeaders: additionalHeaders,
            contentType: contentType,
            maxRetries: maxRetries,
            noRedirect: noRedirect,
            crossSiteCollectionCall: crossSiteCollectionCall,
            needsRequestDigest: this.needsRequestDigest(url)
        });
    }
}

export default DataSource;

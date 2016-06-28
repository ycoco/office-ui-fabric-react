
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import IContext from './IContext';
import DataRequestor from './DataRequestor';

/* Use this as a base class for any generic data source */
/* For a data source that provides a list of items use the ItemDataSource */
export default class DataSource {
    protected _context: IContext;
    protected dataRequestor: DataRequestor;

    constructor(context: IContext) {
        this._context = context;
        this.dataRequestor = new DataRequestor({
            context: this._context
        });
    }

    protected done() {
        return;
    }

    protected getDataSourceName() {
        return 'DataSource';
    }

    protected needsRequestDigest(url: string): boolean {
        return true;
    }

    protected getData<T>(
        getUrl: () => string,
        parseResponse: (responseText: string) => T,
        qosName: string,
        getAdditionalPostData?: () => string,
        method: string = 'POST',
        addtionHeaders?: { [key: string]: string },
        contentType?: string, // defaults to application/json;odata=verbose
        maxRetries?: number,
        noRedirect?: boolean,
        crossSiteCollectionCall?: boolean): Promise<T> {
        let url = getUrl();

        return this.dataRequestor.getData({
            url: url,
            parseResponse: parseResponse,
            qosName: `${this.getDataSourceName()}.${qosName}`,
            additionalPostData: getAdditionalPostData && getAdditionalPostData(),
            method: method,
            addtionHeaders: addtionHeaders,
            contentType: contentType,
            maxRetries: maxRetries,
            noRedirect: noRedirect,
            crossSiteCollectionCall: crossSiteCollectionCall,
            needsRequestDigest: this.needsRequestDigest(url)
        });
    }
}
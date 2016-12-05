import ISpPageContext from '../../interfaces/ISpPageContext';
import DataRequestor from '../base/DataRequestor';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

/**
 * Calls the groupWeb/_api/GroupService endpoints
 */
export default class GroupService {
    private _dataRequestor: DataRequestor;
    private _pageContext: ISpPageContext;

    constructor(pageContext: ISpPageContext) {
        this._dataRequestor = new DataRequestor({}, { pageContext: pageContext });
        this._pageContext = pageContext;
    }

    /**
     * Calls the /_api/GroupService/SyncGroupProperties endpoint to sync the Group properties that are locally
     * stored on SharePoint from Federated Directory.
     * Properties currently locally stored on SharePoint (and thus are synced):
     * - Title
     * - Description
     */
    public syncGroupProperties(): Promise<void> {
        let url: string = this._pageContext.webAbsoluteUrl + '/_api/GroupService/SyncGroupProperties';

        return this._dataRequestor.getData<void>({
            url: url,
            qosName: 'SyncGroupProperties',
            method: 'POST'
        });
    }
}

// OneDrive:IgnoreCodeCoverage

import IContext from '../base/IContext';
import DataRequestor from '../base/DataRequestor';

/**
 * Calls the groupWeb/_api/GroupService endpoints
 */
export default class GroupService {
    private _dataRequestor: DataRequestor;
    private _context: IContext;

    constructor(context: IContext) {
        this._dataRequestor = new DataRequestor({ context: context });
        this._context = context;
    }

    /** Calls the /_api/GroupService/SyncGroupProperties endpoint to sync the Group properties that are locally
     *  stored on SharePoint from Federated Directory.
     *  Properties currently locally stored on SharePoint (and thus are synced):
     *    * Title
     *    * Description
     */
    public syncGroupProperties(): void {
        let url: string = this._context.webUrl + '/_api/GroupService/SyncGroupProperties';

        this._dataRequestor.getData<void>({
            url: url,
            qosName: 'SyncGroupProperties',
            method: 'POST'
        });
    }
}
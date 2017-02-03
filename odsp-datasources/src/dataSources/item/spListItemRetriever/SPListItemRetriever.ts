// OneDrive:IgnoreCodeCoverage

import ISPListItemRetriever from './interfaces/ISPListItemRetriever';
import { ISPGetItemContext, ISPGetItemPostDataContext } from './interfaces/ISPGetItemContext';
import ISPGetItemResponse from './interfaces/ISPGetItemResponse';
import ISPListContext from './interfaces/ISPListContext';
import * as ListItemDataHelpers from './ListItemDataHelpers';
import * as ListItemPostDataHelpers from './ListItemPostDataHelpers';
import DataSource from '../../base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import ISpPageContext from '../../../interfaces/ISpPageContext';
import { Qos as QosEvent } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import { ResultTypeEnum as QosResultEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import Guid from '@ms/odsp-utilities/lib/guid/Guid';

export const GROUPINGID_NEXT = '__next__';

export interface ISPListItemRetrieverParams {
    hostSettings: ISpPageContext;
}

export class SPListItemRetriever extends DataSource implements ISPListItemRetriever {
    constructor(params: ISPListItemRetrieverParams) {
        super(params.hostSettings);
    }

    protected getDataSourceName() {
        return 'ListItemDataSource';
    }

    public getItem(context: ISPGetItemContext, listContext: ISPListContext, qosInfo: { qosEvent: QosEvent, qosName: string }): Promise<ISPGetItemResponse> {
        return super.getData<ISPGetItemResponse>(
            () => this.getUrl(listContext, context.postDataContext),
            (responseText: string) => this._parseResponse(responseText, qosInfo.qosEvent),
            qosInfo.qosName,
            () => this.getAdditionalPostData(context.postDataContext),
            'POST',
            ListItemDataHelpers.getListRequestHeaders(listContext, context.postDataContext && context.postDataContext.needsQuickLaunch)
        );
    }

    public getUrl(listContext: ISPListContext, postDataContext?: ISPGetItemPostDataContext) {
        // To get data initially, whichever of listId or listUrl is available will be used.
        let params: ListItemDataHelpers.IListDataUrlParams = {
            webUrl: this._pageContext.webAbsoluteUrl,
            listId: listContext.listId,
            urlParts: listContext.urlParts || {} as any,
            searchTerm: listContext.searchTerm,
            rootFolder: listContext.folderPath
        };

        if (this._isSpecifiedItemRequest(listContext)) {
            // See doc comments on IListDataUrlParams.viewId for what this does...
            params.viewId = listContext.viewIdForRequest;
        } else {
            // When list/doclib is switched, viewIdForRequest is empty guid. In this case, we call list data API with empty view query parameter
            // server will render list with its default view.
            if (!listContext.viewXmlForRequest && !params.urlParts.isCrossList && listContext.viewIdForRequest !== Guid.Empty) {
                params.view = listContext.viewIdForRequest;
            }

            params.filterParams = listContext.filterParams;

            if (listContext.sortField) {
                params.sortField = listContext.sortField;
                params.sortDir = listContext.isAscending === 'false' ? 'Desc' : 'Asc';
            }

            if (postDataContext && postDataContext.groupReplace) {
                params.requestToken = this._isExpandingGroup(params) ? undefined : listContext.requestToken;
            } else {
                params.requestToken = listContext.group ? undefined : listContext.requestToken;
            }
            if (this._isExpandingGroup(listContext) && !(postDataContext && postDataContext.groupReplace)) {
                params.groupString = listContext.group.groupString;
            }
        }

        return ListItemDataHelpers.getListDataUrl(params);
    }

    public getAdditionalPostData(postDataContext: ISPGetItemPostDataContext): string {
        return ListItemPostDataHelpers.getAdditionalPostData(postDataContext);
    }

    private _isSpecifiedItemRequest(listContext: ISPListContext): boolean {
        return listContext.itemIds && listContext.itemIds.length > 0;
    }

    private _isExpandingGroup(listContext: ISPListContext): boolean {
        return listContext.group && listContext.group.groupingId !== GROUPINGID_NEXT;
    }

    private _parseResponse(responseText: string, qos: QosEvent) {
        try {
            if (responseText !== undefined) {
                return JSON.parse(responseText);
            }
        } catch (ex) {
            // mysteriously some return starts with {} followed by correct JSON markup.
            // it could be server or network or browser malfunction. We try one more time with this.
            if (responseText.substring(0, 2) !== '{}') {
                qos.end({
                    resultType: QosResultEnum.Failure,
                    resultCode: 'BadJSON',
                    extraData: {
                        'responseText': responseText,
                        'prefetch': 'false'
                    }
                });
                throw ex;
            }
            return JSON.parse(responseText.substring(2));
        }
    }
}

export default SPListItemRetriever;

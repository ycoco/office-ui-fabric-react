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
import Engagement from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import Guid from '@ms/odsp-utilities/lib/guid/Guid';
import { IErrorData } from '../../base/ServerData';

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

    public getItem(context: ISPGetItemContext,
        listContext: ISPListContext,
        qosInfo: { qosEvent: QosEvent, qosName: string }): Promise<ISPGetItemResponse> {
        context.postDataContext.isOnePage = !!context.newTargetListUrl;
        return super.getData<ISPGetItemResponse>(
            () => this.getUrl(listContext, context),
            (responseText: string) => this._parseResponse(responseText, qosInfo.qosEvent),
            qosInfo.qosName,
            () => this.getAdditionalPostData(context.postDataContext),
            'POST',
            ListItemDataHelpers.getListRequestHeaders(listContext, context.postDataContext && context.postDataContext.needsQuickLaunch),
            undefined,
            undefined,
            undefined,
            undefined,
            this._qosHandler
        ).then((response: ISPGetItemResponse) => {
            return response;
        }, (error: IErrorData) => {
            this._errorHandler(qosInfo.qosName, error);
            return Promise.wrapError(error);
        });
    }

    public getUrl(listContext: ISPListContext, context?: ISPGetItemContext) {
        const postDataContext = context && context.postDataContext;

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
            // not exactly sure why when isCrossList is true, we exclude view id in RenderListAsStream API URL
            // SPList one page navigation needs view id when target list url has view id such as https://msft.spoppe.com/teams/SPGroups/Shared%20Documents/Forms/AllItems.aspx?viewid=3e40956e-07e0-42ee-9574-6f23d055e140
            // in order to not affecting existing scenario, we include view id in list data API url when this is one page navigation and viewIdForRequest is not empty
            if (((!listContext.viewXmlForRequest && !params.urlParts.isCrossList) ||
                (postDataContext && postDataContext.isOnePage)) && listContext.viewIdForRequest !== Guid.Empty ) {
                params.view = listContext.viewIdForRequest;
            }
            // view path might be given when view id is not available,
            // so always use view first, if it is not given, use view path instead
            if (!params.view && listContext.viewPathForRequest) {
                params.viewPath = listContext.viewPathForRequest;
            }

            // Ensure only set filterParams when ignoreFilterParams is not true.
            if (!context || !context.ignoreFilterParams) {
                params.filterParams = listContext.filterParams;
            }

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
                    resultCode: 'BadJSON'
                });
                throw ex;
            }
            return JSON.parse(responseText.substring(2));
        }
    }

    private _qosHandler(errorData: IErrorData): string {
        let resultCode = errorData && errorData.code ? errorData.code : '';

        // refine the logging adding more buckets for failures
        // add engagement events for throteling failures to be trqacked in interana
        if (resultCode.indexOf('2147024860') > -1) {
            resultCode = 'ListViewTreshold';
        } else if (resultCode.indexOf('2147024749') > -1) {
            resultCode = 'LookupColumnTreshold';
        } else if (resultCode.indexOf('2147024809') > -1 &&
            resultCode.indexOf('requestUrl') > -1) {
            resultCode = 'RequestURLFailure';
        } else if (resultCode.indexOf('2147024809') > -1 &&
            resultCode.indexOf('range') > -1) {
            resultCode = 'RangeError';
        } else if (resultCode.indexOf('2147024809') > -1 &&
            resultCode.indexOf('view') > -1) {
            resultCode = 'InvalidView';
        } else if (resultCode.indexOf('2130575340') > -1 &&
            resultCode.indexOf('field') > -1) {
            resultCode = 'FieldTypesNotInstalledProperly';
        } else {
            resultCode = errorData.status.toString();
        }
        return resultCode;
    }

    private _errorHandler(qosName: string, errorData: IErrorData): void {
        let resultCode = errorData && errorData.code ? errorData.code : '';
        // refine the logging adding more buckets for failures
        // add engagement events for throteling failures to be trqacked in interana
        if (resultCode.indexOf('2147024860') > -1) {
            Engagement.logData({ name: qosName + '.ListViewTreshold' });
        } else if (resultCode.indexOf('2147024749') > -1) {
            Engagement.logData({ name: qosName + '.LookupColumnTreshold' });
        }
    }

}

export default SPListItemRetriever;

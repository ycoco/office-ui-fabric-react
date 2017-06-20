import { ISPGetItemContext, ISPGetItemPostDataContext } from './ISPGetItemContext';
import ISPGetItemResponse from './ISPGetItemResponse';
import ISPListContext from './ISPListContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { Qos as QosEvent } from '@ms/odsp-utilities/lib/logging/events/Qos.event';

/* Represents an Office 365 list item data source */
export interface ISPListItemRetriever {
    /**
     * Returns a promise that returns a set of list items for the given context.
     */
    getItem(context: ISPGetItemContext, listContext: ISPListContext, qosInfo: { qosEvent: QosEvent, qosName: string }): Promise<ISPGetItemResponse>;

    /**
     * Returns the server connection URL to make a getItem call for the given context.
     */
    getUrl(listContext: ISPListContext, context?: ISPGetItemContext): string;

    /**
     * Returns additional post data to make a getItem call for the given context.
     */
    getAdditionalPostData(context: ISPGetItemPostDataContext): string;
}

export default ISPListItemRetriever;
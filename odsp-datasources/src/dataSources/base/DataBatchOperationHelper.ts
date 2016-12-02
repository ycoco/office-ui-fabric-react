// OneDrive:IgnoreCodeCoverage

import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import Guid from '@ms/odsp-utilities/lib/guid/Guid';
import { IDataBatchOperationResult, IServerResponse } from '../../interfaces/IDataBatchOperationResult';

export class DataBatchOperationHelper {
    public static defaultBatchRequstPostData = 'Content-Type: application/json;odata=verbose';

    /**
     * Returns the REST API Url for the batch operation.
     * @param {string} webUrl The url of the web
     */
    public static getBatchOperationUrl(webUrl: string): string {
        return UriEncoding.escapeUrlForCallback(webUrl) + '/_api/$batch';
    }

    /**
     * Process the server reponses into objects representing the response data.
     *
     * @param {string} responseFromServer The server response in string format.
     * @returns {IDataBatchOperationResult} The object representing the server response.
     */
    public static processBatchResponse(responseFromServer: string): IDataBatchOperationResult {
        let batchResponseSpliter: string;
        let allItems = [];
        let responseArray: Array<string>;
        let detailResponseArray: Array<string>;
        let singleResponseFromServer;
        let hasError = false;

        if (responseFromServer.split('\n').length > 0) {
            batchResponseSpliter = responseFromServer.split('\n')[0];
        }

        if (batchResponseSpliter) {
            responseFromServer = responseFromServer.replace(batchResponseSpliter.trim() + '--', '');
            responseArray = responseFromServer.split(batchResponseSpliter);

            // ignore the first value in the array, which is ''
            for (let i = 1; i < responseArray.length; i++) {
                detailResponseArray = responseArray[i].split('\n\r');
                if (detailResponseArray.length > 2) {
                    try {
                        singleResponseFromServer = JSON.parse(detailResponseArray[2]);
                    } catch (e) {
                        singleResponseFromServer = detailResponseArray[2];
                    }

                    let itemResponse: IServerResponse = {};

                    singleResponseFromServer = singleResponseFromServer.error ? singleResponseFromServer.error : singleResponseFromServer;

                    if (singleResponseFromServer && singleResponseFromServer.code) {
                        let errorInfoArray = singleResponseFromServer.code ? singleResponseFromServer.code.split(',') : singleResponseFromServer.error.code.split(',');
                        let errorCodeNum = Number(errorInfoArray[0]);
                        let errorMessage = singleResponseFromServer.message.value;
                        itemResponse.error = {
                            code: errorCodeNum,
                            message: errorMessage
                        };
                        hasError = true;
                    }
                    allItems.push(itemResponse);
                }
            }
        }

        return { items: allItems, hasError: hasError };
    }

    /**
     * Get the content of the request for a batch operation.
     * Each batch may contain multiple changesets.
     * @param {string} batchGuid The Guid of the batch operation.
     * @param {Array<Array<string>>} endpointSets Sets of endpoints, each set of endpoints will be included in same changeset.
     * @param {string} requestMethod Method of the request, such as POST, GET, etc.
     * @param {string} postData PostData to be included in each endpoint request.
     */
    public static getBatchContent(batchGuid: string, endpointSets: Array<Array<string>>, requestMethod: string, postData: string): string {

        // Start a batch request
        let batchContents = [];

        for (let i = 0; i < endpointSets.length; i++) {
            let endpoints = endpointSets[i];
            // create the changeset
            let changeSetId = Guid.generate();
            let changeSetContents = [];
            for (let j = 0; j < endpoints.length; j++) {
                let endpoint = endpoints[j];

                changeSetContents.push('--changeset_' + changeSetId);
                changeSetContents.push('Content-Type: application/http');
                changeSetContents.push('Content-Transfer-Encoding: binary');
                changeSetContents.push('');
                changeSetContents.push(requestMethod + ' ' + endpoint + ' HTTP/1.1');
                changeSetContents.push(postData);
                changeSetContents.push('');
            }
            // END changeset
            changeSetContents.push('--changeset_' + changeSetId + '--');

            let changeSetBody = changeSetContents.join('\r\n');
            batchContents.push('--batch_' + batchGuid);
            batchContents.push('Content-Type: multipart/mixed; boundary="changeset_' + changeSetId + '"');
            batchContents.push('Content-Length: ' + changeSetBody.length);
            batchContents.push('Content-Transfer-Encoding: binary');
            batchContents.push('');
            batchContents.push(changeSetBody);
            batchContents.push('');
        }
        // generate the body of the batch
        batchContents.push('--batch_' + batchGuid + '--');

        return batchContents.join('\r\n');
    }
}

export default DataBatchOperationHelper;

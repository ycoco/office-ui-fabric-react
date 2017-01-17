
import IGroupSiteInfo from './IGroupSiteInfo';
import ICreateGroupResponse from './ICreateGroupResponse';
import SiteCreationDataSource from '../site/SiteCreationDataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');

/**
 * Default number of maximum retries when error occurs during rest call.
 */
const NUMBER_OF_RETRIES: number = 3;
const createSiteUrlTemplate: string = '/_api/GroupSiteManager/Create?groupId=\'{0}\'';
const getGroupCreationContextUrlTemplate: string = '/_api/GroupSiteManager/GetGroupCreationContext';
const getSiteUrlFromAliasUrlTemplate: string = '/_api/GroupSiteManager/GetValidSiteUrlFromAlias?alias=\'{0}\'';
const getNotebookUrlTemplate: string = '/_api/GroupSiteManager/Notebook?groupId=\'{0}\'';
const getSiteStatusUrlTemplate: string = '/_api/GroupSiteManager/GetSiteStatus?groupId=\'{0}\'';
const getGroupByAliasUrlTemplate: string = 'Group(alias=\'{0}\')';

/**
 * Use GroupSiteDatasource to interact with group sites.
 * It supports actions like Create, CheckExistence, etc.
 */
export interface IGroupSiteDataSource {
    /**
     * Creates the group according to the provided parameters.
     */
    createGroup(strDisplayName: string,
        strMailNickname: string, boolIsPublic: boolean, description: string,
        dataClassification: string, allowGuestUsers: boolean): Promise<ICreateGroupResponse>;

    /**
    * Checks the existance of a group with the alias.
    */
    checkGroupExists(groupAlias: string): Promise<boolean>;

    /**
    * Checks the existance of a site with site url.
    */
    checkSiteExists(siteUrl: string): Promise<boolean>;

    /**
     * get group creation context
     */
    getGroupCreationContext(): Promise<IGroupCreationContext>;

    /**
     * get site Url from alias
     */
    getSiteUrlFromAlias(alias: string): Promise<string>;

    /**
    * Gets the group's notebook URL from the GroupSiteManager API
    */
    getNotebookUrl(id: string): Promise<string>;

    /**
     * Returns a promise of the group site provisioning status
     */
    getSiteStatus(groupId: string): Promise<IGroupSiteInfo>;

    /**
     * Creates the group site if necessary, and returns a promise of the provisioning status
     */
    createSite(groupId: string): Promise<IGroupSiteInfo>;
}

/**
 * The context for creating a group
 * It contains information needed to create a group
 */
export interface IGroupCreationContext {
    /**
     * Whether secondary contact is required
     */
    requireSecondaryContact: boolean;
    /**
     * The Url for group usage guideline page
     */
    usageGuidelineUrl: string;
    /**
     * The data classification options
     */
    dataClassificationOptions: string[];
    /**
     * The custom group and site creation page url
     */
    customFormUrl: string;
    /**
     * Whether external invitaion is allowed
     */
    allowToAddGuests: boolean;
    /**
     * The path site is created under
     */
    sitePath: string;
}

/**
 * Use GroupSiteDatasource to interact with group sites.
 * It supports actions like Create, CheckExistence, etc.
 */
export class GroupSiteDataSource extends SiteCreationDataSource implements IGroupSiteDataSource {

    private static _parseGroupSiteInfoResponse(responseText: string, methodName: string): IGroupSiteInfo {
        const response = JSON.parse(responseText);
        const siteInfoResponse = response.d[methodName];
        return {
            siteUrl: siteInfoResponse.SiteUrl,
            errorMessage: siteInfoResponse.ErrorMessage,
            siteStatus: siteInfoResponse.SiteStatus,
            documentsUrl: siteInfoResponse.DocumentsUrl
        };
    }

     protected getDataSourceName() {
        return 'GroupSiteDataSource';
    }

    /**
     * Returns a true if a group with specified alias exists...
     * False otherwise.
     */
    public checkGroupExists(groupAlias: string): Promise<boolean> {
        return this.getData<boolean>(
            () => {
                return this._getUrl(StringHelper.format(
                    getGroupByAliasUrlTemplate, groupAlias),
                    'SP.Directory.DirectorySession');
            },
            (responseText: string) => {
                return true;
            },
            'GetGroupByAlias',
            undefined,
            'GET',
            undefined,
            undefined,
            0 /* NumberOfRetries*/).then(
            (value: boolean) => { return value; },
            (error: any) => {
                let errorCode: string = error.code;
                if (errorCode) {
                    let exception = errorCode.split(',')[1];
                    if (exception && -1 === exception.indexOf('ResourceNotFoundException')) {
                        return true;
                    }
                }
                return false;
            });
    }

    /**
     * Gets the group's notebook URL from the GroupSiteManager API
     */
    public getNotebookUrl(id: string): Promise<string> {
        const restUrl = () => {
            return this._pageContext.webAbsoluteUrl + StringHelper.format(getNotebookUrlTemplate, id);
        };

        return this.getData<string>(
            restUrl,
            (responseText: string) => {
                let response = JSON.parse(responseText);
                return response.d.Notebook;
            },
            'GetNotebookUrl',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Returns the group's site provisioning status in a GroupSiteInfo promise
     */
    public getSiteStatus(id: string): Promise<IGroupSiteInfo> {
        const restUrl = () => {
            return this._pageContext.webAbsoluteUrl + StringHelper.format(getSiteStatusUrlTemplate, id);
        };

        return this.getData(restUrl,
            (responseText: string) => {
                return GroupSiteDataSource._parseGroupSiteInfoResponse(responseText, 'GetSiteStatus');
            },
            'GetSiteStatus',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Kicks off group site provisioning and returns the provisioning status in a GroupSiteInfo promise
     */
    public createSite(id: string): Promise<IGroupSiteInfo> {
        const restUrl = () => {
            return this._pageContext.webAbsoluteUrl + StringHelper.format(createSiteUrlTemplate, id);
        };

        return this.getData(restUrl,
            (responseText: string) => {
                return GroupSiteDataSource._parseGroupSiteInfoResponse(responseText, 'Create');
            },
            'CreateSite',
            undefined,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES
        );
    }

    /**
     * Creates a group and the site associated with it.
     */
    public createGroup(strDisplayName: string,
        strMailNickname: string, boolIsPublic: boolean, description: string,
        dataClassification: string, allowGuestUsers: boolean): Promise<ICreateGroupResponse> {
        const restUrl = () => {
            return this._pageContext.webAbsoluteUrl + '/_api/GroupSiteManager/CreateGroupEx';
        };

        const additionalPostData = () => {
            let creationOptions = [];

            if (allowGuestUsers) {
                creationOptions.push('AllowFileSharingForGuestUsers');
            }

            const createGroupParamObj = {
                displayName: strDisplayName,
                alias: strMailNickname,
                isPublic: boolIsPublic,
                optionalParams: {
                    Description: description,
                    CreationOptions: { results: creationOptions },
                    Classification: dataClassification
                }
            };

            return JSON.stringify(createGroupParamObj);
        };

        let parseResult = (responseText: string) => {
            const result: any = JSON.parse(responseText);
            if (result.d) {
                const groupId = result.d.CreateGroupEx;
                return {
                    status: '200',
                    response: responseText,
                    groupId: groupId
                };
            }
        };

        return this.getData(
            restUrl,
            parseResult,
            'CreateGroupSiteFromSP',
            additionalPostData,
            'POST',
            undefined,
            undefined,
            0 /* no retries */);
    }

    /**
     * get group creation context
     */
    public getGroupCreationContext(): Promise<IGroupCreationContext> {
        const restUrl = () => {
            return this._pageContext.webAbsoluteUrl + getGroupCreationContextUrlTemplate;
        };

        return this.getDataUtilizingCache<IGroupCreationContext>({
            getUrl: restUrl,
            parseResponse: (responseText: string): IGroupCreationContext  => {
                let result = JSON.parse(responseText);
                if (result && result.d && result.d.GetGroupCreationContext) {
                    let groupCreationContext = result.d.GetGroupCreationContext;
                    return {
                        requireSecondaryContact: groupCreationContext.RequireSecondaryContact,
                        usageGuidelineUrl: groupCreationContext.UsageGuidelineUrl,
                        dataClassificationOptions: groupCreationContext.DataClassificationOptions.results,
                        customFormUrl: groupCreationContext.CustomFormUrl,
                        allowToAddGuests: groupCreationContext.ExternalInvitationEnabled ,
                        sitePath: groupCreationContext.sitePath
                    };
                }
                return undefined;
            },
            qosName: 'GetGroupCreationContext',
            method: 'GET',
            maxRetries: NUMBER_OF_RETRIES,
            noRedirect: true});
    }

    /**
     * get site Url from alias
     */
    public getSiteUrlFromAlias(alias: string): Promise<string> {
        const restUrl = () => {
            return this._pageContext.webAbsoluteUrl + StringHelper.format(
                getSiteUrlFromAliasUrlTemplate, alias);
        };

        return this.getData<string>(
            restUrl,
            (responseText: string) => {
                let result = JSON.parse(responseText);
                if (result && result.d && result.d.GetValidSiteUrlFromAlias) {
                    return result.d.GetValidSiteUrlFromAlias;
                }
            },
            'GetSiteUrlFromAlias',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    private _getUrl(op: string, ns: string): string {
        return `${this._pageContext.webAbsoluteUrl}/_api/${ns}/${op}`;
    }
}

export default GroupSiteDataSource;
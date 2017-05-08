
import IGroupSiteInfo from './IGroupSiteInfo';
import ICreateGroupResponse from './ICreateGroupResponse';
import SiteCreationDataSource from '../site/SiteCreationDataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import { IErrorData } from '../base/ServerData';

/**
 * Default number of maximum retries when error occurs during rest call.
 */
const NUMBER_OF_RETRIES: number = 3;
const CREATE_SITE_URL_TEMPLATE: string = '/_api/GroupSiteManager/Create?groupId=\'{0}\'';
const GET_GROUP_CREATION_CONTEXT_URL_TEMPLATE: string = '/_api/GroupSiteManager/GetGroupCreationContext';
const GET_SITE_URL_FROM_ALIAS_URL_TEMPLATE: string = '/_api/GroupSiteManager/GetValidSiteUrlFromAlias?alias=\'{0}\'';
const GET_NOTEBOOK_URL_TEMPLATE: string = '/_api/GroupSiteManager/Notebook?groupId=\'{0}\'';
const GET_SITE_STATUS_URL_TEMPLATE: string = '/_api/GroupSiteManager/GetSiteStatus?groupId=\'{0}\'';
const GET_GROUP_BY_ALIAS_URL_TEMPLATE: string = 'Group(alias=\'{0}\')';

// The purpose behind this string is that if the user has selected a formula
// to be applied after the web has been provisioned, a guid needs to be passed
// to CreateGroupEx indicating which formula. Due to the design of the server, the only
// feasible way to do this is to put it in the GroupCreationOptions.
// However, GroupCreationOptions is a collection of strings, not a dictionary,
// so the workaround that was decided on was to append the formula guid to this
// prefix, so that the server can identify it.
// Note that the guid 292aa8a00786498a87a5ca52d9f4214a is part of the string identifier
// and is not the formula guid, which will be appended afterward. (so there will be two guids
// in a row, seperated by an underscore)
const IMPLICIT_FORMULA_PREFIX: string = "implicit_formula_292aa8a00786498a87a5ca52d9f4214a_";

/**
 * Use GroupSiteDatasource to interact with group sites.
 * It supports actions like Create, CheckExistence, etc.
 */
export interface IGroupSiteDataSource {
    /**
     * Creates the group according to the provided parameters.
     * @param strDisplayName A string representing the display name of the groupAlias
     * @param strMailNickName The "alias" of the group (ie: what you type in Exchange to send mail to it)
     * @param boolIsPublic Whether the group is public
     * @param description The description for the group
     * @param dataClassification Whether the group has a data classification or notebook
     * @param allowGuestUsers Whether guest users are allowed on the site
     * @param siteUrl Optional. Specify a URL that might not just be the tenant URL suffixed with the alias (eg: if there is already a site at that location)
     * @param formulaId Optional. Specify a formula to be applied on the group web after it is provisioned.
     */
    createGroup(strDisplayName: string,
        strMailNickname: string, boolIsPublic: boolean, description: string,
        dataClassification: string, allowGuestUsers: boolean, siteUrl?: string, formulaId?: string): Promise<ICreateGroupResponse>;

    /**
     * Creates a new AAD group and attaches it to the current site.
     * @param strName The name of the group.
     * @param strAlias The alias for the group (ie: for senign emails to it)
     * @param isPublic: Whether the group is public or private.
     * @param description: The description of the group/web
     * @param dataClassification: Data classification for the group (eg: HBI, MBI, etc.).
     * @param allowGuestUsers: Whether guest users are allowed on the site.
     */
    groupify(strName: string, strAlias: string, isPublic: boolean, description: string,
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
                     GET_GROUP_BY_ALIAS_URL_TEMPLATE, groupAlias),
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
            return this._pageContext.webAbsoluteUrl + StringHelper.format(GET_NOTEBOOK_URL_TEMPLATE, id);
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
            return this._pageContext.webAbsoluteUrl + StringHelper.format(GET_SITE_STATUS_URL_TEMPLATE, id);
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
            return this._pageContext.webAbsoluteUrl + StringHelper.format(CREATE_SITE_URL_TEMPLATE, id);
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
     * @param strDisplayName A string representing the display name of the groupAlias
     * @param strMailNickName The "alias" of the group (ie: what you type in Exchange to send mail to it)
     * @param boolIsPublic Whether the group is public
     * @param description The description for the group
     * @param dataClassification Whether the group has a data classification or notebook
     * @param allowGuestUsers Whether guest users are allowed on the site
     * @param siteUrl Optional. Specify a URL that might not just be the tenant URL suffixed with the alias (eg: if there is already a site at that location)
     * @param formulaId Optional. Specify a formula to be applied on the group web after it is provisioned.
     */
    public createGroup(strDisplayName: string,
        strMailNickname: string, boolIsPublic: boolean, description: string,
        dataClassification: string, allowGuestUsers: boolean, siteUrl?: string, formulaId?: string): Promise<ICreateGroupResponse> {
        const restUrl = () => {
            return this._pageContext.webAbsoluteUrl + '/_api/GroupSiteManager/CreateGroupEx';
        };

        const additionalPostData = () => {
            let creationOptions = [];

            if (allowGuestUsers) {
                creationOptions.push('AllowFileSharingForGuestUsers');
            }

            if (siteUrl) {
                let siteAlias = this._extractSiteAlias(siteUrl);
                if (siteAlias !== "" && siteAlias !== strMailNickname) {
                    creationOptions.push('SiteAlias:' + siteAlias);
                }
            }

            if (formulaId) {
                creationOptions.push(IMPLICIT_FORMULA_PREFIX + formulaId);
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
     * Create an AAD group and attaches it to the current site.
     * @param strName Name of the group.
     * @param strAlias Alias for the group (ie: how you contact it via email).
     * @param isPublic Whether the group is public or not.
     * @param description The description for the site/group.  This SHOULD be the current description of the root web of the site, otherwise we'll overwrite it.
     * @param dataClassification Data classification for the group (eg: HBI, MBI, etc.).
     * @param allowGuestUsers Whether the group should allow guest users.
     */
    public groupify(strName: string, strAlias: string, isPublic: boolean, description: string,
        dataClassification: string, allowGuestUsers: boolean): Promise<ICreateGroupResponse> {
        const restUrl = () => {
            return this._pageContext.webAbsoluteUrl + '/_api/GroupSiteManager/CreateGroupForSite';
        };

        const additionalPostData = () => {
            let creationOptions = [];

            if (allowGuestUsers) {
                creationOptions.push('AllowFileSharingForGuestUsers');
            }

            const groupifyParamObj = {
                displayName: strName,
                alias: strAlias,
                isPublic: isPublic,
                optionalParams: {
                    Description: description,
                    CreationOptions: { results: creationOptions },
                    Classification: dataClassification
                }
            };

            return JSON.stringify(groupifyParamObj);
        };

        let parseResult = (responseText: string) => {
            const result: any = JSON.parse(responseText);
            if (result.d) {
                const groupId = result.d.CreateGroupForSite;
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
            'Groupify',
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
            return this._pageContext.webAbsoluteUrl + GET_GROUP_CREATION_CONTEXT_URL_TEMPLATE;
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
                        allowToAddGuests: groupCreationContext.ExternalInvitationEnabled,
                        sitePath: groupCreationContext.SitePath
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
                GET_SITE_URL_FROM_ALIAS_URL_TEMPLATE, alias);
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
            NUMBER_OF_RETRIES,
            undefined,
            undefined,
            (errorData: IErrorData) => {
                let errorCode = errorData && errorData.code ? errorData.code : '';
                if (errorCode.indexOf('2147467261') > -1 ) {
                    return 'AliasNullException';
                } else {
                    return errorData.status.toString();
                }
            });
    }

    private _getUrl(op: string, ns: string): string {
        return `${this._pageContext.webAbsoluteUrl}/_api/${ns}/${op}`;
    }

    private _extractSiteAlias(siteUrl: string): string {
        let alias = "";
        if (siteUrl && siteUrl.length > 0) {
            var startIndex = siteUrl.lastIndexOf('/') + 1;
            if (startIndex !== -1) {
                if (startIndex === siteUrl.length) {
                    siteUrl = siteUrl.substr(0, siteUrl.length - 1);
                    startIndex = siteUrl.lastIndexOf('/') + 1;
                }

                let aliasLength = siteUrl.length - startIndex;

                alias = siteUrl.substr(startIndex, aliasLength);
            }
        }

        return alias;
    }
}

export default GroupSiteDataSource;

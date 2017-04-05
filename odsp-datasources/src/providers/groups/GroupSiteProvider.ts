
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import ISpPageContext from '../../interfaces/ISpPageContext';
import IGroupSiteInfo from '../../dataSources/groups/IGroupSiteInfo';
import ICreateGroupResponse from '../../dataSources/groups/ICreateGroupResponse';
import GroupSiteDataSource, { IGroupSiteDataSource, IGroupCreationContext } from '../../dataSources/groups/GroupSiteDataSource';

export interface IGroupSiteProvider {
    /**
     * get site Url from alias
     */
    getSiteUrlFromAlias(alias: string): Promise<string>;

    /**
     * Checks the availability of the group alias.
     */
    checkGroupExists(strAlias: string): Promise<boolean>;

    /**
     * Checks the existance of a site with site url.
     */
    checkSiteExists(siteUrl: string): Promise<boolean>;

    /**
     * Creates the group according to the provided parameters.
     * @param strDisplayName A string representing the display name of the groupAlias
     * @param strMailNickName The "alias" of the group (ie: what you type in Exchange to send mail to it)
     * @param boolIsPublic Whether the group is public
     * @param description The description for the group
     * @param dataClassification Whether the group has a data classification or notebook
     * @param allowGuestUsers Whether guest users are allowed on the site
     * @param siteUrl Optional. Specify a URL that might not just be the tenant URL suffixed with the alias (eg: if there is already a site at that location)
     */
    createGroup(strName: string, strAlias: string, isPublic: boolean, description: string,
        dataClassification: string, allowGuestUsers: boolean, siteUrl?: string): Promise<ICreateGroupResponse>;

    /**
     * Gets the group notebook URL from the GroupSiteManager API.
     */
    getNotebookUrl(groupId: string): Promise<string>;

    /**
     * Gets the group site provisioning status.
     */
    getGroupSiteStatus(groupId: string): Promise<IGroupSiteInfo>;

    /**
     * Creates the group site if necessary.
     */
    createGroupSite(groupId: string): Promise<IGroupSiteInfo>;

     /**
     * get group creation context
     */
    getGroupCreationContext(): Promise<IGroupCreationContext>;
}

export interface IGroupSiteProviderParams {
    pageContext?: ISpPageContext;
    dataSource?: IGroupSiteDataSource;
}

const MISSING_GROUP_ID_ERROR: string = 'Missing group id.';

/**
 * O365 Groups service provider
 */
export class GroupSiteProvider implements IGroupSiteProvider {

    private _dataSource: IGroupSiteDataSource;

    constructor(params: IGroupSiteProviderParams) {
        this._dataSource = params.dataSource || new GroupSiteDataSource(params.pageContext);
    }

     /**
     * Checks the availability of the site and alias.
     */
    public checkGroupExists(strAlias: string): Promise<boolean> {
        return this._dataSource.checkGroupExists(strAlias);
    }

    /**
     * Checks the existance of a site with site url.
     */
    public checkSiteExists(siteUrl: string): Promise<boolean> {
        return this._dataSource.checkSiteExists(siteUrl);
    }

    /**
     * get site Url from alias
     */
    public getSiteUrlFromAlias(alias: string): Promise<string> {
        return this._dataSource.getSiteUrlFromAlias(alias);
    }

    /**
     * get group creation context
     */
    public getGroupCreationContext(): Promise<IGroupCreationContext> {
        return this._dataSource.getGroupCreationContext();
    }

    /**
     * Creates the group according to the provided parameters.
     * @param strDisplayName A string representing the display name of the groupAlias
     * @param strMailNickName The "alias" of the group (ie: what you type in Exchange to send mail to it)
     * @param boolIsPublic Whether the group is public
     * @param description The description for the group
     * @param dataClassification Whether the group has a data classification or notebook
     * @param allowGuestUsers Whether guest users are allowed on the site
     * @param siteUrl Optional. Specify a URL that might not just be the tenant URL suffixed with the alias (eg: if there is already a site at that location)
     */
    public createGroup(strName: string, strAlias: string, isPublic: boolean, description: string
            , dataClassification: string, allowGuestUsers: boolean, siteUrl?: string): Promise<ICreateGroupResponse> {
        return this._dataSource.createGroup(strName, strAlias, isPublic, description, dataClassification, allowGuestUsers, siteUrl);
    }
    /**
     * Gets the group notebook URL from the GroupSiteManager API.
     */
    public getNotebookUrl(groupId: string): Promise<string> {
        if (!groupId) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        }
        return this._dataSource.getNotebookUrl(groupId);
    }

    /**
     * Gets the group site provisioning status.
     */
    public getGroupSiteStatus(groupId: string): Promise<IGroupSiteInfo> {
        if (!groupId) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        }
        return this._dataSource.getSiteStatus(groupId);
    }

    /**
     * Creates the group site if necessary.
     */
    public createGroupSite(groupId: string): Promise<IGroupSiteInfo> {
        if (!groupId) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        }
        return this._dataSource.createSite(groupId);
    }
}

export default GroupSiteProvider;
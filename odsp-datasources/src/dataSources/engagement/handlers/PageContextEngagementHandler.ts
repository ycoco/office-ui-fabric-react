
import { IEngagementHandler, IEngagementSingleSchema } from '@ms/odsp-utilities/lib/logging/engagement/Engagement';
import ISpPageContext from '../../../interfaces/ISpPageContext';

export interface IPageContextEngagementHandlerDependencies {
    pageContext: ISpPageContext;
}

interface IPageContextEngagementExtraData {
    [key: string]: string;
    SiteId?: string;
    WebId?: string;
    ListId?: string;
    WebTemplateId?: string;
    GroupId?: string;
    ListTemplateId?: string;
}

export default class PageContextEngagementHandler implements IEngagementHandler {
    private _pageContext: ISpPageContext;

    constructor(params: {} = {}, dependencies: IPageContextEngagementHandlerDependencies) {
        this._pageContext = dependencies.pageContext;
    }

    public getEngagementData(): Partial<IEngagementSingleSchema> {
        const extraData: IPageContextEngagementExtraData = {
            SiteId: this._pageContext.siteId,
            WebId: this._pageContext.webId,
            WebTemplateId: this._pageContext.webTemplate
        };

        if (this._pageContext.groupId) {
            extraData.GroupId = this._pageContext.groupId;
        }

        if (this._pageContext.listId) {
            extraData.ListId = this._pageContext.listId;
        }

        if (this._pageContext.listBaseTemplate > -1) {
            extraData.ListTemplateId = `${this._pageContext.listBaseTemplate}`
        }

        return {
            extraData: extraData
        };
    }
}

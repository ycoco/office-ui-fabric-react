
import { IEngagementHandler, IEngagementSingleSchema } from '@ms/odsp-utilities/lib/logging/engagement/Engagement';
import ISpPageContext from '../../../interfaces/ISpPageContext';

export interface IPageContextEngagementHandlerDependencies {
    pageContext: ISpPageContext;
}

export default class PageContextEngagementHandler implements IEngagementHandler {
    private _pageContext: ISpPageContext;

    constructor(params: {} = {}, dependencies: IPageContextEngagementHandlerDependencies) {
        this._pageContext = dependencies.pageContext;
    }

    public getEngagementData(): Partial<IEngagementSingleSchema> {
        const engagementData: Partial<IEngagementSingleSchema> = {
            siteId: this._pageContext.siteId,
            webId: this._pageContext.webId,
            webTemplateId: this._pageContext.webTemplate
        };

        if (this._pageContext.groupId) {
            engagementData.groupId = this._pageContext.groupId;
        }

        if (this._pageContext.listId) {
            engagementData.listId = this._pageContext.listId;
        }

        if (this._pageContext.listBaseTemplate > -1) {
            engagementData.listTemplateId = `${this._pageContext.listBaseTemplate}`
        }

        return engagementData;
    }
}

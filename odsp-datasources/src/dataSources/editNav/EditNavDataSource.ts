import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataSource from '../base/DataSource';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { IEditNavDataSource,
         IEditableMenuState,
         IEditableMenuNode,
         IDSNavLinkGroup,
         IDSNavLink
} from './IEditNavDataSource';
import { ViewNavDataSource } from './ViewNavDataSource';

import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');

/**
 * This datasource calls SP NavigationService REST API to do update.
 */
export class EditNavDataSource extends DataSource implements IEditNavDataSource  {
    private _mapProviderName: string;
    private _pagesTitle: string;
    private _viewNavDataSource: ViewNavDataSource;

    /**
     * @constructor
     * @param {ISpPageContext} pageContext sp pageContext.
     * @param {string, optonal} PagesTitle if Pages link is to be added.
     * @param (string, optional} mapProviderName navigation provider name used if retrieve none default navigation data.
     */
    constructor(pageContext: ISpPageContext, pagesTitle?: string, mapProviderName?: string) {
        super(pageContext);
        this._mapProviderName = mapProviderName;
        this._pagesTitle = pagesTitle;
        this._viewNavDataSource = new ViewNavDataSource(pageContext, pagesTitle, mapProviderName);
    }

    /**
     * Get Navigation MenuState data from a given provider (default is SPNavigationProvider quickLaunch).
     */
    public getMenuState(): Promise<IDSNavLinkGroup[]> {
        return this._viewNavDataSource.getMenuState();
    }

    /**
     * Save updated EditNavLink[] to SharePoint MenuState
     */
    public onSave(groups: IDSNavLinkGroup[]): Promise<boolean> {
        const restUrl = () => {
            return this._pageContext.webAbsoluteUrl + '/_api/navigation/SaveMenuState';
        };

        // convert groups into SharePoint EditableMenuState schema
        // then Stringfy to Json before REST API post call.
        let editNavPostData = () => { return this._transformToEditableMenuState(groups[0]); };

        return this.getData<boolean>(
            restUrl,
            (responseText: string): boolean => {
                try {
                    const result: any = JSON.parse(responseText);
                    if (result.value === 200) {
                        return true;
                    }
                } catch (e) {
                    return false;
                }
            },
            'SaveEditNavData',
            editNavPostData,
            'POST',
            {'ODATA-VERSION': '4.0', 'Accept': '*/*, application/json; odata.metadata=minimal'},
            'application/json; odata.metadata=minimal',
            1 /* 1 retries */);
    }

    private _transformToEditableMenuState(groups: IDSNavLinkGroup): string {
        // convert DateTime to UTC format for GT operation. regular datetime value will fail CAML query.
        let dateTime = new Date();
        let value = StringHelper.format('{0}-{1}-{2}T{3}:{4}:{5}Z', dateTime.getUTCFullYear(),
                dateTime.getUTCMonth() + 1,
                dateTime.getUTCDate(),
                dateTime.getUTCHours(),
                dateTime.getUTCMinutes(),
                dateTime.getUTCSeconds());
        let menuState: IEditableMenuState = {
            Version: value,
            StartingNodeKey: '1025',
            StartingNodeTitle: 'Quicklaunch',
            SPSitePrefix: '/',
            SPWebPrefix: this._pageContext.webServerRelativeUrl,
            FriendlyUrlPrefix: '',
            SimpleUrl: '',
            Nodes: this._getEditableNodesFromLinks(groups.links)
        };

        let menustateTemplate;
        if (this._mapProviderName === undefined) {
            menustateTemplate = '{"menuState":  {0}}';
        } else {
            menustateTemplate = '{"menuState":  {0}, "mapProviderName": {1}}';
        }
        let payload = JSON.stringify(menuState);
        return StringHelper.format(menustateTemplate, payload, this._mapProviderName);
    }

    private _getEditableNodesFromLinks(links: IDSNavLink[]): IEditableMenuNode[] {
        if (!links || links.length <= 0) {
            return undefined;
        }

        let nodes: IEditableMenuNode[] = [];
        links.forEach((link) => {
            // link key with negative value are client side added or special button non editable nodes
            // link key is undefined for newly added node, therefore it could be 0 on some browser.
            if (link.key === undefined || Number(link.key) >= 0) {
                nodes.push({
                    NodeType: 0,
                    Key: link.key,
                    Title: link.name,
                    SimpleUrl: link.url,
                    FriendlyUrlSegment: '',
                    IsDeleted: link.isDeleted,
                    Nodes: link.links ? this._getEditableNodesFromLinks(link.links) : undefined
                });
            }
        });
        return nodes;
    }
}

export default EditNavDataSource;
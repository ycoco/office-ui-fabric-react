import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataSource from '../base/DataSource';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { IEditNavDataSource,
         IEditableMenuState,
         IEditableMenuNode,
         IDSNavLinkGroup,
         IDSNavLink } from './IEditNavDataSource';

import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');

/**
 * This datasource calls SP NavigationService REST API to do update.
 */
export class EditNavDataSource extends DataSource implements IEditNavDataSource  {
    private _mapProviderName: string;
    private _pagesTitle: string;

    /**
     * @constructor
     */
    constructor(pageContext: ISpPageContext, pagesTitle?: string, mapProviderName?: string) {
        super(pageContext);
        this._mapProviderName = mapProviderName;
        this._pagesTitle = pagesTitle;
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

    /**
     * Get updated SharePoint MenuState data (quicklaunch nodes)
     */
    public getMenuState(): Promise<IDSNavLinkGroup[]> {
        const queryString = this._mapProviderName ? `?menuNodeKey=` + `&mapProviderName='` + this._mapProviderName + `'` : ``;
        return this.getData<IDSNavLinkGroup[]>(
            () => this._pageContext.webAbsoluteUrl + `/_api/navigation/MenuState` + queryString,
            (responseText: string): IDSNavLinkGroup[] => {
                // parse the responseText
                const response: IEditableMenuState = JSON.parse(responseText);
                return this._transformToNavLinkGroups(response);
            },
            'getMenuState',
            undefined,
            'GET',
            {'ODATA-VERSION': '4.0', 'Accept': '*/*, application/json; odata.metadata=minimal'},
            'application/json; odata.metadata=minimal',
            1 /* 1 retries */
        );
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

        let menustateTemplate = '{"menuState":  {0}, "mapProviderName": {1}}';
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

    private _transformToNavLinkGroups(menuState: IEditableMenuState): IDSNavLinkGroup[] {
        if (!menuState || !menuState.Nodes || menuState.Nodes.length === 0) {
            return undefined;
        }

        let groups: IDSNavLinkGroup[] = [];
        let group = { links: [] };
        // populate INavLink[] from menuState
        group.links = this._getLinksFromNodes(menuState.Nodes, false, undefined);
        groups.push(group);
        return groups;
    }

    private _getLinksFromNodes(nodes: IEditableMenuNode[], isSubLinks: boolean, parentFriendlyUrlSegment?: string): IDSNavLink[] {
        let links: IDSNavLink[] = [];
        let idx = 0;
        // HACK: MenuState return last 3 nodes be Site contents, Recycle bin, Pages should be right before it so -2
        let siteContentsIdx = nodes ? nodes.length - 2 : -1;
        nodes.forEach((node: IEditableMenuNode) => {
            // exclude Recent node
            if (!node.IsDeleted && node.Key !== '1033') {
                // temp hack to deal with client added Pages node in front of recycle bin.
                if (!isSubLinks && idx === siteContentsIdx && this._pagesTitle) {
                    links.push({
                        name: this._pagesTitle,
                        url: this._pageContext.webAbsoluteUrl + '/SitePages',
                        key: '-2',  // hack: recyclebin node key is "-1"
                        links: undefined,
                        ariaLabel: this._pagesTitle,
                        isExpanded: true
                    });
                }
                let linkUrl: string;
                if (isSubLinks && parentFriendlyUrlSegment) {
                    linkUrl = `/` + parentFriendlyUrlSegment + `/` + node.FriendlyUrlSegment;
                } else {
                    linkUrl = `/` + node.FriendlyUrlSegment;
                }
                links.push({
                    name: node.Title,
                    url: node.SimpleUrl ? node.SimpleUrl : linkUrl,
                    key: node.Key,
                    links: node.Nodes ? this._getLinksFromNodes(node.Nodes, true, node.FriendlyUrlSegment) : undefined,
                    ariaLabel: node.Title,
                    isExpanded: true
                });
                idx++;
            }
        });
        return links;
    }
}

export default EditNavDataSource;
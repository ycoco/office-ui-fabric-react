import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataSource from '../base/DataSource';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { IViewNavDataSource,
         IEditableMenuState,
         IEditableMenuNode,
         IDSNavLinkGroup,
         IDSNavLink } from './IEditNavDataSource';

/**
 * This datasource calls SP NavigationService REST API to do update.
 */
export class ViewNavDataSource extends DataSource implements IViewNavDataSource  {
    private _mapProviderName: string;
    private _pagesTitle: string;

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
    }

    /**
     *  Tests if the url is a relative url
     *  @param {string} url
     *  @return {boolean}
     */
    public static isRelativeUrl(url: string): boolean {
        if (!url) {
            return false;
        }
        let lowerUrl = url.toLowerCase();
        var hasProtocol = /^ftp:\/\//.test(lowerUrl) || /^http:\/\//.test(lowerUrl) || /^https:\/\//.test(lowerUrl) || /^file:\/\//.test(lowerUrl);
        return !hasProtocol;
    }

    /**
     * Get Navigation MenuState data from a given provider (default is SPNavigationProvider quickLaunch).
     */
    public getMenuState(): Promise<IDSNavLinkGroup[]> {
        let queryString = this._mapProviderName !== undefined ? `?menuNodeKey=&mapProviderName='${this._mapProviderName}'` : '';
        return this.getData<IDSNavLinkGroup[]>(
            () => `${this._pageContext.webAbsoluteUrl}/_api/navigation/MenuState${queryString}`,
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

    private _transformToNavLinkGroups(menuState: IEditableMenuState): IDSNavLinkGroup[] {
        if (!menuState || !menuState.Nodes || menuState.Nodes.length === 0) {
            return undefined;
        }
        let groups: IDSNavLinkGroup[] = [];
        let group = { links: [] };
        // populate INavLink[] from menuState
        group.links = this._getLinksFromNodes(menuState.Nodes);
        groups.push(group);
        return groups;
    }

    private _getLinksFromNodes(nodes: IEditableMenuNode[]): IDSNavLink[] {
        let links: IDSNavLink[] = nodes
            .filter((node: IEditableMenuNode) =>
                node.Key !== '1033' &&
                !node.IsDeleted &&
                !node.IsHidden)
            .map((node: IEditableMenuNode) => ({
                name: node.Title,
                url: this._getUrl(node, false /*isSubLink */),
                key: node.Key,
                ariaLabel: node.Title,
                isExpanded: true,
                target: ViewNavDataSource.isRelativeUrl(this._getUrl(node, false /*isSubLink */)) ? '' : '_blank',
                links: (node.Nodes && node.Nodes.length) ? node.Nodes
                    .filter((childNode: IEditableMenuNode) =>
                        !childNode.IsDeleted &&
                        !childNode.IsHidden)
                    .map((childNode: IEditableMenuNode) => ({
                        name: childNode.Title,
                        url: this._getUrl(node, true /*isSubLink */, node.FriendlyUrlSegment),
                        key: childNode.Key,
                        ariaLabel: childNode.Title,
                        isExpanded: true,
                        target: ViewNavDataSource.isRelativeUrl(this._getUrl(childNode, true /*isSubLink */, node.FriendlyUrlSegment)) ? '' : '_blank'
                        })) : undefined
            }));
        return links;
    }

    private _getUrl(node: IEditableMenuNode, isSublink?: boolean, parentFriendlySegment?: string): string {
        if (!isSublink) {
            // parent node
            return node.SimpleUrl ? node.SimpleUrl : `/${node.FriendlyUrlSegment}`;
        } else {
            // child node
            return node.SimpleUrl ? node.SimpleUrl : ((parentFriendlySegment ? `/${parentFriendlySegment}` : '') + `/${node.FriendlyUrlSegment}`);
        }
    }
}

export default ViewNavDataSource;
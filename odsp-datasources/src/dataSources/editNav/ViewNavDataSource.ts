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
    public getMenuState(providerName?: string): Promise<IDSNavLinkGroup[]> {
        let queryString;
        if (providerName) {
            queryString = `?menuNodeKey=&providerName'${providerName}'`;
        } else {
            queryString = this._mapProviderName !== undefined ? `?menuNodeKey=&mapProviderName='${this._mapProviderName}'` : '';
        }
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
        group.links = this._getLinksFromNodes(menuState.Nodes, menuState.FriendlyUrlPrefix);

        groups.push(group);
        return groups;
    }

    private _getLinksFromNodes(nodes: IEditableMenuNode[], friendlyUrlPrefix: string): IDSNavLink[] {
        let links: IDSNavLink[] = nodes
            .filter((node: IEditableMenuNode) =>
                node.Key !== '1033' &&
                node.Key.indexOf('SPNavigationNodeId=1033') === -1 &&
                !node.IsDeleted &&
                !node.IsHidden)
            .map((node: IEditableMenuNode) => ({
                name: node.Title,
                url: this._getUrl(node, false /*isSubLink */, friendlyUrlPrefix),
                key: node.Key,
                ariaLabel: node.Title,
                isExpanded: true,
                target: ViewNavDataSource.isRelativeUrl(this._getUrl(node, false /*isSubLink */, friendlyUrlPrefix)) ? '' : '_blank',
                links: (node.Nodes && node.Nodes.length) ? node.Nodes
                    .filter((childNode: IEditableMenuNode) =>
                        !childNode.IsDeleted &&
                        !childNode.IsHidden)
                    .map((childNode: IEditableMenuNode) => ({
                        name: childNode.Title,
                        url: this._getUrl(childNode, true /*isSubLink */, friendlyUrlPrefix, node.FriendlyUrlSegment),
                        key: childNode.Key,
                        ariaLabel: childNode.Title,
                        isExpanded: true,
                        target: ViewNavDataSource.isRelativeUrl(this._getUrl(childNode, true /*isSubLink */, friendlyUrlPrefix, node.FriendlyUrlSegment)) ? '' : '_blank'
                        })) : undefined
            }));
        return links;
    }

    private _getUrl(node: IEditableMenuNode, isSublink?: boolean, friendlyUrlPrefix?: string, parentFriendlySegment?: string): string {
        if (node.SimpleUrl) {
            return node.SimpleUrl;
        }

        let url = friendlyUrlPrefix;  // this link has both leading and trailing '/'

        if (!isSublink) {
            // parent node
            url = url + node.FriendlyUrlSegment;
        } else {
            // child node
            url = url + ((parentFriendlySegment ? `/${parentFriendlySegment}` : '') + `/${node.FriendlyUrlSegment}`);
        }
        url = url.replace('//', '/');
        return url;
    }
}

export default ViewNavDataSource;
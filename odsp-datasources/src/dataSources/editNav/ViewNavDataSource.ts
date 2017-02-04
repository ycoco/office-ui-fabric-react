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
    public static isRelativeUrl(url: string) {
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
                if (!isSubLinks && idx === siteContentsIdx &&
                    this._pagesTitle &&
                    this._pageContext.sitePagesEnabled &&
                    !this.isServerSidePagesNodeAvailable()) {
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
                let curUrl = node.SimpleUrl ? node.SimpleUrl : linkUrl;
                links.push({
                    name: node.Title,
                    url: curUrl,
                    key: node.Key,
                    links: node.Nodes ? this._getLinksFromNodes(node.Nodes, true, node.FriendlyUrlSegment) : undefined,
                    ariaLabel: node.Title,
                    isExpanded: true,
                    target: ViewNavDataSource.isRelativeUrl(curUrl) ? '' : '_blank'
                });
                idx++;
            }
        });
        return links;
    }

   /* this is a very temporary fix. the entire code will
   be removed once build 6127 has finished rolling out
   bug # 305813 */
  private isServerSidePagesNodeAvailable(): boolean {
      const buildVersion: string = this._pageContext.themeCacheToken;
      let isBuildGtPagesBuild: boolean = false;
      if (buildVersion) {
        const buildNumber: number = Number(buildVersion.substr(buildVersion.length - 9, 4));
        if (!isNaN(buildNumber)) {
          isBuildGtPagesBuild = buildNumber >= 6127;
        }
      }
      return isBuildGtPagesBuild;
    } 
}

export default ViewNavDataSource;
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IViewNavDataSource {
  /**
   * Get new SharePoint menuState data.
   */
   getMenuState(): Promise<IDSNavLinkGroup[]>;
}

export interface IEditNavDataSource extends IViewNavDataSource {
  /**
   * Save edited nav nodes to SharePoint.
   */
   onSave(groups: IDSNavLinkGroup[]): Promise<boolean>;
}

/**
  * Match SharePoint NavigationService EditableAspMenuState props.
  */
export interface IEditableMenuState {
  /**
   * Text string that server uses to detect texternal changes.
   * @example "2009-06-15T20:45:30Z".
   */
  Version?: string;

  /**
   * This key identifies the starting node within th enavigation tree.
   * @example 1025.
   */
  StartingNodeKey?: string;

  /**
   * This key identifies the starting node title within th enavigation tree.
   * @example "Document Center".
   */
  StartingNodeTitle?: string;

  /**
   * The prefix substitude the relative path "~sitecollection/" of "~sitecollection/Pages/MyPage.aspx".
   * @example "http://contoso.com/sites/site1/".
   */
  SPSitePrefix?: string;

  /**
   * The prefix substitude the relative path "~site/" of "~site/Pages/MyPage.aspx".
   * @example "http://contoso.com/sites/site1/web1/".
   */
  SPWebPrefix?: string;

  /**
   * This specifies the Friendly URL prefix for starting node
   * Suppose the starting node is "Products", to obtain the Friendly
   * URL for node "B" whose parent is node "A", the JavaScript would
   * concatenate these strings:
   * FriendlyUrlPrefix + A.FriendlyUrlSegment + "/" + B.FriendlyUrlSegment
   * @example "http://contoso.com/sites/site1/web1/Products/".
   */
  FriendlyUrlPrefix?: string;

  /**
   * Used only with NodeType=SimpleLink.  If the URL is blank, then the node
   * acts as a menu caption with no hyperlink.  The URL can have several
   * syntaxes, for @example:
   * - http://bing.com/?q=dogs
   * - /sites/site1/web1/Pages/MyPage.aspx
   * - ~site/Pages/MyPage.aspx
   * - ~sitecollection/web1/Pages/MyPage.aspx
   */
  SimpleUrl?: string;

  /**
   * Links to render within this group match SharePoint EditableAspMenuNode.
   */
  Nodes: IEditableMenuNode[];
}

export enum EditNavLinkType {
  /**
   * This is a traditional nav menu node.  If the URL is blank, then the node
   * acts as a menu caption with no hyperlink.
   */
   SimpleLink = 0,

  /**
   * This is a special Taxonomy Nav menu node that defines a Friendly URL.
   */
   FriendlyUrl = 1
}

/**
  * Match SharePoint NavigationService EditableAspMenuNode props.
  */
export interface IEditableMenuNode {
  /**
   * Node type: One of the enum values
   */
  NodeType: EditNavLinkType;

  /**
   * An identifier that uniquely identifies the node in the tree.
   * This identifier must be the same key that is exposed by SiteMapNode.Key.
   */
  Key: string;

  /**
   * Text to render for this link.
   */
  Title: string;

  /**
   * Used only with NodeType=SimpleLink.  If the URL is blank, then the node
   * acts as a menu caption with no hyperlink.
   */
  SimpleUrl?: string;

  /**
   * Used only with NodeType=FriendlyUrl.  If the URL is blank, then the node
   * acts as a menu caption with no hyperlink.
   */
  FriendlyUrlSegment?: string;

  /**
   * mark if it is deleted node.
   */
  IsDeleted?: boolean;

  /**
   * Child links to this link, if any.
   */
  Nodes?: IEditableMenuNode[];
}

/**
  * Trim down version of INavLinkGroup from Office-ui-fabric-react.
  */
export interface IDSNavLinkGroup {
  /**
   * Links to render within this group
   */
  links: IDSNavLink[];
}

/**
  * Trim down version of INavLink from Office-ui-fabric-react..
  */
export interface IDSNavLink {
  /**
   * Text to render for this link
   */
  name: string;

  /**
   * URL to navigate to for this link
   */
  url: string;

  /**
   * Child links to this link, if any
   */
  links?: IDSNavLink[];

  /**
   * (Optional) Meta info for the link, does not involving rendering.
   */
  key?: string;

  /**
   * (Optional) Link aria label.
   */
  ariaLabel?: string;

  /**
   * flag marks the link is being deleted.
   */
  isDeleted?: boolean;

  /**
   * flag marks the link is in expanded state
   */
  isExpanded?: boolean;

  /**
   * Link <a> target.
   */
  target?: string;
}

export default IEditNavDataSource;

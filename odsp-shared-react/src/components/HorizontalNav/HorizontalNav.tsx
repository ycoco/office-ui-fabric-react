import * as React from 'react';
import './HorizontalNav.scss';
import { IHorizontalNav, IHorizontalNavProps } from './HorizontalNav.Props';
import { INavLink } from 'office-ui-fabric-react/lib/Nav';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { css, getRTL, autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import { ReactDeferredComponent, IReactDeferredComponentProps } from '../ReactDeferredComponent/index';
import { DirectionalHint } from 'office-ui-fabric-react/lib/common/DirectionalHint';
import { ViewNavDataSource } from '@ms/odsp-datasources/lib/ViewNav';

export interface IHorizontalNavState {
  /** items before the overflow */
  renderedItems?: INavLink[];
  /** items currently in overflow */
  overflowItems?: INavLink[];
  /** Ref to the overflow button */
  contextMenuRef?: HTMLElement;
  /**  What items are presently in the contextual menu. */
  contextMenuItems?: INavLink[];
  /** last item that triggered a context menu */
  lastTriggeringItem?: INavLink | string;
  /** edit mode is on, hide all nodes. */
  isEditMode?: boolean;
  /** caller can set seclected key */
  selectedKey?: string;
}

let _instance = 0;
const OVERFLOW_KEY = 'overflow';
const OVERFLOW_WIDTH = 32.67;
const EDITLINK_KEY = 'EditLink';

// global var used in horizontalNav _isLinkSelected.  TODO: we may want to use ONE copy of this copy from Nav of office fabirc in the future.
let _urlResolverForHNav;
/**
 * Horizontal Nav control, meant to contain top navigation nodes.
 */
export class HorizontalNav extends BaseComponent<IHorizontalNavProps, IHorizontalNavState> implements IHorizontalNav {
  private _horizontalNavItemsRef: { [index: number]: HTMLElement };
  private _horizontalNavRegion: HTMLElement;
  private _overflowElementRef: HTMLElement;
  private _editLinkElementRef: HTMLElement;
  private _resolvedElement: (index: number) => (el: HTMLElement) => any;

  private _instanceIdPrefix: string;
  private _currentOverflowWidth: number;
  private _editLinkWidth: number;
  private _navItemWidths: { [key: string]: number };
  private _boundItemClick: Array<(ev: React.MouseEvent<HTMLElement>) => void> = [];
  private _boundMainItemHover: Array<(ev: React.MouseEvent<HTMLElement>) => void> = [];
  private _navItemHoverTimerId: number;

  constructor(props: IHorizontalNavProps, context?: any) {
    super(props, context);
    this._instanceIdPrefix = 'HorizontalNav-' + (_instance++) + '-';
    this.state = this._getStateFromProps(this.props);
    this._editLinkWidth = -1;
    this._horizontalNavItemsRef = {};
    this._resolvedElement = (index: number) => (el: HTMLElement) => this._horizontalNavItemsRef[index] = el;
  }

  public componentDidMount() {
    this._updateItemMeasurements();
    this._updateRenderedItems();
    this._events.on(window, 'resize', this._updateRenderedItems);
  }

  public componentWillUnmount() {
    this._events.dispose();
    this._async.dispose();
  }

  public componentWillReceiveProps(nextProps: IHorizontalNavProps) {
    this.setState(this._getStateFromProps(nextProps));
    this._navItemWidths = null;
  }

  public componentDidUpdate(prevProps: IHorizontalNavProps, prevStates: IHorizontalNavState) {
    if (!this._navItemWidths && !this.state.isEditMode) {
      this._updateItemMeasurements();
      this._updateRenderedItems();
    }
  }

  public render() {
    const { contextMenuItems, isEditMode } = this.state;
    if (isEditMode) {
      // in editMode,
      return (<div />);
    }
    let deferredContextualMenu = null;
    if (contextMenuItems) {
      let contextualMenuProps = {
        className: 'ms-HorizontalNav',
        labelElementId: this._instanceIdPrefix + OVERFLOW_KEY,
        items: contextMenuItems.map((item: INavLink, index: number) => ({
          key: String(index),
          name: item.name,
          href: this._hasSublinks(item) ? undefined : item.url,
          items: this._hasSublinks(item) ? item.links.map((subItem: INavLink, subindex: number) => ({
            key: String(subindex),
            name: subItem.name,
            href: subItem.url,
            onClick: subItem.onClick ? (ev, contextItem) => { subItem.onClick(ev, subItem) } : null
          })) : undefined,
          onClick: item.onClick ? (ev, contextItem) => { item.onClick(ev, item); } : null
        })),
        targetElement: this.state.contextMenuRef,
        onDismiss: this._OnContextualMenuDismiss,
        gapSpace: 8,
        isBeakVisible: false,
        directionalHint: DirectionalHint.bottomLeftEdge,
        shouldFocusOnMount: true
      };

      const contextualMenuPath = 'office-ui-fabric-react/lib/ContextualMenu';
      if (this.props.moduleLoader) {
        this.props.moduleLoader.parse = (module: { [modulePath: string]: { ContextualMenu: typeof React.Component } }) => {
          return module[contextualMenuPath] && module[contextualMenuPath].ContextualMenu;
        };
      }

      let deferredContextualMenuPropsProps: IReactDeferredComponentProps = {
        modulePath: contextualMenuPath,
        moduleLoader: this.props.moduleLoader,
        waitPLT: false, // because contextual menu starts loading when user clicks Edit link when is guaranteed after PLT
        props: contextualMenuProps
      };

      deferredContextualMenu = <ReactDeferredComponent { ...deferredContextualMenuPropsProps } />;
    }

    return (
      <div className='ms-HorizontalNav' ref={ this._resolveRef('_horizontalNavRegion') } role='navigation'>
        <FocusZone
          direction={ FocusZoneDirection.horizontal }
          aria-label={ this.props.ariaLabel }>
          <div className='ms-HorizontalNavItems' role='menubar'>
            { this._renderHorizontalNavItems() }
            { this._renderOverflow() }
            { this._renderEditLink() }
          </div>
        </FocusZone>
        {
          (contextMenuItems) && deferredContextualMenu
        }
      </div>
    );
  }

  /**
   * @inheritDoc
   * @see IHorizontalNav.measureLayout()
   */
  public measureLayout() {
    this._updateRenderedItems();
  }

  private _renderHorizontalNavItems() {
    let { renderedItems } = this.state;
    if (!renderedItems || renderedItems.length === 0) {
      return;
    }

    return renderedItems.map((item, index) => {
      let popupHover = this._boundMainItemHover[index] || this._onMainItemHover.bind(this, item);
      return (
        <span className='ms-HorizontalNavItem' key={ index } ref={ this._resolvedElement(index) } role='menuItem'>
          { item.url ? this._renderAnchorLink(item, index, popupHover) : this._renderButtonLink(item, index, popupHover) }
          { this._hasSublinks(item) ? (
            <button className='ms-HorizontalNavItem-splitbutton'
              onClick={ this._boundItemClick[index] || this._onItemClick.bind(this, item) }
              onMouseEnter={ popupHover }
              onMouseLeave={ this._onMouseLeave }
              aria-label={ this.props.splitButtonAriaLabel }
              aria-haspopup={ this._hasSublinks(item) }
              onKeyDown={ this._handleKeyPress.bind(this, item) } >
              <i className='ms-HorizontalNav-chevronDown ms-Icon ms-Icon--ChevronDown' />
            </button>) : null }
        </span>
      );
    });
  }

  private _renderAnchorLink(item: INavLink, index: number, popupHover: any) {
    const isLinkSelected: boolean = this.props.hasSelectedState ? this._isLinkSelected(item) : false;

    return (
      <a className={ css('ms-HorizontalNavItem-link', {
        'is-selected': isLinkSelected
      }) }
        href={ item.url }
        title={ item.title || item.name }
        aria-label={ item.ariaLabel }
        onMouseEnter={ popupHover }
        onMouseLeave={ this._onMouseLeave }
        onKeyDown={ this._handleKeyPress.bind(this, item) }
        aria-haspopup={ this._hasSublinks(item) }
        role='menuitem'
        target={ ViewNavDataSource.isRelativeUrl(item.url) ? '_self' : '_blank' }
        rel='noopener'
      >
        { item.name }
      </a>
    );
  }

  private _hasSublinks(item: INavLink): boolean {
    if (item && item.links && item.links.length > 0) {
      return true;
    }
    return false;
  }

  private _renderButtonLink(item: INavLink, index: number, popupHover: any) {
    const isLinkSelected: boolean = this.props.hasSelectedState ? this._isLinkSelected(item) : false;

    return (
      <button className={ css('ms-HorizontalNavItem-link', {
        'is-selected': isLinkSelected
      }) }
        title={ item.title || item.name }
        aria-label={ item.ariaLabel }
        onClick={ this._boundItemClick[index] || this._onItemClick.bind(this, item) }
        onMouseEnter={ popupHover }
        onMouseLeave={ this._onMouseLeave }
        onKeyDown={ this._handleKeyPress.bind(this, item) }
        aria-haspopup={ this._hasSublinks(item) }
        role='menuitem'>
        { item.name }
      </button>
    );
  }

  private _renderOverflow() {
    let { overflowItems } = this.state;
    return overflowItems && overflowItems.length ? (
      <div className='ms-HorizontalNavItem' key={ OVERFLOW_KEY } ref={ this._resolveRef('_overflowElementRef') }>
        <button
          id={ this._instanceIdPrefix + OVERFLOW_KEY }
          className={ css('ms-HorizontalNavItem-link') }
          onClick={ this._onOverflowClick }
          aria-haspopup={ true }
          onKeyDown={ this._handleKeyPress.bind(this, OVERFLOW_KEY) }
          role='menuitem'>
          <i className='ms-HorizontalNavItem-overflow ms-Icon ms-Icon--More'></i>
        </button>
      </div>
    ) : null;
  }

  private _renderEditLink() {
    const { editLink, isEditMode } = this.props;
    return editLink && !isEditMode ? (
      <div className='ms-HorizontalNavItem' ref={ this._resolveRef('_editLinkElementRef') }>
        <button
          id={ this._instanceIdPrefix + EDITLINK_KEY }
          className={ css('ms-HorizontalNavItem-link ms-HorizontalNavItem-Edit') }
          { ...{ href: editLink.url } }
          onClick={ this._onEditClick }
        >
          { editLink.name }
        </button>
      </div>
    ) : null;
  }

  private _updateItemMeasurements() {
    this._currentOverflowWidth = this._overflowElementRef ||
      (this.props.overflowItems && this.props.overflowItems.length) ? OVERFLOW_WIDTH : 0;

    if (this._editLinkWidth === -1 && this.props.editLink && this._editLinkElementRef) {
      this._editLinkWidth = this._getElementWidth(this._editLinkElementRef);
    }

    if (!this._navItemWidths) {
      this._navItemWidths = {};
    }

    for (let index = 0; index < this.props.items.length; index++) {
      if (!this._navItemWidths[index]) {
        this._navItemWidths[index] = this._getElementWidth(this._horizontalNavItemsRef[index]);
      }
    }
  }

  private _getElementWidth(element: HTMLElement): number {
    let isRTL = getRTL();
    return element ? (element.getBoundingClientRect().width + parseInt(isRTL ? window.getComputedStyle(element).marginLeft :
      window.getComputedStyle(element).marginRight, 10)) : 0;
  }

  private _updateRenderedItems() {
    let items = this.props.items;
    let renderedItems = [].concat(...items);
    let availableWidth = this._horizontalNavRegion.clientWidth - this._currentOverflowWidth - this._editLinkWidth;
    let overflowItemsToRender = this.props.overflowItems;

    let consumedWidth = 0;

    for (let i = 0; i < renderedItems.length; i++) {
      let itemWidth = this._navItemWidths[i];
      if (consumedWidth + itemWidth >= availableWidth) {
        if (i > 0 && (!this.props.overflowItems || this.props.overflowItems.length === 0)
          && (availableWidth - consumedWidth) < OVERFLOW_WIDTH) {
          i--;
        }

        overflowItemsToRender = renderedItems.splice(i).concat(overflowItemsToRender ? overflowItemsToRender : []);
        break;
      } else {
        consumedWidth += itemWidth;
      }
    }

    this.setState(
      {
        renderedItems: renderedItems,
        overflowItems: overflowItemsToRender
      }
    );

  }

  @autobind
  private _onOverflowClick(ev: React.MouseEvent<HTMLElement>) {

    if (this.state.contextMenuItems || this.state.lastTriggeringItem === OVERFLOW_KEY) {
      this._OnContextualMenuDismiss();
      this.setState({ lastTriggeringItem: null });
    } else {
      this.setState({
        contextMenuItems: this.state.overflowItems,
        contextMenuRef: ev.currentTarget as HTMLElement,
        lastTriggeringItem: OVERFLOW_KEY
      });
    }
  }

  @autobind
  private _onEditClick(ev: React.MouseEvent<HTMLElement>) {
    this.props.editLink.onClick(ev);
    this.setState({ isEditMode: false });
  }

  private _onItemClick(item: INavLink, ev: React.MouseEvent<HTMLElement>) {
    if (this._navItemHoverTimerId) {
      this._async.clearTimeout(this._navItemHoverTimerId);
    }

    ev.stopPropagation();
    ev.preventDefault();

    if (this.state.contextMenuItems || this.state.lastTriggeringItem === item) {
      this.setState({ lastTriggeringItem: null });
      this._OnContextualMenuDismiss();
      return;
    } else if ((ev.target as HTMLElement).tagName === 'I') {
      this.setState({
        contextMenuItems: item.links,
        contextMenuRef: ev.currentTarget as HTMLElement,
        lastTriggeringItem: item
      });

      return;
    }

    if (item.onClick) {
      item.onClick(ev, item);
    } else if (item.url) {
      window.open(item.url, ViewNavDataSource.isRelativeUrl(item.url) ? '_self' : '_blank');
    }
  }

  private _onMainItemHover(item: INavLink, ev: React.MouseEvent<HTMLElement>) {
    if (item.url) {
      window.status = item.url;
    }

    ev.stopPropagation();
    ev.preventDefault();
    const target = ev.currentTarget as HTMLElement;
    if (this._hasSublinks(item)) {
      this._navItemHoverTimerId = this._async.setTimeout(() => {
        if (this.state.contextMenuItems !== item.links) {
          if (this.state.contextMenuItems) {
            this._OnContextualMenuDismiss();
          }

          this._openSubMenu(item.links, target, item);
        }
      }, 250);
    }
  }

  @autobind
  private _onMouseLeave() {
    this._async.clearTimeout(this._navItemHoverTimerId);
  }

  private _handleKeyPress(item: INavLink | string, ev: React.KeyboardEvent<HTMLElement>) {
    if (ev.which === 32 /* space */ || ev.which === 40 /* down */
      || ev.which === 13 /* enter */ && ev.target && (ev.target as HTMLElement).className === 'ms-HorizontalNavItem-splitbutton') {
      ev.stopPropagation();
      ev.preventDefault();

      if (item === OVERFLOW_KEY) {
        this._openSubMenu(this.state.overflowItems, ev.target as HTMLElement, item);
      } else {
        this._openSubMenu((item as INavLink).links, ev.target as HTMLElement, item);
      }

    }
  }

  private _openSubMenu(items: INavLink[], target: HTMLElement, triggerItem: INavLink | string) {
    if (target.className === 'ms-HorizontalNavItem-splitbutton' || target.tagName === 'i' && triggerItem !== OVERFLOW_KEY) {
      let t = target;
      while (t && t.tagName.toLowerCase() !== 'span') {
        t = t.parentElement;
      }
      if (t && t.children && t.children.length > 0) {
        target = t.children[0] as HTMLElement;
      }
    }

    this.setState({
      lastTriggeringItem: triggerItem,
      contextMenuItems: items,
      contextMenuRef: target
    });
  }

  @autobind
  private _OnContextualMenuDismiss(ev?: any) {
    if (!ev || !ev.relatedTarget || !this._horizontalNavRegion.contains(ev.relatedTarget as HTMLElement)) {
      this.setState({
        contextMenuItems: null
      });
    } else {
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  private _getStateFromProps(props: IHorizontalNavProps): IHorizontalNavState {
    const { items, overflowItems, isEditMode } = props;
    this._boundItemClick.length = 0;
    this._boundMainItemHover.length = 0;
    items.forEach((item: INavLink, index: number) => {
      this._boundItemClick.push(this._onItemClick.bind(this, item));
      this._boundMainItemHover.push(this._onMainItemHover.bind(this, item));
    });

    return {
      renderedItems: items,
      overflowItems: overflowItems ? overflowItems : [],
      contextMenuItems: null,
      isEditMode: isEditMode,
      selectedKey: undefined
    };
  }


  private _isLinkSelected(link: INavLink): boolean {
    // if caller passes in selectedKey, use it as first choice or
    // if current state.selectedKey (from addressbar) is match to the link
    if (this.props.selectedKey !== undefined) {
      return link.key === this.props.selectedKey;
    } else if (this.state.selectedKey !== undefined && link.key === this.state.selectedKey) {
      return true;
    }

    // resolve is not supported for ssr
    if (typeof (window) === 'undefined') {
      return false;
    }

    if (!link.url) {
      return false;
    }

    _urlResolverForHNav = _urlResolverForHNav || document.createElement('a');

    _urlResolverForHNav.href = link.url || '';
    const target: string = _urlResolverForHNav.href;
    const target2: string = target + '/SitePages/Home.aspx';

    if (location.href === target || location.href === target2) {
      return true;
    }

    if (location.protocol + '//' + location.host + location.pathname === target) {
      return true;
    }

    if (location.hash) {
      // Match the hash to the url.
      if (location.hash === link.url) {
        return true;
      }

      // Match a rebased url. (e.g. #foo becomes http://hostname/foo)
      _urlResolverForHNav.href = location.hash.substring(1);

      return _urlResolverForHNav.href === target;
    }
    return false;
  }
}

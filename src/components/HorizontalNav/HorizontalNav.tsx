import * as React from 'react';
import './HorizontalNav.scss';
import { IHorizontalNav, IHorizontalNavProps, IHorizontalNavItem } from './HorizontalNav.Props';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { css } from 'office-ui-fabric-react/lib/utilities/css';
import { EventGroup } from 'office-ui-fabric-react/lib/utilities/eventGroup/EventGroup';
import { ContextualMenu, DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import { getRTL } from 'office-ui-fabric-react/lib/utilities/rtl';
import { Async } from 'office-ui-fabric-react/lib/utilities/Async/Async';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';

export interface IHorizontalNavState {
  /** items before the overflow */
  renderedItems?: IHorizontalNavItem[];
  /** items currently in overflow */
  overflowItems?: IHorizontalNavItem[];
  /** Ref to the overflow button */
  contextMenuRef?: HTMLElement;
  /**  What items are presently in the contextual menu. */
  contextMenuItems?: IHorizontalNavItem[];
  /** last item that triggered a context menu */
  lastTriggeringItem?: IHorizontalNavItem | string;
}

let _instance = 0;
const OVERFLOW_KEY = 'overflow';
const OVERFLOW_WIDTH = 32.67;

/**
 * Horizontal Nav control, meant to contain top navigation nodes.
 */
export class HorizontalNav extends React.Component<IHorizontalNavProps, IHorizontalNavState> implements IHorizontalNav {

  public refs: {
    [key: string]: React.ReactInstance;
    horizontalNavRegion: HTMLElement;
  };

  private _events: EventGroup;
  private _async: Async;

  private _instanceIdPrefix: string;
  private _currentOverflowWidth: number;
  private _navItemWidths: { [key: string]: number };
  private _boundItemClick: Array<(ev: React.MouseEvent<HTMLElement>) => void> = [];
  private _boundMainItemHover: Array<(ev: React.MouseEvent<HTMLElement>) => void> = [];
  private _navItemHoverTimerId: number;

  constructor(props: IHorizontalNavProps, context?: any) {
    super(props, context);
    this._instanceIdPrefix = 'HorizontalNav-' + (_instance++) + '-';
    this._events = new EventGroup(this);
    this._async = new Async(this);
    this.state = this._getStateFromProps(this.props);
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
    if (!this._navItemWidths) {
      this._updateItemMeasurements();
      this._updateRenderedItems();
    }
  }

  public render() {
    const { contextMenuItems } = this.state;

    return (
      <div className='ms-HorizontalNav' ref='horizontalNavRegion' role='navigation'>
        <FocusZone
          direction={ FocusZoneDirection.horizontal }
          aria-label={ this.props.ariaLabel }>
          <div className='ms-HorizontalNavItems' role='menubar'>
            { this._renderHorizontalNavItems() }
            { this._renderOverflow() }
          </div>
        </FocusZone>
        {
          (contextMenuItems) &&
          (<ContextualMenu
            className='ms-HorizontalNav'
            labelElementId={ this._instanceIdPrefix + OVERFLOW_KEY }
            items={ contextMenuItems.map((item: IHorizontalNavItem, index: number) => ({
              key: String(index),
              name: item.text,
              items: item.childNavItems && item.childNavItems.map((subItem: IHorizontalNavItem, subindex: number) => ({
                key: String(subindex),
                name: subItem.text,
                onClick: subItem.onClick ? (contextItem, ev) => { subItem.onClick.call(this, subItem, ev); } : null
              })),
              onClick: item.onClick ? (contextItem, ev) => { item.onClick.call(this, item, ev); } : null
            })) }
            targetElement={ this.state.contextMenuRef }
            onDismiss={ this._OnContextualMenuDismiss }
            gapSpace={ 8 }
            isBeakVisible={ false }
            directionalHint={ DirectionalHint.bottomAutoEdge }
            shouldFocusOnMount={ true }
            />
          )
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

    return renderedItems.map((item, index) => {
      let popupHover = this._boundMainItemHover[index] || this._onMainItemHover.bind(this, item);
      return (
        <span className='ms-HorizontalNavItem' key={ index } ref={ String(index) }>
          <button className='ms-HorizontalNavItem-link'
            onClick={ this._boundItemClick[index] || this._onItemClick.bind(this, item) }
            onMouseEnter={ popupHover }
            onMouseLeave={ this._onMouseLeave }
            onKeyDown={ this._handleKeyPress.bind(this, item) }
            aria-haspopup={ !!item.childNavItems }
            role='menuitem'>
            { item.text }
            { item.childNavItems && item.childNavItems.length && (
              <i className='ms-HorizontalNav-chevronDown ms-Icon ms-Icon--ChevronDown' />) }
          </button>
        </span>
      );
    });
  }

  private _renderOverflow() {
    let { overflowItems } = this.state;
    return overflowItems && overflowItems.length ? (
      <div className='ms-HorizontalNavItem' key={ OVERFLOW_KEY } ref={ OVERFLOW_KEY }>
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

  private _updateItemMeasurements() {
    let isRTL = getRTL();

    this._currentOverflowWidth =
      this.refs[OVERFLOW_KEY] || (this.props.overflowItems && this.props.overflowItems.length)
        ? OVERFLOW_WIDTH : 0;

    if (!this._navItemWidths) {
      this._navItemWidths = {};
    }

    for (let i = 0; i < this.props.items.length; i++) {
      if (!this._navItemWidths[i]) {
        let element = this.refs[i] as HTMLElement;
        this._navItemWidths[i] = element.getBoundingClientRect().width + parseInt(isRTL ? window.getComputedStyle(element).marginLeft : window.getComputedStyle(element).marginRight, 10);
      }
    }
  }

  private _updateRenderedItems() {
    let items = this.props.items;
    let renderedItems = [].concat(...items);
    let horizontalNavRegion = this.refs.horizontalNavRegion;
    let availableWidth = horizontalNavRegion.clientWidth - this._currentOverflowWidth;
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

  private _onItemClick(item: IHorizontalNavItem, ev: React.MouseEvent<HTMLElement>) {
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
        contextMenuItems: item.childNavItems,
        contextMenuRef: ev.currentTarget as HTMLElement,
        lastTriggeringItem: item
      });

      return;
    }

    if (item.onClick) {
      item.onClick(item, ev);
    }
  }

  private _onMainItemHover(item: IHorizontalNavItem, ev: React.MouseEvent<HTMLElement>) {
    ev.stopPropagation();
    ev.preventDefault();

    const target = ev.currentTarget as HTMLElement;
    if (item.childNavItems) {
      this._navItemHoverTimerId = this._async.setTimeout(() => {
        if (this.state.contextMenuItems !== item.childNavItems) {
          if (this.state.contextMenuItems) {
            this._OnContextualMenuDismiss();
          }

          this._openSubMenu(item.childNavItems, target, item);
        }
      }, 250);
    }
  }

  @autobind
  private _onMouseLeave() {
    this._async.clearTimeout(this._navItemHoverTimerId);
  }

  private _handleKeyPress(item: IHorizontalNavItem | string, ev: React.KeyboardEvent<HTMLElement>) {
    if (ev.which === 32 /* space */ || ev.which === 40 /* down */) {
      ev.stopPropagation();
      ev.preventDefault();

      if (item === OVERFLOW_KEY) {
        this._openSubMenu(this.state.overflowItems, ev.target as HTMLElement, item);
      } else {
        this._openSubMenu((item as IHorizontalNavItem).childNavItems, ev.target as HTMLElement, item);
      }

    }
  }

  private _openSubMenu(items: IHorizontalNavItem[], target: HTMLElement, triggerItem: IHorizontalNavItem | string) {
    this.setState({
      lastTriggeringItem: triggerItem,
      contextMenuItems: items,
      contextMenuRef: target
    });
  }

  @autobind
  private _OnContextualMenuDismiss(ev?: any) {
    if (!ev || !ev.relatedTarget || !this.refs.horizontalNavRegion.contains(ev.relatedTarget as HTMLElement)) {
      this.setState({
        contextMenuItems: null
      });
    } else {
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  private _getStateFromProps(props: IHorizontalNavProps): IHorizontalNavState {
    const { items, overflowItems } = props;
    items.forEach((item: IHorizontalNavItem, index: number) => {
      this._boundItemClick.push(this._onItemClick.bind(this, item));
      this._boundMainItemHover.push(this._onMainItemHover.bind(this, item));
    });

    return {
      renderedItems: items,
      overflowItems: overflowItems ? overflowItems : [],
      contextMenuItems: null
    };
  }
}

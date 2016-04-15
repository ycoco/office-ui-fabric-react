import * as React from 'react';
import './HorizontalNav.scss';
import { IHorizontalNavProps, IHorizontalNavItem } from './HorizontalNav.Props';
import { FocusZone, FocusZoneDirection } from '@ms/office-ui-fabric-react/lib/utilities/focus/index';
import { css } from '@ms/office-ui-fabric-react/lib/utilities/css';
import EventGroup from '@ms/office-ui-fabric-react/lib/utilities/eventGroup/EventGroup';
import { default as ContextualMenu, DirectionalHint } from '@ms/office-ui-fabric-react/lib/components/ContextualMenu/index';

export interface IHorizontalNavState {
  /** items before the overflow */
  renderedItems?: IHorizontalNavItem[];
  /** items currently in overflow */
  overflowItems?: IHorizontalNavItem[];
  /** is the overflow menu open? */
  overflowExpanded?: boolean;
  /** Ref to the overflow button */
  overflowBtnRef?: HTMLElement;
}

let _instance = 0;
const OVERFLOW_KEY = 'overflow';
const OVERFLOW_WIDTH = 32.67;

/**
 * Horizontal Nav control, meant to contain top navigation nodes.
 */
export default class HorizontalNav extends React.Component<IHorizontalNavProps, IHorizontalNavState> {

  public refs: {
    [key: string]: React.ReactInstance;
    horizontalNavRegion: HTMLElement;
  };

  private _instanceIdPrefix: string;
  private _events: EventGroup;
  private _currentOverflowWidth: number;
  private _navItemWidths: { [key: string]: number };

  constructor(props: IHorizontalNavProps, context?: any) {
    super(props, context);
    this._instanceIdPrefix = 'HorizontalNav-' + (_instance++) + '-';
    this._events = new EventGroup(this);

    this.state = this._getStateFromProps(this.props);
  }

  public componentDidMount() {
    this._updateItemMeasurements();
    this._updateRenderedItems();

    this._events.on(window, 'resize', this._updateRenderedItems);
  }

  public componentWillUnmount() {
    this._events.dispose();
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
    return (
      <div className='ms-HorizontalNav' ref='horizontalNavRegion'>
        <FocusZone direction={ FocusZoneDirection.horizontal }>
          <div className='ms-HorizontalNavItems'>
          { this._renderHorizontalNavItems() }
          { this._renderOverflow() }

            </div>
          </FocusZone>
        {
        (this.state.overflowExpanded) &&
          (<ContextualMenu
            className='ms-HorizontalNav'
            labelElementId={ this._instanceIdPrefix + OVERFLOW_KEY }
            items={ this.state.overflowItems.map((item: IHorizontalNavItem, index: number) => ({
              key: String(index),
              name: item.text,
              onClick: item.onClick ? (contextItem, ev) => { item.onClick.call(this, item, ev); } : null
            })) }
            targetElement={ this.state.overflowBtnRef }
            onDismiss={ this._OnContextualMenuDismiss.bind(this) }
            gapSpace={ 8 }
            isBeakVisible={ true }
            directionalHint={ DirectionalHint.bottomAutoEdge }
            shouldFocusOnMount={ true }
            />
          )
        }
        </div>
    );
  }

  private _renderHorizontalNavItems() {
    let { renderedItems } = this.state;

    return renderedItems.map((item, index) => (
      <span className='ms-HorizontalNavItem' key={ index } ref={ String(index) }>
        <button className='ms-HorizontalNavItem-link' onClick={ this._onItemClick.bind(this, item) }>
          { item.text }
          </button>
        </span>
    ));
  }

  private _renderOverflow() {
    let { overflowItems } = this.state;
    return overflowItems && overflowItems.length ? (
      <div className='ms-HorizontalNavItem' key={ OVERFLOW_KEY } ref={ OVERFLOW_KEY }>
        <button
          id={ this._instanceIdPrefix + OVERFLOW_KEY }
          className={ css('ms-HorizontalNavItem-link', { 'is-expanded': this.state.overflowExpanded }) }
          onClick={ this._onOverflowClick.bind(this) }
          aria-haspopup={ true }>
          <i className='ms-HorizontalNavItem-overflow ms-Icon ms-Icon--ellipsis'></i>
          </button>
        </div>
    ) : null;
  }

  private _updateItemMeasurements() {
    this._currentOverflowWidth =
      this.refs[OVERFLOW_KEY] || (this.props.overflowItems && this.props.overflowItems.length)
        ? OVERFLOW_WIDTH : 0;

    if (!this._navItemWidths) {
      this._navItemWidths = {};
    }

    for (let i = 0; i < this.props.items.length; i++) {
      if (!this._navItemWidths[i]) {
        let element = this.refs[i] as HTMLElement;
        this._navItemWidths[i] = element.getBoundingClientRect().width + parseInt(window.getComputedStyle(element).marginRight, 10);
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
        if (i > 0 && (!this.props.overflowItems || this.props.overflowItems.length === 0) && (availableWidth - consumedWidth) < OVERFLOW_WIDTH) {
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

  private _onOverflowClick(ev: React.MouseEvent) {
    if (this.state.overflowExpanded) {
      this._OnContextualMenuDismiss();
    } else {
      this.setState({
        overflowExpanded: true,
        overflowBtnRef: ev.currentTarget as HTMLElement
      });
    }
  }

  private _onItemClick(item: IHorizontalNavItem, ev: React.MouseEvent) {
    if (this.state.overflowExpanded) {
      this._OnContextualMenuDismiss();
    }

    item.onClick(item, ev);
  }

  private _OnContextualMenuDismiss(ev?: any) {
    if (!ev || !ev.relatedTarget || !this.refs.horizontalNavRegion.contains(ev.relatedTarget as HTMLElement)) {
      this.setState({
        overflowExpanded: false
      });
    } else {
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  private _getStateFromProps(props: IHorizontalNavProps): IHorizontalNavState {
    return {
      renderedItems: props.items,
      overflowItems: props.overflowItems ? props.overflowItems : [],
      overflowExpanded: false
    };
  }
}

import * as React from 'react';
import './ItemTile.scss';
import {
  IItemTileProps,
  IItemTileFolderProps,
  ItemTileType,
  SelectionVisibility
} from './ItemTile.Props';
import { FolderCoverTile } from './FolderCoverTile/FolderCoverTile';
import { IItemTileRenderer, TILE_RENDERERS } from './renderers/IItemTileRenderer';
import {
  DEFAULT_ICON_CELLSIZE
} from './Constants';
import { CheckCircle } from '../CheckCircle/index';

import {
  SELECTION_CHANGE
} from 'office-ui-fabric-react/lib/utilities/selection/interfaces';
import {
  IDragDropOptions
} from 'office-ui-fabric-react/lib/utilities/dragdrop/interfaces';

import { EventGroup } from 'office-ui-fabric-react/lib/utilities/eventGroup/EventGroup';
import { css } from 'office-ui-fabric-react/lib/utilities/css';

let _instance = 0;

export interface IItemTileState {
  /** If the checkbox should be immediately visible (such as on hover). */
  canSelect?: boolean;
  /** Whether the item tile is currently being dragged. */
  isDragging?: boolean;
  /** Whether or not the ItemTile is currently a drop target. */
  isDropping?: boolean;
  /** Whether the ItemTile is selected or not. */
  isSelected?: boolean;
}

const ItemTileTypeMap = {
  [ ItemTileType.file ]: 'is-file',
  [ ItemTileType.folder ]: 'is-folder',
  [ ItemTileType.photo ]: 'is-photo',
  [ ItemTileType.video ]: 'is-video'
};

/**
 * Item Tile Control, meant to display tiles.
 * TODO: The following components need to be created:
 *    FileTypeIcon, newBadge
 */
export class ItemTile extends React.Component<IItemTileProps, IItemTileState> {
  public refs: {
    [key: string]: React.ReactInstance,
    root: HTMLElement,
    /**
     * The folderCover ref is declared in the FolderRenderer.
     * It is used to expose the functions for pulsing.
     */
    folderCover: FolderCoverTile
  };

  private _dragDropKey: string;
  private _events: EventGroup;
  private _instanceIdPrefix: string;
  private _itemTileRenderer: IItemTileRenderer;

  constructor(props: IItemTileProps, context?: any) {
    super(props, context);

    this._events = new EventGroup(this);
    this._instanceIdPrefix = 'ms-ItemTile-' + (_instance++) + '-';
    this._updateDroppingState = this._updateDroppingState.bind(this);

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseOver = this._onMouseOver.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);

    let {
      selection,
      itemIndex
    } = props;
    this.state = {
      canSelect: false,
      isSelected: selection ? selection.isIndexSelected(itemIndex) : false
    };
  }

  public componentDidMount() {
    let { dragDropHelper } = this.props;
    if (dragDropHelper) {
      dragDropHelper.subscribe(this.refs.root, this._events, this._getDragDropOptions());
    }

    if (this.props.selection) {
      this._events.on(this.props.selection, SELECTION_CHANGE, this._onSelectionChanged);
    }
  }

  public componentWillUnmount() {
    let { dragDropHelper } = this.props;

    if (dragDropHelper) {
      dragDropHelper.unsubscribe(this.refs.root, this._dragDropKey);
    }

    this._itemTileRenderer.dispose();
    this._events.dispose();
  }

  public componentWillReceiveProps(newProps: IItemTileProps) {
    // Require new renderer if itemtiletype changes.
    // Always require new renderer if folder
    if (
      newProps.itemTileType !== this.props.itemTileType ||
      newProps.itemTileType === ItemTileType.folder
      ) {
      this._itemTileRenderer = null;
    }
  }

  public render() {
    let {
      ariaLabel,
      cellWidth,
      cellHeight,
      dragDropEvents,
      item,
      itemIndex,
      itemTileType,
      itemTileTypeProps,
      selection,
      selectionVisibility,
      thumbnailUrl,
      tooltipText
    } = this.props;
    let {
      canSelect,
      isDropping,
      isSelected
    } = this.state;
    let isDraggable: boolean =
      !!dragDropEvents &&
      dragDropEvents.canDrag &&
      dragDropEvents.canDrag(item);

    let tileStyle = {
      width: (cellWidth || DEFAULT_ICON_CELLSIZE) + 'px',
      height: (cellHeight || DEFAULT_ICON_CELLSIZE) + 'px'
    };

    // An anchor element is not contained within the ms-ItemTile div as a sibling to the selector.
    // Adding an anchor element causes the focusZone to recognize the anchor as a focusable element. (as of office-ui-fabric-react: 0.28.0)
    // Even if we put data-is-focusable={ false } on the anchor, it still messes with the focusZone behavior.
    // We really just want the root to be the focusable element so we attach the link behavior to its onclick event.
    return (
      <div
        className={ css(
        'ms-ItemTile',
        ItemTileTypeMap[itemTileType],
        {
          'has-thumbnail ': !!thumbnailUrl,
          'is-selected': isSelected,
          'can-select':
            selection &&
            (selectionVisibility !== SelectionVisibility.none) &&
            ((selectionVisibility === SelectionVisibility.always) ||
              canSelect ||
              isSelected),
          'od-ItemTile--isAlbum': itemTileTypeProps && (itemTileTypeProps as IItemTileFolderProps).isAlbum,
          'is-dropping': isDropping
        }) }
        ref='root'
        role='link'
        onMouseDown={ this._onMouseDown }
        onMouseOver={ this._onMouseOver }
        onMouseLeave={ this._onMouseLeave }
        style={ tileStyle }
        aria-label={ ariaLabel }
        aria-selected={
          (selection && selectionVisibility !== SelectionVisibility.none) ?
          isSelected :
          undefined }
        data-is-draggable={ isDraggable }
        data-is-focusable={ true }
        data-selection-index={ itemIndex }
        data-selection-invoke={ true }
        data-item-index={ itemIndex }
        data-automationid='ItemTile'
        >
        <div
          className='ms-ItemTile-content'
          >
          { this._renderItemTile() }
        </div>
        <div className='ms-ItemTile-selector'>
          <div className='ms-ItemTile-frame' title={ tooltipText }></div>
          <div
            className='ms-ItemTile-checkCircle'
            data-item-index={ itemIndex }
            data-selection-toggle={ true }
            data-automationid='CheckCircle'
            aria-checked={ isSelected }
            >
            <CheckCircle isChecked={ isSelected } />
          </div>
        </div>
      </div>
    );
  }

  /**
   * Returns whether or not this tile is capable of pulsing.
   * Only folders with more than one thumbnail can pulse.
   */
  public canPulse(): boolean {
    return (
      (this.props.itemTileType === ItemTileType.folder) &&
      (this.props.itemTileTypeProps as IItemTileFolderProps).pulseThumbnails &&
      (this.props.itemTileTypeProps as IItemTileFolderProps).pulseThumbnails.length > 1
    );
  }

  /**
   * When this method is called, the pulseThumbnails of the folderCover are advanced once.
   * This function only affects folder tiles with more than one specified pulseThumbnail.
   */
  public pulse() {
    if (this.props.itemTileType === ItemTileType.folder && this.refs.folderCover) {
      this.refs.folderCover.pulse();
    }
  }

  private _renderItemTile() {
    if (!this._itemTileRenderer) {
      let renderer = TILE_RENDERERS[this.props.itemTileType];
      if (!!renderer) {
        this._itemTileRenderer = new renderer(this.props);
      }
    }
    if (this._itemTileRenderer) {
      return this._itemTileRenderer.render(this.props);
    }
  }

  private _onSelectionChanged() {
    let {
      itemIndex,
      selection
    } = this.props;
    let isSelected = !!selection && selection.isIndexSelected(itemIndex);

    if (isSelected !== this.state.isSelected) {
      this.setState({
        isSelected: isSelected
      });
    }
  }

  private _getDragDropOptions(): IDragDropOptions {
    let {
      dragDropEvents,
      item,
      itemIndex,
      itemTileEventMap
    } = this.props;

    this._dragDropKey = 'itemTile-' + itemIndex;

    let options: IDragDropOptions = {
      key: this._dragDropKey,
      eventMap: itemTileEventMap,
      selectionIndex: itemIndex,
      context: { data: item, index: itemIndex },
      canDrag: dragDropEvents.canDrag,
      canDrop: dragDropEvents.canDrop,
      onDragStart: this._createOnDragStart(),
      updateDropState: this._updateDroppingState
    };
    return options;
  }

  private _updateDroppingState(isDropping: boolean, ev: DragEvent) {
    let {
      dragDropEvents,
      item
    } = this.props;

    if (!isDropping) {
      if (dragDropEvents.onDragLeave) {
        dragDropEvents.onDragLeave(item, ev);
      }
    }

    // Only change state if the new value differs.
    if (isDropping !== this.state.isDropping) {
      this.setState({ isDropping: isDropping });
    }
  }

  /**
   * These hover methods aren't useful for mobile users.
   * In order to display the checkCircle to mobile users, the selectionVisibility property can be used.
   */
  private _onMouseOver() {
    this.setState({ canSelect: true });
  }

  private _onMouseLeave() {
    this.setState({ canSelect: false });
  }

  // Returns a lambda for a pass-through function for _onDragStart to track drag state of this element.
  private _createOnDragStart() {
    let {
      dragDropEvents
    } = this.props;

    return (item: any, itemIndex: number, selectedItems: any[], event: MouseEvent) => {
      if (!this.state.isDragging) {
        this.setState({ isDragging: true });
      }

      dragDropEvents.onDragStart(item, itemIndex, selectedItems, event);
    };
  }

  /**
   * This function is used to change selection state of a single item so that it triggers the drag-drop events on the item.
   * The drag-and-drop needs to interact with selection in order to do multi-item drag.
   * When the drag start event is bound, whatever items are selected in the selection state are used for the drag data.
   */
  private _onMouseDown(ev: React.MouseEvent) {
    // Set drag state of tile to false. The item will not begin dragging until the mouse is moved.
    this.setState({ isDragging: false });
  }
}

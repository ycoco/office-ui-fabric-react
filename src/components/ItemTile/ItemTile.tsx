import * as React from 'react';
import './ItemTile.scss';
import { IItemTileProps, IItemTileFolderProps, ItemTileType, SelectionVisiblity } from './ItemTile.Props';
import { FolderCoverTile } from './FolderCoverTile/FolderCoverTile';
import { IItemTileRenderer, TILE_RENDERERS } from './renderers/IItemTileRenderer';
import { DEFAULT_ICON_CELLSIZE } from './constants';
import { CheckCircle } from '../CheckCircle/index';
import { css } from '@ms/office-ui-fabric-react/lib/utilities/css';

let _instance = 0;

export interface IItemTileState {
  /** If the checkbox should be immeadiately visible (such as on hover) */
  canSelect?: boolean;
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
    [key: string]: React.ReactInstance;
    folderCover: FolderCoverTile;
  };

  private _instanceIdPrefix: string;

  private _itemTileRenderer: IItemTileRenderer;

  constructor(props: IItemTileProps, context?: any) {
    super(props, context);

    this._instanceIdPrefix = 'ms-ItemTile-' + (_instance++) + '-';

    this.state = {
      canSelect: false
    };
  }

  public render() {
    let {
      ariaLabel,
      cellWidth,
      cellHeight,
      itemTileType,
      itemTileTypeProps,
      linkUrl,
      selection,
      selectionIndex,
      selectionVisiblity,
      tabIndex,
      thumbnailUrl,
      tooltipText
    } = this.props;
    let { canSelect } = this.state;
    let isSelected = !!selection && selection.isIndexSelected(selectionIndex);

    let tileStyle = {
      width: (cellWidth || DEFAULT_ICON_CELLSIZE) + 'px',
      height: (cellHeight || DEFAULT_ICON_CELLSIZE) + 'px'
    };

    return (
      <div className={ css(
        'ms-ItemTile',
        ItemTileTypeMap[itemTileType],
        {
          'has-thumbnail ': !!thumbnailUrl,
          'is-selected': isSelected,
          'can-select':
            selection &&
            (selectionVisiblity !== SelectionVisiblity.none) &&
            ((selectionVisiblity === SelectionVisiblity.always) ||
              canSelect ||
              isSelected),
          'od-ItemTile--isAlbum': itemTileTypeProps && (itemTileTypeProps as IItemTileFolderProps).isAlbum
        }) }
        tabIndex={ tabIndex || -1 }
        style={ tileStyle }
        onMouseOver={ this._onMouseOver.bind(this) }
        onMouseLeave={ this._onMouseLeave.bind(this) }
        aria-label={ ariaLabel }
        data-selection-index={ selectionIndex }
        >
        <a tabIndex={ -1 }
          href={ linkUrl }
          onClick={ this._onClick.bind(this, this.props) }>
          <div className='ms-ItemTile-content'>
            { this._renderItemTile() }
          </div>
          <div className='ms-ItemTile-selector'>
            <div className='ms-ItemTile-frame' title={ tooltipText }></div>
            <div
              className='ms-ItemTile-checkCircle'
              data-selection-toggle={ canSelect }
              >
              <CheckCircle isChecked={ isSelected } />
            </div>
          </div>
        </a>
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

    return this._itemTileRenderer.render(this.props);
  }

  /**
   * These hover methods aren't useful for mobile users.
   * In order to display the checkCircle to mobile users, the selectionVisiblity property can be used.
   */
  private _onMouseOver() {
    this.setState({ canSelect: true });
  }

  private _onMouseLeave() {
    this.setState({ canSelect: false });
  }

  private _onClick(tile: IItemTileProps, ev: React.MouseEvent) {
    if (this.props.onClick) {
      this.props.onClick(tile, ev);

      ev.stopPropagation();
    }
  }
}

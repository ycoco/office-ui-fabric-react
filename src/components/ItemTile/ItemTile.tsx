import * as React from 'react';
import './ItemTile.scss';
import { IItemTileProps, IItemTileFolderProps, ItemTileType } from './ItemTile.Props';
import { FolderCoverTile } from './FolderCoverTile/FolderCoverTile';
import { IItemTileRenderer } from './renderers/IItemTileRenderer';
import { DEFAULT_ICON_CELLSIZE } from './constants';
import { CheckCircle } from '../CheckCircle/index';
import { css } from '@ms/office-ui-fabric-react/lib/utilities/css';

let _instance = 0;

export interface IItemTileState {
  /** If the tile is selected */
  isSelected?: boolean;
  /** If the checkbox should be visible */
  canSelect?: boolean;
}

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
      isSelected: false,
      canSelect: false
    };
  }

  public render() {
    let tileStyle = {
      width: (this.props.cellWidth || DEFAULT_ICON_CELLSIZE) + 'px',
      height: (this.props.cellHeight || DEFAULT_ICON_CELLSIZE) + 'px'
    };

    return (
      <div className={ css(
        'ms-ItemTile',
        {
          'has-thumbnail ': !!this.props.thumbnailUrl,
          'is-file': (this.props.itemTileType === ItemTileType.file),
          'is-folder': (this.props.itemTileType === ItemTileType.folder),
          'is-photo': (this.props.itemTileType === ItemTileType.photo),
          'is-video': (this.props.itemTileType === ItemTileType.video),
          'is-selected': this.state.isSelected,
          'can-select': this.props.showSelect || this.state.canSelect || this.state.isSelected,
          'od-ItemTile--isAlbum': this.props.itemTileTypeProps && (this.props.itemTileTypeProps as IItemTileFolderProps).isAlbum
        }) }
        tabIndex={ this.props.tabIndex || -1 }
        style={ tileStyle }
        onMouseOver={ this._onMouseOver.bind(this) }
        onMouseLeave={ this._onMouseLeave.bind(this) }
        aria-label={ this.props.ariaLabel }
        >
        <a tabIndex={ -1 }
          href={ this.props.linkUrl }
          onClick={ this._onClick.bind(this, this.props) }>
          <div className='ms-ItemTile-content'>
            { this._renderItemTile() }
          </div>
          <div className='ms-ItemTile-selector'>
            <div className='ms-ItemTile-frame' title={ this.props.tooltipText }></div>
            <div className='ms-ItemTile-checkCircle' onClick={ this._onCheckClick.bind(this, this.props) }>
              <CheckCircle isChecked={ this.state.isSelected } />
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
      let renderer = undefined;
      switch (this.props.itemTileType) {
        case ItemTileType.file:
          renderer = require('./renderers/ItemTileFileRenderer').ItemTileFileRenderer;
          break;
        case ItemTileType.folder:
          renderer = require('./renderers/ItemTileFolderRenderer').ItemTileFolderRenderer;
          break;
        case ItemTileType.photo:
          renderer = require('./renderers/ItemTilePhotoRenderer').ItemTilePhotoRenderer;
          break;
        case ItemTileType.video:
          renderer = require('./renderers/ItemTileVideoRenderer').ItemTileVideoRenderer;
          break;
        default:
          return (
            <span>No recognized itemTileType.</span>
          );
      }
      if (!!renderer) {
        this._itemTileRenderer = new renderer(this.props);
      }
    }

    return this._itemTileRenderer.render(this.props);
  }

  /**
   * These hover methods aren't useful for mobile users.
   * I order to display the checkCircle to mobile users, the showSelect property can be used.
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

  private _onCheckClick(tile: IItemTileProps, ev: React.MouseEvent) {
    this.setState({ isSelected: !this.state.isSelected });
    if (this.props.onCheckClick) {
      this.props.onCheckClick(tile, ev);
    }
    ev.stopPropagation();
    ev.preventDefault();
  }
}

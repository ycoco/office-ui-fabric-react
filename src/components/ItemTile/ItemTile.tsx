import * as React from 'react';
import './ItemTile.scss';
import { IItemTileProps } from './ItemTile.Props';
import { FolderCoverTile } from '../index';
import { IItemTileRenderer } from './renderers/IItemTileRenderer';
import { DEFAULT_ICON_CELLSIZE, ItemTileType } from './constants';
import { default as RowCheck } from '../RowCheck/index';
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
export default class ItemTile extends React.Component<IItemTileProps, IItemTileState> {

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

    // TODO: change is-checkVisible and isInvokable
    return (
      <div className={ css('ms-ItemTile', {
        'has-thumbnail ': !!this.props.thumbnailUrl,
        'is-file': (this.props.itemTileType === ItemTileType.file),
        'is-folder': (this.props.itemTileType === ItemTileType.folder),
        'is-photo': (this.props.itemTileType === ItemTileType.photo),
        'is-video': (this.props.itemTileType === ItemTileType.video),
        'is-selected': this.state.isSelected,
        'is-checkVisible': true,
        'can-select': this.state.canSelect || this.state.isSelected,
        'od-ItemTile--isInvokable': true
        }) }
        ref='ItemTileRegion'
        tabIndex={ this.props.tabIndex || -1 }
        style={ tileStyle }
        onMouseOver={ this._onMouseOver.bind(this) }
        onMouseLeave={ this._onMouseLeave.bind(this) }
        >
        <a tabIndex={ -1 }
          href={ this.props.linkUrl }
          onClick={ this._onClick.bind(this, this.props) }>
          <div className='ms-ItemTile-content' data-bind='template: templateName'>
            { this._renderItemTile() }
          </div>
          <div className='ms-ItemTile-selector'>
            <div className='ms-ItemTile-frame' title={ this.props.tooltipText }></div>
            <div className='ms-ItemTile-rowCheck' onClick={ this._onRowCheckClick.bind(this, this.props) }>
              <RowCheck isChecked={ this.state.isSelected } />
            </div>
          </div>
        </a>
      </div>
    );
  }

  public pulse() {
      this.refs.folderCover.pulse();
  }

  private _renderItemTile() {
    if (!this._itemTileRenderer) {
      let renderer = undefined;
      switch (this.props.itemTileType) {
        case ItemTileType.file:
          renderer = require('./renderers/ItemTileFileRenderer');
          break;
        case ItemTileType.folder:
          renderer = require('./renderers/ItemTileFolderRenderer');
          break;
        case ItemTileType.photo:
          renderer = require('./renderers/ItemTilePhotoRenderer');
          break;
        case ItemTileType.video:
          renderer = require('./renderers/ItemTileVideoRenderer');
          break;
        default:
          return (
            <span>No recognized itemTileType.</span>
          );
      }
      if (!!renderer) {
        this._itemTileRenderer = new renderer.default(this.props);
      }
    }

    return this._itemTileRenderer.render(this.props);
  }

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

  private _onRowCheckClick(tile: IItemTileProps, ev: React.MouseEvent) {
    this.setState({ isSelected: !this.state.isSelected });
    if (this.props.onRowCheckClick) {
      this.props.onRowCheckClick(tile, ev);
    }
    ev.stopPropagation();
    ev.preventDefault();
  }
}

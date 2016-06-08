/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */
import { IItemTileProps, IItemTileFolderProps } from '../ItemTile.Props';
import { IItemTileRenderer } from './IItemTileRenderer';
import { IFolderCoverTileProps, FolderCoverTile } from '../index';

import { Image } from '@ms/office-ui-fabric-react/lib/Image';
import { css } from '@ms/office-ui-fabric-react/lib/utilities/css';

export class ItemTileFolderRenderer implements IItemTileRenderer {

  private _thumbnailRenderer;
  private _folderCoverProps: IFolderCoverTileProps;

  constructor(props: IItemTileProps) {
    let folderCoverTileProps: IFolderCoverTileProps = { coverRecords: [] };

    if (props.itemTileTypeProps && (props.itemTileTypeProps as IItemTileFolderProps).pulseThumbnails) {
      folderCoverTileProps.coverRecords = (props.itemTileTypeProps as IItemTileFolderProps).pulseThumbnails.map((thumbnail, index) => {
        return ({ thumbnail: (
          <div className='ms-ItemTile-thumbnail'>
            <Image { ...thumbnail } />
          </div>
        ) });
      });
    } else {
      if (!this._thumbnailRenderer) {
        let thumbnailRenderer = require('./ItemTileThumbnailRenderer').default;
        this._thumbnailRenderer = new thumbnailRenderer();
      }
      folderCoverTileProps.coverRecords.push({ thumbnail: this._thumbnailRenderer.render(props) });
    }

    this._folderCoverProps = folderCoverTileProps;

  }

  public dispose() {
    if (this._thumbnailRenderer) {
      this._thumbnailRenderer.dispose();
    }
  }

  // TODO: Add newBadge
  public render(props: IItemTileProps) {
    return (
      <div className='ms-ItemTile-folder'>
        <div className='ms-ItemTile-image'>
          <FolderCoverTile ref='folderCover' { ...this._folderCoverProps }/>
        </div>
        <div className='ms-ItemTile-dragDropIcon'></div>
        <div className='ms-ItemTile-namePlate'>
          <div className='ms-ItemTile-folderBeak'></div>
          <div className='ms-ItemTile-folderBeakHighlight'></div>

          { (props.itemTileTypeProps && !(props.itemTileTypeProps as IItemTileFolderProps).isSubTextVisible && props.isShared && !(props.itemTileTypeProps as IItemTileFolderProps).isAlbum) && (
            <i className='ms-ItemTile-sharingIcon ms-Icon ms-Icon--people'></i>
          ) }

          { props.itemTileTypeProps && (
            <div className='ms-ItemTile-name'>
              { props.displayName }
            </div>
          ) }

          <div className='ms-ItemTile-childCount'>
            { props.itemTileTypeProps && (props.itemTileTypeProps as IItemTileFolderProps).childCount }
          </div>

          { (props.itemTileTypeProps && (props.itemTileTypeProps as IItemTileFolderProps).isSubTextVisible && !(props.itemTileTypeProps as IItemTileFolderProps).isAlbum) && (
            <div className='ms-ItemTile-subText'>
              <i className={ css(
                'ms-Icon',
                {
                  'ms-ItemTile-sharingIcon ms-ItemTile-subTextIcon ms-Icon--people': props.itemTileTypeProps && props.isShared
                }) }></i>
              <span>
                { props.subText }
              </span>
            </div>
          ) }
        </div>
      </div>
    );
  }
}

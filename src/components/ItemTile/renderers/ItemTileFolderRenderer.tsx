/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */
import { IItemTileProps, IItemTileFolderProps } from '../ItemTile.Props';
import { IItemTileRenderer } from './IItemTileRenderer';
import { ItemTileThumbnailRenderer } from './ItemTileThumbnailRenderer';
import { IFolderCoverTileProps, FolderCoverTile } from '../index';

import { css } from 'office-ui-fabric-react/lib/utilities/css';

export class ItemTileFolderRenderer implements IItemTileRenderer {

  private _thumbnailRenderer;
  private _folderCoverProps: IFolderCoverTileProps;

  constructor(props: IItemTileProps) {
    let folderProps = (props.itemTileTypeProps as IItemTileFolderProps);

    let folderCoverTileProps: IFolderCoverTileProps = {};

    if (folderProps) {
      let { childCount, watermarkUrl } = folderProps;
      folderCoverTileProps = {
        childCount: childCount,
        watermarkUrl: watermarkUrl
      };
    }

    folderCoverTileProps.coverRecords = [];

    if (!this._thumbnailRenderer) {
      this._thumbnailRenderer = new ItemTileThumbnailRenderer();
    }

    if (folderProps && folderProps.pulseThumbnails) {
      folderCoverTileProps.coverRecords = (props.itemTileTypeProps as IItemTileFolderProps).pulseThumbnails.map((thumbnail) => {
        // Thumbnail renderer stores state in order to crossfade new images.
        // This is why a new renderer is neaded for each pulsethumbnail.
        let tempThumbnailRenderer = new ItemTileThumbnailRenderer();
        return ({
          thumbnail: tempThumbnailRenderer.render({ thumbnailUrl: thumbnail.src, itemTileType: null })
        });
      });
    } else {
      if (props.thumbnailUrl) {
        folderCoverTileProps.coverRecords.push({
          thumbnail: this._thumbnailRenderer.render(props)
        });
      }
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

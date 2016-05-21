/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */
import { IItemTileProps } from '../ItemTile.props';
import { IItemTileRenderer } from './IItemTileRenderer';
import { IFolderCoverTileProps, FolderCoverTile } from '../index';

import { IImageProps, default as Image } from '@ms/office-ui-fabric-react/lib/components/Image/index';
import { css } from '@ms/office-ui-fabric-react/lib/utilities/css';

export default class ItemTileFolderRenderer implements IItemTileRenderer {

  private _thumbnailRenderer;
  private _folderCoverProps: IFolderCoverTileProps;

  constructor(props: IItemTileProps) {
    let folderCoverTileProps: IFolderCoverTileProps = { coverRecords: [] };

    if (props.itemTileTypeProps && props.itemTileTypeProps.pulseThumbnails) {
      folderCoverTileProps.coverRecords = props.itemTileTypeProps.pulseThumbnails.map((thumbnail, index) => {
        let thumbnailImageProps: IImageProps = {
          src: thumbnail,
          shouldFadeIn: true
        };

        return ({ thumbnail: (
          <div className='ms-ItemTile-thumbnail'>
            <Image { ...thumbnailImageProps } />
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

          { (props.itemTileTypeProps && !props.itemTileTypeProps.isSubTextVisible && props.isShared && !props.itemTileTypeProps.isAlbum) && (
            <i className='ms-ItemTile-sharingIcon ms-Icon ms-Icon--people'></i>
          ) }

          { (props.itemTileTypeProps && !props.itemTileTypeProps.faceGroup) && (
            <div className='ms-ItemTile-name'>
              { props.displayName }
            </div>
          ) }

          <div className='ms-ItemTile-childCount'>
            { props.itemTileTypeProps && props.itemTileTypeProps.childCount }
          </div>

          { (props.itemTileTypeProps && props.itemTileTypeProps.isSubTextVisible && !props.itemTileTypeProps.isAlbum) && (
            <div className='ms-ItemTile-subText'>
              <i className={ css('ms-Icon', {
                'ms-ItemTile-sharingIcon ms-ItemTile-subTextIcon ms-Icon--people': props.itemTileTypeProps && props.isShared && !props.itemTileTypeProps.isBundle,
                'ms-Icon--bundle': props.itemTileTypeProps && props.itemTileTypeProps.isBundle
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

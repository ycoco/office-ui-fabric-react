/**
 * @copyright Microsoft Corporation. All rights reserved.
 *
 * @file Tip Tile component to show tips.
 */

import * as React from 'react';
import { Button, ButtonType } from '@ms/office-ui-fabric-react/lib/Button';
import { KeyCodes } from '@ms/office-ui-fabric-react/lib/utilities/KeyCodes';
import {  DocumentCard, DocumentCardPreview } from '@ms/office-ui-fabric-react/lib/DocumentCard';
import { ImageFit }from '@ms/office-ui-fabric-react/lib/Image';
import { FocusZone, FocusZoneDirection } from '@ms/office-ui-fabric-react/lib/FocusZone';
import { ICardTileProps } from './ICardTile.Props';
import './TipTile.scss';

export class TipTile extends React.Component<ICardTileProps, {}> {
  constructor() {
    super();
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  public render(): React.ReactElement<ICardTileProps> {
    const {
      title,
      tipDetailContent,
      tipActionButtonIcon,
      tipActionLabel,
      onClick,
      onClickHref,
      accentColor,
      previewImages
    } = this.props.item;
    const { previewImageHeight, previewImageWidth, ariaLabel, ariaDescribedByElementId } = this.props;

    return (
      <div className='ms-TipTile' data-is-focusable={ true } onKeyDown={ this._onKeyDown } role='gridcell'
        aria-label={ ariaLabel }  aria-describedby={ ariaDescribedByElementId }>
        <FocusZone
          direction={ FocusZoneDirection.vertical }>
          <DocumentCard onClick={ onClick } onClickHref={ onClickHref }>
            <DocumentCardPreview
              previewImages = { previewImages }
              imageFit={ ImageFit.center }
              width={ previewImageWidth }
              height={ previewImageHeight }
              accentColor={ accentColor }/>
            <div className='ms-TipTile-title'>{ title }</div>
            <div className='ms-TipTile-detail'>{ tipDetailContent }</div>
            <Button buttonType={ ButtonType.command } icon={ tipActionButtonIcon }>{ tipActionLabel }</Button>
          </DocumentCard>
        </FocusZone>
      </div>
    );
  }

  private _onKeyDown(ev: React.KeyboardEvent): void {
    if (ev.which === KeyCodes.enter) {
      const {
        onClick,
        onClickHref
      } = this.props.item;

      if (onClick) {
        onClick(ev);
      } else if (onClickHref) {
         window.location.href = onClickHref;
      }
    }
  }
}

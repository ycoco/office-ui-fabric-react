/**
 * @copyright Microsoft Corporation. All rights reserved.
 *
 * @file Tip Tile component to show tips.
 */

import * as React from 'react';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { KeyCodes, autobind } from 'office-ui-fabric-react/lib/Utilities';
import {  DocumentCard, DocumentCardPreview, DocumentCardType, DocumentCardTitle } from 'office-ui-fabric-react/lib/DocumentCard';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { ICardTileProps } from './ICardTile.Props';
import './TipTile.scss';

export class TipTile extends React.Component<ICardTileProps, {}> {
  public render(): React.ReactElement<ICardTileProps> {
    const { ariaLabel, ariaDescribedByElementId, useCompactDocumentCard } = this.props;

    return (
      <div className='ms-TipTile' data-is-focusable={ true } onKeyDown={ this._onKeyDown } role='gridcell'
        aria-label={ ariaLabel }  aria-describedby={ ariaDescribedByElementId }>
        <FocusZone
          direction={ FocusZoneDirection.vertical }>
          { useCompactDocumentCard ? this._renderCompactTipTile() : this._renderNormalTipTile() }
        </FocusZone>
      </div>
    );
  }

  @autobind
  private _renderCompactTipTile() {
    const {
      tipDetailContent,
      tipActionButtonIcon,
      tipActionLabel,
      onClick,
      onClickHref,
      previewImages
    } = this.props.item;

    return (
      <DocumentCard onClick={ onClick } onClickHref={ onClickHref } type={ DocumentCardType.compact }>
        <DocumentCardPreview previewImages = { previewImages }/>
        <div className='ms-DocumentCard-details'>
          <DocumentCardTitle title={ tipDetailContent } shouldTruncate={ true }/>
          <Button buttonType={ ButtonType.command } icon={ tipActionButtonIcon }>{ tipActionLabel }</Button>
        </div>
      </DocumentCard>
    );
  }

  @autobind
  private _renderNormalTipTile() {
    const {
      title,
      tipDetailContent,
      tipActionButtonIcon,
      tipActionLabel,
      onClick,
      onClickHref,
      previewImages
    } = this.props.item;

    return (
      <DocumentCard onClick={ onClick } onClickHref={ onClickHref }>
        <DocumentCardPreview previewImages = { previewImages }/>
          <div className='ms-TipTile-titleArea'>
            <div className='ms-TipTile-title'>{ title }</div>
            <div className='ms-TipTile-detail'>{ tipDetailContent }</div>
          </div>
        <Button className='ms-TipTile-action' buttonType={ ButtonType.command } icon={ tipActionButtonIcon }>{ tipActionLabel }</Button>
      </DocumentCard>
    );
  }

  @autobind
  private _onKeyDown(ev: React.KeyboardEvent<HTMLElement>): void {
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

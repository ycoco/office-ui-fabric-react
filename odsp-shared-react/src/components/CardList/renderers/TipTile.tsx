/**
 * @copyright Microsoft Corporation. All rights reserved.
 *
 * @file Tip Tile component to show tips.
 */

import * as React from 'react';
import { CommandButton } from 'office-ui-fabric-react/lib/Button';
import { KeyCodes, autobind } from 'office-ui-fabric-react/lib/Utilities';
import { DocumentCard, DocumentCardPreview, DocumentCardType, DocumentCardTitle } from 'office-ui-fabric-react/lib/DocumentCard';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { ICardTileProps } from './ICardTile.Props';
import './TipTile.scss';

export class TipTile extends React.Component<ICardTileProps, {}> {
  public render(): React.ReactElement<ICardTileProps> {
    const { ariaLabel, ariaDescribedByElementId, useCompactDocumentCard } = this.props;

    return (
      <div className='ms-TipTile' data-is-focusable={ true } onKeyDown={ this._onKeyDown } role='gridcell'
        aria-label={ ariaLabel } aria-describedby={ ariaDescribedByElementId }>
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
      previewImages,
      className
    } = this.props.item;

    return (
      <DocumentCard onClick={ onClick } onClickHref={ onClickHref } type={ DocumentCardType.compact } className={ className }>
        <DocumentCardPreview previewImages={ previewImages } />
        <div className='ms-DocumentCard-details'>
          <DocumentCardTitle title={ tipDetailContent } shouldTruncate={ true } />
          <CommandButton
            iconProps={ { iconName: tipActionButtonIcon } }
            text={ tipActionLabel }
          />
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
      previewImages,
      className
    } = this.props.item;

    return (
      <DocumentCard onClick={ onClick } onClickHref={ onClickHref } className={ className }>
        <DocumentCardPreview previewImages={ previewImages } />
        <div className='ms-TipTile-titleArea'>
          <div className='ms-TipTile-title'>{ title }</div>
          <div className='ms-TipTile-detail'>{ tipDetailContent }</div>
        </div>
        <CommandButton
          className='ms-TipTile-action'
          iconProps={ { iconName: tipActionButtonIcon } }
          text={ tipActionLabel }
        />
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

/**
 * @copyright Microsoft Corporation. All rights reserved.
 *
 * @file Document Card Tile component to show document information in tile.
 * including editor information, preview image and file icon image etc.
 */

import * as React from 'react';
import {
  DocumentCard,
  DocumentCardPreview,
  DocumentCardActivity,
  DocumentCardLocation,
  DocumentCardTitle,
  DocumentCardType
} from 'office-ui-fabric-react/lib/DocumentCard';
import { autobind, css, KeyCodes } from 'office-ui-fabric-react/lib/Utilities';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { ICardTileProps } from './ICardTile.Props';
import './DocumentCardTile.scss';

export class DocumentCardTile extends React.Component<ICardTileProps, {}> {
  public render(): JSX.Element {
    const { ariaLabel, ariaDescribedByElementId, useCompactDocumentCard } = this.props;
    return (
      <div className='ms-DocumentCardTile' data-is-focusable={ true } onKeyDown={ this._onKeyDown } role='gridcell'
        aria-label={ ariaLabel } aria-describedby={ ariaDescribedByElementId }>
        <FocusZone
          direction={ FocusZoneDirection.vertical }>
          { useCompactDocumentCard ? this._renderCompactDocumentCard() : this._renderNormalDocumentCard() }
        </FocusZone>
      </div>
    );
  }

  @autobind
  private _renderCompactDocumentCard() {
    const {
      people,
      activity,
      previewImages,
      getOverflowDocumentCountText,
      title,
      onClick,
      onClickHref,
      customIconAcronym,
      customIconBgColor,
      className
    } = this.props.item;

    const showPreview = !customIconAcronym || !customIconBgColor;

    return (
      <DocumentCard onClick={ onClick } onClickHref={ onClickHref } type={ DocumentCardType.compact } className={ className }>
        { showPreview &&
          <DocumentCardPreview
            previewImages = { previewImages }
            getOverflowDocumentCountText={ getOverflowDocumentCountText }/>
        }
        { !showPreview && this._renderCustomIconPreview(customIconBgColor, customIconAcronym) }
        <div className='ms-DocumentCard-details'>
          <DocumentCardTitle title={ title } shouldTruncate={ true }/>
          { people && people.length > 0 &&
            <DocumentCardActivity
              activity={ activity }
              people={ people }/>
          }
        </div>
      </DocumentCard>
    );
  }

  @autobind
  private _renderNormalDocumentCard() {
    const {
      people,
      activity,
      previewImages,
      getOverflowDocumentCountText,
      title,
      location,
      locationHref,
      hideLocation,
      locationOnClick,
      onClick,
      onClickHref,
      customIconAcronym,
      customIconBgColor,
      className
    } = this.props.item;

    const showPreview = !customIconAcronym || !customIconBgColor;

    // The accentColor prop has been deprecated and will be removed from the next major release of Fabric React.
    // So for now it needs to be set to #eaeaea, but soon it won’t be needed at all.
    if (previewImages) {
      for (let previewImage of previewImages) {
        previewImage.accentColor = '#eaeaea';
      }
    }

    return (
      <DocumentCard onClick={ onClick } onClickHref={ onClickHref } className={ className }>
        { showPreview &&
          <DocumentCardPreview
            previewImages = { previewImages }
            getOverflowDocumentCountText={ getOverflowDocumentCountText }/>
        }
        { !showPreview && this._renderCustomIconPreview(customIconBgColor, customIconAcronym) }
        <div className={ css({ 'has-location': !!location && !hideLocation }, 'ms-DocumentCardTile-titleArea') }>
          { location && !hideLocation &&
            <DocumentCardLocation location={ location } onClick={ locationOnClick } locationHref={ locationHref }/>
          }
          {
            title ?
              <DocumentCardTitle title={ title } shouldTruncate={ true }/> :
              <DocumentCardTitle title={ title } shouldTruncate={ false }/>
          }
        </div>
        { people && people.length > 0 &&
          <DocumentCardActivity
            activity={ activity }
            people={ people }/>
        }
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

  private _renderCustomIconPreview(customIconBgColor: string, customIconAcronym: string) {
    return (
      <div className='ms-DocumentCardPreview ms-DocumentCardTile-customIconPreview'>
        <div
          role='presentation'
          aria-hidden='true'
          className='ms-DocumentCardTile-customIcon'
          style={ { 'backgroundColor': customIconBgColor } } >
          { customIconAcronym }
        </div>
      </div>
    )
  }
}

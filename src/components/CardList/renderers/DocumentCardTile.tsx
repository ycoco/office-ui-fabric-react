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
  DocumentCardTitle
} from 'office-ui-fabric-react/lib/DocumentCard';
import { KeyCodes } from 'office-ui-fabric-react/lib/utilities/KeyCodes';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { css } from 'office-ui-fabric-react/lib/utilities/css';
import { ICardTileProps } from './ICardTile.Props';
import './DocumentCardTile.scss';

export class DocumentCardTile extends React.Component<ICardTileProps, {}> {
  constructor() {
    super();
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  public render(): JSX.Element {
    const {
      people,
      activity,
      previewImages,
      title,
      location,
      locationHref,
      hideLocation,
      locationOnClick,
      onClick,
      onClickHref
    } = this.props.item;
    const { ariaLabel, ariaDescribedByElementId } = this.props;

    return (
      <div className='ms-DocumentCardTile' data-is-focusable={ true } onKeyDown={ this._onKeyDown } role='gridcell'
        aria-label={ ariaLabel } aria-describedby={ ariaDescribedByElementId }>
        <FocusZone
          direction={ FocusZoneDirection.vertical }>
          <DocumentCard onClick={ onClick } onClickHref={ onClickHref}>
            <DocumentCardPreview previewImages = { previewImages }/>
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

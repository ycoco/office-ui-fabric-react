/**
 * @copyright Microsoft Corporation. All rights reserved.
 *
 * @file Site Activity List component that will render rencent activities
 * each activity is rendered as Activity Tile component.
 */

import * as React from 'react';
import { List } from 'office-ui-fabric-react/lib/List';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { ImageFit } from 'office-ui-fabric-react/lib/Image';
import { KeyCodes } from 'office-ui-fabric-react/lib/utilities/KeyCodes';
import { ResponsiveMode, withResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { css } from 'office-ui-fabric-react/lib/utilities/css';
import { ICardListProps, ICardItem, CardType } from './CardList.Props';
import { DocumentCardTile } from './renderers/DocumentCardTile';
import { TipTile } from './renderers/TipTile';
import './CardList.scss';

const DEFAULT_ITEM_COUNT_PER_PAGE: number = 10;
const ARIA_DESCRIPTION_SPAN_ID: string = 'CardListDesc_ea223a47-285b-4aad-af20-eb67d5257904';

// need to be in sync with variables in CardList.scss
const CARD_MARGIN: number = 20;
const CARD_MARGIN_MOBILE: number = 4;
const CARD_MIN_WIDTH: number = 206;
const CARD_MIN_WIDTH_MOBILE: number = 138;
const CARD_MAX_WIDTH: number = 260;
const TILE_NON_PREVIEW_HEIGHT: number = 140; // need to be in sync with DocumentCardTile.scss
const TILE_NON_PREVIEW_HEIGHT_MOBILE: number = 124; // need to be in sync with DocumentCardTile.scss

@withResponsiveMode
export class CardList extends React.Component<ICardListProps, {}> {
  private _tileWidth: number;
  private _tileHeight: number;
  private _previewImageHeight: number;

  constructor(props: ICardListProps) {
    super(props);

    this._onRenderCell = this._onRenderCell.bind(this);
    this._getItemCountForPage = this._getItemCountForPage.bind(this);
  }

  public render(): JSX.Element {
    const {
      items,
      title,
      ariaDescription,
      ariaLabelForGrid
    } = this.props;

    return (
      <div className={ css(
        'ms-CardList',
        { 'ms-CardList-lgDown': this.props.responsiveMode <= ResponsiveMode.large }
      ) } role='grid'  aria-label={ ariaLabelForGrid }>
        { title && <h2 className='ms-CardList-title'>{ title }</h2> }
        { ariaDescription && <span className='hiddenSpan' id={ ARIA_DESCRIPTION_SPAN_ID } role='presentation'> { ariaDescription }</span> }
        <FocusZone
          direction={ FocusZoneDirection.horizontal }
          isCircularNavigation={ true }
          isInnerZoneKeystroke={ (ev) => (ev.which === KeyCodes.down) }>
          <Fabric>
            <List
              items={ items }
              onRenderCell={ this._onRenderCell }
              getItemCountForPage={ this._getItemCountForPage }
              />
            </Fabric>
          </FocusZone>
        </div>
    );
  }

  /**
   * render each item using different CardTile based on the card type.
   */
  private _onRenderCell(item: ICardItem, index: number): React.ReactNode {
    const { getAriaLabel, ariaDescription } = this.props;
    const ariaLabel = getAriaLabel ? getAriaLabel(item, index) : null;
    const ariaDescribedByElementId = ariaDescription ? ARIA_DESCRIPTION_SPAN_ID : null;
    if (item.previewImages && item.previewImages.length > 0) {
      for (const previewImage of item.previewImages) {
        if (previewImage.imageFit === ImageFit.center) {
          // For ImageFit center to work, it require to have width and height.
          // We need to use the latest tileWidth and previewImageHeight we calculated in _getItemCountForPage
          previewImage.width = this._tileWidth;
          previewImage.height = this._previewImageHeight;
        } else {
          // we need to set width to ensure it will scale using width
          previewImage.width = this._tileWidth;
        }
      }
    }

    return (
      <div style={ { width: this._tileWidth, height: this._tileHeight } }>
        { item.cardType === CardType.TipTile ?
          <TipTile
            item={ item }
            ariaLabel={ ariaLabel }
            ariaDescribedByElementId={ ariaDescribedByElementId }>
          </TipTile> :
          <DocumentCardTile
            item={ item }
            ariaLabel={ ariaLabel }
            ariaDescribedByElementId={ ariaDescribedByElementId }>
          </DocumentCardTile>
        }
        </div>
    );
  }

  /**
   * This function will be called when list surface rectangle is changed.
   * Since we render each item as a tile and each row can render multiple items,
   * we need to calculate how many items can fit into one row and need to make
   * sure that item count for page is multiplier of items per row.
   * @example if current surface can only fit 4 items per row, the item count for page
   * should be 12 but not 10. otherwise the last row in each page will have empty space
   * at the end.
   */
  private _getItemCountForPage(itemIndex: number, surfaceRect: ClientRect): number {
    const rowWidth: number = surfaceRect ? surfaceRect.width : 0;
    let minWidth: number = CARD_MIN_WIDTH;
    let margin: number = CARD_MARGIN;
    let nonPreviewAreaHeight: number = TILE_NON_PREVIEW_HEIGHT;
    let itemCount: number = DEFAULT_ITEM_COUNT_PER_PAGE;

    if (this.props.responsiveMode === ResponsiveMode.small) {
      minWidth = CARD_MIN_WIDTH_MOBILE;
      margin = CARD_MARGIN_MOBILE;
      nonPreviewAreaHeight = TILE_NON_PREVIEW_HEIGHT_MOBILE;
    }

    if (rowWidth) {
      // try to fit as many items per row as possible using min width
      const itemCountPerRow: number = Math.floor((rowWidth + margin) /
        (minWidth + margin)) || 1;
      itemCount = Math.ceil(itemCount / itemCountPerRow) * itemCountPerRow;

      // calculate actual tile width based on the itemCount per row
      this._tileWidth = Math.min((rowWidth / itemCountPerRow - margin), CARD_MAX_WIDTH);

      // calculate actual tile height based on the tile width and
      // keep the preview height to width ratio equal to 9/16
      this._previewImageHeight = Math.floor(this._tileWidth * 9 / 16);
      this._tileHeight = this._previewImageHeight + nonPreviewAreaHeight;
    }

    return itemCount;
  }
}

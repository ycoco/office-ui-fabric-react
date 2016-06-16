import * as React from 'react';
import { IWithResponsiveModeState } from '@ms/office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { IDocumentCardActivityPerson } from '@ms/office-ui-fabric-react/lib/DocumentCard';
import { CardList } from './CardList';

export interface ICardListProps extends React.Props<CardList>, IWithResponsiveModeState {
  /**
   * Items to render.
   */
  items: ICardItem[];

  /**
   * Title to render above the list.
   */
  title?: string;
}

export enum CardType {
  /**
   * Render document information in DocumentCardTile.
   */
  DocumentCardTile,

  /**
   * Render tip information in TipTile.
   */
  TipTile
}

export interface ICardItem {
  /**
   * Card type used to render Item.
   * @default DocumentCardTile
   */
  cardType?: CardType;

  /**
   * Function to call when the card is clicked.
   */
  onClick?: (ev?: any) => void;

  /**
   * A URL to navigate to when the card is clicked. If a function has also been provided,
   * it will be used instead of the URL.
   */
  onClickHref?: string;

  /**
   * Path to the preview image.
   */
  previewImageSrc?: string;

  /**
   * Path to the icon associated with this document type.
   */
  iconSrc?: string;

  /**
   * Hex color value of the line below the preview, which should correspond to the document type.
   */
  accentColor?: string;

  /**
   * Text for the location of the document.
   */
  location?: string;

  /**
   * URL to navigate to for this location.
   */
  locationHref?: string;

  /**
   * Function to call when the location is clicked.
   */
  locationOnClick?: (ev?: any) => void;

  /**
   * Whether we hide the location.
   */
  hideLocation?: boolean;

  /**
   * Title text.
   */
  title?: string;

  /**
   * One or more people who are involved in this document card activity.
   */
  people?: IDocumentCardActivityPerson[];

  /**
   * Describes the activity that has taken place, such as "Created Feb 23, 2016".
   */
  activity?: string;

  /**
   * Describes the tip detail, such as "Use lists to keep team activities organized."
   */
  tipDetailContent?: string;

  /**
   * The icon for tip action button.
   */
  tipActionButtonIcon?: string;

  /**
   * The label shown on the action button.
   */
  tipActionLabel?: string;
}

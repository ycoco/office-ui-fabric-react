import * as React from 'react';
import { IWithResponsiveModeState } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { IDocumentCardActivityPerson, IDocumentCardPreviewImage } from 'office-ui-fabric-react/lib/DocumentCard';
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

  /**
   * Aria description for the list. If provided, list will have a hidden span contains this aria description.
   * And all the cards in the list have aria-describedby attribute pointing to that hidden span.
   * This can be some additional information about the list and how user can interact with the list.
   * Such as 'Use right and left arrow keys to navigate through cards.'
   */
  ariaDescription?: string;

  /**
   * Function to get aria label for the Card in the list.
   */
  getAriaLabel?: (item: ICardItem, index?: number) => string;

  /** Aria label for grid in card list. */
  ariaLabelForGrid?: string;

  /**
   * Whether to use compact document card.
   * If not provided, we will auto use compact document card when it is at a small break point
   */
  useCompactLayout?: boolean;

  /**
   * Function to call when the item to render is missing.
   */
  onRenderMissingItem?: (index?: number) => React.ReactNode;
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
   * One or more preview images to display.
   */
  previewImages?: IDocumentCardPreviewImage[];

  /**
   * The function return string that will describe the number of overflow documents.
   * such as  (overflowCount: number) => `+${ overflowCount } more`,
   */
  getOverflowDocumentCountText?: (overflowCount: number) => string;

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

  /**
   * 2-letter put in the center of the logo. This is for the case don't have previewImages.
   */
  customIconAcronym?: string;

  /**
   * Background color for the logo. This is for the case don't have previewImages.
   */
  customIconBgColor?: string;
}

import { ICardItem } from '../CardList.Props';

export interface ICardTileProps {
  /**
   * Item to render.
   */
  item?: ICardItem;

  /**
   * Aria label for the Card
   */
  ariaLabel?: string;

  /**
   * Element id that will be used in the CardTile aria-describedby attribue.
   */
  ariaDescribedByElementId?: string;
}

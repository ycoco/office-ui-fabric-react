import { ICardItem } from '../CardList.Props';

export interface ICardTileProps {
  /**
   * Item to render.
   */
  item?: ICardItem;
  /**
   * If provided, forces the preview image to be this width.
   */
  previewImageWidth?: number;

  /**
   * If provided, forces the preview image to be this height.
   */
  previewImageHeight?: number;
}

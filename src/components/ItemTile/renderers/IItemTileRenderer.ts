import { IItemTileProps } from '../ItemTile.Props';

export interface IItemTileRenderer {
  render: (props: IItemTileProps) => JSX.Element;
}

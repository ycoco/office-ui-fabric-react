import { IItemTileProps } from '../ItemTile.props';

export interface IItemTileRenderer {
  render: (props: IItemTileProps) => JSX.Element;
}

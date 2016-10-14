export interface IFolderProps {
  /**
   * The size in pixels for the width/height of the folder to render.
   * @default 16
   */
  size?: number;

  /**
   * The style-safe color of the folder background.
   * @default '#3d3d3d'
   */
  color?: string;

  /**
   * Optional classname to attach to the root foler.
   */
  className?: string;
}
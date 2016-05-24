
/**
 * The width and height of a tile is set to this if left unspecified.
 * The size is in measured in pixels.
 */
export const DEFAULT_ICON_CELLSIZE = 192;

/**
 * Used to determine which icon should be displayed in the subtext of a tile.
 */
export enum SubTextIconType {
  sharing,
  notify,
  block,
  playButton,
  badPhoto,
  none
};

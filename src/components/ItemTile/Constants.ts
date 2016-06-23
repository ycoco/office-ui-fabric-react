/**
 * The width and height of a tile is set to this if left unspecified.
 * The size is in measured in pixels.
 */
export const DEFAULT_ICON_CELLSIZE = 192;

/**
 * The classname to be added to itemTiles that are currently drop targets.
 */
export const DEFAULT_DROPPING_CSS_CLASS = 'is-dropping';

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
}

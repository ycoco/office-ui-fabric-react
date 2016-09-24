export interface IEditNavContextMenuProps {
  /**
   * List of menu items.
   */
  menuItems: IEditNavContextMenuItem[];
  /**
   * Element to anchor the callout to.
   */
  targetElement?: HTMLElement;
  /**
   * on dismiss callback function
   */
  onDismiss?: Function;
}

export interface IEditNavContextMenuItem {
  /**
   * command name string.
   */
  name: string;
  /**
   * command key string.
   */
  key: string;
  /**
   * command onClick callback function
   */
  onClick?: Function;
}

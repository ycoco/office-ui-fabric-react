import { IBaseProps } from 'office-ui-fabric-react/lib/Utilities';
import { INavLinkGroup, INavLink } from 'office-ui-fabric-react/lib/Nav';
import { EditNavDataCache } from './EditNavDataCache';
import { IEditNavCalloutProps } from './EditNavCallout/EditNavCallout.Props';

export interface IEditNavProps extends IBaseProps {
  /**
   * A collection of link groups to display in the navigation bar
   */
  groups?: IEditNavLinkGroup[];
  /**
   * Data cache that manages edited data.
   */
  dataCache?: EditNavDataCache;

  /**
   * Used to customize how content inside the link tag is rendered
   * @defaultvalue Default link rendering
   */
  onRenderLink?: Function;
  /**
   * EditNav component Save button callback
   */
  onSave?: Function;
  /**
   * EditNav component Cancel button callback
   */
  onCancel?: Function;

  /**
   * Indicates whether the navigation component renders on top of other content in the UI
   */
  isOnTop?: boolean;

  /**
   * Indicates the orientation of the items in the Nav
   * default: false (means default is vertical)
   */
  horizontal?: boolean;

  /**
   * (EditNav panel): save button label
   */
  saveButtonLabel?: string;

  /**
   * (EditNav panel): cancel button label
   */
  cancelButtonLabel?: string;

  /**
   * Text for expand button state
   */
  expandedStateText?: string;

  /**
   * (EditNav Callout): Add link title.
   */
  addLinkTitle?: string;

  /**
   * (EditNav Callout): Edit link title.
   */
  editLinkTitle?: string;

  /**
   * (EditNav): ariaLabelContextMenu.
   */
  ariaLabelContextMenu?: string;

  /**
   * Properties to pass through to EditNavCallout.
   */
  editNavCalloutProps?: IEditNavCalloutProps;

  /**
   * Properties to pass through to EditNavContextMenu.
   */
  editNavContextMenuProps?: IEditNavContextMenuStringProps;
  /**
   * aris label for the EditNav panel.
   */
  ariaLabel?: string;
}

export interface IEditNavContextMenuStringProps {
  /**
   * (EditNav ContextMenu): Edit text
   */
  editText?: string;

  /**
  * (EditNav ContextMenu): MoveUp text
  */
  moveupText?: string;

  /**
   * (EditNav ContextMenu): MoveDown text
   */
  movedownText?: string;
  /**
   * (EditNav ContextMenu): Remove text
   */
  removeText?: string;

  /**
   * (EditNav ContextMenu): indentLink text
   */
  indentlinkText?: string;
  /**
   * (EditNav ContextMenu): promoteLink text
   */
  promotelinkText?: string;
}

export interface IEditNavLinkGroup extends INavLinkGroup {
  /**
   * Links to render within this group
   */
  links: IEditNavLink[];
}

export interface IEditNavLink extends INavLink {
  /**
   * used in edit mode, Mark if current link is deleted
   */
  isDeleted?: boolean;
  /**
   * used in edit mode, order position
   */
  position?: number;
  /**
   * Whether or not the link is in an expanded state
   */
  isExpanded?: boolean;
  /**
   * used in edit mode, Whether or not the link contextMenu is in visible state
   */
  isContextMenuVisible?: boolean;
  /**
   * used in edit mode Whether or not the link callout is in visible state
   */
  isCalloutVisible?: boolean;
  /**
   * used in edit mode Whether or not the link is sublink
   */
  isSubLink?: boolean;
  /**
   * used in edit mode, Mark if current link is opened in a new browser tab.
   */
  openInNewTab?: boolean;
}
import * as React from 'react';
import { SitePermissions } from './SitePermissions';
import { PersonaInitialsColor } from 'office-ui-fabric-react/lib/Persona';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';
import { PermissionLevel } from '../../containers/SitePermissions/SitePermissionsStateManager';

export interface ISitePermissionsProps extends React.Props<SitePermissions> {
  /**
   * Site Title
   */
  title: string;

  /**
   * Array of ISitePersona that define each Persona.
   */
  personas?: ISitePersonaPermissions[];

  /**
   * List of menu items.
   */
  menuItems?: IContextualMenuItem[];

  /**
   * Permission level.
   */
  permLevel?: PermissionLevel;

  /**
   * Element to anchor the control to.
   */
  targetElement?: HTMLElement;
}

export interface ISitePersonaPermissions {
  /**
   * Name of the person.
   */
  name?: string;

  /**
   * Url to the image to use, should be a square aspect ratio and big enough to fit in the image area.
   */
  imageUrl?: string;

  /**
   * The user's initials to display in the image area when there is no image.
   */
  imageInitials?: string;

  /**
   * The background color when the user's initials are displayed.
   * @defaultvalue PersonaInitialsColor.blue
   */
  initialsColor?: PersonaInitialsColor;

    /**
   * List of menu items.
   */
  menuItems?: IContextualMenuItem[];
}
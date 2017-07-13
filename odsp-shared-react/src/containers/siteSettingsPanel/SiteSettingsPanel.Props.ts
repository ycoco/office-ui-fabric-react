import * as React from 'react';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ISiteSettingsPanelStrings, DepartmentDisplayType } from '../../components/SiteSettingsPanel';

export { DepartmentDisplayType };

/**
 * The state of the site header container control
 */
export interface ISiteSettingsPanelContainerState {
  /** Value of the 'Name' text box */
  name?: string;

  /** Value of the 'Description' text box */
  description?: string;

  /** Available values for the 'Privacy' drop-down */
  privacyOptions?: IDropdownOption[];

  /** Key of the initially selected privacy option. */
  privacySelectedKey?: string;

  /** Available values for the 'Business Classification' drop-down */
  classificationOptions?: IDropdownOption[];

  /** Key of the initially selected classification option. */
  classificationSelectedKey?: string;

  /**
   * URL of the site logo image
   */
  siteLogoUrl?: string;

  /**
   * The metadata about the site acronym containing the acronym
   * and the colors.
   */
  siteAcronym?: string;

  /**
   * The site logo color.
   */
  siteLogoColor?: string;

  /**
   * The department this site should be associated with.
   */
  departmentUrl?: string;

  /**
   * Settings panel is waiting for data
   */
  isLoading?: boolean;

  /**
   * Error message available when saving has failed
   */
  errorMessage?: string;

  /** Optional error message to render when group deletion fails. */
  groupDeleteErrorMessage?: string;

  /** URL of the usage guidelines page */
  usageGuidelinesUrl?: string;

  /** Has EXO picture URL */
  hasPictureUrl?: boolean;
}

/**
 * Holds the params of the manager that controls the state
 * of the SiteSettingsPanel.
 */
export interface ISiteSettingsPanelContainerStateManagerParams {
  /** The SiteSettingsPanelContainer object */
  siteSettingsPanelContainer: React.Component<{}, ISiteSettingsPanelContainerState>;

  /** Contextual information for the current host */
  pageContext: ISpPageContext;

  /** Host supports image picking */
  enableImagePicker?: boolean;

  /** Determines the shown/hidden and enabled/disabled state of the department text field. */
  departmentDisplayType?: DepartmentDisplayType;

  /** URL of the "empty image" placeholder */
  emptyImageUrl?: string;

  /** Deleting the site/group is supported. */
  enableDelete?: boolean;

  /** Collection of localized strings to show in the site settings panel UI */
  strings: ISiteSettingsContainerStateManagerStrings;
}

/** Collection of localized strings to show in the site settings panel UI */
export interface ISiteSettingsContainerStateManagerStrings extends ISiteSettingsPanelStrings {
  /** Drop-down privacy option for Private group */
  privacyOptionPrivate: string;

  /** Drop-down privacy option for Public group */
  privacyOptionPublic: string;
}
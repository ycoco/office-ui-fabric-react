import * as React from 'react';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';

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
   * Settings panel is waiting for data
   */
  isLoading?: boolean;

  /**
   * Error message available when saving has failed
   */
  errorMessage?: string;
}

/**
 * Holds the params of the manager that controls the state
 * of the SiteSettingsPanel.
 */
export interface ISiteSettingsPanelContainerStateManagerParams {
  /** The SiteSettingsPanelContainer object */
  siteSettingsPanel: React.Component<any, ISiteSettingsPanelContainerState>;

  /** Contextual information for the current host */
  pageContext: ISpPageContext;

  /** Collection of localized strings to show in the site settings panel UI */
  strings: {
    /** Text for the title header of the site settings panel */
    title: string;

    /** Label on the 'Name' text box */
    nameLabel: string;

    /** Label on the 'Description' text box */
    descriptionLabel: string;

    /** Label on the 'Privacy' drop-down */
    privacyLabel: string;

    /** Label on the 'Business classification' drop-down */
    classificationLabel: string;

    /** Drop-down privacy option for Private group */
    privacyOptionPrivate: string;

    /** Drop-down privacy option for Public group */
    privacyOptionPublic: string;

    /** Caption on the 'Save' button */
    saveButton: string;

    /** Caption on the 'Close' button */
    closeButton: string;
  };
}
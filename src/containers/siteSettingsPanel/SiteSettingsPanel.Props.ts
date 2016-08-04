import * as React from 'react';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import IContext from '@ms/odsp-datasources/lib/dataSources/base/IContext';

/**
 * The state of the site header container control
 */
export interface ISiteSettingsPanelContainerState {
  // TODO: logoUrl

  /** Value of the 'Name' text box */
  name?: string;

  /** Value of the 'Description' text box */
  description?: string;

  /** Available values for the 'Privacy' drop-down */
  privacyOptions?: IDropdownOption[];

  /** Available values for the 'Business Classification' drop-down */
  classificationOptions?: IDropdownOption[];
}

/**
 * Holds the params of the manager that controls the state
 * of the SiteSettingsPanel.
 */
export interface ISiteSettingsPanelContainerStateManagerParams {
  /** The SiteSettingsPanelContainer object */
  siteSettingsPanel: React.Component<any, ISiteSettingsPanelContainerState>;

  /** Contextual information for the current host */
  context: IContext;

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
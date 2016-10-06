import * as React from 'react';
import { SiteSettingsPanel } from './SiteSettingsPanel';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

export interface ISiteSettingsPanelProps extends React.Props<SiteSettingsPanel> {
  /** Value of the 'Name' text box. */
  name?: string;

  /** Value of the 'Description' text box. */
  description?: string;

  /** Available values for the 'Privacy' drop-down. */
  privacyOptions?: IDropdownOption[];

  /** Available values for the 'Business Classification' drop-down. */
  classificationOptions?: IDropdownOption[];

  /** Displays a spinner indicating that the panel is loading data. */
  showLoadingSpinner?: boolean;

  /** Optional error message to render when saving fails. */
  errorMessage?: string;

  /**
   * Logo for the site.
   */
  siteLogo?: {
    /**
     * Url to site logo image, if there is one.
     */
    imageUrl?: string;

    /**
     * 2-letter acronym used for the site.
     */
    acronym?: string;

    /**
     * Background color for site logo.
     */
    backgroundColor?: string;
  };

  /** Collection of localized strings to show in the site settings panel UI. */
  strings: {
    /** Text for the title header of the site settings panel. */
    title: string;

    /** Label on the 'Name' text box. */
    nameLabel: string;

    /** Label on the 'Description' text box. */
    descriptionLabel: string;

    /** Label on the 'Privacy' drop-down. */
    privacyLabel: string;

    /** Label on the 'Business classification' drop-down. */
    classificationLabel: string;

    /** Caption on the 'Save' button. */
    saveButton: string;

    /** Caption on the 'Close' button. */
    closeButton: string;
  };

  /**
  * Event handler for when the panel is closed.
  */
  onDismiss?: () => void;

  /**
  * Event handler for when Save button is clicked.
  */
  onSave?: (title: string, description: string, privacy: IDropdownOption, classification: IDropdownOption) => void;
}
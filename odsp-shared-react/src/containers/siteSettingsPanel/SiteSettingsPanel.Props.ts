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

  /** URL of the "empty image" placeholder */
  emptyImageUrl?: string;

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

    /** Screen reader text for close buttons on panels and dialogs */
    closeButtonAriaLabel?: string;

    /** Text label for the footer of the Panel that directs user to the full site settings
     * "{0}" within string will designate position of Site Settings link within text.
     */
    classicSiteSettingsHelpText?: string;

    /** Text label for the link to the classic site settings, rendered within siteSettingsHelpText wherever "{0}" is found */
    classicSiteSettingsLinkText?: string;

    /** Text label for the optional link to usage guidelines */
    usageGuidelinesLinkText?: string;

    /** Text label for the link to delete the current Group */
    deleteGroupLinkText?: string;

    /** Text label for the confirmation dialog to delete the current Group */
    deleteGroupConfirmationDialogText?: string;

    /** Title for the confirmation dialog to delete the current Group */
    deleteGroupConfirmationDialogTitle?: string;

    /** Label for the user acknowledgement checkbox within the Group delete confirmation dialog */
    deleteGroupConfirmationDialogCheckbox?: string;

    /** Caption for the 'Delete' button in the Delete Group confirmation dialog */
    deleteGroupConfirmationDialogButtonDelete?: string;

    /** Caption for the 'Cancel' button in the Delete Group confirmation dialog */
    deleteGroupConfirmationDialogButtonCancel?: string;

    /** Caption for the 'Change' button that launches a file browser to choose a new image */
    changeImageButton?: string;

    /** Caption for the 'Remove' button that removes the newly chosen image */
    removeImageButton?: string;
  };
}
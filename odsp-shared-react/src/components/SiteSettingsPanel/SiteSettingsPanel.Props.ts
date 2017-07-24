import * as React from 'react';
import { SiteSettingsPanel } from './SiteSettingsPanel';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IClassificationDescriptionItem } from '@ms/odsp-datasources/lib/GroupSite';

export interface ISiteSettingsPanelProps extends React.Props<SiteSettingsPanel> {
  /** Value of the 'Name' text box. */
  name?: string;

  /** Value of the 'Description' text box. */
  description?: string;

  /** Available values for the 'Privacy' drop-down. */
  privacyOptions?: IDropdownOption[];

  /** Key of the initially selected privacy option. */
  privacySelectedKey?: string;

  /** Available values for the 'Business Classification' drop-down. */
  classificationOptions?: IDropdownOption[];

  /** Key of the initially selected classification option. */
  classificationSelectedKey?: string;

  /** Displays a spinner indicating that the panel is loading data. */
  showLoadingSpinner?: boolean;

  /** Enables site image selection, otherwise only displays image as read-only */
  showImageBrowser?: boolean;

  /** Determines the shown/hidden and enabled/disabled state of the department text field. */
  departmentDisplayType?: DepartmentDisplayType;

  /** Deleting the site/group is supported. */
  enableDelete?: boolean;

  /** Optional error message to render when saving fails. */
  errorMessage?: string;

  /** Optional error message to render when group deletion fails. */
  groupDeleteErrorMessage?: string;

  /** URL of the classic site settings page */
  classicSiteSettingsUrl?: string;

  /** URL of the usage guidelines page */
  usageGuidelinesUrl?: string;

  /** URL of the "empty image" placeholder */
  emptyImageUrl?: string;

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

  /** Department this site belongs to. */
  departmentUrl?: string;

  /** Collection of localized strings to show in the site settings panel UI. */
  strings: ISiteSettingsPanelStrings;

  /**
  * Event handler for when the panel is closed.
  */
  onDismiss?: () => void;

  /**
  * Event handler for when Save button is clicked.
  */
  onSave?: (title: string, description: string, privacy: IDropdownOption, classification: IDropdownOption, imageFile?: File, departmentUrl?: string) => void;

  /**
   * Event handler for when the Delete group link is clicked and user has confirmed deletion.
   */
  onDeleteGroup?: () => void;

  /**
   * Event handler for when the Delete group link is clicked and user has closed the delete confirmation dialog.
   */
  onDeleteGroupDismiss?: () => void;

  /** 
   * Array of classification description items 
   */
  classificationDescriptions?: IClassificationDescriptionItem[];
}

export interface ISiteSettingsPanelStrings {
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

  /** Label on the text box for setting the department URL. */
  departmentLabel?: string;

  /** Caption on the 'Save' button. */
  saveButton: string;

  /** Caption on the 'Close' button. */
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

  /** Label text for data classification descriptions */
  dataClassificationDescriptionsLabel?: string;

  /** The text for dismiss button of classification description panel */
  dataClassificationDescriptionDismissButtonText?: string;

  /** Title text for data classification descriptions */
  dataClassificationDescriptionsTitle?: string;
}

export const enum DepartmentDisplayType {
  hidden, // don't change order--this option should be 0
  readOnly,
  enabled
}

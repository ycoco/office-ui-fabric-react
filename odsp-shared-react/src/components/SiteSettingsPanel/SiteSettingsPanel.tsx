import './SiteSettingsPanel.scss';
import * as React from 'react';
import { ISiteLogo } from '../SiteLogo/SiteLogo.Props';
import { ISiteSettingsPanelProps, DepartmentDisplayType } from './SiteSettingsPanel.Props';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { ImagePreview, IImagePreviewProps, IImageSelectedResponse } from '../ImagePreview/index';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { LocalFileReader } from '@ms/odsp-datasources/lib/File';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { SiteLogo } from '../SiteLogo/SiteLogo';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');

const IMAGE_SIZE = 96;

export interface ISiteSettingsPanelState {
  showPanel?: boolean;
  privacySelectedKey?: string | number;
  classificationSelectedKey?: string | number;
  showSavingSpinner?: boolean;
  showDeletingSpinner?: boolean;
  saveButtonDisabled?: boolean;
  deleteConfirmationCheckboxChecked?: boolean;
  showDeleteConfirmationDialog?: boolean;
}

export class SiteSettingsPanel extends React.Component<ISiteSettingsPanelProps, ISiteSettingsPanelState> {
  public refs: {
    [key: string]: React.ReactInstance,
    nameText: TextField,
    descriptionText: TextField,
    privacyDropdown: Dropdown,
    classificationDropdown: Dropdown,
    departmentText: TextField,
    imageBrowser: ImagePreview,
    fileBrowser: React.ReactInstance
  };

  constructor(props: ISiteSettingsPanelProps) {
    super(props);

    this.state = {
      showPanel: true, // panel is initially open
      privacySelectedKey: undefined,
      classificationSelectedKey: undefined
    };

    Engagement.logData({ name: 'SiteSettingsPanel.Opened' });
  }

  public componentWillReceiveProps(nextProps: ISiteSettingsPanelProps) {
    if (nextProps.errorMessage || nextProps.groupDeleteErrorMessage) {
      // if saving error encountered, re-enable controls so user can try again
      this.setState({
        showSavingSpinner: false,
        showDeletingSpinner: false,
        saveButtonDisabled: false
      });
    }

    // Need to maintain the state of the dropdown option selection since it's not
    // handled internally by Dropdown. Initialize their state when loading is complete, then
    // will remember the state when user changes it.
    if (!nextProps.showLoadingSpinner) {
      if (this.state.privacySelectedKey === undefined) {
        this.setState({ privacySelectedKey: nextProps.privacySelectedKey });
      }

      if (this.state.classificationSelectedKey === undefined) {
        this.setState({ classificationSelectedKey: nextProps.classificationSelectedKey });
      }
    }
  }

  public render(): React.ReactElement<ISiteSettingsPanelProps> {
    // TODO: Move Save/Close buttons to top of panel (above panel header)
    //       (Currently unsupported by Office-Fabric-React Panel)

    const {
      props,
      props: {
        classificationOptions,
        departmentDisplayType,
        name,
        privacyOptions,
        siteLogo,
        strings,
      },
      state
    } = this;

    const siteLogoProps: ISiteLogo = siteLogo ? {
      siteTitle: name,
      siteLogoUrl: siteLogo.imageUrl,
      siteAcronym: siteLogo.acronym,
      siteLogoBgColor: siteLogo.backgroundColor,
      disableSiteLogoFallback: false
    } : void 0;

    let helpTextFooter = this._renderHelpTextFooter();
    let usageLink = this._renderUsageLink();
    let deleteGroupLink = this._renderDeleteGroupLink();
    let deleteGroupConfirmationDialog = this._renderDeleteConfirmationDialog();
    let imageBrowser = this._renderImageBrowser();

    return (
      <Panel
        className='ms-SiteSettingsPanel'
        isOpen={ state.showPanel }
        type={ PanelType.smallFixedFar }
        onDismiss={ this._closePanel }
        isLightDismiss={ true }
        closeButtonAriaLabel={ strings.closeButtonAriaLabel }
        headerText={ strings.title }
      >
        { props.showLoadingSpinner ? <Spinner /> :
          <div className='ms-SiteSettingsPanel'>
            <div className='ms-SiteSettingsPanel-SiteLogo' data-automationid='SiteSettingsPanelSiteLogo'>
              {
                siteLogoProps && !props.showImageBrowser ? <SiteLogo { ...siteLogoProps} /> : null
              }
              { imageBrowser }
            </div>
            { usageLink }
            <div className='ms-SiteSettingsPanel-SiteInfo' data-automationid='SiteSettingsPanelSiteInfo'>
              <TextField
                ref='nameText'
                label={ strings.nameLabel }
                defaultValue={ name }
                onChanged={ this._onNameTextChanged }
                required
                data-automationid='SiteSettingsPanelNameText'
              />
              <TextField
                ref='descriptionText'
                label={ strings.descriptionLabel }
                defaultValue={ props.description }
                multiline
                resizable={ false }
                data-automationid='SiteSettingsPanelDescriptionText'
              />
              { privacyOptions && privacyOptions.length ?
                <Dropdown
                  className='ms-SiteSettingsPanel-PrivacyDropdown'
                  ref='privacyDropdown'
                  label={ strings.privacyLabel }
                  options={ privacyOptions }
                  selectedKey={ state.privacySelectedKey }
                  onChanged={ this._onPrivacyOptionChanged }
                /> : null }
              { classificationOptions && classificationOptions.length ?
                <Dropdown
                  className='ms-SiteSettingsPanel-ClassificationDropdown'
                  ref='classificationDropdown'
                  label={ strings.classificationLabel }
                  options={ classificationOptions }
                  selectedKey={ state.classificationSelectedKey }
                  onChanged={ this._onClassificationOptionChanged }
                /> : null }
              { departmentDisplayType ?
                <TextField
                  ref='departmentText'
                  label={ strings.departmentLabel }
                  value={ props.departmentUrl }
                  resizable={ false }
                  readOnly={ departmentDisplayType === DepartmentDisplayType.readOnly }
                /> : null }
              { props.errorMessage ?
                <div className='ms-SiteSettingsPanel-ErrorMessage' data-automationid='SiteSettingsPanelErrorMessage'>{ props.errorMessage }</div> : null
              }
              <div className='ms-SiteSettingsPanel-Buttons' data-automationid='SiteSettingsPanelButtons'>
                <span className='ms-SiteSettingsPanelButton-container'>
                  <Button
                    buttonType={ ButtonType.primary }
                    disabled={ state.saveButtonDisabled }
                    onClick={ this._onSaveClick }
                    data-automationid='SiteSettingsPanelSaveButton'>
                    { strings.saveButton }
                  </Button>
                </span>
                <span className='ms-SiteSettingsPanelButton-container'>
                  <Button onClick={ this._onCancelClick }
                    data-automationid='SiteSettingsPanelCancelButton'>
                    { strings.closeButton }
                  </Button>
                </span>
              </div>
              { state.showSavingSpinner ? <Spinner /> : null }
              { helpTextFooter }
              { deleteGroupLink }
            </div>
          </div> }
        { deleteGroupConfirmationDialog }
        <input
          ref='fileBrowser'
          className='ms-SiteSettingsPanel-FileBrowser'
          type='file'
          accept='image/*'
          tabIndex={ -1 }
          multiple={ false }
        />
      </Panel>
    );
  }

  @autobind
  private _onDeleteConfirmationCheckboxChange(ev: React.FormEvent<HTMLInputElement>, isChecked: boolean) {
    // don't enable the 'Okay' button until the user clicks the confirmation checkbox
    this.setState({
      deleteConfirmationCheckboxChecked: isChecked
    })
  }

  @autobind
  private _onDeleteConfirmationDialogAccept() {
    Engagement.logData({ name: 'SiteSettingsPanel.DeleteGroupConfirmation.Click' });

    this.setState({
      showDeletingSpinner: true
    });

    // user has approved the group deletion, let the host handle group deletion
    if (this.props.onDeleteGroup) {
      this.props.onDeleteGroup();
    }
  }

  @autobind
  private _onDeleteConfirmationDialogCancel() {
    this.setState({
      showDeleteConfirmationDialog: false
    });

    if (this.props.onDeleteGroupDismiss) {
      this.props.onDeleteGroupDismiss();
    }
  }

  @autobind
  private _onDeleteGroupClick() {
    Engagement.logData({ name: 'SiteSettingsPanel.DeleteGroup.Click' });

    // open confirmation dialog to allow user to confirm the group deletion
    this.setState({
      showDeleteConfirmationDialog: true,
      showDeletingSpinner: false,
      deleteConfirmationCheckboxChecked: false,
    });
  }

  @autobind
  private _onSaveClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    const {
      refs: {
        nameText,
      descriptionText,
      imageBrowser,
      departmentText
      },
      props,
      state
    } = this;

    Engagement.logData({ name: 'SiteSettingsPanel.Save.Click' });

    this.setState({
      showSavingSpinner: true,
      saveButtonDisabled: true
    });

    if (props.onSave) {
      let nameValue =
        (nameText && nameText.value) ? nameText.value.trim() : '';
      let descriptionValue =
        (descriptionText && descriptionText.value) ? descriptionText.value.trim() : '';
      let imageFile: File = undefined;
      if (imageBrowser && imageBrowser.state && imageBrowser.state.fileToUpload) {
        imageFile = imageBrowser.state.fileToUpload;
      }
      let departmentValue =
        (departmentText && departmentText.value) ? departmentText.value.trim() : undefined;

      props.onSave(
        nameValue,
        descriptionValue,
        this._findDropdownOption(props.privacyOptions, state.privacySelectedKey),
        this._findDropdownOption(props.classificationOptions, state.classificationSelectedKey),
        imageFile,
        departmentValue);
    }
  }

  @autobind
  private _onCancelClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    Engagement.logData({ name: 'SiteSettingsPanel.Cancel.Click' });
    this._closePanel();
  }

  @autobind
  private _onNameTextChanged() {
    const nameTextRef = this.refs.nameText;
    let nameText = (nameTextRef && nameTextRef.value) ? nameTextRef.value.trim() : '';

    this.setState({
      saveButtonDisabled: !Boolean(nameText)
    });
  }

  @autobind
  private _onClassificationOptionChanged(option: IDropdownOption) {
    this.setState({ classificationSelectedKey: option.key });
  }

  @autobind
  private _onPrivacyOptionChanged(option: IDropdownOption) {
    this.setState({ privacySelectedKey: option.key });
  }

  @autobind
  private _closePanel() {
    this.setState({ showPanel: false });

    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }

  private _findDropdownOption(options: IDropdownOption[], key: string | number): IDropdownOption {
    return options && options.filter((option: IDropdownOption) => option.key === key)[0];
  }

  @autobind
  private _onClickChangeImage(): Promise<IImageSelectedResponse> {
    return new Promise<IImageSelectedResponse>((resolve, reject) => {
      // grab the hidden file input element in launch the file browser programatically
      const fileInputElement = this.refs.fileBrowser as HTMLInputElement;

      if (fileInputElement) {
        // change event will fulfil the promise upon user file selection
        fileInputElement.onchange = (ev: Event) => {
          const target = ev.target as HTMLInputElement;

          // was an actual file selected?
          if (target && target.files && target.files.length) {
            const targetFile = target.files[0];

            // read in file data and resolve promise with result
            LocalFileReader.readFile(targetFile).then((value: string) => {
              resolve({
                src: value,
                fileToUpload: targetFile
              });
            }, (error: any) => {
              // reading file data failed, pass along the error
              reject(error);
            });
          } else {
            // no file was selected
            reject();
          }
        };

        // opens the file browser
        fileInputElement.click();
      } else {
        reject();
      }
    });
  }

  private _renderDeleteGroupLink(): JSX.Element {
    const { props } = this;
    let deleteGroupLink = null;

    if (props.enableDelete) {
      deleteGroupLink = (
        <div className='ms-SiteSettingsPanel-DeleteGroupLink'>
          <Link onClick={ this._onDeleteGroupClick } data-automationid='SiteSettingsPanelDeleteGroupLink'>
            <i className='ms-SiteSettingsPanel-DeleteGroupLinkIcon ms-Icon ms-Icon--Delete'></i>
            <span className='ms-SiteSettingsPanel-DeleteGroupLinkLabel'>{ props.strings.deleteGroupLinkText }</span>
          </Link>
        </div>
      );
    }

    return deleteGroupLink;
  }

  private _renderDeleteConfirmationDialog(): JSX.Element {
    const {
      props: {
        enableDelete,
      groupDeleteErrorMessage,
      name,
      strings
      },
      state
    } = this;

    let deleteGroupConfirmationDialog = null;

    if (enableDelete) {
      const deleteDialogText = StringHelper.format(strings.deleteGroupConfirmationDialogText, name);

      deleteGroupConfirmationDialog = (
        <Dialog
          isOpen={ state.showDeleteConfirmationDialog }
          type={ DialogType.close }
          onDismiss={ this._onDeleteConfirmationDialogCancel }
          isBlocking={ true }
          closeButtonAriaLabel={ strings.closeButtonAriaLabel }
          title={ strings.deleteGroupConfirmationDialogTitle }
        >
          <div>{ deleteDialogText }</div>
          <Checkbox
            className='ms-SiteSettingsPanel-DeleteGroupConfirmationCheckbox'
            label={ strings.deleteGroupConfirmationDialogCheckbox }
            onChange={ this._onDeleteConfirmationCheckboxChange }
          />
          { groupDeleteErrorMessage ?
            <div className='ms-SiteSettingsPanel-ErrorMessage'>{ groupDeleteErrorMessage }</div> : null
          }
          <DialogFooter>
            <Button
              buttonType={ ButtonType.primary }
              disabled={ !state.deleteConfirmationCheckboxChecked || state.showDeletingSpinner }
              onClick={ this._onDeleteConfirmationDialogAccept }
            >
              { strings.deleteGroupConfirmationDialogButtonDelete }
            </Button>
            <Button onClick={ this._onDeleteConfirmationDialogCancel }>{ strings.deleteGroupConfirmationDialogButtonCancel }</Button>
            { state.showDeletingSpinner ? <Spinner /> : null }
          </DialogFooter>
        </Dialog>
      );
    }

    return deleteGroupConfirmationDialog;
  }

  private _renderHelpTextFooter(): JSX.Element {
    const {
      props: {
        strings,
      classicSiteSettingsUrl
      }
    } = this;

    let helpTextFooter = null;

    if (classicSiteSettingsUrl) {
      // classicSiteSettingsHelpText designates the position of the inline link with a '{0}' token to permit proper localization.
      // Split the string up and render the anchor and span elements separately.
      const helpTextSplit = strings.classicSiteSettingsHelpText.split('{0}');

      if (helpTextSplit.length === 2) {
        helpTextFooter = (
          <div className='ms-SiteSettingsPanel-HelpText' data-automationid='SiteSettingsPanelHelperText'>
            <span>{ helpTextSplit[0] }</span>
            <Link href={ classicSiteSettingsUrl }>{ strings.classicSiteSettingsLinkText }</Link>
            <span>{ helpTextSplit[1] }</span>
          </div>
        );
      }
    }

    return helpTextFooter;
  }

  private _renderImageBrowser(): JSX.Element {
    const {
      props,
      props: {
        strings,
        siteLogo
      }
    } = this;

    let imageBrowser = null;

    const emptyImageSrc = props.emptyImageUrl || '';

    if (props.showImageBrowser) {
      const imagePreviewProps: IImagePreviewProps = {
        imageHeight: IMAGE_SIZE,
        imageWidth: IMAGE_SIZE,
        initialPreviewImage: {
          src: siteLogo && siteLogo.imageUrl || emptyImageSrc
        },
        onClickChangeImage: this._onClickChangeImage,
        strings: {
          changeImageButtonText: strings.changeImageButton,
          removeImageButtonText: strings.removeImageButton
        }
      };

      imageBrowser = (
        <ImagePreview ref='imageBrowser' { ...imagePreviewProps } />
      );
    }

    return imageBrowser;
  }

  private _renderUsageLink(): JSX.Element {
    const {
      props: {
        strings,
      usageGuidelinesUrl
      }
    } = this;
    let usageLink = null;

    if (usageGuidelinesUrl) {
      usageLink = (
        <div className='ms-SiteSettingsPanel-UsageLink'>
          <Link href={ usageGuidelinesUrl } target='_blank' data-automationid='SiteSettingsPanelUsageLink'>{ strings.usageGuidelinesLinkText }</Link>
        </div>
      );
    }

    return usageLink;
  }
}
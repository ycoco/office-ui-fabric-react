import './SiteSettingsPanel.scss';
import * as React from 'react';
import { ISiteLogo } from '../SiteLogo/SiteLogo.Props';
import { ISiteSettingsPanelProps } from './SiteSettingsPanel.Props';
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

export class SiteSettingsPanel extends React.Component<ISiteSettingsPanelProps, any> {
  public refs: {
    [key: string]: React.ReactInstance,
    nameText: TextField,
    descriptionText: TextField,
    privacyDropdown: Dropdown,
    classificationDropdown: Dropdown,
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

    const siteLogoProps: ISiteLogo = this.props.siteLogo ? {
      siteTitle: this.props.name,
      siteLogoUrl: this.props.siteLogo.imageUrl,
      siteAcronym: this.props.siteLogo.acronym,
      siteLogoBgColor: this.props.siteLogo.backgroundColor,
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
        isOpen={ this.state.showPanel }
        type={ PanelType.smallFixedFar }
        onDismiss={ this._closePanel }
        isLightDismiss={ true }
        closeButtonAriaLabel={ this.props.strings.closeButtonAriaLabel }
        headerText={ this.props.strings.title }
        >
        {this.props.showLoadingSpinner ? <Spinner /> :
          <div className='ms-SiteSettingsPanel'>
            <div className='ms-SiteSettingsPanel-SiteLogo' data-automationid='SiteSettingsPanelSiteLogo'>
              {
                siteLogoProps && !this.props.showImageBrowser ? <SiteLogo { ...siteLogoProps} /> : null
              }
              {imageBrowser}
            </div>
            {usageLink}
            <div className='ms-SiteSettingsPanel-SiteInfo' data-automationid='SiteSettingsPanelSiteInfo'>
              <TextField
                ref='nameText'
                label={ this.props.strings.nameLabel }
                defaultValue={ this.props.name }
                onChanged={ this._onNameTextChanged }
                required
                data-automationid='SiteSettingsPanelNameText'
                />
              <TextField
                ref='descriptionText'
                label={ this.props.strings.descriptionLabel }
                defaultValue={ this.props.description }
                multiline
                resizable={false}
                data-automationid='SiteSettingsPanelDescriptionText'
                />
              { this.props.privacyOptions && this.props.privacyOptions.length ?
                <Dropdown
                  className='ms-SiteSettingsPanel-PrivacyDropdown'
                  ref='privacyDropdown'
                  label={ this.props.strings.privacyLabel }
                  options={ this.props.privacyOptions }
                  selectedKey={ this.state.privacySelectedKey }
                  onChanged={ this._onPrivacyOptionChanged }
                  /> : null }
              { this.props.classificationOptions && this.props.classificationOptions.length ?
                <Dropdown
                  className='ms-SiteSettingsPanel-ClassificationDropdown'
                  ref='classificationDropdown'
                  label={this.props.strings.classificationLabel}
                  options={this.props.classificationOptions}
                  selectedKey={this.state.classificationSelectedKey}
                  onChanged={this._onClassificationOptionChanged}
                  /> : null}
              {this.props.errorMessage ?
                <div className='ms-SiteSettingsPanel-ErrorMessage' data-automationid='SiteSettingsPanelErrorMessage'>{this.props.errorMessage}</div> : null
              }
              <div className='ms-SiteSettingsPanel-Buttons' data-automationid='SiteSettingsPanelButtons'>
                <span className='ms-SiteSettingsPanelButton-container'>
                  <Button
                    buttonType={ButtonType.primary}
                    disabled={this.state.saveButtonDisabled}
                    onClick={this._onSaveClick}
                    data-automationid='SiteSettingsPanelSaveButton'>
                    {this.props.strings.saveButton}
                  </Button>
                </span>
                <span className='ms-SiteSettingsPanelButton-container'>
                  <Button onClick={this._onCancelClick}
                  data-automationid='SiteSettingsPanelCancelButton'>
                    {this.props.strings.closeButton}
                  </Button>
                </span>
              </div>
              { this.state.showSavingSpinner ? <Spinner /> : null }
              { helpTextFooter }
              { deleteGroupLink }
            </div>
          </div>}
          {deleteGroupConfirmationDialog}
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
    Engagement.logData({ name: 'SiteSettingsPanel.Save.Click' });

    this.setState({
      showSavingSpinner: true,
      saveButtonDisabled: true
    });

    if (this.props.onSave) {
      let nameValue =
        (this.refs.nameText && this.refs.nameText.value) ? this.refs.nameText.value.trim() : '';
      let descriptionValue =
        (this.refs.descriptionText && this.refs.descriptionText.value) ? this.refs.descriptionText.value.trim() : '';
      let imageFile: File = undefined;

      if (this.refs.imageBrowser && this.refs.imageBrowser.state && this.refs.imageBrowser.state.fileToUpload) {
        imageFile = this.refs.imageBrowser.state.fileToUpload;
      }

      this.props.onSave(
        nameValue,
        descriptionValue,
        this._findDropdownOption(this.props.privacyOptions, this.state.privacySelectedKey),
        this._findDropdownOption(this.props.classificationOptions, this.state.classificationSelectedKey),
        imageFile);
    }
  }

  @autobind
  private _onCancelClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    Engagement.logData({ name: 'SiteSettingsPanel.Cancel.Click' });
    this._closePanel();
  }

  @autobind
  private _onNameTextChanged() {
    let nameText = (this.refs.nameText && this.refs.nameText.value) ? this.refs.nameText.value.trim() : '';

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

  private _findDropdownOption(options: IDropdownOption[], key: string|number): IDropdownOption {
    let result: IDropdownOption = undefined;

    if (options) {
      for (let option of options) {
        if (option.key === key) {
          result = option;
          break;
        }
      }
    }

    return result;
  }

  @autobind
  private _onClickChangeImage(): Promise<IImageSelectedResponse>
  {
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
    let deleteGroupLink = null;

    if (this.props.strings.deleteGroupLinkText) {
      // if no strings are defined then the host doesn't support group deletion

      deleteGroupLink = (
        <div className='ms-SiteSettingsPanel-DeleteGroupLink'>
          <Link onClick={ this._onDeleteGroupClick } data-automationid='SiteSettingsPanelDeleteGroupLink'>
            <i className='ms-SiteSettingsPanel-DeleteGroupLinkIcon ms-Icon ms-Icon--Delete'></i>
            <span className='ms-SiteSettingsPanel-DeleteGroupLinkLabel'>{ this.props.strings.deleteGroupLinkText }</span>
          </Link>
        </div>
      );
    }

    return deleteGroupLink;
  }

  private _renderDeleteConfirmationDialog(): JSX.Element {
    let deleteGroupConfirmationDialog = null;

    if (this.props.strings.deleteGroupConfirmationDialogText &&
      this.props.strings.deleteGroupConfirmationDialogTitle &&
      this.props.strings.deleteGroupConfirmationDialogCheckbox &&
      this.props.strings.deleteGroupConfirmationDialogButtonDelete &&
      this.props.strings.deleteGroupConfirmationDialogButtonCancel) {
      // if no strings are defined then the host doesn't support group deletion

      const deleteDialogText = StringHelper.format(this.props.strings.deleteGroupConfirmationDialogText, this.props.name);

      deleteGroupConfirmationDialog = (
        <Dialog
          isOpen={ this.state.showDeleteConfirmationDialog }
          type={ DialogType.close }
          onDismiss={ this._onDeleteConfirmationDialogCancel }
          isBlocking={ true }
          closeButtonAriaLabel={ this.props.strings.closeButtonAriaLabel }
          title={ this.props.strings.deleteGroupConfirmationDialogTitle }
          >
          <div>{ deleteDialogText }</div>
          <Checkbox
            className='ms-SiteSettingsPanel-DeleteGroupConfirmationCheckbox'
            label={ this.props.strings.deleteGroupConfirmationDialogCheckbox }
            onChange={ this._onDeleteConfirmationCheckboxChange }
            />
          { this.props.groupDeleteErrorMessage ?
            <div className='ms-SiteSettingsPanel-ErrorMessage'>{ this.props.groupDeleteErrorMessage }</div> : null
          }
          <DialogFooter>
            <Button
              buttonType={ ButtonType.primary }
              disabled={ !this.state.deleteConfirmationCheckboxChecked || this.state.showDeletingSpinner }
              onClick={ this._onDeleteConfirmationDialogAccept }
              >
              { this.props.strings.deleteGroupConfirmationDialogButtonDelete }
            </Button>
            <Button onClick={ this._onDeleteConfirmationDialogCancel }>{ this.props.strings.deleteGroupConfirmationDialogButtonCancel }</Button>
            { this.state.showDeletingSpinner ? <Spinner /> : null }
          </DialogFooter>
        </Dialog>
      );
    }

    return deleteGroupConfirmationDialog;
  }

  private _renderHelpTextFooter(): JSX.Element {
    let helpTextFooter = null;

    if (this.props.strings.classicSiteSettingsHelpText &&
      this.props.strings.classicSiteSettingsLinkText &&
      this.props.classicSiteSettingsUrl) {
      // classicSiteSettingsHelpText designates the position of the inline link with a '{0}' token to permit proper localization.
      // Split the string up and render the anchor and span elements separately.
      const helpTextSplit = this.props.strings.classicSiteSettingsHelpText.split('{0}');

      if (helpTextSplit.length === 2) {
        helpTextFooter = (
          <div className='ms-SiteSettingsPanel-HelpText' data-automationid='SiteSettingsPanelHelperText'>
            <span>{helpTextSplit[0]}</span>
            <Link href={this.props.classicSiteSettingsUrl}>{this.props.strings.classicSiteSettingsLinkText}</Link>
            <span>{helpTextSplit[1]}</span>
          </div>
        );
      }
    }

    return helpTextFooter;
  }

  private _renderImageBrowser(): JSX.Element {
    let imageBrowser = null;

    const emptyImageSrc = this.props.emptyImageUrl || '';

    if (this.props.showImageBrowser) {
      const imagePreviewProps: IImagePreviewProps = {
        imageHeight: IMAGE_SIZE,
        imageWidth: IMAGE_SIZE,
        initialPreviewImage: {
          src: (this.props.siteLogo && this.props.siteLogo.imageUrl) ?
            this.props.siteLogo.imageUrl :
            emptyImageSrc
        },
        onClickChangeImage: this._onClickChangeImage,
        strings: {
          changeImageButtonText: this.props.strings.changeImageButton,
          removeImageButtonText: this.props.strings.removeImageButton
        }
      };

      imageBrowser = (
        <ImagePreview ref='imageBrowser' { ...imagePreviewProps } />
      );
    }

    return imageBrowser;
  }

  private _renderUsageLink(): JSX.Element {
    let usageLink = null;

    if (this.props.strings.usageGuidelinesLinkText && this.props.usageGuidelinesUrl) {
      usageLink = (
        <div className='ms-SiteSettingsPanel-UsageLink'>
          <Link href={this.props.usageGuidelinesUrl} target='_blank'data-automationid='SiteSettingsPanelUsageLink'>{this.props.strings.usageGuidelinesLinkText}</Link>
        </div>
      );
    }

    return usageLink;
  }
}
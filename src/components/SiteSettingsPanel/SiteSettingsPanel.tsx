import './SiteSettingsPanel.scss';
import * as React from 'react';
import { ISiteLogo } from '../SiteLogo/SiteLogo.Props';
import { ISiteSettingsPanelProps } from './SiteSettingsPanel.Props';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { SiteLogo } from '../SiteLogo/SiteLogo';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';

export class SiteSettingsPanel extends React.Component<ISiteSettingsPanelProps, any> {
  public refs: {
    [key: string]: React.ReactInstance,
    nameText: TextField,
    descriptionText: TextField,
    privacyDropdown: Dropdown,
    classificationDropdown: Dropdown
  };

  constructor(props: ISiteSettingsPanelProps) {
    super(props);

    this.state = {
      showPanel: true, // panel is initially open
      privacySelectedKey: undefined,
      classificationSelectedKey: undefined
    };
  }

  public componentWillReceiveProps(nextProps: ISiteSettingsPanelProps) {
    if (nextProps.errorMessage) {
      // if saving error encountered, re-enable controls so user can try again
      this.setState({
        showSavingSpinner: false,
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
    // TODO: Add an ImagePicker for site logo
    // TODO: Move Save/Close buttons to top of panel (above panel header)
    //       (Currently unsupported by Office-Fabric-React Panel)

    const siteLogoProps: ISiteLogo = {
      siteTitle: this.props.name,
      siteLogoUrl: this.props.siteLogo.imageUrl,
      siteAcronym: this.props.siteLogo.acronym,
      siteLogoBgColor: this.props.siteLogo.backgroundColor,
      disableSiteLogoFallback: false
    };

    return (
      <Panel
        isOpen={ this.state.showPanel }
        type={ PanelType.smallFixedFar }
        onDismiss= { this._closePanel }
        headerText={ this.props.strings.title }
      >
      { this.props.showLoadingSpinner ? <Spinner /> :
        <div className='ms-SiteSetingsPanel'>
          <div className='ms-SiteSettingsPanel-SiteLogo'>
            <SiteLogo { ...siteLogoProps} />
          </div>
          <div className='ms-SiteSettingsPanel-SiteInfo'>
            <TextField
              ref='nameText'
              label={ this.props.strings.nameLabel }
              defaultValue={ this.props.name }
              onChanged={ this._onNameTextChanged }
              required
            />
            <TextField
              ref='descriptionText'
              label={ this.props.strings.descriptionLabel }
              defaultValue={ this.props.description }
              multiline
              resizable={ false }
            />
            <Dropdown
              ref='privacyDropdown'
              label={ this.props.strings.privacyLabel }
              options={ this.props.privacyOptions }
              selectedKey={ this.state.privacySelectedKey }
              onChanged={ this._onPrivacyOptionChanged }
            />
            <Dropdown
              ref='classificationDropdown'
              label={ this.props.strings.classificationLabel }
              options={ this.props.classificationOptions }
              selectedKey={ this.state.classificationSelectedKey }
              onChanged={ this._onClassificationOptionChanged }
            />
            { this.props.errorMessage ?
              <div className='ms-SiteSettingsPanel-ErrorMessage'>{ this.props.errorMessage }</div> : null
            }
            <div className='ms-SiteSettingsPanel-Buttons'>
              <Button
                buttonType={ ButtonType.primary }
                disabled={ this.state.saveButtonDisabled }
                onClick={ this._onSaveClick }>
                { this.props.strings.saveButton }
              </Button>
              <Button onClick={ this._onCancelClick }>
                { this.props.strings.closeButton }
              </Button>
            </div>
            { this.state.showSavingSpinner ? <Spinner /> : null }
          </div>
        </div> }
      </Panel>
    );
  }

  @autobind
  private _onSaveClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    this.setState({
      showSavingSpinner: true,
      saveButtonDisabled: true
    });

    if (this.props.onSave) {
      let nameValue =
        (this.refs.nameText && this.refs.nameText.value) ? this.refs.nameText.value.trim() : '';
      let descriptionValue =
        (this.refs.descriptionText && this.refs.descriptionText.value) ? this.refs.descriptionText.value.trim() : '';
      let privacyIndex =
        (this.refs.privacyDropdown && this.refs.privacyDropdown.state) ? this.refs.privacyDropdown.state.selectedIndex : 0;
      let classificationIndex =
        (this.refs.classificationDropdown && this.refs.classificationDropdown.state) ? this.refs.classificationDropdown.state.selectedIndex : 0;

      this.props.onSave(
        nameValue,
        descriptionValue,
        this.props.privacyOptions[privacyIndex],
        this.props.classificationOptions[classificationIndex]);
    }
  }

  @autobind
  private _onCancelClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
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
    this.setState( {showPanel: false } );

    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }
}
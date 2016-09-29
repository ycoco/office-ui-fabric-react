import * as React from 'react';
import { ISiteSettingsPanelProps } from './SiteSettingsPanel.Props';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
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
      showPanel: true // panel is initially open
    };
  }

  public render(): React.ReactElement<ISiteSettingsPanelProps> {
    // TODO: Add an ImagePicker for site logo
    // TODO: Display loading spinner while waiting on data
    // TODO: Move Save/Close buttons to top of panel (above panel header)
    //       (Currently unsupported by Office-Fabric-React Panel)

    return (
      <Panel
        isOpen={ this.state.showPanel }
        type={ PanelType.smallFixedFar }
        onDismiss= { this._closePanel }
        headerText={ this.props.strings.title }
      >
        <TextField
          ref='nameText'
          label={ this.props.strings.nameLabel }
          value={ this.props.name }
          required
        />
        <TextField
          ref='descriptionText'
          label={ this.props.strings.descriptionLabel }
          value={ this.props.description }
          multiline
          resizable={ false }
        />
        <Dropdown
          ref='privacyDropdown'
          label={ this.props.strings.privacyLabel }
          options={ this.props.privacyOptions }
        />
        <Dropdown
          ref='classificationDropdown'
          label={ this.props.strings.classificationLabel }
          options={ this.props.classificationOptions }
        />
        <Button buttonType={ ButtonType.primary } onClick={ this._onSaveClick }>
          { this.props.strings.saveButton }
        </Button>
        <Button onClick={ this._onCancelClick }>
          { this.props.strings.closeButton }
        </Button>
      </Panel>
    );
  }

  @autobind
  private _onSaveClick(ev: React.MouseEvent) {
    if (this.props.onSave) {
      this.props.onSave(
        this.refs.nameText.value,
        this.refs.descriptionText.value,
        this.props.privacyOptions[this.refs.privacyDropdown.state.selectedIndex],
        this.props.classificationOptions[this.refs.classificationDropdown.state.selectedIndex]);
    }
    this._closePanel();
  }

  @autobind
  private _onCancelClick(ev: React.MouseEvent) {
    this._closePanel();
  }

  @autobind
  private _closePanel() {
    this.setState( {showPanel: false } );

    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }
}
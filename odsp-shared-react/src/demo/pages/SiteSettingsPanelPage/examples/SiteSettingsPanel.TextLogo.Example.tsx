import * as React from 'react';
import { SiteSettingsPanel, ISiteSettingsPanelProps } from '../../../../components/index';
import { Button } from 'office-ui-fabric-react/lib/Button';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';

export class SiteSettingsPanelTextLogoExample extends React.Component<React.Props<SiteSettingsPanelTextLogoExample>, any> {
  constructor() {
    super();

    this.state = {
      showPanel: false
    };
  }

  public render() {
    let sampleProps: ISiteSettingsPanelProps = {
      name: 'Example Site',
      description: 'This is an example site with a text logo for the SiteSettingsPanel',

      strings: {
        title: 'Site Settings',
        nameLabel: 'Name',
        descriptionLabel: 'Description',
        privacyLabel: 'Privacy',
        classificationLabel: 'Business classification',
        saveButton: 'Save',
        closeButton: 'Close'
      },

      siteLogo: {
        acronym: 'ES',
        backgroundColor: '#0078d7'
      },

      onDismiss: this._onPanelDismissed
    };

    return (
      <div>
        <Button onClick={ this._onLaunchPanel }>Launch Panel</Button>
        { this.state.showPanel && <SiteSettingsPanel {...sampleProps} /> }
      </div>
    );
  }

  @autobind
  private _onLaunchPanel(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    this.setState({
      showPanel: true
    });
  }

  @autobind
  private _onPanelDismissed() {
    this.setState({
      showPanel: false
    });
  }
}

import * as React from 'react';
import { SitePermissionsPanel, ISitePermissionsPanelProps, ISitePermissionsProps} from '../../../../components/index';
import { Button } from 'office-ui-fabric-react/lib/Button';
import { PersonaInitialsColor } from '../../../index';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

export interface ISitePermissionsExampleState {
   _showP: boolean;
}

export class SitePermissionsExample extends React.Component<React.Props<SitePermissionsExample>, ISitePermissionsExampleState> {
  private sitePermissionsPreps: ISitePermissionsProps[];
  constructor(props) {
    super(props);

    this.state = {
      _showP: true
    };
    this.sitePermissionsPreps = new Array();
    this._getSitePermissionsProps();
  }

  public render() {

    let sitePermissionsPanelProps: ISitePermissionsPanelProps = {
      sitePermissions: this.sitePermissionsPreps,
      title: 'Site Settings'
    };

    return (
      <div>
        <Button description='Panel' onClick={this._showPanel }>Open Panel</Button>
        <SitePermissionsPanel {...sitePermissionsPanelProps} />
      </div>
    );
  }

  @autobind
  private _showPanel() {
    this.setState({ _showP: true });
  }

  private _getSitePermissionsProps() {

    this.sitePermissionsPreps.push({
      title: `Edit`,
      personas: [
        {
          name: 'Bill Murray',
          imageUrl: '//www.fillmurray.com/200/200'
        },
        {
          name: 'Douglas Field',
          imageInitials: 'DF',
          initialsColor: PersonaInitialsColor.green
        },
        {
          name: 'Marcus Laue',
          imageInitials: 'ML',
          initialsColor: PersonaInitialsColor.purple
        }
      ]
    });

    this.sitePermissionsPreps.push({
      title: `Read`,
      personas: [
        {
          name: 'Bill Murray',
          imageUrl: '//www.fillmurray.com/200/200'
        },
        {
          name: 'Douglas Field',
          imageInitials: 'DF',
          initialsColor: PersonaInitialsColor.green
        },
        {
          name: 'Marcus Laue',
          imageInitials: 'ML',
          initialsColor: PersonaInitialsColor.purple
        }
      ]
    });
  }
}

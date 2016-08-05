import * as React from 'react';
import { ISitePermissionsPanelProps } from './SitePermissionsPanel.Props';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { SitePermissions } from '../SitePermissions/SitePermissions';
import { ISitePermissionsProps } from '../SitePermissions/SitePermissions.Props';

export class SitePermissionsPanel extends React.Component<ISitePermissionsPanelProps, any> {
  constructor(props: ISitePermissionsPanelProps) {
    super(props);

    this.state = {
      showPanel: true
    };
  }

  public render(): React.ReactElement<ISitePermissionsPanelProps> {
    return (
      <Panel
        isOpen={ this.state.showPanel }
        type={ PanelType.smallFixedFar }
        onDismiss= { this._closePanel.bind(this) }
        headerText={ this.props.title }
        >
        {
          (this.props !== undefined && this.props.sitePermissions !== undefined) ?
            this.props.sitePermissions.map((sitePermissions: ISitePermissionsProps, index: number) => {
              return this._getSitePermissions(sitePermissions, index);
            }) : undefined
        }
      </Panel>
    );
  }

  private _getSitePermissions(sitePermissions: ISitePermissionsProps, index: number): JSX.Element {
    return <SitePermissions {...sitePermissions} />;
  }

  private _closePanel() {
    this.setState({ showPanel: false });

    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }
}

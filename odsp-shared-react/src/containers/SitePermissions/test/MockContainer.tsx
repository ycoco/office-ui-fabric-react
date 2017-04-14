import * as React from 'react';
import { SitePermissionsPanel } from './../../../SitePermissionsPanel';
import { SitePermissionsPanelStateManager, ISitePermissionsPanelContainerState, ISitePermissionsPanelContainerStateManagerParams } from '../index';
import { MockSitePermissions } from './index';
import { SitePermissionsMockStrings } from './MockStrings'

export interface IMockContainerProps {
  params: ISitePermissionsPanelContainerStateManagerParams;
}

export class MockContainer extends React.Component<IMockContainerProps, ISitePermissionsPanelContainerState> {
  public stateManager: SitePermissionsPanelStateManager;
  public strings = SitePermissionsMockStrings;
  public mockSitePermissions = new MockSitePermissions();

  constructor(props: IMockContainerProps, context?: any) {
    super(props, context);
    let params = props.params;
    params.title = this.strings.title;
    params.panelDescription = this.strings.panelDescription;

    let sitePermissionsPanelContainerState: ISitePermissionsPanelContainerState = {
      sitePermissions: this.mockSitePermissions.sitePermissionsProps,
      title: this.strings.title,
      panelDescription: this.strings.panelDescription
    }
    params.sitePermissionsPanelContainer = this;
    params.sitePermissionsPanelContainer.state = sitePermissionsPanelContainerState;

    this.stateManager = new SitePermissionsPanelStateManager(params);
  }

  public render() {
    return (<SitePermissionsPanel {...this.stateManager.getRenderProps() } />);
  }

  public componentWillUnmount() {
    this.stateManager.componentWillUnmount();
  }
}

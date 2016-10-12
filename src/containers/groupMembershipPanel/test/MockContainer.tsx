import * as React from 'react';
import { GroupMembershipPanel } from './../../../GroupMembershipPanel';
import { GroupMembershipPanelStateManager, IGroupMembershipPanelContainerState, IGroupMembershipPanelContainerStateManagerParams } from '../index';

export interface IMockContainerProps {
  params: IGroupMembershipPanelContainerStateManagerParams;
}

export class MockContainer extends React.Component<IMockContainerProps, IGroupMembershipPanelContainerState> {
  public stateManager: GroupMembershipPanelStateManager;
  constructor(props: IMockContainerProps, context?: any) {
    super(props, context);
    let params = props.params;
    params.groupMembershipPanel = this;
    this.stateManager = new GroupMembershipPanelStateManager(params);
  }

  public render() {
    return (<GroupMembershipPanel {...this.stateManager.getRenderProps()} />);
  }

  public componentDidMount() {
    this.stateManager.componentDidMount();
  }
}

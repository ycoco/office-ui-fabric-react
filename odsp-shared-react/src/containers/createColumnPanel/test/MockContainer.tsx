import * as React from 'react';
import { CreateColumnPanel } from './../../../CreateColumnPanel';
import { CreateColumnPanelContainerStateManager, ICreateColumnPanelContainerState, ICreateColumnPanelContainerStateManagerParams } from '../index';

export interface IMockContainerProps {
  params: ICreateColumnPanelContainerStateManagerParams;
}

export class MockContainer extends React.Component<IMockContainerProps, ICreateColumnPanelContainerState> {
  public stateManager: CreateColumnPanelContainerStateManager;
  constructor(props: IMockContainerProps, context?: any) {
    super(props, context);
    let params = props.params;
    params.createColumnPanelContainer = this;
    this.stateManager = new CreateColumnPanelContainerStateManager(params);
  }

  public render() {
    return (<CreateColumnPanel {...this.stateManager.getRenderProps()} />);
  }
}

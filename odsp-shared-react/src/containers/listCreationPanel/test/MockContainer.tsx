import * as React from 'react';
import { ListCreationPanel } from './../../../ListCreationPanel';
import { ListCreationPanelContainerStateManager, IListCreationPanelContainerState, IListCreationPanelContainerStateManagerParams } from '../index';

export interface IMockContainerProps {
  params: IListCreationPanelContainerStateManagerParams;
}

export class MockContainer extends React.Component<IMockContainerProps, IListCreationPanelContainerState> {
  public stateManager: ListCreationPanelContainerStateManager;
  constructor(props: IMockContainerProps, context?: any) {
    super(props, context);
    let params = props.params;
    params.listCreationPanel = this;
    this.stateManager = new ListCreationPanelContainerStateManager(params);
  }

  public render() {
    return (<ListCreationPanel {...this.stateManager.getRenderProps()} />);
  }

  public componentDidMount() {
    this.stateManager.componentDidMount();
  }
}

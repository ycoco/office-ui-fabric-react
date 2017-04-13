import * as React from 'react';
import { ColumnManagementPanel } from '../../../components/ColumnManagementPanel/index';
import { ColumnManagementPanelContainerStateManager, IColumnManagementPanelContainerState, IColumnManagementPanelContainerStateManagerParams } from '../index';

export interface IMockContainerProps {
  params: IColumnManagementPanelContainerStateManagerParams;
}

export class MockContainer extends React.Component<IMockContainerProps, IColumnManagementPanelContainerState> {
  public stateManager: ColumnManagementPanelContainerStateManager;
  constructor(props: IMockContainerProps, context?: any) {
    super(props, context);
    let params = props.params;
    params.columnManagementPanelContainer = this;
    this.stateManager = new ColumnManagementPanelContainerStateManager(params);
  }

  public render() {
    return (<ColumnManagementPanel {...this.stateManager.getRenderProps()} />);
  }
}

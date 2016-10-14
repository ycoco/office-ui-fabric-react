import * as React from 'react';
import { CompositeHeader } from './../../../CompositeHeader';
import { ISiteHeaderContainerState, SiteHeaderContainerStateManager, ISiteHeaderContainerStateManagerParams } from '../index';

export interface IMockContainerProps {
  params: ISiteHeaderContainerStateManagerParams;
}

export class MockContainer extends React.Component<IMockContainerProps, ISiteHeaderContainerState> {
  public stateManager: SiteHeaderContainerStateManager;
  constructor(props: IMockContainerProps, context?: any) {
    super(props, context);
    let params = props.params;
    params.siteHeader = this;
    this.stateManager = new SiteHeaderContainerStateManager(params);
  }

  public render() {
    return (<CompositeHeader {...this.stateManager.getRenderProps()} />);
  }

  public componentDidMount() {
    this.stateManager.componentDidMount();
  }

  public componentWillUnmount() {
    this.stateManager.componentWillUnmount();
  }
}

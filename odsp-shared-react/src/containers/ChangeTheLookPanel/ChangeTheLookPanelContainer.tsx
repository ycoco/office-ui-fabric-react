import * as React from 'react';
import { IChangeTheLookPanelContainerParams } from './ChangeTheLookPanelContainerStateManager.Props';
import { ChangeTheLookPanelStateManager } from './ChangeTheLookPanelStateManager';
import { ChangeTheLookPanel } from '../../components/ChangeTheLookPanel/ChangeTheLookPanel';
import { IChangeTheLookPanelProps } from '../../components/ChangeTheLookPanel/ChangeTheLookPanel.Props';
import { BaseComponent} from 'office-ui-fabric-react/lib/Utilities';

export class ChangeTheLookPanelContainer extends BaseComponent<IChangeTheLookPanelContainerParams, IChangeTheLookPanelProps> {

  private _changeTheLookPanelStateManager: ChangeTheLookPanelStateManager;

  constructor(props: IChangeTheLookPanelContainerParams) {
    super(props);
    this._changeTheLookPanelStateManager = new ChangeTheLookPanelStateManager({ ...props, updateState: this.setState.bind(this) });
    this.state = this._changeTheLookPanelStateManager.getRenderProps();
  }

  public componentDidMount() {
    this._changeTheLookPanelStateManager.componentDidMount();
  }
  public render() {
    return <ChangeTheLookPanel {...this.state} />;
  }
}
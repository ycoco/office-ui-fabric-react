import * as React from 'react';
import { CreateColumnPanelContent, ICreateColumnPanelProps } from './index';
import { Panel } from 'office-ui-fabric-react/lib/Panel';
import { KeyCodes, autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import './CreateColumnPanel.scss';

export class CreateColumnPanel extends BaseComponent<ICreateColumnPanelProps, any> {

  constructor(props: ICreateColumnPanelProps) {
    super(props);
  }

  public render() {
    return (
      <Panel
        { ...this.props.panelProps }
        className='ms-CreateColumnPanel'
        firstFocusableSelector='ms-TextField-field'>
        <CreateColumnPanelContent { ...this.props.createColumnPanelContentProps } />
      </Panel>);
  }

  public componentDidMount() {
    this._events.on(window, 'keydown', this._onKeyDown.bind(this));
  }

  @autobind
  private _onKeyDown(ev: React.KeyboardEvent<HTMLElement>) {
    if (ev.which === KeyCodes.escape) {
      this.props.panelProps.onDismiss();
    }

    ev.stopPropagation();
  }
}

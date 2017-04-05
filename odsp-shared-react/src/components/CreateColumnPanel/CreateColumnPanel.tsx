import * as React from 'react';
import { CreateColumnPanelContent, ICreateColumnPanelProps } from './index';
import { Panel } from 'office-ui-fabric-react/lib/Panel';
import { KeyCodes, autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import { PrimaryButton, Button } from 'office-ui-fabric-react/lib/Button';
import './CreateColumnPanel.scss';

export class CreateColumnPanel extends BaseComponent<ICreateColumnPanelProps, any> {
  private _panelContent: CreateColumnPanelContent;

  constructor(props: ICreateColumnPanelProps) {
    super(props);
  }

  public render() {
    return (
      <Panel
        { ...this.props.panelProps }
        className='ms-CreateColumnPanel'
        firstFocusableSelector='ms-TextField-field'
        onRenderFooterContent={ this._onRenderFooterContent }>
        <CreateColumnPanelContent { ...this.props.createColumnPanelContentProps } ref={ this._resolveRef("_panelContent")} />
      </Panel>);
  }

  public componentDidMount() {
    this._events.on(window, 'keydown', this._onKeyDown.bind(this));
  }

  @autobind
  private _onRenderFooterContent() {
    let strings = this.props.createColumnPanelContentProps.strings;
    return (
        <div className = 'ms-CreateColumnPanel-footer'>
            <div>
              <PrimaryButton className='ms-CreateColumnPanel-saveButton' disabled={ this.props.saveDisabled } onClick={ this._onSaveClick }>{ strings.saveButtonText }</PrimaryButton>
              <Button className='ms-CreateColumnPanel-cancelButton' onClick={ this.props.onDismiss }>{ strings.cancelButtonText }</Button>
            </div>
            <div role='region' aria-live='polite' className={(this.props.listColumnsUnknown ? 'ms-CreateColumnPanel-error' : '')}>
              { this.props.listColumnsUnknown &&
              <span>{ strings.genericError }</span> }
            </div>
        </div>
    );
  }

  @autobind
  private _onSaveClick() {
    let options = this._panelContent.getCreateFieldInfo();
    this.props.onSave(options);
  }

  @autobind
  private _onKeyDown(ev: React.KeyboardEvent<HTMLElement>) {
    if (ev.which === KeyCodes.escape) {
      this.props.panelProps.onDismiss();
    }

    ev.stopPropagation();
  }
}

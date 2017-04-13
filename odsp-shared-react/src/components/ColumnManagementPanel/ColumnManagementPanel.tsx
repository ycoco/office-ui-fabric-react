import * as React from 'react';
import { ColumnManagementPanelContent, IColumnManagementPanelProps } from './index';
import { Panel } from 'office-ui-fabric-react/lib/Panel';
import { KeyCodes, autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import { PrimaryButton, Button } from 'office-ui-fabric-react/lib/Button';
import './ColumnManagementPanel.scss';

export class ColumnManagementPanel extends BaseComponent<IColumnManagementPanelProps, any> {
  private _panelContent: ColumnManagementPanelContent;

  constructor(props: IColumnManagementPanelProps) {
    super(props);
  }

  public render() {
    return (
      <Panel
        { ...this.props.panelProps }
        className='ms-ColumnManagementPanel'
        firstFocusableSelector='ms-TextField-field'
        onRenderFooterContent={ this._onRenderFooterContent }>
        <ColumnManagementPanelContent { ...this.props.columnManagementPanelContentProps } ref={ this._resolveRef("_panelContent")} />
      </Panel>);
  }

  public componentDidMount() {
    this._events.on(window, 'keydown', this._onKeyDown.bind(this));
  }

  @autobind
  private _onRenderFooterContent() {
    let strings = this.props.columnManagementPanelContentProps.strings;
    return (
        <div className = 'ms-ColumnManagementPanel-footer'>
            <div>
              <PrimaryButton className='ms-ColumnManagementPanel-saveButton' disabled={ this.props.saveDisabled ? this.props.saveDisabled : false } onClick={ this._onSaveClick }>{ strings.saveButtonText }</PrimaryButton>
              <Button className='ms-ColumnManagementPanel-cancelButton' onClick={ this.props.onDismiss }>{ strings.cancelButtonText }</Button>
            </div>
            <div role='region' aria-live='polite' className={(this.props.errorMessage ? 'ms-ColumnManagementPanel-error' : '')}>
              { this.props.errorMessage &&
              <span>{ this.props.errorMessage }</span> }
            </div>
        </div>
    );
  }

  @autobind
  private _onSaveClick() {
    let fieldSchema = this._panelContent.getFieldCreationSchema();
    this.props.onSave(fieldSchema);
  }

  @autobind
  private _onKeyDown(ev: React.KeyboardEvent<HTMLElement>) {
    if (ev.which === KeyCodes.escape) {
      this.props.panelProps.onDismiss();
    }

    ev.stopPropagation();
  }
}

import * as React from 'react';
import { ColumnManagementPanelContent, IColumnManagementPanelProps } from './index';
import { Panel } from 'office-ui-fabric-react/lib/Panel';
import { KeyCodes, autobind, BaseComponent, css } from 'office-ui-fabric-react/lib/Utilities';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
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
        className={ css('ms-ColumnManagementPanel', { 'hidden': !this.props.showPanel }, { 'loading': this.props.isContentLoading}) }
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
    return (
        <div className ={ 'ms-ColumnManagementPanel-footer' }>
            { this.props.isEditPanel ? this._editFooterButtons() : this._createFooterButtons() }
            <div role='region' aria-live='polite' className={(this.props.errorMessage ? 'ms-ColumnManagementPanel-error' : '')}>
              { this.props.errorMessage &&
              <span>{ this.props.errorMessage }</span> }
            </div>
        </div>
    );
  }

  // Footer buttons for the create column panel
  @autobind
  private _createFooterButtons() {
    let strings = this.props.columnManagementPanelContentProps.strings;
    return (
      <div>
        <PrimaryButton className='ms-ColumnManagementPanel-saveButton' disabled={ this.props.saveDisabled ? this.props.saveDisabled : false } onClick={ this._onSaveClick }>{ strings.saveButtonText }</PrimaryButton>
        <DefaultButton className='ms-ColumnManagementPanel-cancelButton' onClick={ this.props.onDismiss }>{ strings.cancelButtonText }</DefaultButton>
      </div>
    );
  }

  // Footer buttons for the edit column panel
  @autobind
  private _editFooterButtons() {
    let strings = this.props.columnManagementPanelContentProps.strings;
    let confirmDeleteDialog = (
      <Dialog
      className='ms-ColumnManagementPanel-confirmDeleteDialog'
      isOpen={ this.props.confirmDeleteDialogIsOpen }
      type={ DialogType.close }
      onDismiss={ this.props.showHideConfirmDeleteDialog }
      title={ strings.confirmDeleteDialogTitle }
      subText={ strings.confirmDeleteDialogText }
      isBlocking={ false }
      closeButtonAriaLabel={ strings.closeButtonAriaLabel }>
      <DialogFooter>
        <PrimaryButton onClick={ this.props.onDelete }>{ strings.deleteButtonText }</PrimaryButton>
        <DefaultButton onClick={ this.props.showHideConfirmDeleteDialog }>{ strings.cancelButtonText }</DefaultButton>
      </DialogFooter>
    </Dialog>
    );
    return (
      <div>
        <PrimaryButton className='ms-ColumnManagementPanel-saveButton' disabled={ this.props.saveDisabled ? this.props.saveDisabled : false } onClick={ this._onSaveClick }>{ strings.saveButtonText }</PrimaryButton>
        <DefaultButton className='ms-ColumnManagementPanel-cancelButton' onClick={ this.props.onDismiss }>{ strings.cancelButtonText }</DefaultButton>
        <DefaultButton className='ms-ColumnManagementPanel-deleteButton' onClick={ this.props.showHideConfirmDeleteDialog }>{ strings.deleteButtonText }</DefaultButton>
        { this.props.confirmDeleteDialogIsOpen ? confirmDeleteDialog : null }
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

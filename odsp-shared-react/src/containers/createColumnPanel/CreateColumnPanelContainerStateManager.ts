// OneDrive:IgnoreCodeCoverage

import { ICreateColumnPanelContainerState, ICreateColumnPanelContainerStateManagerParams } from './CreateColumnPanelContainerStateManager.Props';
import { IPanelProps, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { ICreateColumnPanelProps, ICreateColumnPanelContentProps } from '../../components/CreateColumnPanel';
import { Qos as QosEvent, ResultTypeEnum as QosResultEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import { ListDataSource, IListDataSource, ICreateFieldOptions, IField } from '@ms/odsp-datasources/lib/List';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export class CreateColumnPanelContainerStateManager {
  private _params: ICreateColumnPanelContainerStateManagerParams;
  private _listDataSource: IListDataSource;
  private _listFieldsPromise: Promise<IField[]>;

    constructor(params: ICreateColumnPanelContainerStateManagerParams) {
      this._params = params;
      this._params.createColumnPanelContainer.state = {
        isPanelOpen: true,
        duplicateColumnName: false,
        listColumnsUnknown: false,
        savingColumn: false,
        saveDisabled: true
      };
      this._listDataSource = params.getListDataSource ? params.getListDataSource() : new ListDataSource(params.pageContext);
      this._listFieldsPromise = params.listFieldsPromise ? params.listFieldsPromise : null;
    }

    public getRenderProps(): ICreateColumnPanelProps {
      const params = this._params;
      const state = params.createColumnPanelContainer.state;

      const panelProps: IPanelProps = {
        type: params.panelType ? params.panelType : PanelType.smallFixedFar,
        isOpen: state.isPanelOpen,
        headerText: params.strings.title,
        onDismiss: this._onDismiss,
        isLightDismiss: true
      };

      const createColumnPanelContentProps: ICreateColumnPanelContentProps = {
        strings: params.strings,
        onClearError: this._onClearError,
        updateSaveDisabled: this._updateSaveDisabled,
        duplicateColumnName: state.duplicateColumnName,
        currentLanguage: params.pageContext.currentLanguage
      };

      return {
        panelProps: panelProps,
        createColumnPanelContentProps: createColumnPanelContentProps,
        saveDisabled: state.saveDisabled,
        onDismiss: this._onDismiss,
        onSave: this._onSave,
        listColumnsUnknown: state.listColumnsUnknown
      };
    }

    private setState(state: ICreateColumnPanelContainerState) {
      this._params.createColumnPanelContainer.setState(state);
    }

    @autobind
    private _onDismiss() {
      // Closing the panel causes it to call this function, so this prevents it being run twice
      if (this._params.createColumnPanelContainer.state.isPanelOpen) {
        this.setState({ isPanelOpen: false });
        // Call the onDismiss callback unless we are closing the panel to create the column
        if (this._params.onDismiss && !this._params.createColumnPanelContainer.state.savingColumn) {
          this._params.onDismiss();
        }
      }
    }

    @autobind
    private _onSave(options: ICreateFieldOptions) {
      if (this._listFieldsPromise) {
        // Check if the column name entered is a duplicate. If it is, throw error. Otherwise, create column.
        let checkColumnNameQos = new QosEvent({ name: 'CreateColumnPanel.VerifyColumnName' });
        this._listFieldsPromise.then((fields: IField[]) => {
          if (this._isColumnNameTaken(options.displayName, fields)) {
            checkColumnNameQos.end({ resultType: QosResultEnum.ExpectedFailure, resultCode: 'DuplicateColumnName'});
            this.setState({ duplicateColumnName: true });
          } else {
            checkColumnNameQos.end({ resultType: QosResultEnum.Success });
            this.setState({ isPanelOpen: false, savingColumn: true });
            let createFieldPromise = this._listDataSource.createField(options);
            this._params.onSave(options.displayName, createFieldPromise);
          }
        }, (error: any) => {
          checkColumnNameQos.end({ resultType: QosResultEnum.Failure, error: error });
          this.setState({ listColumnsUnknown: true, saveDisabled: true });
        });
      } else {
        this.setState({ isPanelOpen: false, savingColumn: true });
        let createFieldPromise = this._listDataSource.createField(options);
        this._params.onSave(options.displayName, createFieldPromise);
      }
    }

    @autobind
    private _updateSaveDisabled(name: string) {
      if (this._params.createColumnPanelContainer.state.listColumnsUnknown || name === "") {
        this.setState({ saveDisabled: true });
      } else {
        this.setState({ saveDisabled: false });
      }
    }

    @autobind
    private _onClearError() {
      this.setState({ duplicateColumnName: false });
    }

    /** Given a colName, checks to see if a field with that name exists in the current list */
    private _isColumnNameTaken(colName: string, fields: IField[]): boolean {
        'use strict';

        if (!fields) {
            return false;
        }
        colName = colName.toLocaleLowerCase();
        return fields.some((field: IField) => colName === field.title.toLocaleLowerCase());
    }
}
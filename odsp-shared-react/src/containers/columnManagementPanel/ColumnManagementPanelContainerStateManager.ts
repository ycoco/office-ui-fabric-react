// OneDrive:IgnoreCodeCoverage

import { IColumnManagementPanelContainerState, IColumnManagementPanelContainerStateManagerParams } from './ColumnManagementPanelContainerStateManager.Props';
import { IPanelProps, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { IColumnManagementPanelProps, IColumnManagementPanelContentProps } from '../../components/ColumnManagementPanel';
import {
  fillInColumnManagementPanelStrings,
  fillInColumnManagementPanelErrorStrings,
  IColumnManagementPanelErrorStrings,
  handleCreateEditColumnError
} from './index';
import { Qos as QosEvent, ResultTypeEnum as QosResultEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import { ListDataSource, IListDataSource, IFieldSchema, IField } from '@ms/odsp-datasources/lib/List';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export class ColumnManagementPanelContainerStateManager {
  private _params: IColumnManagementPanelContainerStateManagerParams;
  private _listDataSource: IListDataSource;
  private _listFieldsPromise: Promise<IField[]>;
  private _listFields: IField[];
  private _getListFieldsError: any;
  private _errorStrings: IColumnManagementPanelErrorStrings;

  constructor(params: IColumnManagementPanelContainerStateManagerParams) {
    this._params = params;
    this._params.columnManagementPanelContainer.state = {
      isPanelOpen: true,
      duplicateColumnName: false,
      savingColumn: false,
      saveDisabled: true,
      errorMessage: null
    };
    this._listDataSource = params.getListDataSource ? params.getListDataSource() : new ListDataSource(params.pageContext);
    this._listFieldsPromise = params.listFieldsPromise ? params.listFieldsPromise : null;
    this._getListFieldsError = null;
    this._listFields = null;
    if (this._listFieldsPromise) {
      this._listFieldsPromise.then((fields: IField[]) => {
        this._listFields = fields;
      }, (error: any) => {
        this._getListFieldsError = error;
      });
    }
    this._errorStrings = fillInColumnManagementPanelErrorStrings(params.errorStrings);
  }

  public getRenderProps(): IColumnManagementPanelProps {
    const params = this._params;
    const state = params.columnManagementPanelContainer.state;
    const strings = fillInColumnManagementPanelStrings(params.strings);

    const panelProps: IPanelProps = {
      type: params.panelType ? params.panelType : PanelType.smallFixedFar,
      isOpen: state.isPanelOpen,
      headerText: strings.title,
      onDismiss: this._onDismiss,
      isLightDismiss: true
    };

    const columnManagementPanelContentProps: IColumnManagementPanelContentProps = {
      strings: strings,
      onClearError: this._onClearError,
      updateSaveDisabled: this._updateSaveDisabled,
      duplicateColumnName: state.duplicateColumnName,
      currentLanguage: params.pageContext.currentLanguage
    };

    return {
      panelProps: panelProps,
      columnManagementPanelContentProps: columnManagementPanelContentProps,
      saveDisabled: state.saveDisabled,
      onDismiss: this._onDismiss,
      onSave: this._onSave,
      errorMessage: state.errorMessage
    };
  }

  private setState(state: IColumnManagementPanelContainerState) {
    this._params.columnManagementPanelContainer.setState(state);
  }

  @autobind
  private _onDismiss() {
    // Closing the panel causes it to call this function, so this prevents it being run twice
    if (this._params.columnManagementPanelContainer.state.isPanelOpen) {
      this.setState({ isPanelOpen: false });
      // Call the onDismiss callback unless we are closing the panel because we have created the column
      if (this._params.onDismiss && !this._params.columnManagementPanelContainer.state.savingColumn) {
        this._params.onDismiss();
      }
    }
  }

  @autobind
  private _onSave(fieldSchema: IFieldSchema) {
    if (this._listFieldsPromise) {
      // Check if the column name entered is a duplicate. If it is, show error. Otherwise, create column.
      let checkColumnNameQos = new QosEvent({ name: 'ColumnManagementPanel.VerifyColumnName' });
      if (this._isColumnNameTaken(fieldSchema.DisplayName, this._listFields)) {
        checkColumnNameQos.end({ resultType: QosResultEnum.ExpectedFailure, resultCode: 'DuplicateColumnName' });
        this.setState({ duplicateColumnName: true });
      } else if (!this._listFields) {
        // The request to get our list of fields has still not returned or has failed. Because we can't currently retry getting the list of column names, kick the user out of the panel and show error in operations panel.
        let qosResult = {
          resultType: QosResultEnum.Failure,
          ...this._getListFieldsError && { error: this._getListFieldsError}
        };
        checkColumnNameQos.end(qosResult);
        this.setState({ isPanelOpen: false });
        this._params.onError(fieldSchema.DisplayName, this._getListFieldsError);
      } else {
        checkColumnNameQos.end({ resultType: QosResultEnum.Success });
        this._saveColumn(fieldSchema);
      }
    } else {
      this._saveColumn(fieldSchema);
    }
  }

  @autobind
  private _saveColumn(fieldSchema: IFieldSchema) {
    this.setState({ savingColumn: true });
    let createColumnQos = new QosEvent({ name: 'ColumnManagementPanel.CreateField' });
    this._listDataSource.createField(fieldSchema).then((internalFieldName: string) => {
      createColumnQos.end({ resultType: QosResultEnum.Success });
      this.setState({ isPanelOpen: false });
      this._params.onSuccess(fieldSchema.DisplayName, internalFieldName);
    }, (error: any) => {
      createColumnQos.end({ resultType: QosResultEnum.Failure, error: error });
      let message = handleCreateEditColumnError(error, this._errorStrings);
      this.setState({ errorMessage: message, savingColumn: false });
    });
  }

  @autobind
  private _updateSaveDisabled(name: string) {
    if (name === "") {
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
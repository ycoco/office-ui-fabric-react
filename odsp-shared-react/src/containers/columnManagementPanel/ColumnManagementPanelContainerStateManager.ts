// OneDrive:IgnoreCodeCoverage

import { IColumnManagementPanelContainerState, IColumnManagementPanelContainerStateManagerParams, ColumnActionType } from './ColumnManagementPanelContainerStateManager.Props';
import { IPanelProps, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { IColumnManagementPanelProps,
  IColumnManagementPanelContentProps,
  IColumnManagementPanelCurrentValues
} from '../../components/ColumnManagementPanel';
import { IUniqueFieldsComponentRequiredValues } from '../../components/ColumnManagementPanel/HelperComponents/index';
import {
  fillInColumnManagementPanelStrings,
  fillInColumnManagementPanelErrorStrings,
  IColumnManagementPanelErrorStrings
} from './ColumnManagementPanelStringHelper';
import { handleCreateEditColumnError } from './ColumnManagementPanelErrorHelper';
import { Qos as QosEvent, ResultTypeEnum as QosResultEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import { ListDataSource, IListDataSource, IFieldSchema, IField, IServerField, FieldType } from '@ms/odsp-datasources/lib/List';
import {isDocumentLibrary} from '@ms/odsp-datasources/lib/dataSources/listCollection/ListTemplateType';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export class ColumnManagementPanelContainerStateManager {
  private _params: IColumnManagementPanelContainerStateManagerParams;
  private _listDataSource: IListDataSource;
  private _listFieldsPromise: Promise<IField[]>;
  private _currentValuesPromise: Promise<IServerField>;
  private _listFields: IField[];
  private _getListFieldsError: any;
  private _errorStrings: IColumnManagementPanelErrorStrings;
  private _originalName: string;
  private _isEditPanel: boolean;
  private _isDocumentLibrary: boolean;

  constructor(params: IColumnManagementPanelContainerStateManagerParams) {
    this._params = params;
    this._listDataSource = params.getListDataSource ? params.getListDataSource() : new ListDataSource(params.pageContext);

    this._listFieldsPromise = this._listDataSource.getFields(params.listFullUrl);
    this._getListFieldsError = null;
    this._listFields = null;
    this._listFieldsPromise.then((fields: IField[]) => {
      this._listFields = fields;
    }, (error: any) => {
      this._getListFieldsError = error;
    });

    this._errorStrings = fillInColumnManagementPanelErrorStrings(params.errorStrings);
    this._originalName = "";
    this._isEditPanel = !!params.editField;
    this._isDocumentLibrary = isDocumentLibrary(this._params.pageContext.listBaseTemplate);
    if (params.editField && params.editField.fieldName) {
      this._currentValuesPromise = this._listDataSource.getField(this._params.editField.fieldName, params.listFullUrl);
    } else {
      this._currentValuesPromise = null;
    } 

    this._params.columnManagementPanelContainer.state = {
      isPanelOpen: true,
      duplicateColumnName: false,
      savingColumn: false,
      saveDisabled: true,
      errorMessage: null,
      showPanel: false,
      isContentLoading: true,
      confirmDeleteDialogIsOpen: false
    };

    // Wait a quarter of a second before displaying the panel to allow default values for the components to load in most cases.
    setTimeout(() => this._showPanel(), 250);
  }

  public getRenderProps(): IColumnManagementPanelProps {
    const params = this._params;
    const state = params.columnManagementPanelContainer.state;
    const strings = fillInColumnManagementPanelStrings(params.strings);
    let createFieldType = FieldType.Choice;
    if (params.createField && params.createField.fieldType !== undefined) {
      createFieldType = params.createField.fieldType;
    }
    let editFieldType = params.editField && params.editField.fieldType;
    let fieldType = this._isEditPanel ? editFieldType : createFieldType;
    let titleFormat = this._isEditPanel ? strings.editPanelTitleFormat : strings.titleFormat;
    let headerText = this._isEditPanel ? strings.editPanelTitle : strings.title;
    if (titleFormat && fieldType !== undefined) {
      let displayTypeString = strings['friendlyName' + FieldType[fieldType]];
      if (fieldType === FieldType.URL) {
        displayTypeString = params.isHyperlink ? strings['friendlyNameHyperlink'] : strings['friendlyNamePicture'];
      }
      if (displayTypeString) {
        headerText = StringHelper.format(titleFormat, displayTypeString);
      }
    }

    const panelProps: IPanelProps = {
      type: params.panelType ? params.panelType : PanelType.smallFixedFar,
      isOpen: state.isPanelOpen,
      headerText: headerText,
      closeButtonAriaLabel: strings.closeButtonAriaLabel,
      onDismiss: this._onDismiss,
      isLightDismiss: true
    };

    const columnManagementPanelContentProps: IColumnManagementPanelContentProps = {
      strings: strings,
      onClearError: this._onClearError,
      updateSaveDisabled: this._updateSaveDisabled,
      duplicateColumnName: state.duplicateColumnName,
      isEditPanel: this._isEditPanel,
      currentLanguage: params.pageContext.currentLanguage,
      updateParentStateWithCurrentValues: this._updateStateWithCurrentValues,
      currentValuesPromise: this._currentValuesPromise,
      fieldType: fieldType,
      isHyperlink: params.isHyperlink,
      isDocumentLibrary: this._isDocumentLibrary
    };

    return {
      panelProps: panelProps,
      columnManagementPanelContentProps: columnManagementPanelContentProps,
      saveDisabled: state.saveDisabled,
      onDismiss: this._onDismiss,
      onSave: this._onSave,
      errorMessage: state.errorMessage,
      isEditPanel: this._isEditPanel,
      showPanel: state.showPanel,
      isContentLoading: state.isContentLoading,
      confirmDeleteDialogIsOpen: state.confirmDeleteDialogIsOpen,
      showHideConfirmDeleteDialog: this._showHideConfirmDeleteDialog,
      onDelete: this._deleteColumn
    };
  }

  private setState(state: IColumnManagementPanelContainerState, callback?: () => void) {
    this._params.columnManagementPanelContainer.setState(state, callback && callback);
  }

  @autobind
  private _onDismiss() {
    // Closing the panel causes it to call this function, so this prevents it being run twice
    if (this._params.columnManagementPanelContainer.state.isPanelOpen) {
      this.setState({ isPanelOpen: false }, this._params.onDismiss);
    }
  }

  @autobind
  private _onSave(fieldSchema: IFieldSchema) {
      // Check if the column name entered is a duplicate. If it is, show error. Otherwise, create column.
      let checkColumnNameQos = new QosEvent({ name: 'ColumnManagementPanel.VerifyColumnName' });
      if (fieldSchema.DisplayName !== this._originalName && this._isColumnNameTaken(fieldSchema.DisplayName, this._listFields)) {
        checkColumnNameQos.end({ resultType: QosResultEnum.ExpectedFailure, resultCode: 'DuplicateColumnName' });
        this.setState({ duplicateColumnName: true, errorMessage: null });
      } else if (!this._listFields && fieldSchema.DisplayName !== this._originalName) {
        // The request to get our list of fields has still not returned or has failed. Because the user can't retry this call, kick the user out of the panel and show error in operations panel.
        let actionType: ColumnActionType = this._isEditPanel ? 'Edit' : 'Create';
        this._handleColumnActionErrorExternal(checkColumnNameQos, fieldSchema.DisplayName, actionType, this._getListFieldsError);
      } else {
        checkColumnNameQos.end({ resultType: QosResultEnum.Success });
        this._isEditPanel ? this._editColumn(fieldSchema) : this._createColumn(fieldSchema);
      }
  }

  @autobind
  private _createColumn(fieldSchema: IFieldSchema) {
    let createColumnQos = new QosEvent({ name: 'ColumnManagementPanel.CreateField' });
    this._listDataSource.createField(fieldSchema, this._params.listFullUrl).then((internalFieldName: string) => {
      this._handleColumnActionSuccess(createColumnQos, fieldSchema.DisplayName, internalFieldName, 'Create');
    }, (error: any) => {
      this._handleColumnActionErrorInPanel(createColumnQos, error, 'Create');
    });
  }

  @autobind
  private _editColumn(fieldSchema: IFieldSchema) {
    let editColumnQos = new QosEvent({ name: 'ColumnManagementPanel.EditField' });
    this._listDataSource.editField(this._params.editField.fieldName, fieldSchema, this._params.listFullUrl).then((responseText: string) => {
      this._handleColumnActionSuccess(editColumnQos, fieldSchema.DisplayName, this._params.editField.fieldName, 'Edit');
    }, (error: any) => {
      this._handleColumnActionErrorInPanel(editColumnQos, error, 'Edit');
    });
  }

  @autobind
  private _deleteColumn() {
    let deleteColumnQos = new QosEvent({ name: 'ColumnManagementPanel.DeleteField' });
    this._listDataSource.deleteField(this._params.editField.fieldName, this._params.listFullUrl).then((responseText: string) => {
      this._handleColumnActionSuccess(deleteColumnQos, this._originalName, this._params.editField.fieldName, 'Delete');
    }, (error: any) => {
      this._handleColumnActionErrorExternal(deleteColumnQos, this._originalName, 'Delete', error);
    });
  }

  @autobind
  private _handleColumnActionSuccess(actionQos: QosEvent, displayName: string, internalFieldName: string, actionType: ColumnActionType) {
    actionQos.end({ resultType: QosResultEnum.Success });
    this.setState({ isPanelOpen: false });
    this._params.onSuccess(displayName, internalFieldName, actionType);
  }

  @autobind
  private _handleColumnActionErrorInPanel(actionQos: QosEvent, error: any, actionType: ColumnActionType) {
    actionQos.end({ resultType: QosResultEnum.Failure, error: error });
    let message = handleCreateEditColumnError(error, this._errorStrings, actionType);
    this.setState({ errorMessage: message });
  }

  @autobind
  private _handleColumnActionErrorExternal(actionQos: QosEvent, displayName: string, actionType: ColumnActionType, error?: any) {
      actionQos.end({ resultType: QosResultEnum.Failure, ...error && { error: error } });
      this.setState({ isPanelOpen: false });
      this._params.onError(displayName, error, actionType);
  }

  @autobind
  private _updateSaveDisabled(name: string, requiredValues?: IUniqueFieldsComponentRequiredValues) {
    let requiredValueEmpty = requiredValues && Object.keys(requiredValues).some((key) => requiredValues[key] === "");
    if (!name || requiredValueEmpty) {
      this.setState({ saveDisabled: true });
    } else {
      this.setState({ saveDisabled: false });
    }
  }

  @autobind
  private _onClearError() {
      this.setState({ duplicateColumnName: false });
  }

  @autobind
  private _updateStateWithCurrentValues(currentValues: IColumnManagementPanelCurrentValues) {
    this.setState({ isContentLoading: false });
    this._updateSaveDisabled(currentValues.name, { choicesText: currentValues.choicesText });
    this._originalName = currentValues.name;
  }

  @autobind
  private _showPanel() {
    this.setState({ showPanel: true });
  }

  @autobind
  private _showHideConfirmDeleteDialog() {
      this.setState((prevState: IColumnManagementPanelContainerState) => ({
          confirmDeleteDialogIsOpen: !prevState.confirmDeleteDialogIsOpen
      }));
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
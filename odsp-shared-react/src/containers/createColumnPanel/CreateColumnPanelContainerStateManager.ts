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
        savingColumn: false
      };
      this._listDataSource = params.getListDataSource ? params.getListDataSource() : new ListDataSource(params.pageContext);
      this._listFieldsPromise = params.listFieldsPromise ? params.listFieldsPromise : null;
    }

    public getRenderProps(): ICreateColumnPanelProps {
      const params = this._params;
      const state = params.createColumnPanelContainer.state;

      const panelProps: IPanelProps = {
        type: params.panelType ? params.panelType : PanelType.smallFixedFar,
        headerText: params.strings.title,
        isOpen: state.isPanelOpen,
        onDismiss: this._onDismiss,
        isLightDismiss: true
      };

      const createColumnPanelContentProps: ICreateColumnPanelContentProps = {
        strings: {
          title: params.strings.title,
          guideText: params.strings.guideText,
          nameLabel: params.strings.nameLabel,
          descriptionLabel: params.strings.descriptionLabel,
          choicesLabel: params.strings.choicesLabel,
          choicesPlaceholder: params.strings.choicesPlaceholder,
          choicesAriaLabel: params.strings.choicesAriaLabel,
          defaultValueDropdown: params.strings.defaultValueDropdown,
          choiceDefaultValue: params.strings.choiceDefaultValue,
          manuallyAddValuesCheckbox: params.strings.manuallyAddValuesCheckbox,
          infoButtonAriaLabel: params.strings.infoButtonAriaLabel,
          manuallyAddValuesTeachingBubble: params.strings.manuallyAddValuesTeachingBubble,
          moreOptionsButtonText: params.strings.moreOptionsButtonText,
          saveButtonText: params.strings.saveButtonText,
          cancelButtonText: params.strings.cancelButtonText,
          allowMultipleSelectionToggle: params.strings.allowMultipleSelectionToggle,
          requiredToggle: params.strings.requiredToggle,
          enforceUniqueValuesToggle: params.strings.enforceUniqueValuesToggle,
          addToAllContentTypesToggle: params.strings.addToAllContentTypesToggle,
          toggleOnText: params.strings.toggleOnText,
          toggleOffText: params.strings.toggleOffText,
          columnValidationButtonText: params.strings.columnValidationButtonText,
          columnValidationGuideText: params.strings.columnValidationGuideText,
          columnValidationLearnMoreLink: params.strings.columnValidationLearnMoreLink,
          formulaLabel: params.strings.formulaLabel,
          userMessageGuideText: params.strings.userMessageGuideText,
          userMessageLabel: params.strings.userMessageLabel,
          duplicateColumnNameError: params.strings.duplicateColumnNameError,
          genericError: params.strings.genericError
        },
        onDismiss: this._onDismiss,
        onSave: this._onSave,
        onClearError: this._onClearError,
        duplicateColumnName: state.duplicateColumnName,
        listColumnsUnknown: state.listColumnsUnknown
      };

      return {
        panelProps: panelProps,
        createColumnPanelContentProps: createColumnPanelContentProps
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
          this.setState({ listColumnsUnknown: true });
        });
      } else {
        this.setState({ isPanelOpen: false, savingColumn: true });
        let createFieldPromise = this._listDataSource.createField(options);
        this._params.onSave(options.displayName, createFieldPromise);
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
import * as React from 'react';
import { BaseComponent, autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { IBaseMoreOptionsComponent, IBaseMoreOptionsComponentSchemaValues } from './IMoreOptionsComponent';
import { IColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/ColumnManagementPanelStringHelper';
import { FieldType } from '@ms/odsp-datasources/lib/List';

export interface IBaseMoreOptionsProps {
  /** Callback to update whether the column validation section is shown or not. */
  updateShowColumnValidationState: (allowMultipleSelection: boolean) => void;
  /** Type of the field so that it can be updated based on the state of allow multiple selections. */
  fieldType: FieldType;
  /** Collection of localized strings to show in the create column panel UI. */
  strings: IColumnManagementPanelStrings;
  /** Default checked state of the allow multiple selection toggle. @default false. */
  allowMultipleSelection: boolean;
  /** Default checked state of the required toggle. @default false. */
  required: boolean;
  /** Default checked state of the enforce unique values toggle. @default false. */
  enforceUniqueValues: boolean;
<<<<<<< HEAD
  /** Whether or not to show the required toggle. @default true. */
=======
  /** Default checked state of the unlimited length in document libraries toggle. Default is false. */
  unlimitedLengthInDocumentLibrary: boolean;
  /** Whether or not to show the allow multiple selections toggle. Default is false. */
  showAllowMultipleToggle?: boolean;
  /** Whether or not to show the required toggle. Default is false. */
>>>>>>> Create multiline text panel: missing appendOnly error message
  showRequiredToggle?: boolean;
  /** Whether or not to show the allow multiple selections toggle. @default false. */
  showAllowMultipleToggle?: boolean;
  /** Whether or not to show the enforce unique values toggle. @default false. */
  showEnforceUniqueToggle?: boolean;
  /** Whether or not to showe the unlimited length in document libraries toggle. Default is false. */
  showUnlimitedLengthInDocumentLibraryToggle?: boolean;
}

export interface IBaseMoreOptionsState {
  allowMultipleSelection?: boolean;
  enforceUniqueValues?: boolean;
  unlimitedLengthInDocumentLibrary?: boolean;
};

export class BaseMoreOptions extends BaseComponent<IBaseMoreOptionsProps, IBaseMoreOptionsState> implements IBaseMoreOptionsComponent {
  private _required: Toggle;

  constructor(props: IBaseMoreOptionsProps) {
    super(props);
    this.state = {
      allowMultipleSelection: this.props.allowMultipleSelection,
      enforceUniqueValues: this.props.enforceUniqueValues,
      unlimitedLengthInDocumentLibrary: this.props.unlimitedLengthInDocumentLibrary
    };
  }

  public render() {
    let strings = this.props.strings;
    let allowMultipleToggle = (
      <Toggle className='ms-ColumnManagementPanel-toggle allowMultipleSelection'
        checked={ this.state.allowMultipleSelection }
        label={ strings.allowMultipleSelectionToggle }
        onText={ strings.toggleOnText }
        offText={ strings.toggleOffText }
        onChanged={ this._multiSelectChanged } />
    );
    let requiredToggle = (
      <Toggle className='ms-ColumnManagementPanel-toggle requiredToggle'
        defaultChecked={ this.props.required }
        label={ strings.requiredToggle }
        onText={ strings.toggleOnText }
        offText={ strings.toggleOffText }
        ref={ this._resolveRef('_required') } />
    );
    let enforceUniqueToggle = (
      <Toggle className='ms-ColumnManagementPanel-toggle enforceUniqueValues'
        checked={ this.state.enforceUniqueValues }
        disabled={ this.state.allowMultipleSelection }
        label={ strings.enforceUniqueValuesToggle }
        onText={ strings.toggleOnText }
        offText={ strings.toggleOffText }
        onChanged={ this._enforceUniqueValuesChanged } />
    );
    let unlimitedLengthInDocumentLibraryToggle = (
      <Toggle className='ms-ColumnManagementPanel-toggle'
          checked={ this.state.unlimitedLengthInDocumentLibrary }
          disabled={ this.state.allowMultipleSelection }
          label= { strings.unlimitedLengthInDocumentLibraryToggle }
          onText = { strings.toggleOnText }
          offText = { strings.toggleOffText }
          onChanged = { this._unlimitedLengthInDocumentLibraryChanged } />
    );
    return (
      <div className={ 'ms-ColumnManagementPanel-baseMoreOptions' }>
        { this.props.showAllowMultipleToggle && allowMultipleToggle }
        { this.props.showRequiredToggle !== undefined && !this.props.showRequiredToggle ? null : requiredToggle }
        { this.props.showEnforceUniqueToggle && enforceUniqueToggle }
        {this.props.showUnlimitedLengthInDocumentLibraryToggle && unlimitedLengthInDocumentLibraryToggle}
      </div>
    );
  }

  @autobind
  public getSchemaValues(): IBaseMoreOptionsComponentSchemaValues {
    let schemaValues: IBaseMoreOptionsComponentSchemaValues = {
      Type: this.props.fieldType,
      Required: this._required.checked,
      EnforceUniqueValues: this.state.enforceUniqueValues,
      Indexed: this.state.enforceUniqueValues,
      UnlimitedLengthInDocumentLibrary: this.state.unlimitedLengthInDocumentLibrary
    };
    if (this.state.allowMultipleSelection) {
      if (this.props.fieldType === FieldType.Choice) {
        schemaValues.Type = FieldType.MultiChoice;
      } else if (this.props.fieldType === FieldType.User) {
        schemaValues.Type = FieldType.UserMulti;
        schemaValues.Mult = true;
      }
    }
    return schemaValues;
  }

  @autobind
  private _multiSelectChanged(checked: boolean) {
    this.props.updateShowColumnValidationState(checked);
    this.setState({
      allowMultipleSelection: checked,
      enforceUniqueValues: false
    });
  }

  @autobind
  private _enforceUniqueValuesChanged(checked: boolean) {
    this.setState({
      enforceUniqueValues: checked
    });
  }

    @autobind
  private _unlimitedLengthInDocumentLibraryChanged(checked: boolean) {
      this.setState({
          unlimitedLengthInDocumentLibrary: checked
      });
  }
}
import * as React from 'react';
import { BaseComponent, IBaseProps, autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { IBaseMoreOptionsComponent, IBaseMoreOptionsComponentSchemaValues } from './IMoreOptionsComponent';
import { IColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/ColumnManagementPanelStringHelper';
import { FieldType } from '@ms/odsp-datasources/lib/List';

export interface IBaseMoreOptionsProps extends IBaseProps {
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
  /** Default checked state of the unlimited length in document libraries toggle. @default false. */
  unlimitedLengthInDocumentLibrary: boolean;
  /** Whether or not to show the required toggle. @default true. */
  showRequiredToggle?: boolean;
  /** Whether or not to show the allow multiple selections toggle. @default false. */
  showAllowMultipleToggle?: boolean;
  /** Whether or not to show the enforce unique values toggle. @default false. */
  showEnforceUniqueToggle?: boolean;
  /** Whether or not to show the unlimited length in document libraries toggle. @default false. */
  showUnlimitedLengthInDocumentLibraryToggle?: boolean;
}

export interface IBaseMoreOptionsState {
  allowMultipleSelection?: boolean;
  enforceUniqueValues?: boolean;
  unlimitedLengthInDocumentLibrary?: boolean;
  required?: boolean;
};

export class BaseMoreOptions extends BaseComponent<IBaseMoreOptionsProps, IBaseMoreOptionsState> implements IBaseMoreOptionsComponent {

  constructor(props: IBaseMoreOptionsProps) {
    super(props);
    this.state = {
      allowMultipleSelection: this.props.allowMultipleSelection,
      enforceUniqueValues: this.props.enforceUniqueValues,
      unlimitedLengthInDocumentLibrary: this.props.unlimitedLengthInDocumentLibrary,
      required: this.props.required
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
        checked={ this.state.required }
        label={ strings.requiredToggle }
        onText={ strings.toggleOnText }
        offText={ strings.toggleOffText }
        onChanged={ this._requiredChanged } />
    );
    let enforceUniqueToggle = (
      <Toggle className='ms-ColumnManagementPanel-toggle enforceUniqueValues'
        checked={ this.state.enforceUniqueValues }
        disabled={ this.state.allowMultipleSelection && this.props.showAllowMultipleToggle }
        label={ strings.enforceUniqueValuesToggle }
        onText={ strings.toggleOnText }
        offText={ strings.toggleOffText }
        onChanged={ this._enforceUniqueValuesChanged } />
    );
    let unlimitedLengthInDocumentLibraryToggle = (
      <Toggle className='ms-ColumnManagementPanel-toggle unlimitedLengthInDocumentLibrary'
        checked={ this.state.unlimitedLengthInDocumentLibrary }
        label={ strings.unlimitedLengthInDocumentLibraryToggle }
        onText={ strings.toggleOnText }
        offText={ strings.toggleOffText }
        onChanged={ this._unlimitedLengthInDocumentLibraryChanged } />
    );
    return (
      <div className={ 'ms-ColumnManagementPanel-baseMoreOptions' }>
        { this.props.showAllowMultipleToggle && allowMultipleToggle }
        { this.props.showRequiredToggle !== false && requiredToggle }
        { this.props.showEnforceUniqueToggle && enforceUniqueToggle }
        { this.props.showUnlimitedLengthInDocumentLibraryToggle && unlimitedLengthInDocumentLibraryToggle }
      </div>
    );
  }

  @autobind
  public getSchemaValues(): IBaseMoreOptionsComponentSchemaValues {
    /** Get the schema values from the state, but only if that property is visible for this field type. State persists when field type
     * is switched but it shouldn't be saved unless the property is visible. */
    let schemaValues: IBaseMoreOptionsComponentSchemaValues = {
      Type: this.props.fieldType,
      Required: this.state.required && this.props.showRequiredToggle !== false ? true : null,
      EnforceUniqueValues: this.state.enforceUniqueValues && this.props.showEnforceUniqueToggle ? true : null,
      Indexed: this.state.enforceUniqueValues && this.props.showEnforceUniqueToggle ? true : null,
      UnlimitedLengthInDocumentLibrary: this.state.unlimitedLengthInDocumentLibrary && this.props.showUnlimitedLengthInDocumentLibraryToggle ? true : null
    };
    if (this.state.allowMultipleSelection && this.props.showAllowMultipleToggle) {
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
  private _requiredChanged(checked: boolean) {
    this.setState({
      required: checked
    });
  }

  @autobind
  private _unlimitedLengthInDocumentLibraryChanged(checked: boolean) {
    this.setState({
      unlimitedLengthInDocumentLibrary: checked
    });
  }
}
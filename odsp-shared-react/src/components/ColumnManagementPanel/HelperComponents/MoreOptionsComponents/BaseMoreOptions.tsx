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
  /** Default checked state of the allow multiple selection toggle. Default is false. */
  allowMultipleSelection: boolean;
  /** Default checked state of the required toggle. Default is false. */
  required:  boolean;
  /** Default checked state of the enforce unique values toggle. Default is false. */
  enforceUniqueValues: boolean;
  /** Whether or not to show the allow multiple selections toggle. Default is false. */
  showAllowMultipleToggle?: boolean;
  /** Whether or not to show the required toggle. Default is false. */
  showRequiredToggle?: boolean;
  /** Whether or not to show the enforce unique values toggle. Default is false. */
  showEnforceUniqueToggle?: boolean;
}

export interface IBaseMoreOptionsState {
  allowMultipleSelection?: boolean;
  enforceUniqueValues?: boolean;
};

export class BaseMoreOptions extends BaseComponent<IBaseMoreOptionsProps, IBaseMoreOptionsState> implements IBaseMoreOptionsComponent {
  private _required: Toggle;

  constructor(props: IBaseMoreOptionsProps) {
    super(props);
    this.state = {
      allowMultipleSelection: this.props.allowMultipleSelection,
      enforceUniqueValues: this.props.enforceUniqueValues
    };
  }

  public render() {
    let strings = this.props.strings;
    let allowMultipleToggle = (
      <Toggle className='ms-ColumnManagementPanel-toggle'
          defaultChecked={ this.state.allowMultipleSelection }
          label= { strings.allowMultipleSelectionToggle }
          onText = { strings.toggleOnText }
          offText = { strings.toggleOffText }
          onChanged = { this._multiSelectChanged } />
    );
    let requiredToggle = (
      <Toggle className='ms-ColumnManagementPanel-toggle'
          defaultChecked={ this.props.required }
          label= { strings.requiredToggle }
          onText = { strings.toggleOnText }
          offText = { strings.toggleOffText }
          ref={ this._resolveRef('_required')} />
    );
    let enforceUniqueToggle = (
      <Toggle className='ms-ColumnManagementPanel-toggle'
          checked={ this.state.enforceUniqueValues }
          disabled={ this.state.allowMultipleSelection }
          label= { strings.enforceUniqueValuesToggle }
          onText = { strings.toggleOnText }
          offText = { strings.toggleOffText }
          onChanged = { this._enforceUniqueValuesChanged } />
    );
    return (
      <div className={ 'ms-ColumnManagementPanel-baseMoreOptions'}>
        { this.props.showAllowMultipleToggle && allowMultipleToggle }
        { this.props.showRequiredToggle && requiredToggle }
        { this.props.showEnforceUniqueToggle && enforceUniqueToggle }
      </div>
    );
  }

  @autobind
  public getSchemaValues(): IBaseMoreOptionsComponentSchemaValues {
    let schemaValues: IBaseMoreOptionsComponentSchemaValues = {
      Type: this.props.fieldType,
      Required: this._required.checked,
      EnforceUniqueValues: this.state.enforceUniqueValues,
      Indexed: this.state.enforceUniqueValues
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
}
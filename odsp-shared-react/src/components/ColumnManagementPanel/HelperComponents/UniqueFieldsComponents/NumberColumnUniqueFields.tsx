import * as React from 'react';
import { BaseComponent, IBaseProps, autobind } from 'office-ui-fabric-react/lib/Utilities';
import {
  IUniqueFieldsComponent,
  IUniqueFieldsComponentSchemaValues
} from './IUniqueFieldsComponent';
import { IColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/ColumnManagementPanelStringHelper';
import { DefaultValueEntryField } from '../SharedComponents/index';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';

export interface INumberColumnUniqueFieldsProps extends IBaseProps {
  /** Collection of localized strings to show in the create column panel UI. */
  strings: IColumnManagementPanelStrings;
  /** Whether or not to use a calculated default value. */
  useCalculatedDefaultValue: boolean;
  /** The default formula for the field. */
  defaultFormula: string;
  /** The default value of the field. */
  defaultValue: string;
  /** Whether the number is displayed as a percentage. */
  showAsPercentage: boolean;
  /** Number of decimals places to display. */
  displayFormat: number;
  /** Help id link about proper formula syntax. */
  formulaLearnMoreLink: string;
  /** If provided, additional class name to the root element. */
  className?: string;
}

export interface INumberColumnUniqueFieldsState {
  decimalPlaces?: IDropdownOption;
}

export class NumberColumnUniqueFields extends BaseComponent<INumberColumnUniqueFieldsProps, INumberColumnUniqueFieldsState> implements IUniqueFieldsComponent {
  private _decimalPlacesDropdownOptions: IDropdownOption[];
  private _showAsPercentage: Checkbox;
  private _defaultValue: DefaultValueEntryField;

  constructor(props: INumberColumnUniqueFieldsProps) {
    super(props);
    this._decimalPlacesDropdownOptions = [{ key: 0, text: this.props.strings.decimalPlacesAutomatic }];
    for (var i = 0; i < 6; i++) {
      this._decimalPlacesDropdownOptions.push({ key: i + 1, text: i.toString() });
    }
    // Automatic display format is -1. 0-5 decimal places are 0-5.
    this.state = {
      decimalPlaces: this._decimalPlacesDropdownOptions[this.props.displayFormat + 1]
    };
  }

  public render() {
    let strings = this.props.strings;
    return (
      <div className={ this.props.className ? `${this.props.className} ms-ColumnManagementPanel-uniqueFields` : 'ms-ColumnManagementPanel-uniqueFields' }>
        <Dropdown className='ms-ColumnManagementPanel-decimalsDropdown'
          label={ strings.decimalPlacesDropdownLabel }
          ariaLabel={ strings.decimalPlacesDropdownAriaLabel }
          options={ this._decimalPlacesDropdownOptions }
          selectedKey={ this.state.decimalPlaces.key }
          onChanged={ this._decimalDropdownChanged } />
        <Checkbox className='ms-ColumnManagementPanel-showAsPercentageCheckbox ms-ColumnManagementPanel-checkboxNoInfo'
          label={ strings.showAsPercentageCheckbox }
          defaultChecked={ this.props.showAsPercentage }
          ref={ this._resolveRef('_showAsPercentage') } />
        <DefaultValueEntryField
          defaultValue={ this.props.defaultValue }
          defaultFormula={ this.props.defaultFormula }
          useCalculatedDefaultValue={ this.props.useCalculatedDefaultValue }
          formulaLearnMoreLink={ this.props.formulaLearnMoreLink }
          strings={ strings }
          defaultValuePlaceholder={ strings.enterNumberPlaceholder }
          defaultValueAriaLabel={ strings.defaultNumberAriaLabel }
          checkIsNumber={ true }
          ref={ this._resolveRef('_defaultValue') } />
      </div>
    );
  }

  @autobind
  public getSchemaValues(): IUniqueFieldsComponentSchemaValues | false {
    let schemaValues = this._defaultValue.getSchemaValues();
    if (schemaValues) {
      schemaValues.Percentage = this._showAsPercentage.checked;
      schemaValues.Decimals = this.state.decimalPlaces.key === 0 ? null : Number(this.state.decimalPlaces.text);
      return schemaValues;
    }
    return false;
  }

  @autobind
  private _decimalDropdownChanged(option: IDropdownOption) {
    this.setState({
      decimalPlaces: option
    });
  }
}
import * as React from 'react';
import { BaseComponent, autobind } from 'office-ui-fabric-react/lib/Utilities';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { IUniqueFieldsComponent,
        IUniqueFieldsComponentSchemaValues } from '../UniqueFieldsComponents/IUniqueFieldsComponent';
import { IColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/ColumnManagementPanelStringHelper';
import { InfoTeachingIcon } from './InfoTeachingIcon';

export interface IDefaultValueEntryFieldProps {
  /** The default value of the field. */
  defaultValue: string;
  /** The default formula for the field. */
  defaultFormula: string;
  /** Whether or not to use a calculated default value. */
  useCalculatedDefaultValue: boolean;
  /** Collection of localized strings to show in the create column panel UI. */
  strings: IColumnManagementPanelStrings;
  /** Placeholder text for the default value entry field. */
  defaultValuePlaceholder: string;
  /** Aria label for the default value entry field. */
  defaultValueAriaLabel: string;
  /** Help id link about proper formula syntax. */
  formulaLearnMoreLink: string;
  /** Whether or not to verify the default value is a number. */
  checkIsNumber?: boolean;
}

export interface IDefaultValueEntryFieldState {
  defaultValue?: string;
  defaultValueErrorMessage?: string;
  defaultFormula?: string;
  useCalculatedDefaultValue?: boolean;
}

export class DefaultValueEntryField extends BaseComponent<IDefaultValueEntryFieldProps, IDefaultValueEntryFieldState> implements IUniqueFieldsComponent {

  constructor(props: IDefaultValueEntryFieldProps) {
    super(props);
    this.state = {
      useCalculatedDefaultValue: this.props.useCalculatedDefaultValue,
      defaultFormula: this.props.defaultFormula,
      defaultValue: this.props.defaultValue,
      defaultValueErrorMessage: ""
    };
  }

  public render() {
    let strings = this.props.strings;
    return (
      <div>
        { this.state.useCalculatedDefaultValue ?
            <TextField className='ms-ColumnManagementPanel-defaultValueEntryField'
              placeholder={ strings.defaultFormulaPlaceholder }
              ariaLabel={ strings.defaultFormulaAriaLabel }
              label={ strings.defaultValueHeader }
              value={ this.state.defaultFormula }
              onChanged={ this._defaultFormulaChanged } /> :
            <TextField className='ms-ColumnManagementPanel-defaultValueEntryField'
              placeholder={ this.props.defaultValuePlaceholder }
              ariaLabel={ this.props.defaultValueAriaLabel }
              label={ strings.defaultValueHeader }
              value={ this.state.defaultValue }
              onChanged={ this._defaultValueChanged }
              errorMessage={ this.state.defaultValueErrorMessage } />
        }
        <div className= 'ms-ColumnManagementPanel-useCalculatedValue'>
          <Checkbox className='ms-ColumnManagementPanel-checkbox'
            label={ strings.useCalculatedValue }
            defaultChecked={ this.state.useCalculatedDefaultValue }
            onChange={ this._onUseCalculatedValueChanged } />
          <InfoTeachingIcon className='ms-ColumnManagementPanel-checkboxInfo'
            infoButtonAriaLabel={ strings.infoButtonAriaLabel }
            calloutContent={ strings.useCalculatedValueTeachingBubble }
            helpLink={ {
              href: this.props.formulaLearnMoreLink,
              displayText: strings.formulaLearnMoreLink
            } } />
        </div>
      </div>
    );
  }

  @autobind
  public getSchemaValues(): IUniqueFieldsComponentSchemaValues {
    if (!this.state.useCalculatedDefaultValue && this.state.defaultValueErrorMessage) {
        return false;
    }
    return {
      DefaultValue: this.state.useCalculatedDefaultValue ? null : this.state.defaultValue,
      DefaultFormula: this.state.useCalculatedDefaultValue ? this.state.defaultFormula : null
    };
  }

  @autobind
  private _onUseCalculatedValueChanged(ev: any, checked: boolean) {
      this.setState({
          useCalculatedDefaultValue: checked
      });
  }

  @autobind
  private _defaultFormulaChanged(newValue: string) {
    this.setState({ defaultFormula: newValue });
  }

  @autobind
  private _defaultValueChanged(newValue: string) {
    this.setState({
      defaultValue: newValue,
      defaultValueErrorMessage: this.props.checkIsNumber && isNaN(Number(newValue)) ? this.props.strings.defaultNumberNotValid : ""
    });
  }
};
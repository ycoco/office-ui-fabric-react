import * as React from 'react';
import { BaseComponent, IBaseProps, autobind } from 'office-ui-fabric-react/lib/Utilities';
import {
  IUniqueFieldsComponent,
  IUniqueFieldsComponentSchemaValues
} from './IUniqueFieldsComponent';
import { IColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/ColumnManagementPanelStringHelper';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

export interface IBooleanColumnUniqueFieldsProps extends IBaseProps {
  /** Collection of localized strings to show in the create column panel UI. */
  strings: IColumnManagementPanelStrings;
  /** The default value of the field. */
  defaultValue: string;
  /** If provided, additional class name to the root element. */
  className?: string;
}

export interface IBooleanColumnUniqueFieldsState {
  defaultValue: IDropdownOption;
}

export class BooleanColumnUniqueFields extends BaseComponent<IBooleanColumnUniqueFieldsProps, IBooleanColumnUniqueFieldsState> implements IUniqueFieldsComponent {
  private _dropdownOptions: IDropdownOption[];
  constructor(props: IBooleanColumnUniqueFieldsProps) {
    super(props);
    this._dropdownOptions = [{
      key: 0,
      text: this.props.strings.toggleOnText
    }, {
      key: 1,
      text: this.props.strings.toggleOffText
    }];
    let defaultOff = this.props.defaultValue && this.props.defaultValue === "0";
    this.state = {
      defaultValue: defaultOff ? this._dropdownOptions[1] : this._dropdownOptions[0]
    };
  }

  public render() {
    let strings = this.props.strings;
    return (
      <div className={ this.props.className ? `${this.props.className} ms-ColumnManagementPanel-uniqueFields` : 'ms-ColumnManagementPanel-uniqueFields' }>
        <Dropdown className='ms-ColumnManagementPanel-booleanDefaultValue'
          label={ strings.defaultValueHeader }
          ariaLabel={ strings.defaultValueDropdownAriaLabel }
          options={ this._dropdownOptions }
          selectedKey={ this.state.defaultValue.key }
          onChanged={ this._defaultValueChanged } />
      </div>
    );
  }

  @autobind
  public getSchemaValues(): IUniqueFieldsComponentSchemaValues | false {
    return {
      DefaultValue: this.state.defaultValue.text === this.props.strings.toggleOffText ? "0" : "1"
    };
  }

  @autobind
  private _defaultValueChanged(option: IDropdownOption) {
    this.setState({
      defaultValue: option
    });
  }
}
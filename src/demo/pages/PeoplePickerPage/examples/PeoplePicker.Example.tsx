import * as React from 'react';
import { PeoplePicker } from '../../../../components/PeoplePicker/PeoplePicker';
import { PeoplePickerType } from '../../../../components/PeoplePicker/PeoplePicker.Props';
import { PeoplePickerDataSource } from '@ms/odsp-datasources/lib/mocks/MockPeoplePickerDataSource';
import { IDropdownOption, Dropdown } from 'office-ui-fabric-react/lib/Dropdown';

export class PeoplePickerExample extends React.Component<any, { currentPicker: PeoplePickerType }> {

  constructor() {
    super();
    this.state = { currentPicker: PeoplePickerType.normal };
  }

  public render() {
    let { currentPicker } = this.state;
    return (
      <div>
        <PeoplePicker
          dataSource={ new PeoplePickerDataSource() }
          peoplePickerType={ currentPicker }/>
        <Dropdown label='Select People Picker Type'
          options={[
            { key: PeoplePickerType.normal, text: 'Normal' },
            { key: PeoplePickerType.listBelow, text: 'Members List' }
          ]}
          selectedKey={ currentPicker }
          onChanged={ this._dropDownSelected.bind(this) }
          />
      </div>
    );
  }

  private _dropDownSelected(option: IDropdownOption) {
    this.setState({ currentPicker: option.key as PeoplePickerType });
  }

}
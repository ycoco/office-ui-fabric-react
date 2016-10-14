import * as React from 'react';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { PeoplePicker } from '../../../../components/PeoplePicker/PeoplePicker';
import { PeoplePickerType } from '../../../../components/PeoplePicker/PeoplePicker.Props';
import { PeoplePickerDataSource } from '@ms/odsp-datasources/lib/mocks/MockPeoplePickerDataSource';
import { IDropdownOption, Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import {
  IPersonaProps,
  Persona,
  PersonaPresence,
  PersonaSize
} from 'office-ui-fabric-react/lib/Persona';

export class PeoplePickerExample extends React.Component<any, { currentPicker: PeoplePickerType }> {

  constructor() {
    super();
    this.state = { currentPicker: PeoplePickerType.normal };
  }

  public render() {
    let { currentPicker } = this.state;
    let onRenderItem;
    let onRenderSuggestion;
    if (currentPicker === PeoplePickerType.customListBelow) {
      onRenderItem = (props) => <CustomSelectedItem {...props} />;
      onRenderSuggestion = (props) => <CustomSuggestionItem {...props} />;
    }
    return (
      <div>
        <PeoplePicker
          dataSource={ new PeoplePickerDataSource() }
          peoplePickerType={ this.state.currentPicker }
          onRenderItem={ onRenderItem }
          onRenderSuggestionsItem={ onRenderSuggestion }/>
        <Dropdown label='Select People Picker Type'
          options={[
            { key: PeoplePickerType.normal, text: 'Normal' },
            { key: PeoplePickerType.compact, text: 'Compact' },
            { key: PeoplePickerType.customListBelow, text: 'Members List' }
          ]}
          selectedKey={ this.state.currentPicker }
          onChanged={ this._dropDownSelected.bind(this) }
          />
      </div>
    );
  }

  private _dropDownSelected(option: IDropdownOption) {
    this.setState({ currentPicker: option.key as PeoplePickerType });
  }

}

export class CustomSelectedItem extends React.Component<any, any> {
  public render() {
    let {
      item,
      onRemoveItem
    } = this.props;
    return (
      <div className='ms-PickerPersona-Container'>
        <div className='ms-PickerItem-content'>
          <Persona
            { ...item }
            presence={ item.presence ? item.presence : PersonaPresence.online }
            />
        </div>
        <div className='ms-PickerItem-content'>
          <Button
            icon={ 'Cancel' }
            buttonType={ ButtonType.icon }
            onClick={ onRemoveItem }
            />
        </div>
      </div>
    );
  }
}

export class CustomSuggestionItem extends React.Component<IPersonaProps, any> {
  public render() {
    return (
      <div className='ms-PickerItem-content'>
      <Persona
        { ...this.props }
        presence={ this.props.presence ? this.props.presence : PersonaPresence.online }
        size={ PersonaSize.extraSmall }
        />
    </div>);
  }
}
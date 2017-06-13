/* tslint:disable */
import * as React from 'react';
/* tslint:enable */
import {
  Persona,
  PersonaPresence,
  PersonaSize,
  IPersonaProps
} from 'office-ui-fabric-react/lib/Persona';
import {
  IPerson
} from '@ms/odsp-datasources/lib/PeoplePicker';
import { IPickerItemProps } from 'office-ui-fabric-react/lib/Pickers';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { css } from 'office-ui-fabric-react/lib/Utilities';
import './PickerItem.scss'

function convertIPersonToIPersonaProps(person: IPerson): IPersonaProps {
  return {
    primaryText: person.name ? person.name : '',
    imageUrl: person.image ? person.image : '',
    tertiaryText: person.email ? person.email : '',
    secondaryText: person.job ? person.job : '',
    imageInitials: ''
  };
}

export const SuggestionItemDefault: (person: IPerson) => JSX.Element = (person: IPerson) => {
  let personaProps: IPersonaProps = convertIPersonToIPersonaProps(person);
  return (
    <div className='ms-PeoplePicker-personaContent'>
      <Persona
        { ...personaProps }
        presence={ PersonaPresence.none }
        size={ PersonaSize.small }
        className={ 'ms-PeoplePicker-pickerPersona' }
      />
    </div>
  );
};

export const SelectedItemDefault: (props: IPickerItemProps<IPerson>) => JSX.Element = (props: IPickerItemProps<IPerson>) => {
  let {
    item,
    onRemoveItem,
    index,
    selected
  } = props;
  let personaProps: IPersonaProps = convertIPersonToIPersonaProps(item);
  return (
    <div
      className={ css('ms-PickerPersona-container', {
        'is-selected': selected
      }) }
      data-is-focusable={ true }
      data-selection-index={ index }
      key={ index } >
      <div className='ms-PickerItem-content'>
        <Persona
          { ...personaProps }
          presence={ PersonaPresence.none }
          size={ PersonaSize.extraSmall }
        />
      </div>
      <Button
        onClick={ () => { if (onRemoveItem) { onRemoveItem(); } } }
        iconProps={ { iconName: 'Cancel' } }
        buttonType={ ButtonType.icon }
        className='ms-PickerItem-content'
        data-is-focusable={ false }
      >
      </Button>
    </div >
  );
};

export const SelectedItemBelowDefault: (props: IPickerItemProps<IPerson>) => JSX.Element = (props: IPickerItemProps<IPerson>) => {
  let {
    item,
    onRemoveItem,
    index,
    selected
  } = props;
  let personaProps: IPersonaProps = convertIPersonToIPersonaProps(item);
  return (
    <div
      className={ css('ms-PickerPersona-container is-listbelow', {
        'is-selected': selected
      }) }
      data-is-focusable={ true }
      data-selection-index={ index }
      key={ index } >
      <div className='ms-PickerPersona-content'>
        <Persona
          { ...personaProps }
          presence={ PersonaPresence.none }
          size={ PersonaSize.small }
        />
      </div>
      <div className='ms-PickerItem-sideContent'>
        <Button
          onClick={ () => { if (onRemoveItem) { onRemoveItem(); } } }
          iconProps={ { iconName: 'Cancel' } }
          buttonType={ ButtonType.icon }
          className='ms-PickerItem-content'
          data-is-focusable={ false }
        >
        </Button>
      </div>
    </div >
  );
};

export const SelectedItemBelowCustomMenu: (props: IPickerItemProps<IPerson>, menu?: JSX.Element) => JSX.Element = (props: IPickerItemProps<IPerson>, menu?: JSX.Element) => {
  let {
    item,
    onRemoveItem,
    index,
    selected
  } = props;
  let personaProps: IPersonaProps = convertIPersonToIPersonaProps(item);
  return (
    <div
      className={ css('ms-PickerPersona-container is-listbelow', {
        'is-selected': selected
      }) }
      data-is-focusable={ true }
      data-selection-index={ index }
      key={ index } >
      <div className='ms-PickerPersona-content'>
        <Persona
          { ...personaProps }
          presence={ PersonaPresence.none }
          size={ PersonaSize.small }
        >
          { (menu ? menu : (null)) }
        </Persona>
      </div>
      <div className='ms-PickerItem-sideContent'>
        <Button
          onClick={ () => { if (onRemoveItem) { onRemoveItem(); } } }
          iconProps={ { iconName: 'Cancel' } }
          buttonType={ ButtonType.icon }
          className='ms-PickerItem-content'
          data-is-focusable={ false }
        >
        </Button>
      </div>
    </div >
  );
};
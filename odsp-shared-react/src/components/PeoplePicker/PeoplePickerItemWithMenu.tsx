import * as React from 'react';
/* tslint:enable */
import {
  Persona,
  PersonaPresence,
  PersonaSize,
  IPersonaProps
} from 'office-ui-fabric-react/lib/Persona';
import {
  autobind,
  BaseComponent,
  css
} from 'office-ui-fabric-react/lib/Utilities';
import {
  IPerson
} from '@ms/odsp-datasources/lib/PeoplePicker';
import { IPickerItemProps } from 'office-ui-fabric-react/lib/Pickers';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { ContextualMenu, DirectionalHint, IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import './PeoplePickerItemWithMenu.scss'

export interface IPersonWithMenuProps<T extends IPerson> extends IPickerItemProps<T> {
  menuTitle?: string;
  menuItems?: IContextualMenuItem[];
}

export interface IPersonaWithMenuState {
  isContextualMenuVisible?: boolean;
}

export class PeoplePickerItemWithMenu<T extends IPerson> extends BaseComponent<IPersonWithMenuProps<T>, IPersonaWithMenuState>  {
  private _buttonTarget: HTMLElement;

  constructor(props: IPersonWithMenuProps<T>) {
    super(props);
    this.state = { isContextualMenuVisible: false }
  }

  public render() {
    let {
      item,
      onRemoveItem,
      index,
      selected
    } = this.props;
    let personaProps: IPersonaProps = this._convertIPersonToIPersonaProps(item);

    return (
      <div
        className={ css('ms-PickerPersonaMenu-container', {
          'is-selected': selected
        }) }
        data-selection-index={ index }
        key={ index }
        data-is-focusable={ true } >
        <FocusZone className='ms-PickerPersona-item'>
          <div className='ms-PickerPersona-content'>
            <Persona
              { ...personaProps }
              presence={ PersonaPresence.none }
              size={ PersonaSize.small }
              >
              { this.props.menuTitle && (
                <div className='ms-sitePerm-ContextMenu' >
                  <div className='ms-sitePerm-buttonArea' ref={ this._resolveRef('_buttonTarget') }>
                    <span className='ms-sitePerm-linkText' onClick={ this._onClick } data-is-focusable={ true } role={ 'button' } aria-haspopup={ true } >
                      { this.props.menuTitle }
                      <i className={ 'ms-sitePermMenu-chevron ms-Icon ms-Icon--ChevronDown' }>
                      </i>
                    </span>
                  </div>
                  { this.state.isContextualMenuVisible && (
                    <ContextualMenu
                      items={ this.props.menuItems }
                      isBeakVisible={ false }
                      target={ this._buttonTarget }
                      directionalHint={ DirectionalHint.bottomLeftEdge }
                      onDismiss={ this._onDismiss }
                      gapSpace={ 0 }
                      />
                  ) }
                </div>) }
            </Persona>
          </div>
          <div className='ms-PickerItem-sideContent'>
            <Button
              onClick={ () => { if (onRemoveItem) { onRemoveItem(); } } }
              icon={ 'Cancel' }
              buttonType={ ButtonType.icon }
              className='ms-PickerItem-content'
              >
            </Button>
          </div>
        </FocusZone>
      </div>
    );
  }

  @autobind
  private _onClick() {
    this.setState({
      isContextualMenuVisible: !this.state.isContextualMenuVisible
    });
  }

  @autobind
  private _onDismiss(ev) {
    this.setState({
      isContextualMenuVisible: false
    });
    ev.stopPropagation();
    ev.preventDefault();
  }

  private _convertIPersonToIPersonaProps(person: IPerson): IPersonaProps {
    return {
      primaryText: person.name ? person.name : '',
      imageUrl: person.image ? person.image : '',
      tertiaryText: person.email ? person.email : '',
      secondaryText: person.job ? person.job : '',
      imageInitials: ''
    };
  }
}

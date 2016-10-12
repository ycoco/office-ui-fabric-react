import * as React from 'react';
import './GroupMembershipPanel.scss';
import { IGroupMembershipPanelProps } from './GroupMembershipPanel.Props';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { IGroupMemberPersona } from './GroupMembershipPanel.Props';
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';

export class GroupMembershipPanel extends React.Component<IGroupMembershipPanelProps, any> {
  constructor(props: IGroupMembershipPanelProps) {
    super(props);

    this.state = {
      showPanel: true
    };
  }

  public render(): React.ReactElement<IGroupMembershipPanelProps> {
    return (
      <Panel
        isOpen={ this.state.showPanel }
        type={ PanelType.smallFixedFar }
        onDismiss= { this._closePanel }
        headerText={ this.props.title }
        >
          {
              (this.props && this.props.personas) ?
                  this.props.personas.map((persona: IGroupMemberPersona, index: number) => {
                      const personaControl: JSX.Element = this._getPersonaControl(persona);
                      return this._getPersona(personaControl, persona, index);
                  }) : undefined
          }
      </Panel>
    );
  }

    private _getPersonaControl(persona: IGroupMemberPersona): JSX.Element {
        return (
            <Persona
                name={ persona.name }
                imageInitials={ persona.imageInitials }
                imageUrl={ persona.imageUrl }
                initialsColor={ persona.initialsColor }
                primaryText={ persona.name }
                size={ PersonaSize.extraSmall }
                hidePersonaDetails={ false } >
            </Persona>
        );
    }

    private _getPersona(personaControl: JSX.Element, persona: IGroupMemberPersona, index: number): JSX.Element {
        return <div
            className='ms-groupMember-itemBtn'
            title={ persona.name }
            key={ index }>
            <div className='ms-groupMember-personName'>{ personaControl }</div>
            </div>;
    }

  @autobind
  private _closePanel() {
    this.setState({ showPanel: false });

    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }
}

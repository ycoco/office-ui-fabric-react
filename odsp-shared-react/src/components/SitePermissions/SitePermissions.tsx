import * as React from 'react';
import './SitePermissions.scss';
import { ISitePermissionsProps, ISitePersonaPermissions } from './SitePermissions.Props';
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { SitePermissionsMenu } from './SitePermissionsMenu';
import { autobind, getRTLSafeKeyCode, KeyCodes } from 'office-ui-fabric-react/lib/Utilities';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';

export interface ISitePermissionsState {
    isExpanded: boolean;
}

/**
 * sitePermissions displays properties of an O365 site
 */
export class SitePermissions extends React.Component<ISitePermissionsProps, any> {

    constructor(props: ISitePermissionsProps, context?: any) {
        super(props, context);

        this.state = {
            isExpanded: true
        };
    }

    public render() {
        const { title } = this.props;
        return (
            <div className={ 'ms-sitePerm-body' }>
                <FocusZone direction={ FocusZoneDirection.vertical }
                    isInnerZoneKeystroke={ (ev) => (ev.which === getRTLSafeKeyCode(KeyCodes.right)) }
                    >
                    <span className='ms-sitePerm-itemBtn' onClick={ this._onClick } data-is-focusable={ true }>
                        <i className={ 'ms-sitePerm-chevron ms-Icon ms-Icon--ChevronDown' + (this.state.isExpanded ? ' is-expanded' : '') }></i>
                        { title }
                    </span>
                    <div>
                        {
                            (this.state.isExpanded && this.props && this.props.personas) ?
                                this.props.personas.map((persona: ISitePersonaPermissions, index: number) => {
                                    const personaControl: JSX.Element = this._getPersonaControl(persona);
                                    return this._getPersona(personaControl, persona, index);
                                }) : undefined
                        }
                    </div>
                </FocusZone>
            </div>
        );
    }

    private _getPersonaControl(persona: ISitePersonaPermissions): JSX.Element {
        return (
            <Persona data-is-focusable={ true }
                name={ persona.name }
                imageInitials={ persona.imageInitials }
                imageUrl={ persona.imageUrl }
                initialsColor={ persona.initialsColor }
                primaryText={ persona.name }
                size={ PersonaSize.small }
                hidePersonaDetails={ false } >
                <SitePermissionsMenu
                    menuItems={ persona.menuItems }
                    title={ this.props.title }
                    permLevelTitle={ this.props.permLevelTitle } />
            </Persona>
        );
    }

    private _getPersona(personaControl: JSX.Element, persona: ISitePersonaPermissions, index: number): JSX.Element {
        return <div
            className='ms-sitePerm-Persona'
            title={ persona.name }
            key={ index + persona.name }>
            <div className='ms-sitePerm-personName'>{ personaControl }</div>
        </div>;
    }

    @autobind
    private _onClick() {
        this.setState({
            isExpanded: !this.state.isExpanded
        });
    }
}

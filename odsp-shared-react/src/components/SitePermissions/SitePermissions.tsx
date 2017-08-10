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
            <div className={ 'ms-sitePerm-body' } data-automationid='SitePermissionsBody'>
                <FocusZone direction={ FocusZoneDirection.vertical }
                    isInnerZoneKeystroke={ (ev) => (ev.which === getRTLSafeKeyCode(KeyCodes.right)) }
                >
                    <span className='ms-sitePerm-itemBtn' onClick={ this._onClick } data-is-focusable={ true } data-automationid='SitePermissionsBodyButton'>
                        <i className={ 'ms-sitePerm-chevron ms-Icon ms-Icon--ChevronDown' + (this.state.isExpanded ? ' is-expanded' : '') }></i>
                        <span className='ms-sitePerm-itemBtn-title'>{ title }</span>
                    </span>
                    <div className='ms-sitePerm-personaContainer'>
                        {
                            (this.state.isExpanded && this.props && this.props.personas && this.props.personas.length > 0) ?
                                this.props.personas.map((persona: ISitePersonaPermissions, index: number) => {
                                    const personaControl: JSX.Element = this._getPersonaControl(persona);
                                    return this._getPersona(personaControl, persona, index);
                                }) :
                                (this.state.isExpanded ? <div className='ms-sitePerm-emptyGroupText'> { this.props.emptyGroupText } </div> : null)
                        }
                    </div>
                </FocusZone>
            </div>
        );
    }

    private _getPersonaControl(persona: ISitePersonaPermissions): JSX.Element {
        return (
            <Persona
                data-is-focusable={ true }
                imageInitials={ persona.imageInitials }
                imageUrl={ persona.imageUrl }
                initialsColor={ persona.initialsColor }
                primaryText={ persona.name }
                size={ PersonaSize.small }
                hidePersonaDetails={ false }
                data-automationid='SitePermissionsPersonaControl'
            >
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
            key={ index + persona.name }
            data-automationid='SitePermissionsPersona'>
            <div className='ms-sitePerm-personName' data-automationid='SitePermissionsPersonaName'>{ personaControl }</div>
        </div>;
    }

    @autobind
    private _onClick() {
        this.setState({
            isExpanded: !this.state.isExpanded
        });
    }
}

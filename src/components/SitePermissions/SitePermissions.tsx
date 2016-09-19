import * as React from 'react';
import './SitePermissions.scss';
import { ISitePermissionsProps, ISitePersonaPermissions } from './SitePermissions.Props';
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { SitePermissionsMenu } from './SitePermissionsMenu';

/**
 * sitePermissions displays properties of an O365 site
 */
export class SitePermissions extends React.Component<ISitePermissionsProps, {}> {

    constructor(props: ISitePermissionsProps, context?: any) {
        super(props, context);
    }

    public render() {
        const { title } = this.props;
        return (
            <div className='ms-sitePerm-body'>
                <div className='ms-sitePerm-Title'>
                    { title }
                </div>
                <div>
                    {
                        (this.props && this.props.personas) ?
                            this.props.personas.map((persona: ISitePersonaPermissions, index: number) => {
                                const personaControl: JSX.Element = this._getPersonaControl(persona);
                                return this._getPersona(personaControl, persona, index);
                            }) : undefined
                    }
                </div>
            </div>
        );
    }

    private _getPersonaControl(persona: ISitePersonaPermissions): JSX.Element {
        return (
            <Persona
                name={ persona.name }
                imageInitials={ persona.imageInitials }
                imageUrl={ persona.imageUrl }
                initialsColor={ persona.initialsColor }
                primaryText={ persona.name }
                size={ PersonaSize.extraSmall }
                hidePersonaDetails={ false } >
                 <SitePermissionsMenu
                    menuItems={ persona.menuItems }
                    title={ this.props.title } />
            </Persona>
        );
    }

    private _getPersona(personaControl: JSX.Element, persona: ISitePersonaPermissions, index: number): JSX.Element {
        return <div
            className='ms-sitePerm-itemBtn'
            title={ persona.name }
            key={ index }>
            <div className='ms-sitePerm-personName'>{ personaControl }</div>
            </div>;
    }
}

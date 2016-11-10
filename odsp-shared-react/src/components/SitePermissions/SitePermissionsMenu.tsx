import * as React from 'react';
import './SitePermissions.scss';
import { ContextualMenu, DirectionalHint} from 'office-ui-fabric-react/lib/ContextualMenu';
import { ISitePermissionsProps } from './SitePermissions.Props';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';

export interface IEditContextMenuState {
  isContextualMenuVisible: boolean;
}

/**
 * sitePermissions displays properties
 */
export class SitePermissionsMenu extends React.Component<ISitePermissionsProps, any> {

    private menu: HTMLElement;
    private _resolveMenu: (el: HTMLElement) => any;

    constructor(props: ISitePermissionsProps, context?: any) {
        super(props, context);
        this._resolveMenu = (el) => this.menu = el;
        this.state = {
            isContextualMenuVisible: false
        };
    }

    public render(): React.ReactElement<{}> {
        if (!this.props.menuItems) {
            return null;
        }

        return (
            <div className='ms-sitePerm-ContextMenu' >
                <FocusZone direction={ FocusZoneDirection.horizontal }>
                    <div className='ms-sitePerm-buttonArea' ref={ this._resolveMenu } >
                        <span className='ms-sitePerm-linkText' onClick={ this._onClick } data-is-focusable={ true } >
                            { this.props.title }
                            <i className={ 'ms-sitePermMenu-chevron ms-Icon ms-Icon--ChevronDown' }>
                            </i>
                        </span>
                    </div>
                    {  this.state.isContextualMenuVisible && (
                        <ContextualMenu
                            items={ this.props.menuItems }
                            isBeakVisible={ false }
                            targetElement={ this.menu }
                            directionalHint={ DirectionalHint.bottomLeftEdge }
                            onDismiss={ this._onDismiss }
                            gapSpace={ 0 }
                            />
                    ) }
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
}

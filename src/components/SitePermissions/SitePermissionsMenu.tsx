import * as React from 'react';
import './SitePermissions.scss';
import { ContextualMenu, DirectionalHint} from 'office-ui-fabric-react/lib/ContextualMenu';
import { ISitePermissionsProps } from './SitePermissions.Props';

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

        this._onClick = this._onClick.bind(this);
        this.state = {
            isContextualMenuVisible: false
        };
    if (!this.props.menuItems) {
      return null;
    }

        this._onDismiss = this._onDismiss.bind(this);
    }

    public render(): React.ReactElement<{}> {

        return (
            <div className='ms-sitePerm-ContextMenu'>
                <div className='ms-SitePerm-buttonArea' ref={ this._resolveMenu } >
                <span className='ms-SitePerm-linkText' onClick={ this._onClick }>{ this.props.title }</span></div>
                {  this.state.isContextualMenuVisible && (
                <ContextualMenu
                    items={this.props.menuItems}
                    isBeakVisible={ false }
                    targetElement={ this.menu }
                    directionalHint={ DirectionalHint.bottomLeftEdge }
                    onDismiss={ this._onDismiss }
                    gapSpace={ 0 }
                    />
                 )}
           </div>
        );
    }

    private _onClick() {
        this.setState({
            isContextualMenuVisible: !this.state.isContextualMenuVisible
        });
    }

    private _onDismiss(ev) {
        this.setState({
            isContextualMenuVisible: false
        });
        ev.stopPropagation();
        ev.preventDefault();
    }
}

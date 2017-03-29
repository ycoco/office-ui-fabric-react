import * as React from 'react';
import './GroupMembershipMenu.scss';
import { ContextualMenu, DirectionalHint} from 'office-ui-fabric-react/lib/ContextualMenu';
import { IGroupMembershipMenuProps } from './GroupMembershipMenu.Props';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

export interface IEditContextMenuState {
  isContextualMenuVisible: boolean;
}

/**
 * The group membership menu is a contextual menu dropdown attached to each persona
 * If no menu items are available, only the title is displayed
 */
export class GroupMembershipMenu extends React.Component<IGroupMembershipMenuProps, IEditContextMenuState> {

    private menu: HTMLElement;
    private _resolveMenu: (el: HTMLElement) => HTMLElement;

    constructor(props: IGroupMembershipMenuProps, context?: any) {
        super(props, context);
        this._resolveMenu = (el) => this.menu = el;
        this.state = {
            isContextualMenuVisible: false
        };
    }

    public render(): React.ReactElement<{}> {

        return (
            <div>
                <FocusZone direction={ FocusZoneDirection.horizontal }>
                    <div className='ms-groupMembershipMenu-titleArea' ref={ this._resolveMenu }>
                        <span className={ !!this.props.menuItems ? 'ms-groupMembershipMenu-linkText' : undefined }
                            onClick={ this._onClick }
                            data-is-focusable={ true }
                            role={ 'button' }
                            aria-haspopup={ true }>
                                { this.props.showSpinner && (
                                    <Spinner className='ms-groupMembershipMenu-updatingSpinner' size={ SpinnerSize.small } />
                                )}
                                { this.props.title }
                                { !!this.props.menuItems && (
                                    <i className={ 'ms-groupMembershipMenu-chevron ms-Icon ms-Icon--ChevronDown' }></i>
                                )}
                        </span>
                    </div>
                    { !!this.props.menuItems && this.state.isContextualMenuVisible && (
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
        // Only show the contextual menu if options are available.
        if (!!this.props.menuItems) {
            this.setState({
                isContextualMenuVisible: !this.state.isContextualMenuVisible
            });
        }
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

import './PermissionsList.scss';
import { Header } from '../Header/Header';
import { ISharingInformation, ISharingLink, ISharingPrincipal, SharingAudience, SharingLinkKind, IShareStrings, ClientId } from '../../interfaces/SharingInterfaces';
import { ShareLink } from './ShareLink/ShareLink';
import { SharePrincipal } from './SharePrincipal/SharePrincipal';
import { ShareViewState } from '../Share/Share';
import * as React from 'react';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';

export interface IPermissionsListProps {
    clientId: ClientId;
    companyName: string;
    sharingInformation: ISharingInformation;
}

export class PermissionsList extends React.Component<IPermissionsListProps, {}> {
    private _strings: IShareStrings;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IPermissionsListProps, context: any) {
        super(props);

        this._strings = context.strings;
    }

    public render(): React.ReactElement<{}> {
        const strings = this._strings;
        const sharingInformation = this.props.sharingInformation;
        const hasActiveSharingLinks = this.props.sharingInformation.sharingLinks.reduce((count, sharingLink: ISharingLink) => {
            return count + (sharingLink.isActive ? 1 : 0);
        }, -1) > 0;

        let content;
        if (sharingInformation.isShared) {
            content = (
                <div>
                    <ul className='od-PermissionsList-links'>{ this._renderLinks() }</ul>
                    <FocusZone direction={ FocusZoneDirection.vertical }>
                        <ul className='od-PermissionsList-entities'>{ this._renderPrincipals(hasActiveSharingLinks) }</ul>
                    </FocusZone>
                </div>
            );
        } else {
            content = (
                <div>
                    { strings.notShared }
                </div>
            );
        }

        return (
            <div className='od-PermissionsList'>
                <Header
                    clientId={ this.props.clientId }
                    item={ sharingInformation.item }
                    viewState={ ShareViewState.permissionsList }
                />
                <div className='od-PermissionsList-section'>
                    { content }
                </div>
            </div>
        );
    }

    private _renderLinks(): JSX.Element[] {
        const links = this.props.sharingInformation.sharingLinks;
        return links.map((link: ISharingLink, index: number) => {
            // Don't display direct link.
            if (link.audience !== SharingAudience.specificPeople && link.isActive) {
                return (
                    <li key={ link.shareId }>
                        <ShareLink
                            companyName={ this.props.companyName }
                            link={ link }
                            takeFocus={ index === 0 }
                        />
                    </li>
                );
            }
        });
    }

    private _renderPrincipals(hasActiveSharingLinks: boolean): JSX.Element[] {
        const sharingInformation = this.props.sharingInformation;

        // Get direct principals.
        let principals = sharingInformation.sharingPrincipals.slice();

        // Get principals from linkMembers.
        for (const link of sharingInformation.sharingLinks) {
            if (link.isActive && link.sharingLinkKind !== SharingLinkKind.direct) {
                principals.push(...link.principals);
            }
        }

        // Merge list of principals together.
        return principals.map((principal: ISharingPrincipal, index: number) => {
            return (
                <li key={ principal.id } >
                    <SharePrincipal
                        principal={ principal }
                        takeFocus={ !hasActiveSharingLinks && index === 0 }
                    />
                </li>
            );
        });
    }
}

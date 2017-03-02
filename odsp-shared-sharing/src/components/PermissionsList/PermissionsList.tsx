import './PermissionsList.scss';
import { SharePrincipal } from './SharePrincipal/SharePrincipal';
import { ShareLink } from './ShareLink/ShareLink';
import * as React from 'react';
import { ISharingInformation, ISharingLink, ISharingPrincipal, SharingAudience, SharingLinkKind, IShareStrings } from '../../interfaces/SharingInterfaces';

export interface IPermissionsListProps {
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

        let content;
        if (sharingInformation.isShared) {
            content = (
                <div>
                    <ul className='od-PermissionsList-links'>{this._renderLinks()}</ul>
                    <ul className='od-PermissionsList-entities'>{this._renderPrincipals()}</ul>
                </div>
            );
        } else {
            content = (
                <div>
                    {strings.notShared}
                </div>
            );
        }

        // TODO (joem): Spec has "Folder/File Permissions" instead of just permissions. Item
        // resolution resolves everything as a folder, so just use "Permissions" until that's
        // resolved.
        return (
            <div className='od-PermissionsList'>
                <div className='od-Share-header od-Share-header--multiline'>
                    <div className='od-Share-title ms-font-l ms-fontWeight-regular'>{strings.permissionsLabel}</div>
                    <div className='od-Share-fileName ms-font-xs'>{sharingInformation.item.name}</div>
                </div>
                <div className='od-PermissionsList-section'>
                    {content}
                </div>
            </div>
        );
    }

    private _renderLinks(): JSX.Element[] {
        const links = this.props.sharingInformation.sharingLinks;
        return links.map((link: ISharingLink) => {
            // Don't display direct link.
            if (link.audience !== SharingAudience.SPECIFIC_PEOPLE && link.isActive) {
                return (
                    <li key={link.shareId}>
                        <ShareLink
                            companyName={this.props.sharingInformation.companyName}
                            link={link}
                        />
                    </li>
                );
            }
        });
    }

    private _renderPrincipals(): JSX.Element[] {
        const sharingInformation = this.props.sharingInformation;

        // Get direct principals.
        let principals = sharingInformation.sharingPrincipals.slice();

        // Get principals from linkMembers.
        for (const link of sharingInformation.sharingLinks) {
            if (link.isActive && link.sharingLinkKind !== SharingLinkKind.DIRECT) {
                principals.push(...link.principals);
            }
        }

        // Merge list of principals together.
        return principals.map((principal: ISharingPrincipal) => {
            return (
                <li key={principal.id} >
                    <SharePrincipal
                        principal={principal}
                    />
                </li>
            );
        });
    }
}

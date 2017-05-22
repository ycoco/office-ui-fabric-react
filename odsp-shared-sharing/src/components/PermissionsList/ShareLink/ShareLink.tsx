import './ShareLink.scss';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import { SharingLinkKind, IShareStrings, ISharingLink, ISharingStore } from '../../../interfaces/SharingInterfaces';

export interface ISharingLinkProps {
    companyName: string;
    link: ISharingLink;
}

export class ShareLink extends React.Component<ISharingLinkProps, {}> {
    private _store: ISharingStore;
    private _strings: IShareStrings;

    static contextTypes = {
        sharingStore: React.PropTypes.object.isRequired,
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: ISharingLinkProps, context: any) {
        super(props);

        this._store = context.sharingStore;
        this._strings = context.strings;

        this._onShareLinkDelete = this._onShareLinkDelete.bind(this);
    }

    public render(): React.ReactElement<{}> {
        let {
            url
        } = this.props.link;

        return (
            <div className='od-ShareLink'>
                <div className='od-ShareLink-icon'>
                    <i className='ms-Icon ms-Icon--Link'></i>
                </div>
                <div className='od-ShareLink-details'>
                    <TextField
                        className='od-ShareLink-url'
                        defaultValue={ url }
                        readOnly={ true } />
                    <div className='od-ShareLink-description'>{ this._getLabel(this.props.link) }</div>
                </div>
                <button
                    className='od-ShareLink-delete'
                    onClick={ this._onShareLinkDelete } >
                    <i className='ms-Icon ms-Icon--Cancel'></i>
                </button>
            </div>
        );
    }

    private _onShareLinkDelete(): void {
        const link = this.props.link;
        this._store.unshareLink(link.sharingLinkKind, link.shareId);
    }

    private _getLabel(sharingLink: ISharingLink): string {
        const linkKind = sharingLink.sharingLinkKind;
        const expiration = sharingLink.expiration;
        const companyName = this.props.companyName;
        const strings = this._strings;

        switch (linkKind) {
            case SharingLinkKind.organizationView:
                return StringHelper.format(strings.cslViewDescription, companyName);
            case SharingLinkKind.organizationEdit:
                return StringHelper.format(strings.cslEditDescription, companyName);
            case SharingLinkKind.anonymousView:
                if (expiration) {
                    return StringHelper.format(strings.anonViewDescriptionWithExpiry, expiration.toLocaleDateString());
                } else {
                    return strings.anonViewDescription;
                }
            case SharingLinkKind.anonymousEdit:
                if (expiration) {
                    return StringHelper.format(strings.anonEditDescriptionWithExpiry, expiration.toLocaleDateString());
                } else {
                    return strings.anonEditDescription;
                }
            default:
                return '';
        }
    }
}
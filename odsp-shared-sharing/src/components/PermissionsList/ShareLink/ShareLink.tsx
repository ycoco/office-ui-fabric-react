import './ShareLink.scss';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import { SharingLinkKind, IShareStrings, ISharingLink, ISharingStore } from '../../../interfaces/SharingInterfaces';
import { IconButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';

export interface ISharingLinkProps {
    companyName: string;
    link: ISharingLink;
    takeFocus?: boolean;
}

export class ShareLink extends React.Component<ISharingLinkProps, {}> {
    private _store: ISharingStore;
    private _strings: IShareStrings;
    private _textField: ITextField;

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

    public componentDidMount() {
        if (this._textField && this.props.takeFocus) {
            this._textField.focus();
        }
    }

    public render(): React.ReactElement<{}> {
        let {
            url
        } = this.props.link;

        const linkLabel = this._getLabel(this.props.link);

        return (
            <div className='od-ShareLink' >
                <div className='od-ShareLink-icon'>
                    <i className='ms-Icon ms-Icon--Link'></i>
                </div>
                <div className='od-ShareLink-details'>
                    <TextField
                        data-is-focusable={ true }
                        className='od-ShareLink-url'
                        defaultValue={ url }
                        readOnly={ true }
                        ariaLabel={ linkLabel }
                        componentRef={ (textField) => this._textField = textField } />
                    <div className='od-ShareLink-description'>
                        { linkLabel }
                    </div>
                </div>
                <IconButton
                    data-is-focusable={ true }
                    className='od-ShareLink-delete'
                    onClick={ this._onShareLinkDelete }
                    iconProps={ { iconName: 'Cancel' } }
                    ariaLabel={ this._strings.removeLinkText }>
                </IconButton>
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
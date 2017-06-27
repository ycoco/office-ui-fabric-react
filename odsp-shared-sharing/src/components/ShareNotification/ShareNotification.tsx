import './ShareNotification.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Header } from '../Header/Header';
import { ISharingLink, ISharingLinkSettings, IShareStrings, ShareEndPointType, ISharingInformation, ShareType, ClientId } from '../../interfaces/SharingInterfaces';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { ShareHint } from '../ShareHint/ShareHint';
import { ShareViewState } from '../Share/Share';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import * as ShareHelper from '../../utilities/ShareHelper';
import * as ClientIdHelper from '../../utilities/ClientIdHelper';

export interface IShareNotificationProps {
    companyName: string;
    currentSettings: ISharingLinkSettings;
    shareType: ShareType;
    sharingInformation: ISharingInformation;
    sharingLinkCreated: ISharingLink; // The link created by the UI.
    onShareHintClicked: () => void;
    clientId: ClientId;
}

export interface IShareNotificationState {
    successfullyCopied: boolean;
}

export class ShareNotification extends React.Component<IShareNotificationProps, IShareNotificationState> {
    private _resize: () => void;
    private _strings: IShareStrings;
    private _textField: ITextField;

    static contextTypes = {
        resize: React.PropTypes.func.isRequired,
        strings: React.PropTypes.object.isRequired
    };

    public refs: {
        [key: string]: React.ReactInstance,
        sharingLinkInput: TextField
    };

    constructor(props: IShareNotificationProps, context: any) {
        super(props);

        this.state = {
            successfullyCopied: false
        };

        this._resize = context.resize;
        this._strings = context.strings;
    }

    public componentDidMount() {
        if (this.props.shareType === ShareType.copy) {
            this._copySharingLinkToClipboard();
        }
    }

    public componentDidUpdate() {
        this._resize();
    }

    public render(): React.ReactElement<{}> {
        return (
            <div className='od-ShareNotification'>
                <Header
                    viewState={ ShareViewState.linkSuccess }
                    clientId={ this.props.clientId }
                />
                { this._renderCheckMark() }
                <div className='od-ShareNotification-content'>
                    <div className='ms-font-l'>{ this._getNotificationLabel() }</div>
                    { this._renderCopyCta() }
                    <div className='od-ShareNotification-urlText'>
                        <TextField
                            autoFocus
                            ariaLabel={ StringHelper.format(this._strings.sharingLinkLabel, this.props.sharingInformation.item.name) }
                            onClick={ this._copySharingLinkToClipboard }
                            readOnly
                            componentRef={ (textField) => { this._textField = textField; } }
                            type='text'
                            underlined={ true }
                            value={ this.props.sharingLinkCreated.url }
                        />
                    </div>
                </div>
                { this._renderShareHint() }
            </div>
        );
    }

    @autobind
    private _copySharingLinkToClipboard() {
        let successfullyCopied = false;

        /**
         * Attempt to copy via the browser.
         */
        try {
            this._textField.setSelectionRange(0, this._textField.value.length);
            successfullyCopied = document.execCommand('copy');
        } catch (error) {
            // Error handled below.
        }

        // If browser copy fails, attempt calling external CopyToClipboard.
        if (!successfullyCopied) {
            // Attempt to copy to clipboard via external JavaScript.
            try {
                const externalJavaScript: any = window.external;
                const externalCopyResult = externalJavaScript.CopyToClipboard(this.props.sharingLinkCreated.url);

                /**
                 * First iteration of CopyToClipboard did not have a return value; assume it's successful
                 * if nothing is returned.
                 */
                successfullyCopied = externalCopyResult || externalCopyResult === undefined;
            } catch (error) {
                // Error handled below.
            }
        }

        // Update state with copy action result.
        this.setState({
            ...this.state,
            successfullyCopied: successfullyCopied
        });
    }

    private _renderCheckMark() {
        const shareType = this.props.shareType;
        const isSuccess = shareType === ShareType.share || (shareType === ShareType.copy && this.state.successfullyCopied);

        if (isSuccess) {
            return (
                <div className='od-ShareNotification-icon'>
                    <i className='ms-Icon ms-Icon--CheckMark'></i>
                </div>
            );
        }
    }

    private _renderCopyCta() {
        const props = this.props;
        const state = this.state;

        if ((props.shareType === ShareType.copy) && !state.successfullyCopied) {
            return (
                <span className='od-ShareNotification-copyCta'>{ this._strings.notificationCopyFailedCta }</span>
            );
        }
    }

    private _renderShareHint(): JSX.Element {
        const props = this.props;

        return (
            <div className='od-ShareNotification-footer'>
                <ShareHint
                    companyName={ props.companyName }
                    currentSettings={ props.currentSettings }
                    sharingInformation={ props.sharingInformation }
                    onShareHintClick={ props.onShareHintClicked }
                />
            </div>
        );
    }

    private _getNotificationLabel(): string {
        const strings = this._strings;
        const itemName = ShareHelper.truncateItemNameForShareNotification(this.props.sharingInformation.item.name);
        const shareType = this.props.shareType;

        // Set notification messages.
        const copiedSuccessMessage = StringHelper.format(strings.notificationCopied, itemName);
        const copiedFailureMessage = StringHelper.format(strings.notificationCopyFailed, itemName);
        const sentMessage = StringHelper.format(strings.notificationSent, itemName);

        // Return notification message based on flow and success.
        if (shareType === ShareType.copy) {
            return this.state.successfullyCopied ? copiedSuccessMessage : copiedFailureMessage;
        } else if (shareType === ShareType.share) {
            return sentMessage;
        } else {
            return '';
        }
    }
}
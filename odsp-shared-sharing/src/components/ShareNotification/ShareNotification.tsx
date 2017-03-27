import './ShareNotification.scss';
import { ISharingLink, ISharingLinkSettings, IShareStrings, ShareEndPointType, ISharingInformation } from '../../interfaces/SharingInterfaces';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { ShareHint } from '../ShareHint/ShareHint';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';

export interface IShareNotificationProps {
    companyName: string;
    currentSettings: ISharingLinkSettings;
    isCopy: boolean; // TODO (joem): See comment in ShareCallout about robustness.
    sharingInformation: ISharingInformation;
    sharingLinkCreated: ISharingLink; // The link created by the UI.
    onShareHintClicked: () => void;
}

export interface IShareNotificationState {
    successfullyCopied: boolean;
}

export class ShareNotification extends React.Component<IShareNotificationProps, IShareNotificationState> {
    private _strings: IShareStrings;

    static contextTypes = {
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

        this._strings = context.strings;
    }

    public componentDidMount() {
        if (this.props.isCopy) {
            // Attempt to copy via the browser.
            try {
                this.refs.sharingLinkInput.select();
                const successfullyCopied = document.execCommand('copy');

                this.setState({
                    ...this.state,
                    successfullyCopied: successfullyCopied
                });
            } catch (error) {
                // Attempt to copy to clipboard via external JavaScript.
                try {
                    const externalJavaScript: any = window.external;
                    externalJavaScript.CopyToClipboard(this.props.sharingLinkCreated.url);
                } catch (error) {
                    this.setState({
                        ...this.state,
                        successfullyCopied: false
                    });
                }
            }
        }
    }

    public render(): React.ReactElement<{}> {
        return (
            <div className='od-ShareNotification'>
                <div className='od-ShareNotification-icon'>
                    <i className='ms-Icon ms-Icon--CheckMark'></i>
                </div>
                <div className='od-ShareNotification-content'>
                    <div className='ms-font-l'>{this._getNotificationLabel()}</div>
                    {this._renderCopyCta()}
                    <div className='od-ShareNotification-urlText'>
                        <TextField
                            ref='sharingLinkInput'
                            type='text'
                            value={this.props.sharingLinkCreated.url}
                            underlined={true}
                        />
                    </div>
                </div>
                {this._renderShareHint()}
            </div>
        );
    }

    private _renderCopyCta() {
        const props = this.props;
        const state = this.state;

        if (props.isCopy && !state.successfullyCopied) {
            return (
                <span className='od-ShareNotification-copyCta'>{this._strings.notificationCopyFailedCta}</span>
            );
        }
    }

    private _renderShareHint(): JSX.Element {
        const props = this.props;

        return (
            <div className='od-ShareNotification-footer'>
                <ShareHint
                    companyName={props.companyName}
                    currentSettings={props.currentSettings}
                    sharingInformation={props.sharingInformation}
                    onShareHintClick={props.onShareHintClicked}
                />
            </div>
        );
    }

    private _getNotificationLabel(): string {
        const strings = this._strings;
        const itemName = this.props.sharingInformation.item.name;

        // Set notification messages.
        const copiedSuccessMessage = StringHelper.format(strings.notificationCopied, itemName);
        const copiedFailureMessage = StringHelper.format(strings.notificationCopyFailed, itemName);
        const sentMessage = StringHelper.format(strings.notificationSent, itemName);

        // Return notification message based on flow and success.
        if (this.props.isCopy) {
            return this.state.successfullyCopied ? copiedSuccessMessage : copiedFailureMessage;
        } else {
            return sentMessage;
        }
    }
}
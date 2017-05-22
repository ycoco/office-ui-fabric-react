import './SendLink.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { ISharingInformation, ISharingLinkSettings, IShareStrings, FileShareType, SharingLinkKind, AccessStatus } from '../../interfaces/SharingInterfaces';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import * as PeoplePickerHelper from '../../utilities/PeoplePickerHelper';
import * as React from 'react';
import PeoplePicker from '../PeoplePicker/PeoplePicker';

const MAXIMUM_MESSAGE_LENGTH = 500;

export interface ISendLinkProps {
    ctaLabel?: string;
    currentSettings: ISharingLinkSettings;
    onChange?: (items: Array<any>) => void;
    onSendLinkClicked: (message: string) => void;
    sharingInformation: ISharingInformation;
    showTextArea?: boolean;
    onSelectedPeopleChange: (items: Array<any>) => void;
    groupsMemberCount: number;
    onViewPolicyTipClicked: () => void;
    linkRecipients: Array<IPerson>;
    permissionsMap: { [index: string]: AccessStatus };
}

export interface ISendLinkState {
    errorMessage: JSX.Element;
    messageLength: number;
}

export class SendLink extends React.Component<ISendLinkProps, ISendLinkState> {
    private _strings: IShareStrings;

    public refs: {
        [key: string]: React.ReactInstance,
        messageInput: HTMLInputElement,
        peoplePicker: HTMLDivElement
    };

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: ISendLinkProps, context: any) {
        super(props);

        this._strings = context.strings;

        const peoplePickerError = PeoplePickerHelper.renderPickerError({
            selectedItems: props.linkRecipients,
            sharingLinkKind: props.currentSettings.sharingLinkKind,
            canAddExternalPrincipal: props.sharingInformation.canAddExternalPrincipal,
            hasDlpPolicyTip: props.sharingInformation.item.hasDlpPolicy,
            viewPolicyTipCallback: props.onViewPolicyTipClicked,
            strings: this._strings,
            permissionsMap: props.permissionsMap
        });

        this.state = {
            errorMessage: peoplePickerError,
            messageLength: 0
        };
    }

    public componentWillReceiveProps(nextProps: ISendLinkProps) {
        const peoplePickerError = PeoplePickerHelper.renderPickerError({
            selectedItems: nextProps.linkRecipients,
            sharingLinkKind: nextProps.currentSettings.sharingLinkKind,
            canAddExternalPrincipal: nextProps.sharingInformation.canAddExternalPrincipal,
            hasDlpPolicyTip: nextProps.sharingInformation.item.hasDlpPolicy,
            viewPolicyTipCallback: nextProps.onViewPolicyTipClicked,
            strings: this._strings,
            permissionsMap: nextProps.permissionsMap
        });

        this.setState({
            ...this.state,
            errorMessage: peoplePickerError
        });
    }

    public render(): React.ReactElement<{}> {
        const props = this.props;
        const currentSettings = props.currentSettings;
        const selectedItems = props.linkRecipients;
        const oversharingExternalsWarning = PeoplePickerHelper.getOversharingExternalsWarning(selectedItems, this._strings);
        const oversharingGroupsWarning = PeoplePickerHelper.getOversharingGroupsWarning(selectedItems, props.groupsMemberCount, this._strings);

        return (
            <div className='od-SendLink'>
                <div className='od-SendLink-email'>
                    <PeoplePicker
                        defaultSelectedItems={ selectedItems }
                        error={ this.state.errorMessage }
                        onChange={ this._onChange }
                        oversharingExternalsWarning={ oversharingExternalsWarning }
                        oversharingGroupsWarning={ oversharingGroupsWarning }
                        pickerSettings={ props.sharingInformation.peoplePickerSettings }
                        sharingLinkKind={ currentSettings.sharingLinkKind }
                        sharingInformation={ props.sharingInformation }
                        permissionsMap={ props.permissionsMap }
                    />
                    <div className='od-SendLink-message'>
                        { this._renderTextArea() }
                        { this._renderCharacterCounter() }
                        <div className='od-SendLink-emailButtons'>
                            { this._renderSendButton() }
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    @autobind
    private _onChange(items: Array<IPerson>) {
        const props = this.props;
        const state = this.state;

        // Get people picker error based on resolved items in the picker.
        const peoplePickerError = PeoplePickerHelper.renderPickerError({
            selectedItems: items,
            sharingLinkKind: props.currentSettings.sharingLinkKind,
            canAddExternalPrincipal: props.sharingInformation.canAddExternalPrincipal,
            hasDlpPolicyTip: props.sharingInformation.item.hasDlpPolicy,
            viewPolicyTipCallback: props.onViewPolicyTipClicked,
            strings: this._strings,
            permissionsMap: props.permissionsMap
        });

        this.setState({
            ...this.state,
            errorMessage: peoplePickerError
        }, () => {
            props.onSelectedPeopleChange(items);
        });
    }

    private _computeAllowExternalUsers(): boolean {
        const linkKind = this.props.currentSettings.sharingLinkKind;
        return linkKind !== SharingLinkKind.organizationView && linkKind !== SharingLinkKind.organizationEdit;
    }

    private _renderTextArea(): JSX.Element {
        if (this.props.showTextArea) {
            return (
                <TextField
                    ref='messageInput'
                    placeholder={ this._strings.messagePlaceholder }
                    multiline resizable={ false }
                    onGetErrorMessage={ this._validateMessage }
                />
            );
        }
    }

    private _renderCharacterCounter(): JSX.Element {
        const messageLength = this.state.messageLength;
        const isError = messageLength > MAXIMUM_MESSAGE_LENGTH;
        const classes = `od-SendLink-characterCounter ${isError ? 'od-SendLink-characterCounter--error' : ''}`;

        if (messageLength > (MAXIMUM_MESSAGE_LENGTH / 2)) {
            return (
                <span className={ classes }>{ messageLength }/{ MAXIMUM_MESSAGE_LENGTH }</span>
            );
        }
    }

    private _renderSendButton(): JSX.Element {
        /**
         * Checks permissionMap for any undefined values, meaning that there's currently
         * a pending API call determining if a user has permission or not.
         */
        let checkingPermissions = false;
        if (this.props.currentSettings.sharingLinkKind === SharingLinkKind.direct) {
            for (const recipient of this.props.linkRecipients) {
                if (this.props.permissionsMap[recipient.email] === undefined) {
                    checkingPermissions = true;
                    break;
                }
            }
        }

        if (this.props.ctaLabel) {
            return (
                <PrimaryButton
                    disabled={ !!this.state.errorMessage || checkingPermissions || this.state.messageLength > MAXIMUM_MESSAGE_LENGTH }
                    onClick={ this._onSendLinkClicked }
                >{ this.props.ctaLabel }
                </PrimaryButton>
            );
        }
    }

    @autobind
    private _onSendLinkClicked(): void {
        const props = this.props;
        const peoplePickerInput = document.querySelector('.od-Share-PeoplePicker .ms-BasePicker-input') as HTMLInputElement;

        // Show error message if user tried clicking "Send" without any resolved users.
        if (peoplePickerInput.value) {
            this.setState({
                ...this.state,
                errorMessage: <span>{ this._strings.unresolvedTextError }</span>
            });
            return;
        } else if (props.linkRecipients.length === 0) {
            this.setState({
                ...this.state,
                errorMessage: <span>{ this._strings.recipientsRequiredError }</span>
            });
            return;
        }

        this.props.onSendLinkClicked(this.refs.messageInput.value);
    }

    @autobind
    private _validateMessage(value: string) {
        const messageLength = this._getEncodedMessageLength(value);

        this.setState({
            ...this.state,
            messageLength
        });

        return '';
    }

    /**
     * Gets length of message text using the same algorithm as the server.
     * Logic copied from devmainoverride/sporel/otools/inc/sts/template/HtmlEncodeAllowSimpleTextLength.jss.
     *
     * - Turns ' ' after newline into '&nbsp;'.
     * - Turns ' ' follow by another ' ' into '&nbsp;'.
     * - Turns newline into '<br>'.
     * - Turns carriage return into ' '.
     */
    private _getEncodedMessageLength(messageText: string): number {
        if (!messageText) {
            return 0;
        }

        let htmlLength: number = 0;
        let messageTextLength: number = messageText.length;
        let messageTextIterator: number = 0;
        let waitingForNonWhitespaceAfterBr: boolean = false;

        if (messageText.length === 0) {
            return 0;
        }

        const HTML_STRINGS = {
            Nbsp: "&#160;",
            Br: "<br />",
            Quot: "&quot;&quot;&quot;",
            Amp: "&amp;",
            Apostrophe: "&#39;",
            Lt: "&lt;",
            Gt: "&gt;",
            Space: " "
        };

        while (messageTextIterator < messageTextLength) {
            let specialChar: string = null;
            let character: string = messageText[messageTextIterator];

            // Replace the current character if necessary.
            if (character === ' ') {
                if (messageTextIterator + 1 < messageTextLength && messageText[messageTextIterator + 1] === ' ' || waitingForNonWhitespaceAfterBr) {
                    specialChar = HTML_STRINGS.Nbsp;
                } else {
                    specialChar = ' ';
                }
            } else if (character === '\n') {
                specialChar = HTML_STRINGS.Br;
                waitingForNonWhitespaceAfterBr = true;
            } else {
                if (character === '"') {
                    specialChar = HTML_STRINGS.Quot;
                } else if (character === '&') {
                    specialChar = HTML_STRINGS.Amp;
                } else if (character === '\'') {
                    specialChar = HTML_STRINGS.Apostrophe;
                } else if (character === '<') {
                    specialChar = HTML_STRINGS.Lt;
                } else if (character === '>') {
                    specialChar = HTML_STRINGS.Gt;
                } else if (character === '\r') {
                    specialChar = HTML_STRINGS.Space;
                }

                waitingForNonWhitespaceAfterBr = false;
            }

            // Increment the message length.
            if (specialChar !== null) {
                htmlLength += specialChar.length;
            } else {
                htmlLength += 1;
            }

            // Increment iterator.
            messageTextIterator++;
        }

        return htmlLength;
    }
}
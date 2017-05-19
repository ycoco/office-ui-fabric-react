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
            errorMessage: peoplePickerError
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
                />
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
                    disabled={ !!this.state.errorMessage || checkingPermissions }
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
}
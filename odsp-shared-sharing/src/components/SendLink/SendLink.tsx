import './SendLink.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { ISharingInformation, ISharingLinkSettings, IShareStrings, FileShareType, EntityType } from '../../interfaces/SharingInterfaces';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import * as React from 'react';
import PeoplePicker from '../PeoplePicker/PeoplePicker';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');

export interface ISendLinkProps {
    ctaLabel?: string;
    currentSettings: ISharingLinkSettings;
    onChange?: (items: Array<any>) => void;
    onSendLinkClicked: (recipients: any, message: string) => void;
    sharingInformation: ISharingInformation;
    showTextArea?: boolean;
    onSelectedPeopleChange: (items: Array<any>) => void;
}

export interface ISendLinkState {
    showITPolicy?: boolean;
    showExternalNotification?: boolean;
    errorMessage: string;
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

        this.state = {
            showExternalNotification: true,
            errorMessage: ''
        };

        this._getExternalPeople = this._getExternalPeople.bind(this);
    }

    public render(): React.ReactElement<{}> {
        const props = this.props;
        const currentSettings = props.currentSettings;

        return (
            <div className={ 'od-SendLink' + (this.state.showITPolicy ? ' SendLink--exclustionNotification' : '') }>
                <div className='od-SendLink-email'>
                    <PeoplePicker
                        defaultSelectedItems={ this.props.currentSettings.specificPeople }
                        onChange={ this._onChange }
                        pickerSettings={ props.sharingInformation.peoplePickerSettings }
                        sharingLinkKind={ currentSettings.sharingLinkKind }
                        showError={ !!this.state.errorMessage }
                    />
                    { this._renderMessageBar() }
                    <div className='od-SendLink-message'>
                        { this._renderTextArea() }
                        <div className='od-SendLink-emailButtons'>
                            { this._renderSendButton() }
                        </div>
                        { this._renderITPolicy() }
                    </div>
                </div>
            </div>
        );
    }

    @autobind
    private _onChange(items: any[]) {
        const props = this.props;
        const state = this.state;

        if (state.errorMessage && items.length > 0) {
            this.setState({
                ...this.state,
                errorMessage: ''
            }, () => {
                props.onSelectedPeopleChange(items);
            });
        } else {
            props.onSelectedPeopleChange(items);
        }
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
        if (this.props.ctaLabel) {
            return (
                <Button
                    buttonType={ ButtonType.primary }
                    onClick={ this._onSendLinkClicked }
                >{ this.props.ctaLabel }
                </Button>
            );
        }
    }

    private _renderMessageBar(): JSX.Element {
        const state = this.state;
        const errorMessage = state.errorMessage;

        if (errorMessage) {
            return (
                <span className='od-SendLink-error'>
                    { errorMessage }
                </span>
            );
        } else if (state.showExternalNotification) {
            const numberOfExternalPeople = this._getExternalPeople().length;
            const nameString = this._getExternalPeopleNameString();
            const numberOfGroups = this._getGroups().length;
            const groupsString = this._getGroupsString(numberOfGroups);

            // Messages to show.
            const messageBars = [];

            // Get external sharing warning.
            if (numberOfExternalPeople === 1) {
                messageBars.push(
                    <MessageBar>
                        <strong>{ nameString }</strong>{ ` ${this._strings.outsideOfYourOrgSingular}` }
                    </MessageBar>
                );
            } else if (numberOfExternalPeople > 1) {
                messageBars.push(
                    <MessageBar>
                        <strong>{ nameString }</strong>{ ` ${this._strings.outsideOfYourOrgPlural}` }
                    </MessageBar>
                );
            }

            // Get groups sharing warning.
            if (numberOfGroups > 0) {
                messageBars.push(
                    <MessageBar><strong>{ nameString }</strong>{ ` ${groupsString}` }</MessageBar>
                );
            }

            // Render messages if we have any.
            if (messageBars.length > 0) {
                return (
                    <div className='od-SendLink-externalNotification'>
                        { messageBars }
                    </div>
                );
            }
        }
    }

    // TODO (joem): Need to work more on error messages like this.
    private _renderITPolicy(): JSX.Element {
        if (this.state.showITPolicy) {
            const message: string = this._strings.noExternalSharing;

            return (
                <div className='od-SendLink-ITPolicy'>
                    <TooltipHost content={ message } id='ITPolicy'>
                        <i className='ms-Icon ms-Icon--Info ms-fontColor-redDark' aria-describedby='ITPolicy'></i>
                    </TooltipHost>
                </div>
            );
        }
    }

    @autobind
    private _onSendLinkClicked(): void {
        const props = this.props;

        // Show error message if user tried clicking "Send" without any resolved users.
        if (props.currentSettings.specificPeople.length === 0) {
            this.setState({
                ...this.state,
                errorMessage: this._strings.recipientsRequiredError
            });
            return;
        }

        this.props.onSendLinkClicked(this.props.currentSettings.specificPeople, this.refs.messageInput.value);
    }

    private _getExternalPeopleNameString(): string {
        const externalPeople = this._getExternalPeople();
        const numberOfPeople = externalPeople.length;
        const names: Array<string> = externalPeople.map((persona: any) => {
            return persona.primaryText || persona.name;
        });

        if (numberOfPeople === 2) {
            const result = names.join(', ');
            const oxfordComma: number = result.lastIndexOf(',');
            return `${result.substring(0, oxfordComma)} ${this._strings.and} ${result.substring(oxfordComma + 1)}`;
        } else if (numberOfPeople > 2) {
            const result = names.join(', ');
            const oxfordComma: number = result.lastIndexOf(',');
            return `${result.substring(0, oxfordComma + 1)} ${this._strings.and} ${result.substring(oxfordComma + 1)}`;
        } else {
            return names[0];
        }
    }

    private _getExternalPeople(): Array<any> {
        const selectedItems = this.props.currentSettings.specificPeople;

        const externalPeople = selectedItems.filter((item) => {
            return item.entityType === EntityType.externalUser;
        });

        return externalPeople;
    }

    private _getGroups(): Array<any> {
        const selectedItems = this.props.currentSettings.specificPeople;

        const groups = selectedItems.filter((item) => {
            return item.entityType === EntityType.group;
        });

        return groups;
    }

    private _getGroupsString(numberOfGroups: number): string {
        if (numberOfGroups === 1) {
            return this._strings.oneGroupInvited;
        } else if (numberOfGroups > 1) {
            return StringHelper.format(this._strings.multipleGroupsInvited, numberOfGroups);
        } else {
            return '';
        }
    }
}
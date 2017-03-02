import './SendLink.scss';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { ISharingInformation, ISharingLinkSettings, IShareStrings, FileShareType } from '../../interfaces/SharingInterfaces';
import { MessageBar } from 'office-ui-fabric-react/lib/MessageBar';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import * as React from 'react';
import PeoplePicker from '../PeoplePicker/PeoplePicker';

export interface ISendLinkProps {
    ctaLabel?: string;
    currentSettings: ISharingLinkSettings;
    onChange?: (items: Array<any>) => void;
    onSendLinkClicked: (recipients: any, message: string) => void;
    sharingInformation: ISharingInformation;
    showTextArea?: boolean;
}

export interface ISendLinkState {
    showITPolicy?: boolean;
    showExternalNotification?: boolean;
    selectedItems?: Array<any>;
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
            selectedItems: this.props.currentSettings.specificPeople
        };

        this._onSendLinkClicked = this._onSendLinkClicked.bind(this);
        this._onChange = this._onChange.bind(this);
        this._getExternalPeople = this._getExternalPeople.bind(this);
    }

    public render(): React.ReactElement<{}> {
        const props = this.props;
        const currentSettings = props.currentSettings;

        return (
            <div className={'od-SendLink' + (this.state.showITPolicy ? ' SendLink--exclustionNotification' : '')}>
                <div className='od-SendLink-email'>
                    <PeoplePicker
                        defaultSelectedItems={currentSettings.specificPeople}
                        onChange={this._onChange}
                        pickerSettings={props.sharingInformation.peoplePickerSettings}
                        sharingLinkKind={currentSettings.sharingLinkKind}
                    />
                    {this._renderMessageBar()}
                    <div className='od-SendLink-message'>
                        {this._renderTextArea()}
                        <div className='od-SendLink-emailButtons'>
                            {this._renderSendButton()}
                        </div>
                        {this._renderITPolicy()}
                    </div>
                </div>
            </div>
        );
    }

    private _onChange(items: any[]) {
        this.setState({
            ...this.state,
            selectedItems: items
        });
    }

    private _renderTextArea(): JSX.Element {
        if (this.props.showTextArea) {
            return (
                <TextField
                    ref='messageInput'
                    placeholder={this._strings.messagePlaceholder}
                    multiline resizable={false}
                />
            );
        }
    }

    private _renderSendButton(): JSX.Element {
        if (this.props.ctaLabel) {
            return (
                <Button
                    buttonType={ButtonType.primary}
                    onClick={this._onSendLinkClicked}
                    disabled={this.state.selectedItems.length === 0}>{this.props.ctaLabel}</Button>
            );
        }
    }

    // TODO (joem): Work out what this message says and add it to IShareStrings.
    private _renderMessageBar(): JSX.Element {
        if (this.state.showExternalNotification) {
            const externalPeople = this._getExternalPeople();
            if (externalPeople.length > 0) {
                const verb: string = externalPeople.length === 1 ? ' is ' : ' are ';
                const phrase: string = 'outside of your organization';
                return (
                    <div className='od-SendLink-externalNotification'>
                        <MessageBar><strong>{this._getExternalNotificationList()}</strong>{verb + phrase}</MessageBar>
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
                    <TooltipHost content={message} id='ITPolicy'>
                        <i className='ms-Icon ms-Icon--Info ms-fontColor-redDark' aria-describedby='ITPolicy'></i>
                    </TooltipHost>
                </div>
            );
        }
    }

    private _onSendLinkClicked(): void {
        this.props.onSendLinkClicked(this.state.selectedItems, this.refs.messageInput.value);
    }

    // TODO (joem): Simplify this and localize.
    private _getExternalNotificationList(): string {
        let result: string = '';
        const externalPeople = this._getExternalPeople();
        const numberOfPeople = externalPeople.length;
        const names: Array<string> = externalPeople.map((persona: any) => {
            return persona.primaryText;
        });

        if (numberOfPeople > 1) {
            result = names.join(', ');
            const pos: number = result.lastIndexOf(',');
            return result.substring(0, pos) + ' and' + result.substring(pos + 1);
        } else {
            return names[0];
        }
    }

    private _getExternalPeople(): Array<any> {
        const selectedItems = this.state.selectedItems;

        // TODO (joem): Confirm this logic + use enum.
        const externalPeople = selectedItems.filter((item) => {
            return item.entityType === 1;
        });

        return externalPeople;
    }
}
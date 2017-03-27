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
    onSelectedPeopleChange: (items: Array<any>) => void;
}

export interface ISendLinkState {
    showITPolicy?: boolean;
    showExternalNotification?: boolean;
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
            showExternalNotification: true
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
                        defaultSelectedItems={this.props.currentSettings.specificPeople}
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
        this.props.onSelectedPeopleChange(items);
    }

    private _renderTextArea(): JSX.Element {
        if (this.props.showTextArea) {
            return (
                <TextField
                    ref='messageInput'
                    placeholder={this._strings.messagePlaceholder}
                    multiline resizable={false}
                    inputClassName='od-SendLink-textField'
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
                    disabled={this.props.currentSettings.specificPeople.length === 0}>{this.props.ctaLabel}</Button>
            );
        }
    }

    private _renderMessageBar(): JSX.Element {
        if (this.state.showExternalNotification) {
            const numberOfExternalPeople = this._getExternalPeople().length;
            const nameString = this._getExternalPeopleNameString();

            if (numberOfExternalPeople === 1) {
                return (
                    <div className='od-SendLink-externalNotification'>
                        <MessageBar><strong>{nameString}</strong>{` ${this._strings.outsideOfYourOrgSingular}`}</MessageBar>
                    </div>
                );
            } else if (numberOfExternalPeople > 1) {
                return (
                    <div className='od-SendLink-externalNotification'>
                        <MessageBar><strong>{nameString}</strong>{` ${this._strings.outsideOfYourOrgPlural}`}</MessageBar>
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

        // TODO (joem): Use enum.
        const externalPeople = selectedItems.filter((item) => {
            return item.entityType === 1;
        });

        return externalPeople;
    }
}
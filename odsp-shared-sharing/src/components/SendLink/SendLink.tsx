import './SendLink.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { ISharingInformation, ISharingLinkSettings, IShareStrings, FileShareType } from '../../interfaces/SharingInterfaces';
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
    }

    public render(): React.ReactElement<{}> {
        const props = this.props;
        const currentSettings = props.currentSettings;
        const selectedItems = currentSettings.specificPeople;
        const oversharingExternalsWarning = PeoplePickerHelper.getOversharingExternalsWarning(selectedItems, this._strings);
        const oversharingGroupsWarning = PeoplePickerHelper.getOversharingGroupsWarning(selectedItems, this._strings);

        return (
            <div className={ 'od-SendLink' + (this.state.showITPolicy ? ' SendLink--exclustionNotification' : '') }>
                <div className='od-SendLink-email'>
                    <PeoplePicker
                        defaultSelectedItems={ this.props.currentSettings.specificPeople }
                        error={ this.state.errorMessage }
                        onChange={ this._onChange }
                        oversharingExternalsWarning={ oversharingExternalsWarning }
                        oversharingGroupsWarning={ oversharingGroupsWarning }
                        pickerSettings={ props.sharingInformation.peoplePickerSettings }
                        sharingLinkKind={ currentSettings.sharingLinkKind }
                    />
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
        const peoplePickerInput = document.querySelector('.od-Share-PeoplePicker .ms-BasePicker-input') as HTMLInputElement;

        // Show error message if user tried clicking "Send" without any resolved users.
        if (peoplePickerInput.value) {
            this.setState({
                ...this.state,
                errorMessage: this._strings.unresolvedTextError
            });
            return;
        } else if (props.currentSettings.specificPeople.length === 0) {
            this.setState({
                ...this.state,
                errorMessage: this._strings.recipientsRequiredError
            });
            return;
        }

        this.props.onSendLinkClicked(this.props.currentSettings.specificPeople, this.refs.messageInput.value);
    }
}
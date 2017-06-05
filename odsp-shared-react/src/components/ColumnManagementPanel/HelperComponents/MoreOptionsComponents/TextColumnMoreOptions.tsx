import * as React from 'react';
import { BaseComponent, autobind } from 'office-ui-fabric-react/lib/Utilities';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IMoreOptionsComponent, IMoreOptionsComponentSchemaValues } from './IMoreOptionsComponent';
import { IColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/ColumnManagementPanelStringHelper';


export interface ITextColumnMoreOptionsProps {
    /** The maximum number of characters allowed for the field. */
    maxLength: string;
    /** Callback to show the more options section if there is an error. */
    showMoreOptions: (callback?: () => void) => void;
    /** Collection of localized strings to show in the create column panel UI. */
    strings: IColumnManagementPanelStrings;
}

export interface ITextColumnMoreOptionsState {
    maxLength: string;
    maxLengthErrorMessage: string;
}

export class TextColumnMoreOptions extends BaseComponent<ITextColumnMoreOptionsProps, ITextColumnMoreOptionsState> implements IMoreOptionsComponent {
    private _maxLength: TextField;

    constructor(props) {
        super(props);
        this.state = {
            maxLength: this.props.maxLength,
            maxLengthErrorMessage: ""
        };
    }

    public render() {
        let strings = this.props.strings;
        return (
            <div className='ms-ColumnManagementPanel-textMoreOptions'>
                <TextField
                    label={ strings.maximumLengthLabel }
                    ariaLabel={ strings.maximumLengthAriaLabel }
                    value={ this.state.maxLength }
                    onChanged={ this._maxLengthChanged }
                    errorMessage={ this.state.maxLengthErrorMessage }
                    ref={ this._resolveRef('_maxLength') } />
            </div>
        );
    }

    @autobind
    public getSchemaValues(): IMoreOptionsComponentSchemaValues | false {
        if (this.state.maxLengthErrorMessage) {
            this.props.showMoreOptions(() => this._maxLength.focus());
        } else {
            return {
                MaxLength: this.state.maxLength !== "" ? Number(parseInt(this.state.maxLength)) : null
            };
        }
        return false;
    }

    @autobind
    private _maxLengthChanged(newValue: string) {
        this.setState({
            maxLength: newValue,
            maxLengthErrorMessage: (isNaN(Number(newValue)) || Number(newValue) < 1 || Number(newValue) > 255) ? this.props.strings.maximumLengthNotValid : ""
        })
    }
}
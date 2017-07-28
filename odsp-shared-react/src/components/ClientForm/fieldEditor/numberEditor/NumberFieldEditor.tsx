// external packages
import * as React from 'react';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

// local packages
import { IReactFieldEditor } from '../IReactFieldEditor';
import {
    BaseReactFieldEditor,
    IBaseReactFieldEditorProps,
    IBaseReactFieldEditorState
} from '../BaseReactFieldEditor';

export class NumberFieldEditor extends BaseReactFieldEditor<IBaseReactFieldEditorProps, IBaseReactFieldEditorState> implements IReactFieldEditor {
    private _textField: ITextField;
    private _errMsg: string;
    private _delayedValidate;

    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);
        this._delayedValidate = this._async.debounce(this._validateNumber, this._deferredValidationTime);
    }

    /**
     * Core editor control for this field
     *
     * @override
     */
    protected _getEditor(): JSX.Element {
        // TODO: localization
        const { field } = this.state;
        return (
            <TextField
                placeholder={ 'Enter a number' }
                defaultValue={ (field && field.data) ? field.data.toString() : '' }
                onBlur={ this._endEdit }
                componentRef={ component => this._textField = component }
                underlined={ true }
                onKeyPress={ this._onEditorKeyPress.bind(this) }
                onChanged={ this._delayedValidate }
            />
        );
    }

    @autobind
    protected _endEdit(ev: any): void {
        let newData = this._textField.value;
        this._onSave(newData);
    }

    /**
     * Input validation
     */
    @autobind
    protected _validate(): string {
        super._validate();
        if (this._updatedField.clientSideErrorMessage) {
            return this._updatedField.clientSideErrorMessage;
        }

        this._updatedField.clientSideErrorMessage = this._errMsg;
        return this._updatedField.clientSideErrorMessage;
    }

    @autobind
    private _validateNumber(value: string): void {
        // include format characters and separators for various languages
        let validNumberRegex = /^[\d.,eE-\s'\*\.·٫٬˙]+$/;
        let isValid = !value || validNumberRegex.test(value);
        this._errMsg = !isValid ? 'Invalid number value' : '';
    }
}

export default NumberFieldEditor;
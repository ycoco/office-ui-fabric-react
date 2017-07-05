// external packages
import * as React from 'react';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';

// local packages
import { IReactFieldEditor } from '../IReactFieldEditor';
import { BaseReactFieldEditor, IBaseReactFieldEditorProps } from '../BaseReactFieldEditor';
import './NumberFieldEditor.scss';

export class NumberFieldEditor extends BaseReactFieldEditor implements IReactFieldEditor {
    private _textField: ITextField;
    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);
        this._validateNumber = this._validateNumber.bind(this);
        this._endEdit = this._endEdit.bind(this);
    }

    /**
     * Core editor control for this field
     * 
     * @override
     */
    protected _getEditor(): JSX.Element {
        const { field } = this.state;
        return (
            <TextField
                placeholder={ 'Enter text here' }
                defaultValue={ (field && field.data) ? field.data.toString() : '' }
                onGetErrorMessage={ this._validateNumber }
                onBlur={ this._endEdit }
                componentRef={ component => this._textField = component }
                className='od-TextField custom'
            />
        );
    }

    protected _endEdit(ev: any): void {
        let updatedField = { ...this.state.field };
        updatedField.data = this._textField.value;
        this.setState({
            mode: this._getModeAfterEdit(),
            field: updatedField
        });
        this.props.onSave(updatedField);
    }

    /**
     * Input validation 
     *
     * @param {string} User input string
     */
    private _validateNumber(value: string): string {
        // TODO: localization strings
        let validNumberRegex = /^[\d.,eE-\s'\*\.·٫٬˙]+$/; // include format characters and separators for various languages
        let isValid = !value || validNumberRegex.test(value);
        let errMsg = !isValid ? 'Invalid number value' : '';
        let updatedField = { ...this.state.field };
        updatedField.hasException = !isValid;
        updatedField.errorMessage = errMsg;
        this.setState({
            field: updatedField
        });
        return errMsg;
    }
}

export default NumberFieldEditor;
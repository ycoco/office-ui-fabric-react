// external packages
import * as React from 'react';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';

// local packages
import { IReactFieldEditor,ReactFieldEditorMode } from '../IReactFieldEditor';
import { BaseReactFieldEditor, IBaseReactFieldEditorProps } from '../BaseReactFieldEditor';
import './NumberFieldEditor.scss'

export class NumberFieldEditor extends BaseReactFieldEditor implements IReactFieldEditor {
    private _textField: ITextField;
    private _errMsg: string;
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
                placeholder={ !this.state.field.data ? 'Enter text here' : undefined }
                defaultValue={ (field && field.data) ? field.data.toString() : '' }
                onGetErrorMessage={ this._validateNumber }
                onBlur={ this._endEdit }
                componentRef={ component => this._textField = component }
                className='od-TextField custom'
                />
        );
    }

    protected _endEdit(ev: any): void {
        if (this._errMsg !== '') {
            // When error message is not empty, do not save the input
            return;
        }
        let updatedField = { ...this.state.field };
        updatedField.data = this._textField.value;
        this.setState({
            mode: ReactFieldEditorMode.View,
            field: updatedField
        });
        this.props.onSave(this.state.field);
    }

    /**
     * Input validation 
     *
     * @param {string} User input string
     */
    private _validateNumber(value: string): string {
        // TODO: localization strings
        let validNumberRegex = /^[\d.,eE-\s'\*\.·٫٬˙]+$/; // include format characters and separators for various languages
        this._errMsg = !(validNumberRegex.test(value)) && value ? 'Invalid number value' : '';
        return this._errMsg;
    }
}

export default NumberFieldEditor;
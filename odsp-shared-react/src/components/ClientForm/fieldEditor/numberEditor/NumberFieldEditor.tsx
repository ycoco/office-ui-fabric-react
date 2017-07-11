// external packages
import * as React from 'react';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

// local packages
import { IReactFieldEditor } from '../IReactFieldEditor';
import { BaseReactFieldEditor, IBaseReactFieldEditorProps } from '../BaseReactFieldEditor';
import './NumberFieldEditor.scss';

export class NumberFieldEditor extends BaseReactFieldEditor implements IReactFieldEditor {
    private _textField: ITextField;
    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);
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
                onBlur={ this._endEdit }
                componentRef={ component => this._textField = component }
                className='od-TextField custom'
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

        // include format characters and separators for various languages
        let validNumberRegex = /^[\d.,eE-\s'\*\.·٫٬˙]+$/;
        let isValid = !this._updatedField.data || validNumberRegex.test(this._updatedField.data);

        // TODO: localization strings
        this._updatedField.clientSideErrorMessage = !isValid ? 'Invalid number value' : '';
        return this._updatedField.clientSideErrorMessage;
    }
}

export default NumberFieldEditor;
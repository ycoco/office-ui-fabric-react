// external packages
import * as React from 'react';
import {
    TextField,
    ITextField
} from 'office-ui-fabric-react/lib/TextField';

// local packages
import { IReactFieldEditor } from './IReactFieldEditor';
import { BaseReactFieldEditor, IBaseReactFieldEditorProps } from './BaseReactFieldEditor';

export class TextFieldEditor extends BaseReactFieldEditor implements IReactFieldEditor {
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
                placeholder={ !field.data ? 'Enter text here' : undefined }
                underlined={ true }
                defaultValue={ (field && field.data) ? field.data.toString() : '' }
                onBlur={ this._endEdit.bind(this) }
                componentRef={ component => this._textField = component } />
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
}

export default TextFieldEditor;

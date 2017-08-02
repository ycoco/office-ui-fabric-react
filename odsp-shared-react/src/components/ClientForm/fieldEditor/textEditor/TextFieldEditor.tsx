// external packages
import * as React from 'react';
import {
    TextField,
    ITextField
} from 'office-ui-fabric-react/lib/TextField';

// local packages
import { IReactFieldEditor } from '../IReactFieldEditor';
import {
    BaseReactFieldEditor,
    IBaseReactFieldEditorProps,
    IBaseReactFieldEditorState
} from '../baseEditor/BaseReactFieldEditor';

export class TextFieldEditor extends BaseReactFieldEditor<IBaseReactFieldEditorProps, IBaseReactFieldEditorState> implements IReactFieldEditor {
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
                placeholder={ this._getPlaceHolderString() }
                underlined={ true }
                defaultValue={ (field && field.data) ? field.data.toString() : '' }
                onBlur={ this._endEdit.bind(this) }
                onKeyPress={ this._onEditorKeyPress.bind(this) }
                componentRef={ component => this._textField = component } />
        );
    }

    protected _focusOnEditorIfNeeded(): void {
        if (this._textField) {
            this._textField.focus();
        }
    }

    protected _endEdit(ev: any): void {
        let newData = this._textField.value;
        this._onSave(newData);
    }
}

export default TextFieldEditor;

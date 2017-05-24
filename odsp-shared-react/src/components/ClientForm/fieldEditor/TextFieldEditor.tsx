// external packages
import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

// local packages
import {
    IReactFieldEditor,
    ReactFieldEditorMode
} from './IReactFieldEditor';
import { BaseReactFieldEditor, IBaseReactFieldEditorProps } from './BaseReactFieldEditor';

export class TextFieldEditor extends BaseReactFieldEditor implements IReactFieldEditor {
    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);
    }

    /**
     * Core editor control for this field
     * 
     * @override
     */
    protected _getEditor(): JSX.Element {
        return (
            <TextField
                defaultValue={ this.state.field.data.toString() }
                onBlur={ this._endEdit.bind(this) }
                />
        );
    }

    protected _endEdit(ev: any): void {
        let updatedField = this.state.field;
        updatedField.data = ev.target.value;
        this.setState({
            mode: ReactFieldEditorMode.View,
            field: updatedField
        });
        this.props.onSave(this.state.field);
    }
}

export default TextFieldEditor;

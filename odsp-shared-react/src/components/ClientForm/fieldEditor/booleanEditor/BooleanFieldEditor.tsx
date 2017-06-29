// external packages
import * as React from 'react';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

// local packages
import { IReactFieldEditor } from '../IReactFieldEditor';
import { BaseReactFieldEditor, IBaseReactFieldEditorProps } from '../BaseReactFieldEditor';

export class BooleanFieldEditor extends BaseReactFieldEditor implements IReactFieldEditor {
    private _checkedValue;
    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);
        this._checkedValue = this.props.field.data === "1" ? true : false;
    }

    /**
     * Core editor control for this field
     * 
     * @override
     */
    protected _getEditor(): JSX.Element {
        // TODO: localization strings
        return (
            <Toggle
                defaultChecked={ this._checkedValue }
                onAriaLabel='This toggle is checked. Press to uncheck.'
                offAriaLabel='This toggle is unchecked. Press to check.'
                onText='Yes'
                offText='No'
                onBlur={ this._endEdit.bind(this) }
                onChanged={ this._onChange.bind(this) } />
        );
    }

    protected _endEdit(ev: any): void {
        let updatedField = { ...this.state.field };
        this._onChange.bind(this);
        updatedField.data = (this._checkedValue ? '1' : '0');
        this.setState({
            mode: this._getModeAfterEdit(),
            field: updatedField
        });
        this.props.onSave(updatedField);
    }

    /**
     * Set place holder string for boolean field editor
     * @override
     */
    protected _getPlaceHolderString(): string {
        // TODO: localization strings
        return 'Enter value here';
    }

    protected _onChange(checked: boolean): void {
        this._checkedValue = checked;
    }
}

export default BooleanFieldEditor;
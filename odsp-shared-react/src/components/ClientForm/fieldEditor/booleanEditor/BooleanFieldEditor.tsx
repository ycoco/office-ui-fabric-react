// external packages
import * as React from 'react';
import { Toggle, IToggle } from 'office-ui-fabric-react/lib/Toggle';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

// local packages
import { IReactFieldEditor } from '../IReactFieldEditor';
import {
    BaseReactFieldEditor,
    IBaseReactFieldEditorProps,
    IBaseReactFieldEditorState
} from '../baseEditor/BaseReactFieldEditor';

export class BooleanFieldEditor extends BaseReactFieldEditor<IBaseReactFieldEditorProps, IBaseReactFieldEditorState> implements IReactFieldEditor {
    private _checkedValue;
    private _toggle: IToggle;

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
                componentRef={ (component: IToggle) => this._toggle = component }
                onBlur={ this._endEdit }
                onKeyPress={ this._onEditorKeyPress.bind(this) }
                onChanged={ this._onChange } />
        );
    }

    protected _focusOnEditorIfNeeded(): void {
        if (this._toggle) {
            this._toggle.focus();
        }
    }

    @autobind
    protected _endEdit(ev: any): void {
        this._onChange.bind(this);
        let newData = (this._checkedValue ? '1' : '0');
        this._onSave(newData);
    }

    /**
     * Set place holder string for boolean field editor
     * @override
     */
    protected _getPlaceHolderString(): string {
        // TODO: localization strings
        return 'Enter value here';
    }

    protected _getRendererText(): string {
        // TODO: localization
        let displayTxt = this._checkedValue ? 'Yes' : 'No';
        return displayTxt;
    }

    @autobind
    protected _onChange(checked: boolean): void {
        this._checkedValue = checked;
    }
}

export default BooleanFieldEditor;
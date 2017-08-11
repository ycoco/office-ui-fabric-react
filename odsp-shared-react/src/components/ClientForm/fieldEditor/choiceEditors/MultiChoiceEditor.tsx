// external packages
import * as React from 'react';
import {
    Dropdown,
    IDropdownOption
} from 'office-ui-fabric-react/lib/Dropdown';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import * as ObjectUtil from '@ms/odsp-utilities/lib/object/ObjectUtil';

// local packages
import { IReactFieldEditor } from '../IReactFieldEditor';
import {
    BaseReactFieldEditor,
    IBaseReactFieldEditorProps,
    IBaseReactFieldEditorState
} from '../baseEditor/BaseReactFieldEditor';

export interface IMultChoiceEditorState extends IBaseReactFieldEditorState {
    options: IDropdownOption[];
    selectedOptions: any[];
}

export class MultiChoiceEditor extends BaseReactFieldEditor<IBaseReactFieldEditorProps, IMultChoiceEditorState> implements IReactFieldEditor {
    private _schema;

    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);
        this._schema = this.props.field.schema;
        this.state = {
            ... this.state,
            options: this._makeList(this._schema.MultiChoices),
            selectedOptions: this._parseServerChoicesSelection(this.state.field.data)
        }
    }

    /**
     * Core editor control for this field
     * @override
     */
    protected _getEditor(): JSX.Element {
        return (
            <Dropdown
                multiSelect={ true }
                placeHolder={ this._getPlaceHolderString() }
                options={ this.state.options }
                onChanged={ option => this._onChange(option) }
                selectedKeys={ this.state.selectedOptions }
                onBlur={ this._endEdit }
            />
        );
    }

    /**
     * Set place holder string for choice field editor
     * @override
     */
    protected _getPlaceHolderString(): string {
        // TODO: localization strings
        return 'Select an option';
    }

    protected _focusOnEditorIfNeeded(): void {
        // Dropdown doesn't support focus() method. So no-op here until the support is added.
        return;
    }

    @autobind
    protected _endEdit(): void {
        let newData = this._beforeSave(this.state.selectedOptions);
        this._onSave(newData);
    }

    /**
    * Get string to display when it's in viewing mode.  Child classes usually override this.
    */
    protected _getRendererText(): string {
        let displayString: string = '';
        if (this.state.selectedOptions) {
            for (let key of this.state.selectedOptions) {
                displayString += key;
            }
        }
        return displayString;
    }

    private _makeList(items) {
        let list = [];
        if (items === null) {
            return list;
        }
        for (let i = 0; i < items.length; i++) {
            list.push({ key: items[i], text: items[i] });
        }
        return list;
    }

    /**
     * This function update the currently selected items
     * @param option the option changed
     */
    private _onChange(option: IDropdownOption): void {
        if (!option) {
            return;
        }
        let updatedOptions = ObjectUtil.deepCopy(this.state.selectedOptions);
        if (option.selected) {
            updatedOptions.push(option.key);
        } else {
            var index = this.state.selectedOptions.indexOf(option.key);
            if (index > -1) {
                updatedOptions.splice(index, 1);
            }
        }
        this.setState({
            selectedOptions: updatedOptions
        });
    }

    /**
     * This function convert current selected options in to server format
     * @param selectedOpt currently selected options
     */
    private _beforeSave(selectedOpt): string {
        if (!selectedOpt) {
            return '';
        }
        let result = '';
        let choiceSeparator = ";#";
        for (let selected of selectedOpt) {
            result += choiceSeparator;
            result += selected;
        }

        result += result ? choiceSeparator : '';
        return result;
    }

    /**
     * This function parse data receives from
     * @param input 
     */
    private _parseServerChoicesSelection(input: string): any[] {
        if (!input) {
            return [];
        }
        let stringArray = input.split(';#');
        if (stringArray.length < 3) {
            return [];
        }
        let keyArray = [];
        for (let i = 1; i < stringArray.length - 1; i++) {
            keyArray.push(stringArray[i]);
        }
        return keyArray;
    }
}

export default MultiChoiceEditor;

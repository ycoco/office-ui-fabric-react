// external packages
import * as React from 'react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

// local packages
import { IReactFieldEditor } from '../IReactFieldEditor';
import {
    BaseReactFieldEditor,
    IBaseReactFieldEditorProps
} from '../BaseReactFieldEditor';

export class SingleChoiceEditor extends BaseReactFieldEditor implements IReactFieldEditor {
    private _schema;
    private _selectedItem;
    private _options;

    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);
        this._schema = this.props.field.schema;
    }

    /**
     * Core editor control for this field
     * @override
     */
    protected _getEditor(): JSX.Element {
        const { field } = this.state;
        this._options = this._makeList(this._schema.Choices);
        return (
            <Dropdown
                placeHolder={ this._getPlaceHolderString() }
                options={ this._options }
                onChanged={ option => this._endEdit(option) }
                defaultSelectedKey={ (field && field.data) ? this._lookUpKeyByText(field.data) : '' }
            />
        );
    }

    /**
     * Get string to display when it's in viewing mode.
     * @override
     */
    protected _getRendererText(): string {
        let displayTxt = this.state.field.data ? this.state.field.data : '';
        return displayTxt;
    }

    /**
     * Set place holder string for choice field editor
     * @override
     */
    protected _getPlaceHolderString(): string {
        // TODO: localization strings
        return 'Select an option';
    }

    @autobind
    protected _endEdit(option: any): void {
        this._selectedItem = option;
        let newData = this._selectedItem.text;
        this._onSave(newData);
    }

    private _makeList(items) {
        let list = [];
        if (items === null) {
            return list;
        }
        for (let i = 0; i < items.length; i++) {
            list.push({ key: i, text: items[i] });
        }
        return list;
    }

    @autobind
    private _lookUpKeyByText(text: string) {
        if (text === undefined || this._schema.Choices === undefined) {
            return undefined;
        }

        for (let opt of this._options) {
            if (opt.text === text) {
                return opt.key;
            }
        }
        return undefined;
    }
}

export default SingleChoiceEditor;

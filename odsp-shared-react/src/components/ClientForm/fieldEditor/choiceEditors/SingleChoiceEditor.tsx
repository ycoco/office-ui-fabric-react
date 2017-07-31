// external packages
import * as React from 'react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

// local packages
import { IReactFieldEditor } from '../IReactFieldEditor';
import {
    BaseReactFieldEditor,
    IBaseReactFieldEditorProps,
    IBaseReactFieldEditorState
} from '../BaseReactFieldEditor';

export class SingleChoiceEditor extends BaseReactFieldEditor<IBaseReactFieldEditorProps, IBaseReactFieldEditorState> implements IReactFieldEditor {
    private _schema;
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
                defaultSelectedKey={ (field && field.data) ? field.data : '' }
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

    @autobind
    protected _endEdit(option: any): void {
        let newData = option ? option.text : '';
        this._onSave(newData);
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
}

export default SingleChoiceEditor;
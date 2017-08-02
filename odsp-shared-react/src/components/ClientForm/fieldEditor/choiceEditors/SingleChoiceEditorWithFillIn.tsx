//0 external packages
import * as React from 'react';
import {
    ComboBox,
    IComboBoxOption,
    IComboBox
} from 'office-ui-fabric-react/lib/ComboBox';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import * as ObjectUtil from '@ms/odsp-utilities/lib/object/ObjectUtil';
import { SelectableOptionMenuItemType } from 'office-ui-fabric-react/lib/utilities/selectableOption/SelectableOption.Props';

// local packages
import {
    IReactFieldEditor
} from '../IReactFieldEditor';
import {
    BaseReactFieldEditor,
    IBaseReactFieldEditorProps,
    IBaseReactFieldEditorState
} from '../baseEditor/BaseReactFieldEditor';

export interface ISingleChoiceEditorWithFillInProps extends IBaseReactFieldEditorProps {
    getFieldFilterData?: (fieldName: string) => Promise<string>;
}

export interface ISingleChoiceEditorWithFillInState extends IBaseReactFieldEditorState {
    options: IComboBoxOption[];
    selectedKey: string;
}

export class SingleChoiceEditorWithFillIn extends BaseReactFieldEditor<ISingleChoiceEditorWithFillInProps, ISingleChoiceEditorWithFillInState> implements IReactFieldEditor {
    private _schema;
    private _seperator: IComboBoxOption; // seperator between schema chioces and user entered choices
    private _schemaChoiceHash: { [key: string]: IComboBoxOption };
    private _schemaOptions: IComboBoxOption[]; // all schema options
    private _combobox: IComboBox;

    public constructor(props: ISingleChoiceEditorWithFillInProps) {
        super(props);
        const { field } = this.props;
        this._schema = field.schema;
        this._seperator = { key: 'seperator', text: '-', itemType: SelectableOptionMenuItemType.Divider };
        this._schemaOptions = this._makeSchemaOptions(this._schema.Choices);
        this._schemaChoiceHash = this._createChoicesHash(this._schemaOptions);
        this.state = {
            ... this.state,
            options: this._schemaOptions,
            selectedKey: (field && field.data) ? field.data : ''
        }
    }

    protected _focusOnEditorIfNeeded(): void {
        if (this._combobox) {
            this._combobox.focus();
        }
    }

    /**
     * Core editor control for this field
     * @override
     */
    protected _getEditor(): JSX.Element {
        this._getFilterOptions();
        return (
            <ComboBox
                options={ this.state.options }
                selectedKey={ this.state.selectedKey }
                allowFreeform={ true }
                onChanged={ this._onChange }
                componentRef={ (component: IComboBox) => this._combobox = component }
            />
        );
    }

    /**
     * Set place holder string for choice field editor
     * @override
     */
    protected _getPlaceHolderString(): string {
        // TODO: localization strings
        return 'Select or enter an option';
    }

    @autobind
    protected _endEdit(option: string): void {
        let newData = option ? option : '';
        this._onSave(newData);
    }

    /**
     * @param items schema default choice list
     */
    private _makeSchemaOptions(items): IComboBoxOption[] {
        let schemaOpt: IComboBoxOption[] = [];
        if (items === null) {
            return;
        }
        for (let i = 0; i < items.length; i++) {
            // key will be the same as the display text
            schemaOpt.push(this._constructOption(items[i]));
        }
        return schemaOpt;
    }

    @autobind
    /**
     * Get user inputed options
     */
    private _getFilterOptions(): void {
        if (!this.props.getFieldFilterData) {
            // if getFieldFilterData is undefined, do nothing 
            return;
        }
        let { field } = this.props;

        this.props.getFieldFilterData(field.schema.Name).then((filterData: string) => {
            let newFilterOptions = this._getFilterInChoiceArray(filterData);
            if (newFilterOptions.length > 0) {
                // filter options exist
                let newOptionsArray = this._schemaOptions.concat(this._seperator);
                newOptionsArray = newOptionsArray.concat(newFilterOptions)
                if (!this._arraysAreEqual(this.state.options, newOptionsArray, this._schemaOptions.length)) {
                    this.setState({
                        options: newOptionsArray,
                        selectedKey: this.state.selectedKey
                    });
                }
            }
        });
    }

    /**
     * return the new option array and update the choice hash array
     * @param newOpt - the new options array we want to add
     * @param append - indicates if we want to append the array or now
     */
    private _updateOptions(newOpt: IComboBoxOption[], append: boolean): IComboBoxOption[] {
        let newOptions = this.state.options ? ObjectUtil.deepCopy(this.state.options) : [];
        if (!append) {
            newOptions = ObjectUtil.deepCopy(newOpt);
        } else {
            for (let opt of newOpt) {
                newOptions.push(opt);
            }
        }
        return newOptions;
    }

    /**
     * Parse filter data and return fill in choices
     * @param filterData
     */
    @autobind
    private _getFilterInChoiceArray(filterData: string): Array<IComboBoxOption> {
        let fieldName = this.props.field.schema.Name;
        let fillInChoices: Array<IComboBoxOption> = [];

        // The filterData sent by the SharePoint server contains a <SELECT>...</SELECT> followed by
        // an <img/> with some onload script that results in script errors in ODN.
        // We only need to use the <SELECT/> node and can ignore the rest.
        if (filterData) {
            // The filterData sent by the SharePoint server contains a <SELECT>...</SELECT> followed by
            // an <img/> with some onload script that results in script errors in ODN.
            // We only need to use the <SELECT/> node and can ignore the rest.
            filterData = filterData.split("<br>")[0];

            let iframeDoc = document.createElement("DIV");
            iframeDoc.innerHTML = filterData;
            let select = iframeDoc.querySelector("#diidFilter" + fieldName);
            if (select != null) {
                // The children of the select tag are the choice items; walk them and create the choices array
                let numItems = select.childNodes.length;
                let choiceNodes: any = select.childNodes;
                // Skip index 0 since its "(All)"
                for (let i = 1; i < numItems; i++) {
                    let choiceValue = choiceNodes[i].value.toString();
                    // check whether a value is a fill in value,
                    // add it to fillInChoices array and selectedChoices array if it is.
                    if (choiceValue && !this._schemaChoiceHash[choiceValue]) {
                        let newChoice = this._constructOption(choiceValue);
                        fillInChoices.push(newChoice);
                    }
                }
            }
        }
        return fillInChoices;
    }

    /**
     * Return the hash array of the array passed in
     * @param choices - the choice array you would like to create hash for
     */
    private _createChoicesHash(choices: IComboBoxOption[]): any {
        let choicesHash = [];
        for (let choice of choices) {
            choicesHash[choice.key] = choice;
        }
        return choicesHash;
    }

    @autobind
    private _onChange(option: IComboBoxOption, index: number, value: string): void {
        if (option != null || index != undefined) {
            // select existing items
            let key = option.key.toString()
            this._endEdit(key);
            this.setState({
                selectedKey: key
            });
        } else if (value !== null) {
            // new selection added
            let options;
            let newOption: IComboBoxOption[] = [];
            newOption.push(this._constructOption(value));
            options = this._updateOptions(newOption, true);
            this.setState({
                options: options,
                selectedKey: value
            });
            this._endEdit(value);
        }
    }

    private _constructOption(name: string): IComboBoxOption {
        return { key: name, text: name };
    }

    /**
     * Compare if two arrays contain the same filter options
     * @param arr1 
     * @param arr2
     * @param startIndex - optional, this indicates the index the comparison will start
     */
    private _arraysAreEqual(arr1: IComboBoxOption[], arr2: IComboBoxOption[], startIndex?: number): boolean {
        if (arr1.length != arr2.length) {
            return false;
        }
        for (let i = startIndex; i < arr1.length; i++) {
            if (arr1[i].key !== arr2[i].key) {
                return false;
            }
        }
        return true;
    }

}

export default SingleChoiceEditorWithFillIn;
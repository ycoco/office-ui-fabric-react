import * as React from 'react';
import { IColumnManagementPanelStrings } from '../../../containers/columnManagementPanel/index';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { InfoTeachingIcon,
         IUniqueFieldsComponent,
         IUniqueFieldsComponentSchemaValues,
         IUniqueFieldsComponentRequiredValues
        } from './index';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';

export interface IChoiceColumnUniqueFieldsProps {
  /** If provided, additional class name to the root element. */
  className?: string;
  strings: IColumnManagementPanelStrings,
  choicesText: string,
  useCalculatedDefaultValue: boolean;
  defaultFormula: string;
  defaultValue: IDropdownOption;
  fillInChoice: boolean;
  currentLanguage: number;
  getName?: () => string;
  updateSaveDisabled?: (name: string, requiredValue: IUniqueFieldsComponentRequiredValues) => void;
};

export interface IChoiceColumnUniqueFieldsState {
  choicesText?: string;
  useCalculatedDefaultValue?: boolean;
  defaultFormula?: string;
  defaultValueDropdownOptions?: IDropdownOption[];
  defaultValue?: IDropdownOption;
};


export class ChoiceColumnUniqueFields extends BaseComponent<IChoiceColumnUniqueFieldsProps, IChoiceColumnUniqueFieldsState> implements IUniqueFieldsComponent {
  private _fillInChoice: Checkbox;

  constructor(props: IChoiceColumnUniqueFieldsProps) {
    super(props);
    this.state = {
      choicesText: this.props.choicesText,
      useCalculatedDefaultValue: this.props.useCalculatedDefaultValue,
      defaultValueDropdownOptions: [this.props.defaultValue],
      defaultFormula: this.props.defaultFormula,
      defaultValue: this.props.defaultValue
    };
  }

  public componentWillMount() {
    this._choicesChanged(this.state.choicesText);
  }

  public render() {
        let strings = this.props.strings;
        return (
            <div className={ this.props.className ? `${this.props.className} ms-ColumnManagementPanel-uniqueFields` : 'ms-ColumnManagementPanel-uniqueFields' }>
                <TextField className='ms-ColumnManagementPanel-multilineTextField ms-ColumnManagementPanel-choicesTextField'
                    label={ strings.choicesLabel }
                    value={ this.state.choicesText }
                    ariaLabel={ strings.choicesAriaLabel }
                    onChanged={ this._choicesChanged }
                    required={ true } multiline rows={ 9 }/>
                <div className='ms-ColumnManagementPanel-allowManuallyAddValues'>
                    <Checkbox className='ms-ColumnManagementPanel-checkbox'
                        label={ strings.manuallyAddValuesCheckbox }
                        defaultChecked={ this.props.fillInChoice }
                        ref={ this._resolveRef('_fillInChoice') } />
                    <InfoTeachingIcon className='ms-ColumnManagementPanel-checkboxInfo'
                    infoButtonAriaLabel={ strings.infoButtonAriaLabel }
                    calloutContent={ strings.manuallyAddValuesTeachingBubble } />
                </div>
                <div className='ms-ColumnManagementPanel-defaultValueContainer'>
                    { this.state.useCalculatedDefaultValue ?
                    <TextField className='ms-ColumnManagementPanel-defaultValueEntryField'
                        placeholder={ strings.defaultFormulaPlaceholder }
                        ariaLabel={ strings.defaultFormulaAriaLabel }
                        label={ strings.defaultValueHeader }
                        value={ this.state.defaultFormula }
                        onChanged={ this._defaultFormulaChanged } /> :
                    <Dropdown className='ms-ColumnManagementPanel-defaultValueDropdown'
                        label={ strings.defaultValueHeader }
                        ariaLabel={ strings.defaultValueDropdownAriaLabel }
                        options={ this.state.defaultValueDropdownOptions }
                        selectedKey={ this.state.defaultValue.key }
                        onChanged={ this._choiceDropdownChanged }
                        ref={ this._resolveRef('_defaultValueDropdown') } /> }
                    <div className='ms-ColumnManagementPanel-useCalculatedValue'>
                        <Checkbox className='ms-ColumnManagementPanel-checkbox'
                            label={ strings.useCalculatedValue }
                            defaultChecked={ this.state.useCalculatedDefaultValue }
                            onChange={ this._onUseCalculatedValueChanged } />
                        <InfoTeachingIcon className='ms-ColumnManagementPanel-checkboxInfo'
                        infoButtonAriaLabel={ strings.infoButtonAriaLabel }
                        calloutContent={ strings.useCalculatedValueTeachingBubble }
                        helpLink={{
                            href: `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_FormulaSyntaxError`,
                            displayText: strings.formulaLearnMoreLink
                        }} />
                    </div>
                </div>
            </div>
        );
    }

    @autobind
    public getSchemaValues(): IUniqueFieldsComponentSchemaValues {
      let choices = this.state.choicesText.split('\n').filter((choice) => { return choice; });
      return {
        Choices: choices,
        DefaultValue: this.state.useCalculatedDefaultValue || this.state.defaultValue.key === 0 ? null : this.state.defaultValue.text,
        DefaultFormula: this.state.useCalculatedDefaultValue ? this.state.defaultFormula : null,
        FillInChoice: this._fillInChoice.checked
      };
    }

    @autobind
    public getRequiredValues(): IUniqueFieldsComponentRequiredValues {
      return {
        choicesText: this.state.choicesText
      };
    }

    @autobind
    private _choicesChanged(newValue: string) {
        // Use value from the choices entry field to populate the default value dropdown
        let choices = newValue.split('\n');
        let newDropdownOptions = [{ key: 0, text: this.props.strings.choiceDefaultValue }];
        for (var i = 0; i < choices.length; i++) {
            if (choices[i]) {
                // Skip zero because that is the default 'None' which always stays
                newDropdownOptions.push({ key: i + 1, text: choices[i] });
            }
        }
        let defaultValue = this.state.defaultValue;
        let defaultValueIndex = choices.indexOf(defaultValue.text);
        if (defaultValueIndex === -1) {
          defaultValue = newDropdownOptions[0];
        } else if (defaultValue.key !== defaultValueIndex + 1) {
          defaultValue.key = defaultValueIndex + 1;
        }
        this.setState({
            choicesText: newValue,
            defaultValueDropdownOptions: newDropdownOptions,
            defaultValue: defaultValue
        });
        this.props.updateSaveDisabled && this.props.updateSaveDisabled(this.props.getName(), { choicesText: newValue });
    }

    @autobind
    private _onUseCalculatedValueChanged(ev: any, checked: boolean) {
        this.setState({
            useCalculatedDefaultValue: checked
        });
    }

    @autobind
    private _defaultFormulaChanged(newValue: string) {
        this.setState({ defaultFormula: newValue });
    }

    @autobind
    private _choiceDropdownChanged(option: IDropdownOption) {
        this.setState({
            defaultValue: option
        });
    }
}
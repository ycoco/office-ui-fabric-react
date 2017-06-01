import { IServerField, FieldType } from '@ms/odsp-datasources/lib/List';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IColumnManagementPanelStrings } from '../../containers/columnManagementPanel/index';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

/** Any types that support column validation should be listed here as strings. */
const SUPPORTS_COLUMN_VALIDATION = ["Choice", "Number", "Text"];

export interface IColumnManagementPanelCurrentValues {
    name: string;
    description: string;
    supportsValidation: boolean;
    fieldType: FieldType;
    choicesText: string;
    useCalculatedDefaultValue: boolean;
    defaultFormula: string;
    defaultChoiceValue: IDropdownOption;
    defaultValue: string;
    fillInChoice: boolean;
    minimumValue: string;
    maximumValue: string;
    maxLength: string;
    showAsPercentage: boolean;
    displayFormat: number;
    allowMultipleSelection: boolean;
    required: boolean;
    enforceUniqueValues: boolean;
    validationFormula: string;
    validationMessage: string;
    selectionGroup: number;
    selectionMode: number;
    lookupField: string;
}

export interface IDefaultsFromServerFieldOptions {
  /** Name of the server property from which default value should be determined if not the same as name in IColumnManagementPanelCurrentValues. */
  serverProperty?: string;
  /** Name of the server properties from which default value should be determined, in order. translateServerValue must be defined if specifying this to translate multiple values into one value. */
  serverProperties?: string[];
  /** Function to translate the server value to a formatted default value. */
  translateServerValue?: (...args: any[]) => any;
}

export class ColumnManagementPanelDefaultsHelper {
  private readonly _formatDefaults: {[name: string]: IDefaultsFromServerFieldOptions};

  constructor() {
    // Important. Please don't modify this unless adding new components to the panel that require default formatting help.
    this._formatDefaults = {
      name: {
        serverProperty: "Title"
      }, choicesText: {
        serverProperty: "Choices",
        translateServerValue: (choices: {}) => choices && choices["results"] && choices["results"].join("\n")
      }, useCalculatedDefaultValue: {
        serverProperty: "DefaultFormula",
        translateServerValue: (defaultFormula: string) => !!defaultFormula
      }, defaultChoiceValue: {
        serverProperties: ["DefaultValue", "Choices"],
        translateServerValue: (defaultValue: string, choices: {}) => {
          let key = choices && choices["results"] && choices["results"].indexOf(defaultValue);
          return defaultValue && key !== undefined && key !== -1 ? { key: key + 1, text: defaultValue } : null }
      }, allowMultipleSelection: {
        serverProperty: "TypeAsString",
        translateServerValue: (type: string) => type && type.indexOf('Multi') !== -1
      }, fieldType: {
        serverProperty: "TypeAsString",
        translateServerValue: (type: string) => FieldType[type.replace('Multi', '')]
      }, supportsValidation: {
        serverProperty: "TypeAsString",
        translateServerValue: (type: string) => SUPPORTS_COLUMN_VALIDATION.indexOf(type.replace('Multi', '')) !== -1
      }, minimumValue: {
        translateServerValue: (min: number) => min.toPrecision(2) !== "-1.8e+308" ? String(min) : null
      }, maximumValue: {
        translateServerValue: (max: number) => max.toPrecision(2) !== "1.8e+308" ? String(max) : null
      }, maximumLength: {
        translateServerValue: (maxLength: number) => maxLength.toPrecision(2) !== "1.8e+308" ? String(maxLength) : null
      }
    }
  }

  public getCurrentValueDefaults(strings: IColumnManagementPanelStrings, fieldType?: FieldType): IColumnManagementPanelCurrentValues {
    return {
      name: "",
      description: "",
      supportsValidation: fieldType !== undefined && SUPPORTS_COLUMN_VALIDATION.indexOf(FieldType[fieldType]) !== -1,
      fieldType: fieldType,
      choicesText: strings.choicesPlaceholder,
      useCalculatedDefaultValue: false,
      defaultFormula: "",
      defaultValue: "",
      defaultChoiceValue: { key: 0, text: strings.choiceDefaultValue },
      fillInChoice: false,
      allowMultipleSelection: false,
      required: false,
      enforceUniqueValues: false,
      validationFormula: "",
      validationMessage: "",
      selectionGroup: 0,
      selectionMode: 0,
      lookupField: null,
      minimumValue: "",
      maximumValue: "",
      maxLength: "255",
      showAsPercentage: false,
      displayFormat: -1
    };
  }

  public getCurrentValues(strings: IColumnManagementPanelStrings, currentValuesPromise: Promise<IServerField>, fieldType?: FieldType): Promise<IColumnManagementPanelCurrentValues> {
    let currentValues: IColumnManagementPanelCurrentValues = this.getCurrentValueDefaults(strings, fieldType);
    if (currentValuesPromise) {
      return currentValuesPromise.then((serverField: IServerField) => {
        for (let key in currentValues) {
          let value = this._getValue(key, serverField);
          if (value !== undefined && value !== null) {
            currentValues[key] = value;
          }
        }
        return currentValues;
      });
    } else {
      return Promise.wrap(currentValues);
    }
  }

  private _getValue(key, serverField: IServerField) {
    let formatOptions = this._formatDefaults[key];
    let capitalizedName = key.charAt(0).toUpperCase() + key.slice(1);
    if (formatOptions && formatOptions.serverProperties && formatOptions.translateServerValue) {
      let values = [];
      for (let property of formatOptions.serverProperties) {
        values.push(serverField[property]);
      }
      return formatOptions.translateServerValue(...values);
    }
    let value = formatOptions && formatOptions.serverProperty ? serverField[formatOptions.serverProperty] : serverField[capitalizedName];
    return value !== undefined && formatOptions && formatOptions.translateServerValue ? formatOptions.translateServerValue(value) : value;
  }
}
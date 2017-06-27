import { IServerField, FieldType } from '@ms/odsp-datasources/lib/List';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IColumnManagementPanelStrings } from '../../containers/columnManagementPanel/index';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

/** Any field types that support column validation must be listed here as strings. */
const SUPPORTS_COLUMN_VALIDATION = ["Choice", "Number", "Text"]; 

/**
 * Names of the current values we are determining from server field properties. Unless handled explicitly using serverProperty
 * in formatDefaults, the names here must be camel case versions of the property names in
 * @ms/odsp-datasources/lib/interfaces/list/IServerField
 */
export interface IColumnManagementPanelCurrentValues {
    allowMultipleSelection: boolean;
    appendOnly: boolean;
    choicesText: string;
    defaultChoiceValue: IDropdownOption;
    defaultFormula: string;
    defaultValue: string;
    description: string;
    displayFormat: number;
    enforceUniqueValues: boolean;
    fieldType: FieldType;
    fillInChoice: boolean;
    lookupField: string;
    maximumValue: string;
    maxLength: string;
    minimumValue: string;
    name: string;
    numberOfLines: string;
    required: boolean;
    richText: boolean;
    selectionGroup: number;
    selectionMode: number;
    showAsPercentage: boolean;
    supportsValidation: boolean;
    unlimitedLengthInDocumentLibrary: boolean;
    useCalculatedDefaultValue: boolean;
    validationFormula: string;
    validationMessage: string;
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
      allowMultipleSelection: {
        serverProperty: "TypeAsString",
        translateServerValue: (type: string) => type && type.indexOf('Multi') !== -1
      }, choicesText: {
        serverProperty: "Choices",
        translateServerValue: (choices: {}) => choices && choices["results"] && choices["results"].join("\n")
      }, defaultChoiceValue: {
        serverProperties: ["DefaultValue", "Choices"],
        translateServerValue: (defaultValue: string, choices: {}) => {
          let key = choices && choices["results"] && choices["results"].indexOf(defaultValue);
          return defaultValue && key !== undefined && key !== -1 ? { key: key + 1, text: defaultValue } : null }
      }, fieldType: {
        serverProperty: "TypeAsString",
        translateServerValue: (type: string) => FieldType[type.replace('Multi', '')]
      }, maximumValue: {
        translateServerValue: (max: number) => max && max.toPrecision(2) !== "1.8e+308" ? String(max) : null
      }, minimumValue: {
        translateServerValue: (min: number) => min && min.toPrecision(2) !== "-1.8e+308" ? String(min) : null
      }, name: {
        serverProperty: "Title"
      }, supportsValidation: {
        serverProperty: "TypeAsString",
        translateServerValue: (type: string) => SUPPORTS_COLUMN_VALIDATION.indexOf(type.replace('Multi', '')) !== -1
      }, useCalculatedDefaultValue: {
        serverProperty: "DefaultFormula",
        translateServerValue: (defaultFormula: string) => !!defaultFormula
      }
    }
  }

  public getCurrentValueDefaults(strings: IColumnManagementPanelStrings, fieldType?: FieldType): IColumnManagementPanelCurrentValues {
    return {
      allowMultipleSelection: false,
      appendOnly: false,
      choicesText: strings.choicesPlaceholder,
      defaultChoiceValue: { key: 0, text: strings.choiceDefaultValue },
      defaultFormula: "",
      defaultValue: "",
      description: "",
      displayFormat: -1,
      enforceUniqueValues: false,
      fieldType: fieldType,
      fillInChoice: false,
      lookupField: null,
      maximumValue: "",
      maxLength: "255",
      minimumValue: "",
      name: "",
      numberOfLines: "6",
      required: false,
      richText: false,
      selectionGroup: 0,
      selectionMode: 0,
      showAsPercentage: false,
      supportsValidation: fieldType !== undefined && SUPPORTS_COLUMN_VALIDATION.indexOf(FieldType[fieldType]) !== -1,
      unlimitedLengthInDocumentLibrary: false,
      useCalculatedDefaultValue: false,
      validationFormula: "",
      validationMessage: ""
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
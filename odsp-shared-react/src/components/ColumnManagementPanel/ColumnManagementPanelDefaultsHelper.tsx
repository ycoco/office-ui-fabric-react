import { IServerField } from '@ms/odsp-datasources/lib/List';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IColumnManagementPanelStrings } from '../../containers/columnManagementPanel/index';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IColumnManagementPanelCurrentValues {
    name: string;
    description: string;
    choicesText: string;
    useCalculatedDefaultValue: boolean;
    defaultFormula: string;
    defaultValue: IDropdownOption;
    fillInChoice: boolean;
    allowMultipleSelection: boolean;
    required: boolean;
    enforceUniqueValues: boolean;
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
      name: {
        serverProperty: "Title"
      }, choicesText: {
        serverProperty: "Choices",
        translateServerValue: (choices: {}) => choices && choices["results"] && choices["results"].join("\n")
      }, useCalculatedDefaultValue: {
        serverProperty: "DefaultFormula",
        translateServerValue: (defaultFormula: string) => !!defaultFormula
      }, defaultValue: {
        serverProperties: ["DefaultValue", "Choices"],
        translateServerValue: (defaultValue: string, choices: {}) => {
          let key = choices && choices["results"] && choices["results"].indexOf(defaultValue);
          return defaultValue && key !== -1 ? { key: key + 1, text: defaultValue } : null }
      }, allowMultipleSelection: {
        serverProperty: "TypeAsString",
        translateServerValue: (type: string) => type && type.indexOf('Multi') !== -1
      }
    }
  }

  public getCurrentValueDefaults(strings: IColumnManagementPanelStrings): IColumnManagementPanelCurrentValues {
    return {
      name: "",
      description: "",
      choicesText: strings.choicesPlaceholder,
      useCalculatedDefaultValue: false,
      defaultFormula: "",
      defaultValue: { key: 0, text: strings.choiceDefaultValue },
      fillInChoice: false,
      allowMultipleSelection: false,
      required: false,
      enforceUniqueValues: false,
      validationFormula: "",
      validationMessage: ""
    };
  }

  public getCurrentValues(strings: IColumnManagementPanelStrings, currentValuesPromise: Promise<IServerField>): Promise<IColumnManagementPanelCurrentValues> {
    let currentValues: IColumnManagementPanelCurrentValues = this.getCurrentValueDefaults(strings);
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
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IColumnManagementPanelStrings,
         MockColumnManagementPanelStrings,
         fillInColumnManagementPanelStrings
       } from '../../containers/columnManagementPanel';
import { ColumnManagementPanelDefaultsHelper, IColumnManagementPanelCurrentValues } from './index';
import { IServerField, FieldType } from '@ms/odsp-datasources/lib/List';

const expect: Chai.ExpectStatic = chai.expect;

describe('ColumnManagementPanelDefaultsHelper', () => {
  let helper: ColumnManagementPanelDefaultsHelper;
  let strings: IColumnManagementPanelStrings;
  let expectedCurrentValues: IColumnManagementPanelCurrentValues;
  let serverField: IServerField;

  before(() => {
    helper = new ColumnManagementPanelDefaultsHelper();
    strings = fillInColumnManagementPanelStrings(MockColumnManagementPanelStrings as {});
    expectedCurrentValues = helper.getCurrentValueDefaults(strings, FieldType.Choice);
    expectedCurrentValues.name = "Test Field";
    expectedCurrentValues.description = "this is a test field";
    expectedCurrentValues.validationFormula = "=[Test Formula]";
    expectedCurrentValues.validationMessage = "this is a message";
    // A lot of these values are unimportant but we strongly type server fields so they are filled out here anyway.
    serverField = {
      AppendOnly: false,
      AutoIndexed: false,
      CanBeDeleted: true,
      CustomFormatter: null,
      DefaultValue: null,
      Description: "this is a test field",
      DescriptionResource: null,
      Direction: null,
      EnforceUniqueValues: false,
      EntityPropertyName: null,
      FieldTypeKind: null,
      Filterable: false,
      FromBaseType: true,
      Group: null,
      Groupable: true,
      Hidden: false,
      Id: null,
      Indexed: false,
      InternalName: "Test_Field",
      JSLink: null,
      LookupField: null,
      MinimumValue: null,
      MaximumValue: null,
      ReadOnlyField: false,
      Required: false,
      RichText: false,
      SchemaXml: null,
      Scope: null,
      Sealed: false,
      SelectionGroup: 0,
      SelectionMode: 0,
      Sortable: true,
      StaticName: null,
      Title: "Test Field",
      TitleResource: null,
      TypeAsString: "Choice",
      TypeDisplayName: "Choice",
      TypeShortDescription: "choice",
      UnlimitedLengthInDocumentLibrary: false,
      ValidationFormula: "=[Test Formula]",
      ValidationMessage: "this is a message"
    }
  });

  it('Should merge current values from server and default current values', () => {
    let currentValuesPromise = Promise.wrap(serverField);
    return helper.getCurrentValues(strings, currentValuesPromise).then((currentValues: IColumnManagementPanelCurrentValues) => {
      expect(currentValues).to.deep.equal(expectedCurrentValues);
    });
  });

  it('Should use translate server value functions', () => {
    let testServerField = { ...serverField };
    testServerField.Choices = {
      results: ["Red", "Blue", "Green"]
    };
    testServerField.DefaultValue = "Blue";
    testServerField.TypeAsString = "MultiChoice";
    let currentValuesPromise = Promise.wrap(testServerField);
    let expected = { ...expectedCurrentValues };
    expected.choicesText = "Red\nBlue\nGreen";
    expected.defaultChoiceValue = { key: 2, text: "Blue" };
    expected.defaultValue = "Blue";
    expected.allowMultipleSelection = true;
    expected.originalType = "MultiChoice";
    return helper.getCurrentValues(strings, currentValuesPromise).then((currentValues: IColumnManagementPanelCurrentValues) => {
      expect(currentValues).to.deep.equal(expected);
    });
  });

  it('Should correctly distinguish whether column is using a calculated default', () => {
    let testServerField = { ...serverField };
    testServerField.DefaultFormula = "=Today";
    testServerField.FillInChoice = true;
    testServerField.Required = true;
    let currentValuesPromise = Promise.wrap(testServerField);
    let expected = { ...expectedCurrentValues };
    expected.useCalculatedDefaultValue = true;
    expected.defaultFormula = "=Today";
    expected.fillInChoice = true;
    expected.required = true;
    return helper.getCurrentValues(strings, currentValuesPromise).then((currentValues: IColumnManagementPanelCurrentValues) => {
      expect(currentValues).to.deep.equal(expected);
    });
  });

  it('Should correctly handle user field data', () => {
    let testServerField = { ...serverField };
    testServerField.TypeAsString = "UserMulti";
    testServerField.SelectionMode = 1;
    testServerField.SelectionGroup = 4;
    testServerField.LookupField = "FirstName";
    let currentValuesPromise = Promise.wrap(testServerField);
    let expected = { ...expectedCurrentValues };
    expected.allowMultipleSelection = true;
    expected.selectionGroup = 4;
    expected.selectionMode = 1;
    expected.lookupField = "FirstName";
    expected.fieldType = FieldType.User;
    expected.originalType = "UserMulti";
    return helper.getCurrentValues(strings, currentValuesPromise).then((currentValues: IColumnManagementPanelCurrentValues) => {
      expect(currentValues).to.deep.equal(expected);
    });
  });

  it('Should correctly handle number field data', () => {
    let testServerField = { ...serverField };
    testServerField.TypeAsString = "Number";
    testServerField.MinimumValue = 1;
    testServerField.MaximumValue = 1.7976931348623157e+308;
    testServerField.DisplayFormat = 2;
    let currentValuesPromise = Promise.wrap(testServerField);
    let expected = { ...expectedCurrentValues };
    expected.fieldType = FieldType.Number;
    expected.originalType = "Number";
    expected.minimumValue = "1";
    expected.maximumValue = "";
    expected.displayFormat = 2;
    return helper.getCurrentValues(strings, currentValuesPromise).then((currentValues: IColumnManagementPanelCurrentValues) => {
      expect(currentValues).to.deep.equal(expected);
    });
  });

  it('Should preserve column custom formatting', () => {
    let testServerField = { ...serverField };
    testServerField.CustomFormatter = "{\r\n  \"debugMode\": true,\r\n  \"elmType\": \"div\",\r\n  \"style\": {\r\n    \"background-color\": \"#FFF4CE\",\r\n    \"font-size\": \"14px\",\r\n    \"border\": \"1px solid #c8c8c8\"\r\n  }\r\n}";
    let currentValuesPromise = Promise.wrap(testServerField);
    let expected = { ...expectedCurrentValues };
    expected.customFormatter = "{\r\n  \"debugMode\": true,\r\n  \"elmType\": \"div\",\r\n  \"style\": {\r\n    \"background-color\": \"#FFF4CE\",\r\n    \"font-size\": \"14px\",\r\n    \"border\": \"1px solid #c8c8c8\"\r\n  }\r\n}";
    return helper.getCurrentValues(strings, currentValuesPromise).then((currentValues: IColumnManagementPanelCurrentValues) => {
      expect(currentValues).to.deep.equal(expected);
    })
  });
});
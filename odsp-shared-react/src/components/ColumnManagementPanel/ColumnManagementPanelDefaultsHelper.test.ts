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
      AutoIndexed: false,
      CanBeDeleted: true,
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
      ReadOnlyField: false,
      Required: false,
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
    expected.supportsValidation = false;
    expected.selectionGroup = 4;
    expected.selectionMode = 1;
    expected.lookupField = "FirstName";
    expected.fieldType = FieldType.User;
    return helper.getCurrentValues(strings, currentValuesPromise).then((currentValues: IColumnManagementPanelCurrentValues) => {
      expect(currentValues).to.deep.equal(expected);
    });
  });
});
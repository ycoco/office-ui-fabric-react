import FieldSchemaXmlHelper from './FieldSchemaXmlHelper';
import FieldType from '../../interfaces/list/FieldType';
import IFieldSchema from '../../interfaces/list/IFieldSchema';

const expect: Chai.ExpectStatic = chai.expect;

describe('FieldSchemaXmlHelper', () => {
    let helper: FieldSchemaXmlHelper;
    before(() => {
        helper = new FieldSchemaXmlHelper();
    });

    it('Should create attribute segments properly for numbers, strings, booleans', () => {
        let fieldSchema: IFieldSchema = {
            Type: FieldType.UserMulti,
            DisplayName: "Test UserMulti",
            Title: "Test UserMulti",
            UserSelectionScope: 0,
            Mult: true,
            FillInChoice: null
        }
        expect(helper.makeAttributeSegment("Type", fieldSchema.Type)).to.equal(" Type='UserMulti'");
        expect(helper.makeAttributeSegment("UserSelectionScope", fieldSchema.UserSelectionScope)).to.equal(" UserSelectionScope='0'");
        expect(helper.makeAttributeSegment("Mult", fieldSchema.Mult)).to.equal(" Mult='TRUE'");
        expect(helper.makeAttributeSegment("Title", fieldSchema.Title)).to.equal(" Title='Test UserMulti'");
        expect(helper.makeAttributeSegment("FillInChoice", fieldSchema.FillInChoice)).to.equal('');
    });

    it('Should create element segments correctly', () => {
        let fieldSchemaPartial = {
            Choices: ["Red", "Blue", "Green"],
            DefaultValue: "Blue",
            Validation: {
                Message: "Must be a color",
                Formula: "=[TestFormula]"
            }
        };
        let validationMessage = { Validation: { Message: "Must be a color", Formula: null}};
        let validationFormula = { Validation: { Message: null, Formula: "=[TestFormula]"}};
        let nullTest = { Validation: { Message: null, Formula: null}};
        let choiceSegment = "<CHOICES><CHOICE>Red</CHOICE><CHOICE>Blue</CHOICE><CHOICE>Green</CHOICE></CHOICES>";
        let validationSegment = "<Validation Message='Must be a color'>=[TestFormula]</Validation>";
        let validationMessageSegment = "<Validation Message='Must be a color'></Validation>";
        let validationFormulaSegment = "<Validation>=[TestFormula]</Validation>";
        expect(helper.makeElementSegment("Choices", fieldSchemaPartial.Choices)).to.equal(choiceSegment);
        expect(helper.makeElementSegment("Field", {Choices: fieldSchemaPartial.Choices})).to.equal("<Field>" + choiceSegment + "</Field>");
        expect(helper.makeElementSegment("DefaultValue", fieldSchemaPartial.DefaultValue)).to.equal("<Default>Blue</Default>");
        expect(helper.makeElementSegment("Validation", fieldSchemaPartial.Validation)).to.equal(validationSegment);
        expect(helper.makeElementSegment("Validation", validationMessage.Validation)).to.equal(validationMessageSegment);
        expect(helper.makeElementSegment("Validation", validationFormula.Validation)).to.equal(validationFormulaSegment);
        expect(helper.makeElementSegment("Validation", nullTest.Validation)).to.equal('');
    });

    it('Should assemble child element segments from object and ignore attributes', () => {
        let fieldSchemaPartial = {
            Type: FieldType.Text,
            DisplayName: "Test",
            DefaultValue: "Blue"
        };
        let choices = { "CHOICE": ["Red", "Blue", "Green"]};
        let choiceSegment = "<CHOICE>Red</CHOICE><CHOICE>Blue</CHOICE><CHOICE>Green</CHOICE>";
        expect(helper.assembleChildElements("Field", fieldSchemaPartial)).to.equal("<Default>Blue</Default>");
        expect(helper.assembleChildElements("Choices", choices, true)).to.equal(choiceSegment);
    });

    it('Should assemble attribute segments from object and ignore child elements', () => {
        let fieldSchemaPartial = {
            Type: FieldType.User,
            DefaultFormula: "=[Test]",
            Validation: {
                Message: "Testing"
            }
        };
        expect(helper.assembleAttributes("Field", fieldSchemaPartial)).to.equal("Field Type='User'");
    });
});
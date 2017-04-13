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
            Mult: true
        }
        expect(helper.makeAttributeSegment("Type", fieldSchema.Type)).to.equal(" Type='UserMulti'");
        expect(helper.makeAttributeSegment("UserSelectionScope", fieldSchema.UserSelectionScope)).to.equal(" UserSelectionScope='0'");
        expect(helper.makeAttributeSegment("Mult", fieldSchema.Mult)).to.equal(" Mult='TRUE'");
        expect(helper.makeAttributeSegment("Title", fieldSchema.Title)).to.equal(" Title='Test UserMulti'");
    });

    it('Should create element segments correctly', () => {
        let fieldSchema: IFieldSchema = {
            Type: FieldType.Choice,
            DisplayName: "Test Choice",
            Title: "Test Choice",
            Choices: ["Red", "Blue", "Green"],
            DefaultValue: "Blue",
            Validation: {
                Message: "Must be a color",
                Formula: "=[TestFormula]"
            }
        }
        let choiceSegment = "<CHOICES><CHOICE>Red</CHOICE><CHOICE>Blue</CHOICE><CHOICE>Green</CHOICE></CHOICES>";
        let validationSegment = "<Validation Message='Must be a color'>=[TestFormula]</Validation>";
        expect(helper.makeElementSegment("Choices", fieldSchema.Choices)).to.equal(choiceSegment);
        expect(helper.makeElementSegment("DefaultValue", fieldSchema.DefaultValue)).to.equal("<Default>Blue</Default>");
        expect(helper.makeElementSegment("Validation", fieldSchema.Validation)).to.equal(validationSegment);
    });

    it('Should assemble child element segments from object', () => {
        let childElements1 = { DefaultValue: "Blue" };
        let childElements2 = { Choices: ["Red", "Blue", "Green"]};
        let choiceSegment = "<CHOICES><CHOICE>Red</CHOICE><CHOICE>Blue</CHOICE><CHOICE>Green</CHOICE></CHOICES>";
        expect(helper.assembleChildElements(childElements1)).to.equal("<Default>Blue</Default>");
        expect(helper.assembleChildElements(childElements2)).to.equal(choiceSegment);
    });
});
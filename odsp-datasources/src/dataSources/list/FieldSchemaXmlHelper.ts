import { FieldType } from '../../interfaces/list/FieldType';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import { IFieldSchema, IFieldValidation } from '../../interfaces/list/IFieldSchema';
import HtmlEncoding from '@ms/odsp-utilities/lib/encoding/HtmlEncoding';

/**
 * Attribute and child element names here must match the names of the IFieldSchema attributes. Attributes and child elements not listed
 * here will be ignored.
 */
const FIELD_ATTRIBUTES = ["Type", "Title", "DisplayName", "Description", "FillInChoice", "Required", "EnforceUniqueValues",
"Indexed", "UserSelectionMode", "UserSelectionScope", "Mult", "Format"];
const FIELD_CHILD_ELEMENTS = ["Choices", "DefaultValue", "DefaultFormula", "Validation"];
const FORMATS = {
    attributeFormat: " {0}='{1}'",
    childElementFormat: "<{0}>{1}</{2}>",
    nameAndAttributesFormat: "{0}{1}"
};

export interface ISchemaToXmlOptions {
    /** Names of attributes for the element. Attributes not listed here will be ignored. */
    attributeKeys?: ReadonlyArray<string>;
    /** Names of child elements for the element. Child elements not listed here will be ignored. */
    childElementKeys?: ReadonlyArray<string>;
    /** Function to modify the field schema value before it is put into the xml. E.g. FieldType 0 should be 'Text'. */
    valueTransformer?: (value: any) => string;
    /** Overrides the name of the property in IFieldSchema when placing it in the xml. E.g. "DefaultValue" is "Default" in the xml. */
    nameOverride?: string;
};

/**
 * Given a field schema object, assembles the xml that we need to create the field.
 * For more info, see https://msdn.microsoft.com/en-us/library/office/ms437580.aspx
 */
export default class FieldSchemaXmlHelper {
    private readonly _formatProperties: {[schemaKey: string]: ISchemaToXmlOptions};

    constructor() {
        // Important. Please don't modify this unless adding new items to the field schema that require formatting help.
        this._formatProperties = {
            Field: {
                attributeKeys: FIELD_ATTRIBUTES,
                childElementKeys: FIELD_CHILD_ELEMENTS,
                valueTransformer: (fieldSchema: IFieldSchema) => this.assembleChildElements("Field", fieldSchema)
            },
            Type: {
                valueTransformer: (type: FieldType) => FieldType[type]
            },
            DefaultValue: {
                nameOverride: "Default"
            },
            Choices: {
                nameOverride: "CHOICES",
                childElementKeys: ["CHOICE"],
                valueTransformer: (choices: string[]) => this.assembleChildElements("Choices", { "CHOICE": choices }, true)
            },
            Validation: {
                attributeKeys: ["Message"],
                valueTransformer: (validation: IFieldValidation) => validation.Formula
            }
        };
    }

    /**
     * Gets the full field schema xml for field creation.
     * @param {IFieldSchema} fieldSchema The field schema
     */
    public getFieldSchemaXml(fieldSchema: IFieldSchema): string {
        return this.makeElementSegment("Field", fieldSchema);
    }

    /**
     * Assembles child element XML from an object or a list. Specify one or the other, not both.
     * @param {string} elementName The name of the element whose child elements are being assembled.
     * @param {} childElementsObject An object of key value pairs representing child element names and values. The keys of this object
     * should match the childElementKeys for the elementName in this._formatProperties, other keys will be ignored.
     * @param {boolean} parseChildArrays Whether or not to create a new element for each item in array values.
     * @returns {string} Formatted xml string of all the child elements. E.g. <CHOICES><CHOICE>Red</CHOICE></CHOICES><Default>Red</Default>.
     */
    public assembleChildElements(elementName: string, childElementsObject: {}, parseChildArrays: boolean = false): string {
        let childElements = '';
        let childElementKeys = this._formatProperties[elementName].childElementKeys.filter((key: string) => childElementsObject[key] !== undefined);
        for (let key of childElementKeys) {
            if (Array.isArray(childElementsObject[key]) && parseChildArrays) {
                childElementsObject[key].forEach((value: string) => childElements += this.makeElementSegment(key, value));
            } else {
                childElements += this.makeElementSegment(key, childElementsObject[key]);
            }
        }
        return childElements;
    }

    /**
     * Assembles the attribute XML for an element.
     * @param {string} elementName The name of the element whose attributes are being assembled.
     * @param {} attributesObject An object of key value pairs representing attribute names and values. The keys of this object should
     * match the attributeKeys for the elementName in this._formatProperties, other keys will be ignored.
     * @returns {string} Element name with attribute segments attached. E.g. "Field Title='Test' DisplayName='Test'".
     */
    public assembleAttributes(elementName: string, attributesObject: {}): string {
        let attributes = '';
        let attributeKeys = this._formatProperties[elementName].attributeKeys.filter((key: string) => attributesObject[key] !== undefined);
        for (let key of attributeKeys) {
            attributes += this.makeAttributeSegment(key, attributesObject[key]);
        }
        return StringHelper.format(FORMATS.nameAndAttributesFormat, this.getName(elementName), attributes);
    }

    /** Assemble an element segment from element name and value. E.g. "<CHOICES><CHOICE>Red</CHOICE></CHOICES>". */
    public makeElementSegment(elementName: string, value: any): string {
        let formattedValue = this.getValue(elementName, value);
        let nameWithAttributes = this.getName(elementName, value);
        let name = this.getName(elementName);
        if (formattedValue || nameWithAttributes !== name) {
            return StringHelper.format(FORMATS.childElementFormat, nameWithAttributes, formattedValue, name)
        }
        return '';
    }

    /** Assemble an attribute segment from attribute name and value. Returns formatted attribute string. E.g. " Title='Test'". */
    public makeAttributeSegment(attributeName: string, value: any): string {
        let formattedValue = this.getValue(attributeName, value);
        let name = this.getName(attributeName);
        return formattedValue ? StringHelper.format(FORMATS.attributeFormat, name, formattedValue): '';
    }

    /** Gets name for the element or attribute. If value is specified and the name has attributes they will be added. */
    public getName(elementOrAttributeName: string, value?: string): string {
        let properties = this._formatProperties[elementOrAttributeName];
        if (properties && properties.attributeKeys && value) {
            return this.assembleAttributes(elementOrAttributeName, value);
        }
        return properties && properties.nameOverride ? properties.nameOverride : elementOrAttributeName;
    }

    /** Gets formatted and transformed value for the element or attribute. */
    public getValue(elementOrAttributeName: string, value: any): string {
        let properties = this._formatProperties[elementOrAttributeName];
        let transformedValue = properties && properties.valueTransformer ? properties.valueTransformer(value) : value;
        return properties && properties.childElementKeys ? transformedValue : this.formatValue(transformedValue);
    }

    /** Formats the value so that it is an xml encoded string. Returns string if the value is a boolean, number, or string, else null. */
    public formatValue(value: any): string {
        if (typeof value === "boolean") {
            return value.toString().toUpperCase();
        } else if (typeof value === "string" && value) {
            return HtmlEncoding.encodeText(value);
        } else if (typeof value === "number") {
            return value.toString();
        } else {
            return null;
        }
    }
}


import { FieldType } from '../../interfaces/list/FieldType';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import IFieldSchema from '../../interfaces/list/IFieldSchema';
import HtmlEncoding from '@ms/odsp-utilities/lib/encoding/HtmlEncoding';

/** Attribute and child element names here must match the names of the IFieldSchema attributes. */
const FIELD_ATTRIBUTES = ["Type", "Title", "DisplayName", "Description", "FillInChoice", "Required", "EnforceUniqueValues","UserSelectionMode", "UserSelectionScope", "Mult", "Format"];
const FIELD_CHILD_ELEMENTS = ["Choices", "DefaultValue", "DefaultFormula", "Validation"];
const FORMATS = {
    attributeFormat: " {0}='{1}'",
    childElementFormat: "<{0}>{1}</{2}>",
    nameAndAttributesFormat: "{0}{1}"
};
const FORMAT_PROPERTIES = {
    "Field": {
        attributeKeys: FIELD_ATTRIBUTES
    },
    "Type": {
        valueTransformer: (type: FieldType) => FieldType[type]
    },
    "DefaultValue": {
        nameOverride: "Default"
    },
    "Choices": {
        nameOverride: "CHOICES",
        childrenName: "CHOICE"
    },
    "Validation": {
        attributeKeys: ["Message"],
        valueKey: ["Formula"]
    }
};

/**
 * Given a representation of the field schema, assembles the xml that we need to create the field.
 * For more info, see https://msdn.microsoft.com/en-us/library/office/ms437580.aspx
 */
export default class FieldSchemaXmlHelper {
    /**
     * Gets the full field schema xml for field creation.
     * @param {IFieldSchema} fieldSchema The schema for the field.
     */
    public getFieldSchemaXml(fieldSchema: IFieldSchema): string {
        let attributesFieldSchema = {};
        let childElementsFieldSchema = {};
        for (let attribute of FIELD_ATTRIBUTES) {
            if (fieldSchema[attribute] !== void 0 && fieldSchema[attribute] !== null) {
                attributesFieldSchema[attribute] = fieldSchema[attribute];
            }
        }
        for (let childElement of FIELD_CHILD_ELEMENTS) {
            if (fieldSchema[childElement] !== void 0 && fieldSchema[childElement] !== null) {
                childElementsFieldSchema[childElement] =  fieldSchema[childElement];
            }
        }
        let fieldAttributes = this.assembleAttributes("Field", attributesFieldSchema);
        let childElements = this.assembleChildElements(childElementsFieldSchema);
        return this.makeElementSegment("Field", childElements, fieldAttributes, true/**skip format*/);
    }

    /**
     * Assembles child element XML from an object or a list. Specify one or the other, not both.
     * @param {} childElementsObject An object of key value pairs representing child element names and values.
     * @param {[]} childElementsList A list of child elements to assemble.
     * @param {string} parentName Name of the parent element to get childrenName in the format properties. Specify this if passing a list.
     * @returns {string} Formatted xml string of all the child elements. E.g. <CHOICES><CHOICE>Red</CHOICE></CHOICES><Default>Red</Default>.
     */
    public assembleChildElements(childElementsObject?: {}, childElementsList?: any[], parentName?: string): string {
        let childElements = '';
        if (childElementsObject) {
            for (let key in childElementsObject) {
                childElements += this.makeElementSegment(key, childElementsObject[key]);
            }
        } else if (childElementsList) {
            let name = FORMAT_PROPERTIES[parentName] && FORMAT_PROPERTIES[parentName].childrenName;
            for (let child of childElementsList) {
                childElements += this.makeElementSegment(name, child);
            }
        }
        return childElements;
    }

    /**
     * Assembles the attribute XML for an element.
     * @param {string} elementName The name of the element whose attributes are being assembled.
     * @param {} attributesObject An object of key value pairs representing attribute names and values. The keys of this object should
     * match the attributeKeys for the elementName in FORMAT_PROPERTIES, other keys will be ignored.
     * @returns {string} Element name with attribute segments attached. E.g. "Field Title='Test' DisplayName='Test'".
     */
    public assembleAttributes(elementName: string, attributesObject: {}): string {
        let properties = FORMAT_PROPERTIES[elementName];
        let attributes = '';
        let name = this.getName(elementName);
        if (properties.attributeKeys) {
            // Only create attributes that are defined
            let attributeKeys = properties.attributeKeys.filter((key: string) => attributesObject[key] !== void 0);
            for (let attributeKey of attributeKeys) {
                attributes += this.makeAttributeSegment(attributeKey, attributesObject[attributeKey]);
            }
            return StringHelper.format(FORMATS.nameAndAttributesFormat, name, attributes);
        }
        return '';
    }

    /**
     * Assemble an element segment.
     * @param {string} elementName The name of the element.
     * @param {any} value The value of the element.
     * @param {string} elementWithAttributes Optional parameter. An element name with attribute segments attached.
     * @param {boolean} skipFormat Optional parameter. Skips the function which formats the value into an xml string.
     * @returns {string} Formatted element string. E.g. "<CHOICES><CHOICE>Red</CHOICE></CHOICES".
     */
    public makeElementSegment(elementName: string, value: any, elementWithAttributes?: string, skipFormat: boolean = false): string {
        let formattedValue = this.getValue(elementName, value, skipFormat);
        let properties = FORMAT_PROPERTIES[elementName];
        if (formattedValue || elementWithAttributes) {
            let name = this.getName(elementName);
            let nameAndAttributes = elementWithAttributes ? elementWithAttributes : name;
            return StringHelper.format(FORMATS.childElementFormat, nameAndAttributes, formattedValue, name);
        } else if (properties && properties.attributeKeys) {
            let nameAndAttributes = this.assembleAttributes(elementName, value);
            let newValue = properties.valueKey && value[properties.valueKey];
            return this.makeElementSegment(elementName, newValue, nameAndAttributes);
        } else if (properties && properties.childrenName) {
            let newValue = this.assembleChildElements(null, value, elementName);
            return this.makeElementSegment(elementName, newValue, null, true/**skip format*/);
        }
        return '';
    }

    /** Assemble an attribute segment from attribute name and value. Returns formatted attribute string. E.g. " Title='Test'". */
    public makeAttributeSegment(attributeName: string, value: any): string {
        let formattedValue = this.getValue(attributeName, value);
        if (formattedValue) {
            let name = this.getName(attributeName);
            return StringHelper.format(FORMATS.attributeFormat, name, formattedValue);
        }
        return '';
    }

    /** Gets name for the element or attribute */
    public getName(elementOrAttributeName: string): string {
        let properties = FORMAT_PROPERTIES[elementOrAttributeName];
        return properties && properties.nameOverride ? properties.nameOverride : elementOrAttributeName;
    }

    /** Gets formatted and transformed value for the element or attribute. */
    public getValue(elementOrAttributeName: string, value: any, skipFormat: boolean = false): string {
        let properties = FORMAT_PROPERTIES[elementOrAttributeName];
        let transformedValue = properties && properties.valueTransformer ? properties.valueTransformer(value) : value;
        return skipFormat ? transformedValue : this.formatValue(transformedValue);
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


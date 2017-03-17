import { FieldType } from './interfaces/IField';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import ICreateFieldOptions from './interfaces/ICreateFieldOptions';
import HtmlEncoding from '@ms/odsp-utilities/lib/encoding/HtmlEncoding';

/** Xml attribute names here should match the names of the ICreateFieldOptions attributes. Otherwise,
 * the connection between the attribute here and the option must be made explictly in getFieldXml.
 */
const FIELD_XML_ATTRIBUTES = {
    'start': "<Field",
    'type': " Type='{0}'",
    'displayName': " Title='{0}' DisplayName='{0}'",
    'description': " Description='{0}'",
    'fillInChoice': " FillInChoice='{0}'",
    'required': " Required='{0}'",
    'enforceUniqueValues': " EnforceUniqueValues='{0}'",
    'userSelectionMode': " UserSelectionMode='{0}'",
    'userSelectionScope': " UserSelectionScope='{0}'",
    'mult': " Mult='{0}'",
    'format': " Format='{0}'",
    'end': ">"
};

const FIELD_XML_CHILD_ATTRIBUTES = {
    'choices': "<CHOICES>",
    'choicesEnd': "</CHOICES>",
    'choice': "<CHOICE>{0}</CHOICE>",
    'defaultValue': "<Default>{0}</Default>",
    'validation': "<Validation Message='{0}'>{1}</Validation>",
    'validationFormula': "<Validation>{0}</Validation>",
    'validationMessage': "<Validation Message='{0}'></Validation>",
    'end': "</Field>"
};

/**
 * Given a field type, returns the xml that we need to create the field.
 * For more info, see https://msdn.microsoft.com/en-us/library/office/ms437580.aspx
 */
export function getFieldXml(options: ICreateFieldOptions): string {
    let xmlParts = [FIELD_XML_ATTRIBUTES.start];
    for (let key in options) {
        if (!FIELD_XML_ATTRIBUTES[key]) {
            continue;
        }
        if (key === 'type') {
            xmlParts.push(StringHelper.format(FIELD_XML_ATTRIBUTES['type'], FieldType[options.type]));
        } else if (typeof options[key] === 'boolean') {
            xmlParts.push(StringHelper.format(FIELD_XML_ATTRIBUTES[key], options[key].toString().toUpperCase()));
        } else if (typeof options[key] === 'string' && options[key]) {
            xmlParts.push(StringHelper.format(FIELD_XML_ATTRIBUTES[key], HtmlEncoding.encodeText(options[key])));
        } else if (typeof options[key] === 'number') {
            xmlParts.push(StringHelper.format(FIELD_XML_ATTRIBUTES[key], options[key].toString()));
        }
    }
    xmlParts.push(FIELD_XML_ATTRIBUTES.end);

    for (let key in options) {
        if (!FIELD_XML_CHILD_ATTRIBUTES[key]) {
            continue;
        }
        if (key === 'choices') {
            xmlParts.push(FIELD_XML_CHILD_ATTRIBUTES.choices);
            for (let choice of options.choices) {
                xmlParts.push(StringHelper.format(FIELD_XML_CHILD_ATTRIBUTES.choice, HtmlEncoding.encodeText(choice)));
            }
            xmlParts.push(FIELD_XML_CHILD_ATTRIBUTES.choicesEnd);
        } else if (key === 'validation') {
            let formula = HtmlEncoding.encodeText(options[key].formula);
            let message = HtmlEncoding.encodeText(options[key].message);
            if (formula && message) {
                xmlParts.push(StringHelper.format(FIELD_XML_CHILD_ATTRIBUTES.validation, message, formula));
            } else if (formula) {
                xmlParts.push(StringHelper.format(FIELD_XML_CHILD_ATTRIBUTES.validationFormula, formula));
            } else if (message) {
                xmlParts.push(StringHelper.format(FIELD_XML_CHILD_ATTRIBUTES.validationMessage, message));
            }
        } else if (options[key]) {
            xmlParts.push(StringHelper.format(FIELD_XML_CHILD_ATTRIBUTES[key], HtmlEncoding.encodeText(options[key])));
        }
    }
    xmlParts.push(FIELD_XML_CHILD_ATTRIBUTES.end);

    let finishedXml = xmlParts.join('');
    return finishedXml;
}
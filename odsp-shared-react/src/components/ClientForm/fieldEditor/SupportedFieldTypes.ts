import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';

const supportedReactFieldEditorTypes: string[] = [
    'text',
    'boolean',
    'number',
    'user',
    'url',
    'attachments',
    'choice',
    'note'
];

function logUnsupportedFieldType(fieldType: string): void {
    Engagement.logData({
        name: "ReactClientForm.Fallback",
        extraData: {
            UnsupportedFieldType: fieldType
        }
    });
}

/**
 * Given a ClientForm object, return 'true' if all field types have React client editor functionality
 * available.  Otherwise, return 'false'.
 */
export function supportReactClientForm(clientForm: any): boolean {
    let fields = clientForm && clientForm.fields || null;
    if (fields === null || fields === undefined || !Array.isArray(fields)) {
        // be conservative using the new ReactClientForm
        // when in doubt, fall back to KO ClientForm
        return false;
    }

    for (let idx = 0; idx < fields.length; idx++) {
        let field = fields[idx];
        if (field === undefined || field === null) {
            // be conservative using the new ReactClientForm
            // when in doubt, fall back to KO ClientForm
            return false;
        }
        let fieldType: string = field && field.schema && field.schema.FieldType || '';
        if (supportedReactFieldEditorTypes.indexOf(fieldType.toLowerCase()) < 0) {
            // this field type doesn't have React field editor yet
            logUnsupportedFieldType(fieldType);
            return false;
        }
        if (fieldType === 'Choice') {
            let fillInChoice: boolean = field && field.schema && field.schema.FillInChoice;
            if (fillInChoice) {
                logUnsupportedFieldType(fieldType);
                return false;
            }
        }
    }

    return true;
}
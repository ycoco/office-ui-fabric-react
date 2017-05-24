// external packages
import * as React from 'react';
import { IClientFormField } from '@ms/odsp-datasources/lib/models/clientForm/IClientForm';
import {
    ISPListItem,
} from '@ms/odsp-datasources/lib/SPListItemProcessor';

// local packages
import { PlaceHolderFieldEditor } from './PlaceHolderFieldEditor';
import { TextFieldEditor } from './TextFieldEditor';

export class ReactFieldEditorFactory {
    public static getFieldEditor(
        item: ISPListItem,
        clientFormField: IClientFormField,
        onSave: (field: IClientFormField) => string): JSX.Element {

        if (clientFormField.schema.FieldType === 'Text') {
            return (
                <TextFieldEditor
                    item={ item }
                    field={ clientFormField }
                    onSave={ onSave } />
            );
        }
        return (
            <PlaceHolderFieldEditor
                item={ item }
                field={ clientFormField }
                onSave={ onSave } />
        );
    }
}

export default ReactFieldEditorFactory;

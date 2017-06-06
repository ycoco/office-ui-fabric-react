// external packages
import * as React from 'react';
import { IClientFormField } from '@ms/odsp-datasources/lib/models/clientForm/IClientForm';
import {
    ISPListItem,
} from '@ms/odsp-datasources/lib/SPListItemProcessor';

// local packages
import { PlaceHolderFieldEditor } from './PlaceHolderFieldEditor';
import { TextFieldEditor } from './TextFieldEditor';
import { BooleanFieldEditor } from './booleanEditor/BooleanFieldEditor';

export class ReactFieldEditorFactory {
    public static getFieldEditor(
        item: ISPListItem,
        clientFormField: IClientFormField,
        onSave: (field: IClientFormField) => string): JSX.Element {
            
        if (clientFormField.schema.FieldType === 'Text') {
            return (
                <TextFieldEditor
                    key={clientFormField.schema.Id}
                    item={ item }
                    field={ clientFormField }
                    onSave={ onSave } />
            );
        }
        else if (clientFormField.schema.FieldType === 'Boolean') {
            return (
                <BooleanFieldEditor
                    key={clientFormField.schema.Id}
                    item={ item }
                    field={ clientFormField }
                    onSave={ onSave }
                />
            );
        }
        return (
            <PlaceHolderFieldEditor
                key={clientFormField.schema.Id}
                item={ item }
                field={ clientFormField }
                onSave={ onSave } />
        );
    }
}

export default ReactFieldEditorFactory;

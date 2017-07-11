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
import { NumberFieldEditor } from './numberEditor/NumberFieldEditor';
import { PeopleEditor } from './peopleEditor/PeopleEditor';
import { PictureFieldEditor } from './pictureEditor/PictureFieldEditor';

export class ReactFieldEditorFactory {
    public static getFieldEditor(
        item: ISPListItem,
        clientFormField: IClientFormField,
        interactiveSave: boolean,
        shouldGetFocus: boolean,
        onSave: (field: IClientFormField) => void): JSX.Element {

        if (clientFormField.schema.FieldType === 'Text') {
            return (
                <TextFieldEditor
                    key={ clientFormField.schema.Id }
                    item={ item }
                    field={ clientFormField }
                    interactiveSave={ interactiveSave }
                    shouldGetFocus={ shouldGetFocus }
                    onSave={ onSave } />
            );
        }
        else if (clientFormField.schema.FieldType === 'Boolean') {
            return (
                <BooleanFieldEditor
                    key={ clientFormField.schema.Id }
                    item={ item }
                    field={ clientFormField }
                    interactiveSave={ interactiveSave }
                    shouldGetFocus={ shouldGetFocus }
                    onSave={ onSave }
                />
            );
        }
        else if (clientFormField.schema.FieldType === 'Number') {
            return (
                <NumberFieldEditor
                    key={ clientFormField.schema.Id }
                    item={ item }
                    field={ clientFormField }
                    interactiveSave={ interactiveSave }
                    shouldGetFocus={ shouldGetFocus }
                    onSave={ onSave }
                />
            );
        }
        else if (clientFormField.schema.FieldType === 'User') {
            return (
                <PeopleEditor
                    key={ clientFormField.schema.Id }
                    item={ item }
                    field={ clientFormField }
                    interactiveSave={ interactiveSave }
                    shouldGetFocus={ shouldGetFocus }
                    onSave={ onSave }
                />
            );
        }
        else if (clientFormField.schema.FieldType === 'URL') {
            return (
                <PictureFieldEditor
                    key={ clientFormField.schema.Id }
                    item={ item }
                    field={ clientFormField }
                    interactiveSave={ interactiveSave }
                    shouldGetFocus={ shouldGetFocus }
                    onSave={ onSave }
                />
            );
        }
        return (
            <PlaceHolderFieldEditor
                key={ clientFormField.schema.Id }
                item={ item }
                field={ clientFormField }
                interactiveSave={ interactiveSave }
                shouldGetFocus={ shouldGetFocus }
                onSave={ onSave } />
        );
    }
}

export default ReactFieldEditorFactory;

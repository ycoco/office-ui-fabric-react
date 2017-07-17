// external packages
import * as React from 'react';
import { IClientFormField } from '@ms/odsp-datasources/lib/models/clientForm/IClientForm';
import {
    ISPListItem,
} from '@ms/odsp-datasources/lib/SPListItemProcessor';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';

// local packages
import { PlaceHolderFieldEditor } from './PlaceHolderFieldEditor';
import { TextFieldEditor } from './TextFieldEditor';
import { BooleanFieldEditor } from './booleanEditor/BooleanFieldEditor';
import { NumberFieldEditor } from './numberEditor/NumberFieldEditor';
import { PeopleEditor } from './peopleEditor/PeopleEditor';
import { PictureFieldEditor } from './pictureEditor/PictureFieldEditor';
import { SingleChoiceEditor } from './singleChoiceEditor/SingleChoiceEditor';

export class ReactFieldEditorFactory {
    public static getFieldEditor(
        item: ISPListItem,
        clientFormField: IClientFormField,
        interactiveSave: boolean,
        shouldGetFocus: boolean,
        onSave: (field: IClientFormField) => void,
        pageContext?: ISpPageContext): JSX.Element {

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
        else if (clientFormField.schema.FieldType === 'User' || clientFormField.schema.FieldType === 'UserMulti') {
            return (
                <PeopleEditor
                    key={ clientFormField.schema.Id }
                    item={ item }
                    field={ clientFormField }
                    interactiveSave={ interactiveSave }
                    shouldGetFocus={ shouldGetFocus }
                    onSave={ onSave }
                    pageContext={ pageContext }
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
        else if (clientFormField.schema.FieldType === 'Choice' && !clientFormField.schema.FillInChoice) {
            return (
                <SingleChoiceEditor
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

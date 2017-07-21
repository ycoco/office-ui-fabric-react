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
import { NoteFieldEditor } from './noteEditor/NoteFieldEditor';

export class ReactFieldEditorFactory {
    public static getFieldEditor(
        item: ISPListItem,
        clientFormField: IClientFormField,
        interactiveSave: boolean,
        shouldGetFocus: boolean,
        onSave: (field: IClientFormField) => void,
        pageContext?: ISpPageContext,
        getRichTextEditorIframeUrl?: (fieldName: string) => string
        ): JSX.Element {

        let fieldType: string = clientFormField.schema.FieldType.toLowerCase();
        if (fieldType === 'text') {
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
        else if (fieldType === 'boolean') {
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
        else if (fieldType === 'number') {
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
        else if (clientFormField.schema.FieldType === 'user' || clientFormField.schema.FieldType === 'usermulti') {
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
        else if (fieldType === 'url') {
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
        else if (fieldType === 'choice' && !clientFormField.schema.FillInChoice) {
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
        } else if (fieldType === 'note') {
            let alternativeEditorUrl: string = '';
            if (clientFormField.schema.RichText && getRichTextEditorIframeUrl) {
                alternativeEditorUrl = getRichTextEditorIframeUrl(clientFormField.schema.Name);
            }
            return (
                <NoteFieldEditor
                    key={ clientFormField.schema.Id }
                    item={ item }
                    field={ clientFormField }
                    interactiveSave={ interactiveSave }
                    shouldGetFocus={ shouldGetFocus }
                    onSave={ onSave }
                    alternativeEditorUrl={ alternativeEditorUrl }
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

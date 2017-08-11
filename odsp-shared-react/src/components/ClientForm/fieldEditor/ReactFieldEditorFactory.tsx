// external packages
import * as React from 'react';
import { IClientFormField } from '@ms/odsp-datasources/lib/models/clientForm/IClientForm';
import {
    ISPListItem,
} from '@ms/odsp-datasources/lib/SPListItemProcessor';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';

// local packages
import { PlaceHolderFieldEditor } from './placeHolderEditor/PlaceHolderFieldEditor';
import { TextFieldEditor } from './textEditor/TextFieldEditor';
import { BooleanFieldEditor } from './booleanEditor/BooleanFieldEditor';
import { NumberFieldEditor } from './numberEditor/NumberFieldEditor';
import { PeopleEditor } from './peopleEditor/PeopleEditor';
import { PictureFieldEditor } from './pictureEditor/PictureFieldEditor';
import { SingleChoiceEditor } from './choiceEditors/SingleChoiceEditor';
import { MultiChoiceEditor } from './choiceEditors/MultiChoiceEditor';
import { SingleChoiceEditorWithFillIn } from './choiceEditors/SingleChoiceEditorWithFillIn';
import { NoteFieldEditor } from './noteEditor/NoteFieldEditor';
import { DateTimeFieldEditor } from './dateTimeEditor/DateTimeFieldEditor';

export class ReactFieldEditorFactory {
    public static getFieldEditor(
        item: ISPListItem,
        clientFormField: IClientFormField,
        interactiveSave: boolean,
        shouldGetFocus: boolean,
        onSave: (field: IClientFormField) => void,
        pageContext?: ISpPageContext,
        getFieldFilterData?: (fieldName: string) => Promise<string>,
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
        else if (fieldType === 'user' || fieldType === 'usermulti') {
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
        else if (fieldType === 'choice') {
            if (!clientFormField.schema.FillInChoice) {
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
            } else {
                return (
                    <SingleChoiceEditorWithFillIn
                        key={ clientFormField.schema.Id }
                        item={ item }
                        field={ clientFormField }
                        interactiveSave={ interactiveSave }
                        shouldGetFocus={ shouldGetFocus }
                        onSave={ onSave }
                        getFieldFilterData={ getFieldFilterData }
                    />
                );
            }
        } else if (fieldType === 'multichoice') {
            if (!clientFormField.schema.FillInChoice) {
                return (
                    <MultiChoiceEditor
                        key={ clientFormField.schema.Id }
                        item={ item }
                        field={ clientFormField }
                        interactiveSave={ interactiveSave }
                        shouldGetFocus={ shouldGetFocus }
                        onSave={ onSave }
                    />
                );
            }
        }
        else if (fieldType === 'note') {
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
        } else if (fieldType === 'datetime') {
            return (
                <DateTimeFieldEditor
                    key={ clientFormField.schema.Id }
                    item={ item }
                    field={ clientFormField }
                    interactiveSave={ interactiveSave }
                    shouldGetFocus={ shouldGetFocus }
                    pageContext={ pageContext }
                    onSave={ onSave }
                />
            );
        } else {
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
}

export default ReactFieldEditorFactory;

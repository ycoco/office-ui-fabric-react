// local packages
import { IReactFieldEditor } from './IReactFieldEditor';
import { BaseReactFieldEditor, IBaseReactFieldEditorProps } from './BaseReactFieldEditor';

export class PlaceHolderFieldEditor extends BaseReactFieldEditor implements IReactFieldEditor {
    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);
    }
}

export default PlaceHolderFieldEditor;

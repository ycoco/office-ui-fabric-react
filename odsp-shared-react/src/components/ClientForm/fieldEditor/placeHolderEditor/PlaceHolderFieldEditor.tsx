// local packages
import { IReactFieldEditor } from '../IReactFieldEditor';
import {
    BaseReactFieldEditor,
    IBaseReactFieldEditorProps,
    IBaseReactFieldEditorState
} from '../baseEditor/BaseReactFieldEditor';

export class PlaceHolderFieldEditor extends BaseReactFieldEditor<IBaseReactFieldEditorProps, IBaseReactFieldEditorState> implements IReactFieldEditor {
    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);
    }

    protected _endEdit(ev: any): void {
        let newData = '';
        this._onSave(newData);
    }

    protected _focusOnEditorIfNeeded(): void {
        return;
    }
}

export default PlaceHolderFieldEditor;

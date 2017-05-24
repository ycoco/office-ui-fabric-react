/**
 * Modes of the field editor
 */
export enum ReactFieldEditorMode {
    View,
    Edit
}

export interface IReactFieldEditor {
    /**
     * Set the mode of the field editor
     */
    setMode: (newMode: ReactFieldEditorMode) => void;
}

export default IReactFieldEditor;

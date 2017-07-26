export interface IField {
    id: string;
    internalName: string;
    isHidden: boolean;
    isRequired: boolean;
    staticName?: string;
    title: string;
}

export default IField;
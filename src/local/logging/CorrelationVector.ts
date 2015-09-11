import Guid from '../guid/Guid';

export default class CorrelationVector {
    public static RootVector: CorrelationVector = window['rootVector'] || new CorrelationVector();

    public root: string;
    public parent: string;
    public current: string;

    constructor(
        parent?: {
            root: string,
            current: string
        },
        current?: string) {

        if (parent) {
            this.root = parent.root;
            this.parent = parent.current;
        } else {
            this.root = this.parent = Guid.Empty;
        }

        if (current) {
            this.current = current;
        } else {
            this.current = Guid.generate();
        }
    }

    public toString() {
        return `${this.root}#${this.parent}#${this.current}`;
    }
}
// OneDrive:IgnoreCodeCoverage

import ISize from './ISize';

class Size implements ISize {
    width: number = 0;
    height: number = 0;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}

export default Size;
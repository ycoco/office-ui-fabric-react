// OneDrive:IgnoreCodeCoverage

import ISize = require('../../base/ISize');
import Transform = require('odsp-utilities/math/Transform');
import Point = require('odsp-utilities/math/Point');

export type AlignmentInput = string | AlignmentType | IAlignment;

export enum AlignmentType {
    cover,
    center,
    fit,
    fitWidth,
    fitHeight,
    top
}

export interface IAlignment {
    name: string;
    getTransform(content: ISize, bounds: ISize): Transform;
}

class Alignment implements IAlignment {
    public name: string;
    public getTransform: (content: ISize, bounds: ISize) => Transform;

    constructor(name: string, getTransform: (content: ISize, bounds: ISize) => Transform) {
        this.name = name;
        this.getTransform = getTransform;
    }
}

function createPipe(...alignments: IAlignment[]): IAlignment {
    'use strict';

    return new Alignment(alignments.map((filter: IAlignment) => filter.name).join('-'), (content: ISize, bounds: ISize) => {
        let transform = Transform.IDENTITY;

        for (let alignment of alignments) {
            let adjustedContent = {
                width: content.width * transform.scale,
                height: content.height * transform.scale
            };

            transform = alignment.getTransform(adjustedContent, bounds).multiply(transform);
        }

        return transform;
    });
}

export const center: IAlignment = new Alignment(AlignmentType[AlignmentType.center], (content: ISize, bounds: ISize) => {
    let translate = new Point(
        (bounds.width - content.width) / 2,
        (bounds.height - content.height) / 2);

    return new Transform(translate);
});

export const top: IAlignment = new Alignment(AlignmentType[AlignmentType.top], (content: ISize, bounds: ISize) => {
    let translate = new Point(
        (bounds.width - content.width) / 2,
        0);

    return new Transform(translate);
});

export const fitWidth: IAlignment = new Alignment(AlignmentType[AlignmentType.fitWidth], (content: ISize, bounds: ISize) => {
    let scale = bounds.width / content.width;

    return new Transform(Point.ORIGIN, Math.min(scale, 1));
});

export const fitHeight: IAlignment = new Alignment(AlignmentType[AlignmentType.fitHeight], (content: ISize, bounds: ISize) => {
    let scale = bounds.height / content.height;

    return new Transform(Point.ORIGIN, Math.min(scale, 1));
});

export const fit: IAlignment = new Alignment(AlignmentType[AlignmentType.top], (content: ISize, bounds: ISize) => {
    let contentAspectRatio = content.width / content.height;
    let boundsAspectRatio = bounds.width / bounds.height;

    let fitAlignment: IAlignment;

    if (contentAspectRatio > boundsAspectRatio) {
        fitAlignment = fitWidth;
    } else {
        fitAlignment = fitHeight;
    }

    return fitAlignment.getTransform(content, bounds);
});

export const cover: IAlignment = new Alignment(AlignmentType[AlignmentType.cover], (content: ISize, bounds: ISize) => {
    let contentAspectRatio = content.width / content.height;
    let boundsAspectRatio = bounds.width / bounds.height;

    let fitAlignment: IAlignment;

    if (contentAspectRatio > boundsAspectRatio) {
        fitAlignment = fitHeight;
    } else {
        fitAlignment = fitWidth;
    }

    return fitAlignment.getTransform(content, bounds);
});

export const fitCenter: IAlignment = createPipe(fit, center);

export const coverCenter: IAlignment = createPipe(cover, center);

export function getAlignment(input: AlignmentInput) {
    'use strict';

    if (typeof input === 'string') {
        input = AlignmentType[<string>input];
    } else if (typeof input === 'object') {
        return <IAlignment>input;
    }

    switch (<AlignmentType>input) {
        case AlignmentType.top:
            return top;
        case AlignmentType.fitHeight:
            return fitHeight;
        case AlignmentType.fitWidth:
            return fitWidth;
        case AlignmentType.fit:
            return fitCenter;
        case AlignmentType.center:
            return center;
        default:
            return coverCenter;
    }
}

export function createAlignment(inputOrInputs: AlignmentInput | AlignmentInput[]) {
    'use strict';

    if (inputOrInputs instanceof Array) {
        return createPipe(...inputOrInputs.map(getAlignment));
    } else {
        return createPipe(...[inputOrInputs].map(getAlignment));
    }
}


import ISize = require('odsp-shared/base/ISize');
import Transform from 'odsp-utilities/math/Transform';
import Point from 'odsp-utilities/math/Point';

/**
 * The set of possible inputs for choosing an alignment.
 * A string value must map to the name of an {AlignmentType} value.
 */
export type AlignmentInput = string | AlignmentType | IAlignment;

/**
 * The possible default alignments available in this module.
 */
export enum AlignmentType {
    cover,
    center,
    fit,
    fitWidth,
    fitHeight,
    top
}

/**
 * An alignment which may be applied to content to be positioned within bounds.
 */
export interface IAlignment {
    /**
     * The canonical name of the alignment.
     * For composed alignments, this consists of the names of the piped alignments,
     * in order, joined with a '-'.
     * @example
     *  Alignments.cover.name -> 'cover'
     *  Alignments.fit.name -> 'fit'
     *  Alignments.coverCenter.name -> 'cover-center'
     *  Alignments.fitCenter.name -> 'fit-center'
     */
    name: string;
    getTransform(content: ISize, bounds: ISize): Transform;
}

/**
 * Base implementation of {IAlignment} which binds a transform function with a name.
 */
class Alignment implements IAlignment {
    public name: string;
    public getTransform: (content: ISize, bounds: ISize) => Transform;

    constructor(name: string, getTransform: (content: ISize, bounds: ISize) => Transform) {
        this.name = name;
        this.getTransform = getTransform;
    }
}

/**
 * Creates a composed alignment by piping the transform from one alignment into the next.
 */
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

/**
 * Determines whether or not the given input is a complete alignment instance.
 */
function isAlignment(input: AlignmentInput): input is IAlignment {
    'use strict';

    return typeof input === 'object';
}

/**
 * An alignment which purely centers content within its bounds, no scaling.
 */
export const center: IAlignment = new Alignment(AlignmentType[AlignmentType.center], (content: ISize, bounds: ISize) => {
    let translate = new Point(
        (bounds.width - content.width) / 2,
        (bounds.height - content.height) / 2);

    return new Transform(translate);
});

/**
 * An alignment which aligns the top of the content with the top of the bounds, no scaling.
 */
export const top: IAlignment = new Alignment(AlignmentType[AlignmentType.top], (content: ISize, bounds: ISize) => {
    let translate = new Point(
        (bounds.width - content.width) / 2,
        0);

    return new Transform(translate);
});

/**
 * An alignment which scales the width of content to match the width of the bounds.
 */
export const fitWidth: IAlignment = new Alignment(AlignmentType[AlignmentType.fitWidth], (content: ISize, bounds: ISize) => {
    let scale = bounds.width / content.width;

    return new Transform(Point.ORIGIN, Math.min(scale, 1));
});

/**
 * An alignment which scales the height of content to match the height of the bounds.
 */
export const fitHeight: IAlignment = new Alignment(AlignmentType[AlignmentType.fitHeight], (content: ISize, bounds: ISize) => {
    let scale = bounds.height / content.height;

    return new Transform(Point.ORIGIN, Math.min(scale, 1));
});

/**
 * An alignment which scales the width or height of content to match the bounds, whichever is greater.
 */
export const fit: IAlignment = new Alignment(AlignmentType[AlignmentType.fit], (content: ISize, bounds: ISize) => {
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

/**
 * An alignment which scales the width or height of content to match the bounds, whichever is lesser.
 */
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

/**
 * An alignment which fits the content to scale, then centers it.
 */
export const fitCenter: IAlignment = createPipe(fit, center);

/**
 * An alignment which covers the content to scale, then centers it.
 */
export const coverCenter: IAlignment = createPipe(cover, center);

/**
 * Gets an existing alignment given either an alignment name or instance.
 * @example
 *  let alignment = Alignments.getAlignment('cover')
 *  // alignment.name -> 'cover-center'
 * @example
 *  let alignment = Alignments.getAlignment(AlignmentType.cover)
 *  // alignment.name -> 'cover-center';
 */
export function getAlignment(input: AlignmentInput): IAlignment {
    'use strict';

    let alignmentType: AlignmentType;

    if (typeof input === 'string') {
        alignmentType = AlignmentType[input];
    } else if (isAlignment(input)) {
        return input;
    } else {
        alignmentType = input;
    }

    let alignment: IAlignment;

    switch (alignmentType) {
        case AlignmentType.top:
            alignment = top;
            break;
        case AlignmentType.fitHeight:
            alignment = fitHeight;
            break;
        case AlignmentType.fitWidth:
            alignment = fitWidth;
            break;
        case AlignmentType.fit:
            alignment = fitCenter;
            break;
        case AlignmentType.center:
            alignment = center;
            break;
        default:
            alignment = coverCenter;
            break;
    }

    return alignment;
}

/**
 * Creates a composed alignment given series of alignment inputs, piping each to the next.
 */
export function createAlignment(inputOrInputs: AlignmentInput | AlignmentInput[]) {
    'use strict';

    let inputs: AlignmentInput[];

    if (inputOrInputs instanceof Array) {
        inputs = inputOrInputs;
    } else {
        inputs = [<AlignmentInput>inputOrInputs];
    }

    return createPipe(...inputs.map(getAlignment));
}


import ISize = require('./ISize');
import Rotation = require('./Rotation');
import * as Alignments from '../models/image/Alignments';

interface IImage extends ISize {
    /**
     * A URL or pattern for the image source.
     * {0} and {1} will be replaced with the desired pixel width and height, respectively.
     */
    url: string;

    /**
     * Rotation to apply on top of the image.
     */
    rotation?: Rotation;

    /**
     * A flag informing if the image needs to be fit to the given size.
     * When set to true the image will be clipped to render with the desired size.
     */
    fitToSize?: boolean;

    /**
     * Gets a version of the image corresponding with the given desired size and alignment.
     * Produces an output that has no wildcards in the URL, and which may have a different final size.
     */
    getAligned?: (desiredSize: ISize, alignment: Alignments.IAlignment) => IImage;
}

export = IImage;

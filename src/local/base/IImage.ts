
import ISize = require('./ISize');
import Rotation = require('./Rotation');

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
}

export = IImage;

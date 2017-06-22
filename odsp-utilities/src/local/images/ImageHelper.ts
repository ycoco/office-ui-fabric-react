// OneDrive:IgnoreCodeCoverage

import EventGroup from '../events/EventGroup';
import Promise from '../async/Promise';

export function createImageThumbnail(imageBlob: Blob, maxWidth: number, maxHeight: number): Promise<Blob> {
    return readBlobAsDataUrl(imageBlob).then((sourceImageDataUrl: string) => {
        // create an <img> element from source image file to get dimensions
        const imageElement = document.createElement('img');
        imageElement.src = sourceImageDataUrl;

        let width = imageElement.width;
        let height = imageElement.height;

        // compute thumbnail dimensions by scaling along its largest axis and maintaining
        // the source image's aspect ratio
        if (width > height) {
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }
        }

        width = Math.floor(width);
        height = Math.floor(height);

        if (width === imageElement.width && height === imageElement.height) {
            // nothing to do, bail out early
            return imageBlob;
        }

        // render image at new dimensions into <canvas>
        const canvasElement = document.createElement('canvas');
        canvasElement.width = width;
        canvasElement.height = height;

        const canvasContext = canvasElement.getContext('2d');
        canvasContext.drawImage(imageElement, 0 /*dstX*/, 0 /*dstY*/, width, height);

        // would be nice to use canvas.toBlob() but appears to be too bleeding edge for now so need to render out
        // to a data URL and then manually convert to a Blob by converting the base64 encoding to a byte array

        // render canvas into an image data URL with a matching MIME type
        // explicitly pass encoder quality for JPEGs to ensure consistency across browsers (Chrome and Firefox
        // both default to a 0.92 encoder quality so go with that)
        const dataUrl =
            (imageBlob.type === 'image/jpeg') ?
            canvasElement.toDataURL(imageBlob.type, 0.92) :
            canvasElement.toDataURL(imageBlob.type);

        // convert data URL to a Blob
        return getBlobFromDataUrl(dataUrl);
    });
}

function getBlobFromDataUrl(dataUrl: string): Blob {
    // data:[<MIME-type>][;charset=<encoding>][;base64],<data>
    // parse out <data> and <MIME-type> segments
    const byteString = atob(dataUrl.split(',')[1]);
    const byteArray = new Uint8Array(byteString.length);
    const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];

    // copy bytes from decoded base64 string into byte array
    for (let i = 0, len = byteString.length; i < len; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([byteArray], { type: mimeType });
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
    const events = new EventGroup(this);

    return new Promise((complete: (dataUrl: string) => void, error: (err?: any) => void) => {
        const fileReader = new FileReader();

        events.on(fileReader, 'load', (ev: Event) => {
            complete(fileReader.result);
            events.dispose();
        });

        events.on(fileReader, 'error', (ev: Event) => {
            error(fileReader.error); // DOMError
            events.dispose();
        });

        fileReader.readAsDataURL(blob);
    });
}
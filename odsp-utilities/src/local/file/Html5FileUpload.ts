// OneDrive:IgnoreCodeCoverage

import * as IconSelector from '../icons/IconSelector';
import PlatformDetection from '../browser/PlatformDetection';
import { INativeHtml5File } from './INativeHtml5File';
import * as Path from '../path/Path';

let idSeed = 0;

export interface IHtml5FileUploadParams {
    file: INativeHtml5File;
}

export interface IHtml5FileUploadDependencies {
    platformDetection: PlatformDetection;
}

export class Html5FileUpload {
    public name: string;
    public extension: string;
    public iconName: string;
    public size: number;
    public eTag: string;
    public lastModifiedDate: Date;

    private _file: INativeHtml5File;

    constructor(params: IHtml5FileUploadParams, dependencies: IHtml5FileUploadDependencies) {
        const {
            file
        } = params;

        this._file = file;
        this.eTag = file.eTag;

        const fileName = file.fileName || file.name;

        const {
            name: nameWithoutExtension,
            extension
        } = Path.splitFileName(fileName);

        this.extension = extension;
        this.iconName = IconSelector.getIconNameFromExtension(extension);

        this.size = file.size;

        let name: string;

        // when upload images from ios camera roll,
        // all the images are named 'image.jpg'.
        // This part is trying to give unique name for the image.
        if (dependencies.platformDetection.isIOS && nameWithoutExtension === 'image' && this.iconName === 'photo') {
            const {
                lastModifiedDate: lastModified = new Date()
            } = file;

            name = `IMG_${this._getLastModifiedISO8601(lastModified)}_${++idSeed}${extension}`;
        } else {
            name = fileName;
        }

        if (file.lastModifiedDate) {
            this.lastModifiedDate = file.lastModifiedDate;
        }

        this.name = name;
    }

    public slice(startByte: number, endByte: number): Blob {
        const file = this._file;

        const slice = file.slice || file.mozSlice || file.webkitSlice;

        return slice.call(file, startByte, endByte);
    }

    private _getLastModifiedISO8601(date: Date) {
        return `${
            date.getUTCFullYear()
        }:${
            leftPad(date.getUTCMonth() + 1, 2)
        }:${
            leftPad(date.getUTCDate(), 2)
        } ${
            leftPad(date.getUTCHours(), 2)
        }:${
            leftPad(date.getUTCMinutes(), 2)
        }:${
            leftPad(date.getSeconds(), 2)
        }`;
    }
}

function leftPad(value: number, length: number) {
    let result = `${value}`;

    while (result.length < length) {
        result = `0${result}`;
    }

    return result;
}

export default Html5FileUpload;

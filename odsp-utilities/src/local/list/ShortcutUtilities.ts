import Features, { IFeature } from '../features/Features';

const ShortcutLink: IFeature = { ODB: 563, ODC: null, Fallback: false };

module ShortcutUtilities {
    'use strict';

    /**
     * Returns true if item is a Shortcut item, and false otherwise.
     * Checks the file extension for .url and .website
     */
    export function isShortcutItem(item: { key: string, extension?: string }) {
        if (!item || !item.extension) {
            return false;
        }

        let fileType: string;

        if (item.extension[0] !== '.') {
            // Technically, extension should always start with a '.' but that's not actually the case
            fileType = item.extension;
        } else {
            fileType = item.extension.slice(1);
        }

        return isShortcutFileType(fileType);
    }

    /**
     * Identifies whether or not a given file type should be treated as a shortcut item.
     * Note that while a file extension has a preceding '.' character, a file type does not.
     */
    export function isShortcutFileType(fileType: string) {
        // note: lnk files are not supported in odb's SP shortcuts API, we should not treat .lnk files as shortcut files.
        return fileType === 'url' || fileType === 'website';
    }

    export function isShortcutEnabled(): boolean {
        return Features.isFeatureEnabled(ShortcutLink);
    }

    export enum ShortcutErrors {
        /** Generic unknown error */
        UnknownError,
        /** File already exists (error during new file creation). */
        NewFileCreationFileAlreadyExistsError,
        /** Filename contains an invalid character, such as # % * : < > ? / | */
        InvalidCharacterError
    }
}

export default ShortcutUtilities;

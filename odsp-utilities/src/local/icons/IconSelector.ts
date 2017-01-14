import IconMap from './FileTypeIconMap';
import ItemType from './ItemType';
import * as SharingTypeHelper from '../list/SharingTypeHelper';

const GENERIC_FILE = 'genericfile';
const CODE_FILE = 'code';
const ONENOTE_FILE = 'one';
const FOLDER = 'folder';
const SHARED_FOLDER = 'sharedfolder';
const DOCSET_FOLDER = 'docset';
const VIDEO_FILE = 'video';
const PHOTO_FILE = 'photo';
const LIST_ITEM = 'listitem';

let _extensionToIconName: { [key: string]: string };

export const genericFile = GENERIC_FILE;
export const codeFile = CODE_FILE;
export const videoFile = VIDEO_FILE;
export const photoFile = PHOTO_FILE;

export function getIconNameFromItem(item: { type?: ItemType, extension?: string, sharingType?: any, isDocSet?: boolean, listItem?: any, textEditorMimeType?: string}): string {
    let iconName = '';
    if (item.type === ItemType.Folder) {
        iconName = SharingTypeHelper.usePrivateFolderIcon(item.sharingType) ? FOLDER : SHARED_FOLDER;
        if (item.isDocSet) {
            iconName = DOCSET_FOLDER;
        }
    } else if (item.type === ItemType.OneNote) {
        iconName = ONENOTE_FILE;
    } else if (item.listItem) {
        iconName = LIST_ITEM;
    } else if (item.textEditorMimeType === 'text/typescript') {
        iconName = CODE_FILE;
    } else {
        iconName = getIconNameFromExtension(item.extension);
    }

    return iconName;
}

export function getItemTypeFromExtension(extension: string): ItemType {
    let itemType: ItemType;

    try {
        if (extension) {
            var iconName = getIconNameFromExtension(extension);
            if (IconMap[iconName]) {
                let iconItemType = IconMap[iconName].type;

                if (iconItemType === (void 0)) {
                    iconItemType = ItemType.File;
                }

                itemType = iconItemType;
            }
        }
    } catch (e) {
        //do nothing
    }

    if (itemType === (void 0)) {
        itemType = ItemType.Unknown;
    }

    return itemType;
}

export function getIconNameFromExtension(extension: string): string {
    if (!_extensionToIconName) {
        _extensionToIconName = { };

        for (var iconName in IconMap) {
            var extensions = IconMap[iconName].extensions;

            if (extensions) {
                for (var i = 0; i < extensions.length; i++) {
                    _extensionToIconName[extensions[i]] = iconName;
                }
            }
        }
    }

    // Strip periods, force lowercase.
    extension = extension.replace('.', '').toLowerCase();

    return _extensionToIconName[extension] || GENERIC_FILE;
}

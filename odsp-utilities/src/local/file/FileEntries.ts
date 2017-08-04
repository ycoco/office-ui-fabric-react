// OneDrive:IgnoreCodeCoverage
import Signal from '../async/Signal';
import Promise from '../async/Promise';
import { IFileSystemEntry, IFileSystemFileEntry, IFileSystemDirectoryReader } from './FileSystem';
import { INativeHtml5File } from './INativeHtml5File';

export const enum EntryType {
    unknown,
    file,
    directory
}

export interface IBaseEntry {
    name: string;
}

export interface IFileEntry extends IBaseEntry {
    type: EntryType.file;

    getFile(): Promise<File>;
}

export interface IUnknownEntry extends IBaseEntry {
    type: EntryType.unknown;

    getFile(): Promise<File>;
}

export interface IDirectoryPage {
    entries: IEntry[];

    getEntries?(): Promise<IDirectoryPage>;
}

export interface IDirectoryEntry extends IBaseEntry {
    type: EntryType.directory;

    getEntries(): Promise<IDirectoryPage>;
}

export type IEntry = IFileEntry | IDirectoryEntry | IUnknownEntry;

interface IFolderTree {
    name: string;
    directories: {
        [name: string]: IFolderTree;
    };
    files: File[];
}

function buildDirectoryEntry(tree: IFolderTree): IDirectoryEntry {
    return {
        name: tree.name,
        type: EntryType.directory,
        getEntries: () => {
            return Promise.wrap({
                entries: buildEntries(tree)
            });
        }
    };
}

function buildFileEntry(file: File): IFileEntry | IUnknownEntry {
    let entry: IFileEntry | IUnknownEntry;

    if (file.type) {
        entry = {
            name: file.name,
            type: EntryType.file,
            getFile: () => Promise.wrap(file)
        };
    } else {
        entry = {
            name: file.name,
            type: EntryType.unknown,
            getFile: () => Promise.wrap(file)
        };
    }

    return entry;
}

function buildEntries(tree: IFolderTree): IEntry[] {
    const entries: IEntry[] = [];

    for (const name in tree.directories) {
        if (name) {
            entries.push(buildDirectoryEntry(tree.directories[name]));
        }
    }

    for (const file of tree.files) {
        entries.push(buildFileEntry(file));
    }

    return entries;
}

export function buildEntriesFromFileList(files: ReadonlyArray<INativeHtml5File>): IEntry[] {
    const root: IFolderTree = {
        name: '',
        directories: {},
        files: []
    };

    for (const file of files) {
        const {
            webkitRelativePath: path = file.name
        } = file;

        let folder = root;

        for (const part of path.split('/').slice(0, -1)) {
            folder = folder.directories[part] || (folder.directories[part] = {
                name: part,
                directories: {},
                files: []
            });
        }

        folder.files.push(file);
    }

    return buildEntries(root);
}

function readEntries(reader: IFileSystemDirectoryReader): Promise<IFileSystemEntry[]> {
    const signal = new Signal<IFileSystemEntry[]>();

    reader.readEntries((entries: IFileSystemEntry[]) => signal.complete(entries), (error: Error) => signal.error(error));

    return signal.getPromise();
}

function getFile(fileSystemFileEntry: IFileSystemFileEntry): Promise<File> {
    const signal = new Signal<File>();

    fileSystemFileEntry.file((file: File) => {
        signal.complete(file);
    }, (error: Error) => {
        signal.error(error);
    });

    return signal.getPromise();
}

function getPage(reader: IFileSystemDirectoryReader): Promise<IDirectoryPage> {
    return readEntries(reader).then((fileSystemEntries: IFileSystemEntry[]) => {
        let page: IDirectoryPage;

        if (fileSystemEntries.length) {
            page = {
                entries: fileSystemEntries.map(getEntry),
                getEntries: () => getPage(reader)
            };
        } else {
            page = {
                entries: []
            };
        }

        return page;
    });
}

function getEntry(fileSystemEntry: IFileSystemEntry): IEntry {
    let entry: IEntry;

    if (fileSystemEntry.isDirectory) {
        entry = {
            name: fileSystemEntry.name,
            type: EntryType.directory,
            getEntries: () => {
                return getPage(fileSystemEntry.createReader());
            }
        };
    } else if (fileSystemEntry.isFile) {
        entry = {
            name: fileSystemEntry.name,
            type: EntryType.file,
            getFile: () => {
                return getFile(fileSystemEntry);
            }
        };
    }

    return entry;
}

export function buildEntriesFromEntryList(fileSystemEntries: ReadonlyArray<IFileSystemEntry>): IEntry[] {
    return fileSystemEntries.map(getEntry);
}
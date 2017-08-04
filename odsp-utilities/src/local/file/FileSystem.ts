// OneDrive:IgnoreCodeCoverage
export interface IFileSystemBaseEntry {
    name: string;
    fullPath: string;
}

export interface IFileSystemFileEntry extends IFileSystemBaseEntry {
    isFile: true;
    isDirectory: false;
    file(successCallback: (file: File) => void, errorCallback?: (error: any) => void): void;
}

export interface IFileSystemDirectoryEntry extends IFileSystemBaseEntry {
    isFile: false;
    isDirectory: true;
    createReader(): IFileSystemDirectoryReader;
}

export type IFileSystemEntry = IFileSystemFileEntry | IFileSystemDirectoryEntry;

export interface IFileSystemDirectoryReader {
    readEntries(successCallback: (entries: IFileSystemEntry[]) => void, errorCallback?: (error: any) => void): void;
}

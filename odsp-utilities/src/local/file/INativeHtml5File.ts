export interface INativeHtml5File extends File {
    isFolder?: boolean;
    fileName?: string;
    size: number;
    eTag?: string;
    mozSlice?: (start?: number, end?: number) => INativeHtml5File;
    webkitSlice?: (start?: number, end?: number) => INativeHtml5File;
    lastModifiedDate: Date;
}
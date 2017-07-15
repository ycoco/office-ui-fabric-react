import Promise from '@ms/odsp-utilities/lib/async/Promise';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { DocumentType } from '../../interfaces/list/DocumentType';
import { ISPListContext } from '../../dataSources/item/spListItemRetriever/interfaces/ISPListContext';
import { IFileSystemDataSource, ICheckFilenameStrings } from '../../dataSources/fileSystem/IFileSystemDataSource';
import { FileSystemDataSource } from '../../dataSources/fileSystem/FileSystemDataSource';
import { ISPCreateFolderContext } from '../../dataSources/fileSystem/ISPCreateFolderContext';
import { ISPRenameItemContext } from '../../dataSources/fileSystem/ISPRenameItemContext';
import { ISPListItem } from '../../dataSources/item/spListItemProcessor/ISPListItemData';

export interface IFileSystemProvider {
    createDocument(parentKey: string, docType: DocumentType, docName?: string, templateUrl?: string): Promise<string>;
    createFolder(context: ISPCreateFolderContext): Promise<ISPListItem>;
    renameItem(context: ISPRenameItemContext): Promise<string>;
}

export interface IFileSystemProviderParams {
    pageContext: ISpPageContext;
    listContext: ISPListContext;
    strings: ICheckFilenameStrings;
    dataSource?: IFileSystemDataSource;
}

export class FileSystemProvider implements IFileSystemProvider {
    private _dataSource: IFileSystemDataSource;

    constructor(params: IFileSystemProviderParams) {
        this._dataSource = params.dataSource || new FileSystemDataSource({
            pageContext: params.pageContext,
            listContext: params.listContext,
            strings: params.strings
        });
    }

    public createDocument(parentKey: string, docType: DocumentType, docName?: string, templateUrl?: string): Promise<string> {
        return this._dataSource.createDocument(parentKey, docType, docName, templateUrl);
    }

    public createFolder(context: ISPCreateFolderContext): Promise<ISPListItem> {
        return this._dataSource.createFolder(context);
    }

    public renameItem(context: ISPRenameItemContext): Promise<string> {
        return this._dataSource.renameItem(context);
    }
}

export default FileSystemProvider;

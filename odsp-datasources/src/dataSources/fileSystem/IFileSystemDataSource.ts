import Promise from '@ms/odsp-utilities/lib/async/Promise';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { ISPListItem } from '../item/spListItemProcessor/ISPListItemData';
import { ItemUrlHelper } from '../../utilities/url/ItemUrlHelper';
import { ApiUrlHelper } from '../../utilities/url/ApiUrlHelper';
import { DocumentType } from '../../interfaces/list/DocumentType';
import { ISPRenameItemContext } from './ISPRenameItemContext';
import { ISPCreateFolderContext } from './ISPCreateFolderContext';

export interface IFileSystemDataSource {
  createDocument(parentKey: string, docType: DocumentType, docName?: string, templateUrl?: string): Promise<string>;
  renameItem(context: ISPRenameItemContext): Promise<string>;
  createFolder(context: ISPCreateFolderContext): Promise<ISPListItem>;
}

export interface ICheckFilenameStrings {
  emptyNameError: string;
  invalidNameStartError: string;
  invalidNameError2: string;
  invalidNameError: string;
}

export interface IFileSystemDataSourceParams {
  pageContext: ISpPageContext;
  listContext: { isDocLib?: boolean };
  strings: ICheckFilenameStrings;
  itemUrlHelper?: ItemUrlHelper;
  apiUrlHelper?: ApiUrlHelper;
}
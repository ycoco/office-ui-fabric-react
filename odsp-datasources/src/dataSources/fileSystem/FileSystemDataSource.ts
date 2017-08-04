import DataSource from '../base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { ItemUrlHelper } from '../../utilities/url/ItemUrlHelper';
import { ApiUrlHelper } from '../../utilities/url/ApiUrlHelper';
import { IFileSystemDataSource, IFileSystemDataSourceParams, ICheckFilenameStrings } from './IFileSystemDataSource';
import { ISPRenameItemContext } from './ISPRenameItemContext';
import { ISPCreateFolderContext } from './ISPCreateFolderContext';
import { DocumentType } from '../../interfaces/list/DocumentType';
import { ISPListItem } from '../item/spListItemProcessor/ISPListItemData';
import { getListEntityTypeName } from '../item/spListItemRetriever/ListItemDataHelpers';
import { getSafeWebServerRelativeUrl } from '../../interfaces/ISpPageContext';
import Features from '@ms/odsp-utilities/lib/features/Features';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import * as MsForms from '../msForms/MsForms';
import { ErrorType } from '../item/spListItemProcessor/SPListItemEnums';
import ItemType from '@ms/odsp-utilities/lib/icons/ItemType';
import { getRelativeDateTimeStringForLists } from '@ms/odsp-utilities/lib/dateTime/DateTime';
import { Killswitch } from '@ms/odsp-utilities/lib/killswitch/Killswitch';
import { buildItemKey } from '../../utilities/list/DataSourceUtilities';

const VisioDrawingCreation = { ODB: 973 };
const SupportPoundPercent = { ODB: 54 };

export class FileSystemDataSource extends DataSource implements IFileSystemDataSource {
    private _listContext: { isDocLib?: boolean };
    private _itemUrlHelper: ItemUrlHelper;
    private _apiUrlHelper: ApiUrlHelper;
    private _strings: ICheckFilenameStrings;

    constructor(params: IFileSystemDataSourceParams) {
        super(params.pageContext);

        this._listContext = params.listContext;
        this._itemUrlHelper = params.itemUrlHelper || new ItemUrlHelper({}, { pageContext: params.pageContext });
        this._apiUrlHelper = params.apiUrlHelper || new ApiUrlHelper({}, { pageContext: params.pageContext, itemUrlHelper: this._itemUrlHelper });
        this._strings = params.strings;
    }

    public createDocument(parentKey: string, docType: DocumentType, docName?: string, templateUrl?: string): Promise<string> {
        if (typeof docName === 'string') {
            var renameError: Promise<any> = checkFilename(docName, this._strings, this._pageContext.supportPoundStorePath);
            if (renameError !== null) {
                return renameError;
            }
        }

        return this.getData<string>(
            () => {
                return this._getCreateDocumentUrl(docType, parentKey, docName, templateUrl);
            },
            (responseText: string) => {
                if (responseText !== void 0 && responseText !== null) {
                    var data = JSON.parse(responseText);
                    if (data !== null && data.d !== null && data.d.CreateDocumentAndGetEditLink !== null) {
                        return this._getRedirectToEditNewDocument(data.d.CreateDocumentAndGetEditLink, docType, docName);
                    } else {
                        // try to parse response in xml
                        try {
                            var parser = new DOMParser();
                            var xml = parser.parseFromString(responseText, "text/xml");
                            var wopiUrl = xml.getElementsByTagName("d:CreateDocumentAndGetEditLink")[0].textContent;
                            return this._getRedirectToEditNewDocument(wopiUrl, docType, docName);
                        } catch (e) {
                            // TODO: log error
                            return '';
                        }
                    }
                }

                return responseText;
            },
            'CreateDocument').then(null, (error: any) => {
                return Promise.wrapError(error.message.value);
            });
    }

    public createFolder(context: ISPCreateFolderContext): Promise<ISPListItem> {
        let parentUrlParts = this._itemUrlHelper.getItemUrlParts(context.parent.key);
        context.parseResponse = (responseText: string) => {
            let itemFromServer = null;
            if (responseText !== void 0 && responseText !== null) {
                itemFromServer = JSON.parse(responseText).d;
            }

            if (itemFromServer && itemFromServer.Exists) {
                let urlParts = this._itemUrlHelper.getUrlParts({
                    path: itemFromServer.ServerRelativeUrl,
                    listUrl: parentUrlParts.normalizedListUrl
                });

                let key = buildItemKey(urlParts.serverRelativeItemUrl, urlParts.normalizedListUrl);

                let item: ISPListItem = {
                    key: key
                };
                item.type = ItemType.Folder;
                item.id = itemFromServer.serverRelativeItemUrl;
                item.name = itemFromServer.Name;
                item.dateModified = getRelativeDateTimeStringForLists(itemFromServer['TimeLastModified']);
                item.isDropEnabled = true;
                item.permissions = itemFromServer.PermMask;

                if (itemFromServer.ListItemAllFields) {
                    item.properties = { ID: String(itemFromServer.ListItemAllFields.Id) };
                    item.isPlaceholder = true; // since we asked for item details, but it's not fully populated yet
                }

                item.itemFromServer = itemFromServer;
                return item;
            } else {
                return null;
            }
        };
        return this.createFolderAndParseResponse(context) as Promise<ISPListItem>;
    }

    public createFolderAndParseResponse(context: ISPCreateFolderContext): Promise<{ key: string }> {
        let renameError: Promise<any> = checkFilename(context.folderName, this._strings, this._pageContext.supportPoundStorePath);
        let parentFolderUrl = context.parentFolderUrl || context.parent.key;
        if (renameError !== null) {
            return renameError;
        }

        return this.getData<ISPListItem>(
            /* getUrl */() => {
                return this._getCreateFolderUrl(context);
            },
            /* parseResponse */(responseText: string) => {
                let parseResponse = context.parseResponse;
                return parseResponse(responseText);
            },
            'CreateFolder',
            /* getAdditionalPostData */() => {
                if (this._listContext.isDocLib) {
                    if (context.folderName === '') {
                        context.folderName = 'Folder' + Math.floor(Math.random() * 100) + 1;
                    }
                    if (!Features.isFeatureEnabled(SupportPoundPercent)) {
                        return JSON.stringify({
                            "url": `${parentFolderUrl}/${context.folderName}`,
                            "overwrite": false
                        });
                    }
                } else {
                    return "";
                }
            }).then(null, (error: any) => {
                let errorMessage: string = error.message.value;

                // Check for "docAlreadyExists" exception.
                if (error.code.indexOf(ErrorType.docAlreadyExists) > -1) {
                    // example: target folder name is "test 1"
                    // original error message: "A file or folder with the name sites/testTeam/Shared Documents/test 1 already exists."
                    // the message after process: "A file or folder with the name test 1 already exists."

                    // remove all leading and trailing slashes from parent folder url
                    parentFolderUrl = parentFolderUrl.replace(/^\/+|\/+$/g, '');

                    // remove parent folder url from the message
                    errorMessage = (<string>error.message.value).replace(parentFolderUrl, '');

                    // remove the potential remaining slashes from the message
                    errorMessage = errorMessage.replace(/\//g, '');
                }

                return Promise.wrapError(errorMessage);
            });
    }

    public renameItem(context: ISPRenameItemContext): Promise<string> {
        var renameError: Promise<string> = checkFilename(context.newName, this._strings, this._pageContext.supportPoundStorePath);
        if (renameError !== null) {
            return renameError;
        }

        var apiUrl = this._getRenameItemUrl(context.item);
        var additionalPostData = {};
        var additionHeaders: { [name: string]: string; } = {};
        var filename = context.newName.trim();

        let itemUrlParts = this._itemUrlHelper.getItemUrlParts(context.item.key);

        let serverRelativeListUrl = itemUrlParts.serverRelativeListUrl;

        let serverRelativeWebUrl: string;

        if (context.siteRootItem) {
            let siteUrlParts = this._itemUrlHelper.getItemUrlParts(context.siteRootItem.key);

            serverRelativeWebUrl = siteUrlParts.serverRelativeItemUrl;
        } else {
            serverRelativeWebUrl = getSafeWebServerRelativeUrl(this._pageContext);
        }

        additionalPostData['__metadata'] = {
            'type': getListEntityTypeName(serverRelativeListUrl, serverRelativeWebUrl)
        };
        additionalPostData['FileLeafRef'] = context.item.extension ? filename + context.item.extension : filename;
        additionHeaders["X-HTTP-Method"] = "MERGE";
        additionHeaders["If-Match"] = "*";

        return this.getData<string>(
            /* getUrl */() => {
                return apiUrl;
            },
            /* parseResponse */(responseText: string) => {
                return responseText;
            },
            "RenameItem",
            /* getAdditionalPostData */() => {
                return JSON.stringify(additionalPostData);
            },
            'POST',
            additionHeaders).then(null, (error: any) => {
                return Promise.wrapError(error.message.value);
            });
    }

    private _getRedirectToEditNewDocument(originalEditLink: string, docType: DocumentType, docName: string) {
        var url = "";
        var editActionString = "action=edit";

        if (originalEditLink !== null && originalEditLink !== "") {
            if (docType === DocumentType.ExcelSurvey) {
                url = originalEditLink.replace(editActionString, "action=formedit");
            } else if (docType === DocumentType.ExcelForm) {
                url = MsForms.GetCreateFormUrl(this._pageContext, originalEditLink, docName);
            } else {
                url = originalEditLink.replace(editActionString, "action=editnew");
            }
        }
        return url;
    }

    private _getCreateDocumentUrl(docType: DocumentType, parentKey: string, docName?: string, templateUrl?: string): string {
        // create document based on itemType: 1 - Word, 2 - Excel, 3 - PowerPoint, 4 - OneNote, 5 - ExcelSurvey, 7 - ExcelForm, 8 - Visio
        var maxDocType = DocumentType.Visio;
        if (!Killswitch.isActivated("D75200B0-4F07-464B-851E-AEB3CA8101F0", "06/18/2017", "KillSwitchVisioEditFakeLicense")) {
            maxDocType = DocumentType.Visio;
        } else {
            maxDocType = Features.isFeatureEnabled(VisioDrawingCreation) ? DocumentType.Visio : DocumentType.ExcelForm;
        }
        if (docType !== null && docType >= DocumentType.Word && docType <= maxDocType && docType !== DocumentType.Text) {
            if (docType === DocumentType.OneNote && !docName) {
                docName = "Notebook" + Math.floor(Math.random() * 100) + 1;
            } else if (docType === DocumentType.ExcelSurvey || docType === DocumentType.ExcelForm) {
                docName = docName + ".xlsx";
            }

            if (!docName) {
                docName = "";
            }

            // using ExcelSurvey template for ExcelForm
            if (docType === DocumentType.ExcelForm) {
                docType = DocumentType.ExcelSurvey;
            }

            let itemUrlParts = this._itemUrlHelper.getItemUrlParts(parentKey);
            let parentUrl = itemUrlParts.listRelativeItemUrl;

            let apiUrl = this._apiUrlHelper.build()
                .webByItemUrl(itemUrlParts)
                .method('GetList', itemUrlParts.serverRelativeListUrl)
                .methodWithAliases('CreateDocumentAndGetEditLink', {
                    'fileName': docName,
                    'folderPath': parentUrl,
                    'documentTemplateType': docType,
                    'templateUrl': templateUrl || ''
                });

            return apiUrl.toString();
        } else {
            if (!Killswitch.isActivated("D75200B0-4F07-464B-851E-AEB3CA8101F0", "06/18/2017", "KillSwitchVisioEditFakeLicense") ||
                Features.isFeatureEnabled(VisioDrawingCreation)) {
                throw new Error("document type is not valid, here are the valid type: 1 - Word, 2 - Excel, 3 - PowerPoint, 4 - OneNote, 5 - Excel Survey, 7 - ExcelForm, 8 - Visio");
            } else {
                throw new Error("document type is not valid, here are the valid type: 1 - Word, 2 - Excel, 3 - PowerPoint, 4 - OneNote, 5 - Excel Survey, 7 - ExcelForm");
            }
        }
    }

    private _getRenameItemUrl(item: ISPListItem): string {
        let itemUrlParts = this._itemUrlHelper.getItemUrlParts(item.key);

        let apiUrl = this._apiUrlHelper.build()
            .webByItemUrl(itemUrlParts)
            .method('GetList', itemUrlParts.serverRelativeListUrl)
            .method('Items', item.properties.ID);

        return apiUrl.toString();
    }

    private _getCreateFolderUrl(context: ISPCreateFolderContext): string {
        let itemUrlParts = this._itemUrlHelper.getItemUrlParts(context.parent.key);

        if (this._listContext.isDocLib) {
            let apiUrl = this._apiUrlHelper.build()
                .webByItemUrl(itemUrlParts)
                .segment('folders');
            if (!Features.isFeatureEnabled(SupportPoundPercent)) {
                apiUrl = apiUrl.segment('AddWithOverwrite');
            } else {
                let parentFolderUrl = itemUrlParts.serverRelativeItemUrl;
                apiUrl = apiUrl.methodWithAliases('AddUsingPath', {
                    'DecodedUrl': `${parentFolderUrl}/${context.folderName}`,
                    "overwrite": false
                });
            }

            if (context.needItemDetails) {
                apiUrl = apiUrl.oDataParameter('$Expand', 'ListItemAllFields');
            }

            return apiUrl.toString();
        } else {
            if (!context.folderName) {
                context.folderName = `Folder${Math.floor(Math.random() * 100) + 1}`;
            }

            let apiUrl = this._apiUrlHelper.build()
                .webByItemUrl(itemUrlParts);

            if (Features.isFeatureEnabled(SupportPoundPercent)) {
                apiUrl = apiUrl.methodWithAliases('GetFolderByServerRelativePath', {
                    'DecodedUrl': itemUrlParts.serverRelativeItemUrl
                });
            } else {
                apiUrl = apiUrl.method('GetFolderByServerRelativeUrl', itemUrlParts.serverRelativeItemUrl);
            }

            if (Features.isFeatureEnabled(SupportPoundPercent)) {
                apiUrl = apiUrl.methodWithAliases('AddSubFolderUsingPath', {
                    'DecodedUrl': context.folderName
                });
            } else {
                apiUrl = apiUrl.method('AddSubFolder', context.folderName);
            }

            return apiUrl.toString();
        }
    }
}

export function checkFilename(filename: string, strings: ICheckFilenameStrings, supportPoundStorePath?: boolean): Promise<any> {
    // illegal chars: " # % * : < > ? / \ |
    var illegalFilenameChars = Features.isFeatureEnabled(SupportPoundPercent) ? /["\*:<>\?\/\\\|]/ : /["#%\*:<>\?\/\\\|]/;
    var error: string = null;

    if (typeof filename === 'string') {
        filename = filename.trim();
        if (filename.length === 0) {
            error = strings.emptyNameError;
        } else if (filename[0] === "~" || filename[0] === ".") {
            error = StringHelper.format(strings.invalidNameStartError, filename[0]);
        } else if (illegalFilenameChars.test(filename)) {
            error = StringHelper.format(supportPoundStorePath ? strings.invalidNameError2 : strings.invalidNameError, filename);
        }
    } else {
        error = strings.emptyNameError;
    }

    return (error !== null) ? Promise.wrapError(error) : null;
}

export default FileSystemDataSource;

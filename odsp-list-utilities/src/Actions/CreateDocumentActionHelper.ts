import { PermissionMask } from '@ms/odsp-datasources/lib/Permissions';
import ListTemplateType from '@ms/odsp-datasources/lib/dataSources/listCollection/ListTemplateType';
import { ISPListItem } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ISPListContext } from '@ms/odsp-datasources/lib/SPListItemRetriever';
import { Killswitch } from '@ms/odsp-utilities/lib/killswitch/Killswitch';
import PlatformDetection from '@ms/odsp-utilities/lib/browser/PlatformDetection';
import Features from '@ms/odsp-utilities/lib/features/Features';
import Uri from '@ms/odsp-utilities/lib/uri/Uri';
import { DocumentType } from '@ms/odsp-datasources/lib/interfaces/list/DocumentType';
import { ItemUrlHelper } from '@ms/odsp-datasources/lib/Url';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { ICreateDocumentStrings } from './IAction';

const EnableExcelSurveyV2 = { ODB: 964 };
const EnableExcelSurveyV2LicenseCheck = { ODB: 968 };
const VisioDrawingCreation = { ODB: 973 };

export * from './CreateDocumentActionHelperCore';

export function isAvailable(parentItem: ISPListItem,
    listRootItem: ISPListItem,
    list: { newWOPIDocumentEnabled?: boolean, canUserCreateMicrosoftForm?: boolean, templateType?: ListTemplateType },
    docType: DocumentType,
    pageContext: ISpPageContext,
    platformDetection: PlatformDetection): boolean {
    let canShareByLink = _canShareByLink(listRootItem);
    let canCreateMsForm = _canCreateMsForm(pageContext);
    let canCreateVisioDrawing = _canCreateVisioDrawing(pageContext);

    return (!platformDetection.isMobile || platformDetection.isIPad) && // All docs can be only viewed in mobile and not created, wac and text editor limitation
        !!listRootItem &&
        !!list &&
        docType !== DocumentType.Text &&
        PermissionMask.hasItemPermission(parentItem, PermissionMask.insertListItems) &&
        list.newWOPIDocumentEnabled &&
        // For the command to be shown for Excel surveys, share by link must be enabled and user cannot use Microsoft Forms
        (docType !== DocumentType.ExcelSurvey || (canShareByLink && !canCreateMsForm)) &&
        // For the command to be shown for Microsoft Forms, user must be entitled to use Microsoft Forms
        (docType !== DocumentType.ExcelForm || (canCreateMsForm && (list.templateType !== ListTemplateType.documentLibrary || !!list.canUserCreateMicrosoftForm))) &&
        (docType !== DocumentType.Visio || canCreateVisioDrawing);
}

export function isSupported(listRootItem: ISPListItem,
    docType: DocumentType,
    pageContext: ISpPageContext,
    shareByLinkDataProvider: any /*IShareByLinkProvider*/,
    showShareByLinkErrorDialog: () => void,
    executeCore: () => void): boolean {
    if (docType === DocumentType.ExcelForm) {
        if (_canCreateMsForm(pageContext)) {
            executeCore();
            return false;
        }

        if (shareByLinkDataProvider) {
            let shareByLinkPromise: Promise<any /*IShareByLinkInfo*/> = shareByLinkDataProvider.getShareByLinkInfo();
            shareByLinkPromise.then(
                /* complete */(response: any /*IShareByLinkInfo*/) => {
                    if (Boolean(response)) {
                        if (response.isExternalSharingTipEnabled && _canShareByLink(listRootItem)) {
                            executeCore();
                        } else {
                            showShareByLinkErrorDialog();
                        }
                    } else {
                        showShareByLinkErrorDialog();
                    }
                }, /* error */(response: any) => {
                    showShareByLinkErrorDialog();
                }
            );
        }
        return false;
    } else if (!Killswitch.isActivated("D75200B0-4F07-464B-851E-AEB3CA8101F0", "06/18/2017", "KillSwitchVisioEditFakeLicense")) {
        if (docType === DocumentType.Visio) {
            return _canCreateVisioDrawing(pageContext);
        }
    }

    return true;
}

export function shouldCreateInOfficeClient(docType: DocumentType, templateUrl: string, templateExtension: string): boolean {
    // WAC cannot create document with '.dot', we need to fall back to create it in office client.
    return (templateUrl && docType === DocumentType.Word && templateExtension === 'dot') ? true : false;
}

export function getCreateDocumentByDocAspxUrl(parentKey: string,
    docType: DocumentType,
    itemUrlHelper: ItemUrlHelper,
    getWopiDocUrl: () => string,
    docName?: string): string {
    let wopiDocUrl = getWopiDocUrl();
    let itemUrlParts = itemUrlHelper.getItemUrlParts(parentKey);
    let parentUrl = itemUrlParts.fullItemUrl;

    // create document based on itemType: 1 - Word, 2 - Excel, 3 - PowerPoint, 4 - OneNote, 5 - ExcelSurvey, 7 - ExcelForm, 8 - Visio
    if (docType !== null && (docType === DocumentType.Word || docType === DocumentType.PowerPoint)) {
        // http://inateeg-elite/_layouts/15/doc.aspx?docliburl=http://inateeg-elite/shared%20documents&doctype=1&action=editnew"
        let docUri: Uri = new Uri(wopiDocUrl);
        docUri.setQueryParameter('docliburl', encodeURI(parentUrl));
        docUri.setQueryParameter('doctype', docType.toString());
        docUri.setQueryParameter('action', 'editnew');
        return docUri.toString();
    } else {
        throw new Error("document type is not valid, doc.aspx createNew only support type: 1 - Word, 3 - PowerPoint for the time being.");
    }
}

function _canShareByLink(listRootItem: ISPListItem): boolean {
    // tslint:disable-next-line:no-string-literal
    return !!(listRootItem && listRootItem.properties && listRootItem.properties.commandsSupported && listRootItem.properties.commandsSupported['canShareLinkForNewDocument']);
}

function _canCreateMsForm(pageContext: ISpPageContext): boolean {
    let canCreateMsForm = false;

    if (!Killswitch.isActivated("D25A29E3-E005-4FD6-B72D-04C5D15E2F0C", "06/02/2017", "Simplify ms form flight checking")) {
        canCreateMsForm = !!pageContext.canUserCreateMicrosoftForm;
    } else {
        if (Features.isFeatureEnabled(EnableExcelSurveyV2)) {
            if (Features.isFeatureEnabled(EnableExcelSurveyV2LicenseCheck)) {
                canCreateMsForm = pageContext.canUserCreateMicrosoftForm;
            } else {
                // always return true when license check is not enabled
                canCreateMsForm = true;
            }
        }
    }

    return canCreateMsForm;
}

function _canCreateVisioDrawing(pageContext: ISpPageContext): boolean {
    if (!Killswitch.isActivated("D75200B0-4F07-464B-851E-AEB3CA8101F0", "06/18/2017", "KillSwitchVisioEditFakeLicense")) {
        return pageContext.isSPO && (Features.isFeatureEnabled(VisioDrawingCreation) ||
            !!pageContext.PreviewFeaturesEnabled);
    } else {
        return true;
    }
}
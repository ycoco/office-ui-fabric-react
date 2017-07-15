import Uri from '@ms/odsp-utilities/lib/uri/Uri';
import { IItemUrlParts } from '@ms/odsp-datasources/lib/Url';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ISPContentType } from '@ms/odsp-datasources/lib/SPListItemRetriever';

export interface IListProperties {
    openInClient?: boolean;
    newWOPIDocumentEnabled?: boolean;
    contentTypesEnabled?: boolean;
}

export function isCustomContentTypesDisabled(contentTypes: ISPContentType[], listProperties?: IListProperties): boolean {
    // The logic here is complicated. Even if the contentTypesEnabled flag is true, we don't want to
    // show the custom content types returned from the server if there are none to show. If the
    // contentTypesEnabled flag is false, we still need to show the content types if the user has set a
    // custom document templateUrl, which will be stored in the templateUrl attribute of the contentTypes
    // returned from the server.

    const length = contentTypes && contentTypes.length;
    // If there are no content types, they are disabled
    if (!length) {
        return true;
    }

    const firstEntry = contentTypes[0];
    const templateUrl = firstEntry.templateUrl;
    // If the only content type returned was the default document template, content types are disabled
    const isDefaultTemplate = templateUrl && templateUrl.indexOf('/Forms/template.do') > -1;
    if (length === 1 && ((!templateUrl && !firstEntry.docSetUrl) || isDefaultTemplate)) {
        return true;
    }

    // If content types are expressly enabled, content types are enabled
    if (listProperties && listProperties.contentTypesEnabled) {
        return false;
    }

    return !templateUrl || isDefaultTemplate;
}

export function getContentTypeCommandsCore<T>(contentTypes: ISPContentType[],
    pageContext: ISpPageContext,
    buildCreateDocumentCommand: (key: string, name: string, iconUrl: string, icon: string, templateUrl: string) => T,
    buildNavigationCommand: (key: string, contentType: ISPContentType, iconUrl: string, icon: string, templateUrl: string, cTypeId: string) => T,
    itemUrlParts: IItemUrlParts,
    listProperties?: IListProperties): T[] {
    if (!listProperties) {
        // If the list is not determined, then emit no commands.
        return [];
    }

    const {
        openInClient,
        newWOPIDocumentEnabled
    } = listProperties;

    return contentTypes.map((contentType: ISPContentType) => {
        let templateUrl = contentType.templateUrl;

        const cTypeId = contentType.cTypeId;
        const idQueryString = "CreateNewDocument.aspx?id=";
        const urlIndex = templateUrl ? templateUrl.indexOf(idQueryString) : 0;
        let iconUrl = contentType.iconUrl;
        let icon: string;

        if (iconUrl) {
            if (iconUrl.indexOf("/") === -1) {
                iconUrl = `/${pageContext.layoutsUrl}/images/${iconUrl}`;
            }
        } else {
            const isDocSet = contentType.templateUrl === "" && contentType.docSetUrl;
            icon = isDocSet ? 'DocumentSet' : 'Page';
        }

        if (urlIndex > 0 && !openInClient && newWOPIDocumentEnabled) {
            return buildCreateDocumentCommand('NewDOC', contentType.displayName, iconUrl, icon, templateUrl.substring(urlIndex + idQueryString.length));
        }

        if (!templateUrl) {
            templateUrl = contentType.docSetUrl;
            if (templateUrl) {
                const templateUri = new Uri(templateUrl);
                const rootFolder = itemUrlParts.serverRelativeItemUrl;
                templateUri.setQueryParameter("RootFolder", rootFolder);
                templateUrl = templateUri.toString();
            } else if (!!cTypeId) {
                // if templateUrl is empty or null, the menu item will be hidden. So we'd need to pass in some
                // temp values to get it shown up. templateUrl here is not the right value, just a placeholder waiting
                // to be overwritten in the OnExecute.
                templateUrl = cTypeId;
            }
        }

        return buildNavigationCommand('NewCustomType', contentType, iconUrl, icon, templateUrl, cTypeId);
    });
}
// OneDrive:IgnoreCodeCoverage

import ISPListContext from './interfaces/ISPListContext';
import { IItemUrlParts, SiteRelation } from './interfaces/IItemUrlHelper';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import { Verbose } from '@ms/odsp-utilities/lib/logging/events/Verbose.event';

/** Params for building a RenderListDataAsStream request */
export interface IListDataUrlParams {
    /** Web absolute URL */
    webUrl: string;
    /** List GUID (listUrl takes precedence because get by ID is slow) */
    listId?: string;
    /** Object containing listUrl (takes precedence over listId) */
    urlParts?: IItemUrlParts;

    /**
     * Request query string (including ?).
     * If specified, other query params will not be used.
     */
    requestToken?: string;

    /** Use settings defined by this view ID */
    view?: string;
    /** Return only results that match this search term from within the list */
    searchTerm?: string;
    /** Current folder */
    rootFolder?: string;
    /** Internal name of the sort field */
    sortField?: string;
    /** Sort direction, 'Asc' or 'Desc' */
    sortDir?: string;
    /** Get contents of this grouping ID */
    groupString?: string;
    /**
     * Filter query parameters.
     * Keys are like FilterField(s)N and FilterValue(s)N where N = 1-10.
     * Values should be URL encoded, with multiple values combined with ;# before encoding.
     */
    filterParams?: string;
    /**
     * WILL BE IGNORED in most scenarios. When used in a request that also specifies view XML
     * which does not include view fields, this tells which view to get the view fields from.
     */
    viewId?: string;
}

/** Builds a RenderListDataAsStream request URL */
export function getListDataUrl(params: IListDataUrlParams) {
    'use strict';

    let {
        webUrl,
        listId,
        view,
        searchTerm,
        rootFolder,
        sortField,
        sortDir,
        filterParams,
        groupString,
        requestToken,
        viewId,
        urlParts
    } = params;

    let rg = [UriEncoding.escapeUrlForCallback(webUrl)];
    if (webUrl.slice(-1) !== '/') {
        rg.push('/');
    }

    let siteRelation: SiteRelation;

    if (urlParts) {
        ({
            siteRelation = urlParts.isCrossSite
        } = urlParts);
    }

    // Check to see if data is coming from different list than the current default list
    if (siteRelation === SiteRelation.crossSite) {
        rg.push(`_api/SP.List.GetListDataAsStream?listFullUrl='`);
        rg.push(UriEncoding.encodeRestUriStringToken(urlParts.fullListUrl));

        // If a request token is given, use it and return early
        if (requestToken) {
            if (requestToken[0] !== '?') {
                Verbose.logData({ name: 'ListItemDataHelper.InvalidRequestToken', message: requestToken });
            }
            rg.push(`'&` + requestToken.substring(1));  // strip off '?' and use '&' instead
            return rg.join('');
        }

        rg.push(`'&View=`);
    } else {
        let listUrl: string = urlParts && urlParts.serverRelativeListUrl;

        // lists/GetById() is super slow in server side. Always try to use listUrl first.
        if (listUrl) {
            rg.push('_api/web/GetList(@listUrl');
        } else {
            rg.push(`_api/web/lists/GetById('`);
            rg.push(listId);
            rg.push(`'`);
        }

        // If a request token is given, use it and return early
        if (requestToken) {
            rg.push(')/RenderListDataAsStream');
            rg.push(requestToken);
            rg.push(_appendListUrlToken(listUrl));
            return rg.join('');
        }

        // If no request token is given, build one
        rg.push(')/RenderListDataAsStream?');
        if (listUrl) {
            rg.push(_appendListUrlToken(listUrl, true /*end with &*/));
        }
        rg.push('View=');

        if (view) {
            rg.push(view);
        }
    }

    if (viewId) {
        rg.push(`&ViewId=${viewId}`);
    }

    if (typeof searchTerm === 'string') {
        rg.push('&InplaceSearchQuery=');
        rg.push(UriEncoding.encodeURIComponent(searchTerm));
    }

    if (rootFolder) {
        rg.push('&RootFolder=');
        rg.push(UriEncoding.encodeURIComponent(rootFolder));
    }

    if (typeof groupString === 'string') {
        rg.push('&IsGroupRender=TRUE');
        rg.push('&DrillDown=1');
        rg.push(`&GroupString=${groupString}`);
    }

    if (sortField) {
        rg.push(`&SortField=${sortField}`);
    }

    if (sortDir) {
        rg.push(`&SortDir=${sortDir}`);
    }

    if (filterParams) {
        rg.push(filterParams);
    }

    return rg.join('');
}

function _appendListUrlToken(listUrl: string, endsWithAmpersand?: boolean): string {
    'use strict';
    let rg = [];
    if (listUrl) {
        if (!endsWithAmpersand) {
            rg.push('&');
        }
        rg.push(`@listUrl='`);
        rg.push(UriEncoding.encodeRestUriStringToken(listUrl));
        rg.push(`'`);
        if (endsWithAmpersand) {
            rg.push('&');
        }
    }
    return rg.join('');
}

/** Get a request headers object with the X-SP-REQUESTRESOURCES (Mondo sproc hints) header. */
export function getListRequestHeaders(listContext: ISPListContext, needsQuickLaunch?: boolean): { [key: string]: string } {
    'use strict';
    let listLocator;
    if (listContext.listUrl) {
        listLocator = `listUrl=${UriEncoding.encodeURIComponent(listContext.listUrl)}`;
    } else if (listContext.listId) {
        listLocator = `list=${listContext.listId}`;
    }

    return {
        'X-SP-REQUESTRESOURCES': needsQuickLaunch ? `NAVIGATIONSTRUCTURE,${listLocator}` : listLocator
    };
}

// This logic follows from SPListItemEntityMetadata.GetListEntityTypeName
export function getListEntityTypeName(listUrl: string, webServerRelativeUrl?: string): string {
    'use strict';
    let listRoot = listUrl;
    // if the webServerRelativeUrl is '/foo', and listUrl is '/foo/fooDoclib',
    // we want to return '/fooDoclib' as listRoot
    if (webServerRelativeUrl && listUrl.indexOf(webServerRelativeUrl) === 0) {
        listRoot = listUrl.replace(webServerRelativeUrl, '');
    }

    if (listRoot.substring(0, 1) === '/') {
        listRoot = listRoot.substring(1); // remove starting /
    }

    if (listRoot.toLowerCase().indexOf('lists/') === 0) {
        listRoot = `${listRoot.substr('lists/'.length)}List`;
    }

    let itemTypeFromName = [];
    for (let i = 0; i < listRoot.length; i++) {
        let thisChar = listRoot.charAt(i);
        let cc = listRoot.charCodeAt(i);
        let isAlphaNumeric = (cc > 47 && cc < 58) || (cc > 64 && cc < 91) || (cc > 96 && cc < 123);
        if (!isAlphaNumeric) {
            let paddedHex = `0000${cc.toString(16)}`.slice(-4);
            thisChar = `_x${paddedHex}_`;
        }
        itemTypeFromName.push(thisChar);
    }
    if (itemTypeFromName.length > 0 && itemTypeFromName[0].length === 1) {
        itemTypeFromName[0] = itemTypeFromName[0].toUpperCase();
    }

    return `SP.Data.${itemTypeFromName.join('')}Item`;
}

// This logcal follows from SPListItemEntityMetadata.GetEntityPropertyName for spfield
export function getEntityPropertyName(fieldName: string, fieldType?: string): string {
    'use strict';

    let ret = (fieldName[0] === '_') ? `OData_${fieldName}` : fieldName;
    if (fieldType) {
        switch (fieldType.toLowerCase()) {
            // Lookup field references another list for data (similar to the ForeignKey concept).
            // The server appends 'Id' at the end of the field entity property name to denote this.
            // see 'GetFieldLookupIdName' in SPListItemEntityMetadata.cs
            case 'lookup': ret += 'Id'; break;
            // User field is similar to Lookup field. However, we need to pass the email of the user
            // so we need to use string id instead of int it
            case 'user':
            case 'usermulti': ret += 'StringId'; break;
        }
    }
    return ret;
}

/**
 * Get the type for the given field name based on field definitions from the server.
 * rawListFields is found in listContext.rawListSchema.Field.
 * Text is a good default type in many cases.
 * TODO [elcraig]: add typing (the interface will be added as part of a larger change)
 */
export function getFieldType(fieldName: string, rawListFields: any[], defaultType: string = 'Text'): string {
    'use strict';
    if (!rawListFields) {
        return defaultType;
    }
    for (let field of rawListFields) {
        if (field.Name === fieldName) {
            return field.FieldType;
        }
    }
    return defaultType;
}

import CachedDataSource from '../base/CachedDataSource';
import DataRequestor from '../base/DataRequestor';
import { ISpPageContext, INavNode } from '../../interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import DataStoreCachingType from '@ms/odsp-utilities/lib/models/store/DataStoreCachingType';
import Guid from '@ms/odsp-utilities/lib/guid/Guid';

export interface IDepartmentDataSource {
    /** Gets department data for the current web. */
    getDepartmentData(): Promise<IDepartmentData>;

    /** Set the current SPSite's department to the SPSite with the given GUID. */
    setDepartment(siteId: string): Promise<void>;

    /** Set the current SPSite's department to the SPSite with the given URL. */
    setDepartmentByUrl(siteAbsoluteUrl: string): Promise<void>;
}

export interface IDepartmentData {
    /** Optional title of the department. */
    name?: string;

    /** Optional URL for a department logo. */
    logoUrl?: string;

    /** URL of the parent site (navigate here when logo or title is clicked). */
    url: string;

    /** Navigation links */
    navigation: IDepartmentNavLink[];
}

/**
 * Nav link for a department. Should match office-ui-fabric-react Nav's INavLink.
 */
export interface IDepartmentNavLink {
    /** Link text */
    name: string;
    /** Link URL */
    url: string;
    /** Child links */
    links?: IDepartmentNavLink[];
}

export class DepartmentDataSource extends CachedDataSource implements IDepartmentDataSource {
    constructor(pageContext: ISpPageContext) {
        super(pageContext, 'DepartmentDataSource', {
            cacheTimeoutTime: 24 * 60 * 1000,
            cacheType: DataStoreCachingType.local
        });
    }

    public getDepartmentData(): Promise<IDepartmentData> {
        // The parsed response.d.DepartmentData is *almost* like IDepartmentData,
        // but the nav nodes come in a different format.
        interface IRawDepartmentData {
            name?: string;
            logoUrl?: string;
            url: string;
            navigation: INavNode[]
        }

        return this.getDataUtilizingCache<IRawDepartmentData>({
            getUrl: () => `${this._pageContext.webAbsoluteUrl}/_api/web/DepartmentData`,
            qosName: 'GetDepartmentData',
            parseResponse: (response: string) => JSON.parse(JSON.parse(response).d.DepartmentData)
        }).then((data: IRawDepartmentData) => {
            return data ? {
                name: data.name,
                logoUrl: data.logoUrl,
                url: data.url,
                navigation: data.navigation ? data.navigation.map(_processNode) : []
            } : undefined;
        });
    }

    public setDepartment(siteId: string): Promise<void> {
        if (!siteId) {
            siteId = Guid.Empty;
        }
        return this.dataRequestor.getData<void>({
            url: `${this._pageContext.webAbsoluteUrl}/_api/site/SetDepartmentId(@v1)` +
            `?@v1='${UriEncoding.encodeRestUriStringToken(siteId)}'`,
            qosName: 'SetDepartmentId',
            parseResponse: () => undefined
        });
    }

    public setDepartmentByUrl(siteAbsoluteUrl: string): Promise<void> {
        let siteIdPromise: Promise<string>;
        if (siteAbsoluteUrl) {
            // Get the site's ID, then call the normal setDepartment.
            // (We have to make a new data requestor since this is a cross-site call.)
            siteIdPromise = new DataRequestor({
                pageContext: <any>{
                    webAbsoluteUrl: siteAbsoluteUrl
                },
                qosName: 'DepartmentDataSource'
            }).getData<string>({
                url: `${siteAbsoluteUrl}/_api/site/id`,
                qosName: 'GetSiteId',
                needsRequestDigest: true,
                noRedirect: true,
                crossSiteCollectionCall: true, // important--otherwise webAbsoluteUrl isn't used
                parseResponse: (response: string) => {
                    return JSON.parse(response).d.Id;
                }
            });
        } else {
            // We're removing the department association, so don't try to fetch the ID.
            siteIdPromise = Promise.wrap('');
        }

        return siteIdPromise.then((siteId: string) => this.setDepartment(siteId));
    }

    protected getDataSourceName() {
        return 'DepartmentDataSource';
    }
}

function _processNode(node: INavNode): IDepartmentNavLink {
    let link: IDepartmentNavLink = {
        name: node.Title,
        url: node.Url
    };
    if (node.Children) {
        link.links = node.Children.map(_processNode);
    }
    return link;
}

export default DepartmentDataSource;

import DataSource from '../base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';

/**
 * Default number of maximum retries when error occurs during rest call.
 */
const checkSiteExistsUrlTemplate: string = '/_api/SP.Site.Exists(url=@v)?@v=\'{0}\'';

/**
 * Use SiteCreationDataSource as a base class for other data sources
 * that handle the creation of sites.
 */
export class SiteCreationDataSource extends DataSource {

    /**
     * Checks the existance of a site with site url.
     */
    public checkSiteExists(siteUrl: string): Promise<boolean> {
        const restUrl = () => {
            return this._pageContext.webAbsoluteUrl +
                StringHelper.format(checkSiteExistsUrlTemplate, UriEncoding.encodeRestUriStringToken(siteUrl));
        };

        return this.getData<boolean>(
            restUrl,
            (responseText: string) => {
                let result = JSON.parse(responseText);
                return result && result.d && result.d.Exists;
            },
            'GetSiteExists',
            undefined,
            'GET',
            undefined,
            undefined,
            0 /* NumberOfRetries*/);

    }
}

export default SiteCreationDataSource;

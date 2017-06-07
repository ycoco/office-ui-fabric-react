// OneDrive:IgnoreCodeCoverage

/**
 * SharePoint SPWeb (subsite) template values, from WebTemplate in sts\stsom\Core\spwebtemplate.cs
 */
export enum WebTemplateType {
    invalid = -1,
    /** Team collaboration site */
    teamSite = 1,
    /** Meeting workspace site */
    meetings = 2,
    centralAdmin = 3,
    wiki = 4,
    blog = 9,
    tenantAdmin = 16,
    app = 17,
    appCatalog = 18,
    /** Mysite personal web */
    mySite = 21,
    subgroup = 39,
    mySiteHost = 54,
    group = 64,
    /** SITEPAGEPUBLISHING#0 aka Communications site */
    sitePagePublishing = 68,
}

/**
 * Returns true if the SPWeb Site is not ODB or Group site.
 */
export function isTeamSiteLike(template: WebTemplateType | string | number): boolean {
    'use strict';
    let templateEnum = <WebTemplateType>Number(template);
    return templateEnum	!== WebTemplateType.mySite && templateEnum !== WebTemplateType.group;
}

export default WebTemplateType;

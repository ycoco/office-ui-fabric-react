import WebTemplateType from '../../dataSources/web/WebTemplateType';

/**
 * Gets the id based on web template Enum.
 */
export const webTemplateEnumtoIdMap: {[key:number]:string} = {};
 webTemplateEnumtoIdMap[WebTemplateType.documentCenter] = "BDR#0";
webTemplateEnumtoIdMap[WebTemplateType.enterpriseWiki] = "ENTERWIKI#0";
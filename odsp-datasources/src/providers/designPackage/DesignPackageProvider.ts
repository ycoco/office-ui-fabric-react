import Guid from '@ms/odsp-utilities/lib/guid/Guid';
import WebTemplateType from '../../dataSources/web/WebTemplateType';
import { ISpPageContext } from '../../interfaces/ISpPageContext';
import IChromeOptions, { NavPlacementType } from '../../models/chrome/ChromeOptions';

/**
 * Client side representation of site design package data.
 * It includes chrome options, title, description, and supported web templates.
 */
export interface IDesignPackage {
  id: string;
  /* tslint:disable-next-line:no-any */
  chromeOptions: IChromeOptions;
  title: string;
  description: string;
  supportedTemplates: WebTemplateType[];
  /**
   * Optional. Indicates that this design package is a Formula
   * for the WebTemplateExtensions feature.
   */
  isFormula?: boolean;
}

/** Team Site Design Package ID */
export const TEAMSITE_DESIGNPACKAGEID: string = 'c8b3137a-ca4c-48a9-b356-a8e7987dd693';
/** Report Site Design Package ID */
export const REPORTSITE_DESIGNPACKAGEID: string = '96c933ac-3698-44c7-9f4a-5fd17d71af9e';
/** Portfolio Site Design Package ID */
export const PORTFOLIOSITE_DESIGNPACKAGEID: string = '6142d2a0-63a5-4ba0-aede-d9fefca2c767';
/** Blank Site Design Package ID */
export const BLANKSITE_DESIGNPACKAGEID: string = 'f6cc5403-0d63-442e-96c0-285923709ffc';

function _getTeamSiteDesignPackage(): IDesignPackage {
  return {
    id: TEAMSITE_DESIGNPACKAGEID,
    title: undefined,
    description: undefined,
    chromeOptions: {
      header: { hidden: false },
      nav: { hidden: false, placement: NavPlacementType.LEFT },
      footer: { hidden: false },
      search: { hidden: false }
    },
    supportedTemplates: [WebTemplateType.teamSite, WebTemplateType.group]
  };
};

function _getReportSiteDesignPackage(): IDesignPackage {
  return {
    id: REPORTSITE_DESIGNPACKAGEID,
    title: undefined,
    description: undefined,
    chromeOptions: {
      header: { hidden: false },
      nav: { hidden: false, placement: NavPlacementType.HORIZONTAL },
      footer: { hidden: false },
      search: { hidden: true }
    },
    supportedTemplates: [WebTemplateType.sitePagePublishing]
  };
};

function _getPortfolioSiteDesignPackage(): IDesignPackage {
  return {
    id: PORTFOLIOSITE_DESIGNPACKAGEID,
    title: undefined,
    description: undefined,
    chromeOptions: {
      header: { hidden: false },
      nav: { hidden: false, placement: NavPlacementType.HORIZONTAL },
      footer: { hidden: false },
      search: { hidden: true }
    },
    supportedTemplates: []
  };
};

function _getBlankSiteDesignPackage(): IDesignPackage {
  return {
    id: BLANKSITE_DESIGNPACKAGEID,
    title: undefined,
    description: undefined,
    chromeOptions: {
      header: { hidden: false },
      nav: { hidden: false, placement: NavPlacementType.HORIZONTAL },
      footer: { hidden: false },
      search: { hidden: true }
    },
    supportedTemplates: [WebTemplateType.sitePagePublishing]
  };
};

/** Mapping from WebTemplate to default DesignPackageId for that WebTemplate. */
const _templateToDesignPackageIdMap: { [webTemplate: string]: string } = {
  [WebTemplateType.teamSite]: TEAMSITE_DESIGNPACKAGEID,
  [WebTemplateType.group]: TEAMSITE_DESIGNPACKAGEID,
  [WebTemplateType.sitePagePublishing]: REPORTSITE_DESIGNPACKAGEID
};

/** Mapping from designPackageId to Design Package JSON lambda. */
const _idToDesignPackageMap: { [designPackageId: string]: () => IDesignPackage } = {
  [TEAMSITE_DESIGNPACKAGEID]: _getTeamSiteDesignPackage,
  [REPORTSITE_DESIGNPACKAGEID]: _getReportSiteDesignPackage,
  [PORTFOLIOSITE_DESIGNPACKAGEID]: _getPortfolioSiteDesignPackage,
  [BLANKSITE_DESIGNPACKAGEID]: _getBlankSiteDesignPackage
};

/**
 * Gets the current Design Package for this page context.
 * Note: must provide string resources due to horrendous code repository constraints.
 */
export function getDesignPackage(resources: IDesignPackageResources, pageContext: ISpPageContext): IDesignPackage {
  if (!pageContext) {
    throw new Error('pageContext missing');
  }

  if (!resources) {
    throw new Error('resources missing');
  }

  const designPackageId: string = _chooseDesignPackageId(pageContext);
  return _getDesignPackage(resources, designPackageId);
}

/**
 * Returns the set of all Design Packages that support the given web template.
 * Note: must provide string resources due to horrendous code repository constraints.
 */
export function getDesignPackagesForTemplate(resources: IDesignPackageResources, webTemplate: WebTemplateType): IDesignPackage[] {
  let supportingDesignPackages: IDesignPackage[] = [];

  for (let designPackageId in _idToDesignPackageMap) {
    let designPackage: IDesignPackage = _getDesignPackage(resources, designPackageId);
    if (designPackage.supportedTemplates.indexOf(webTemplate) > -1) {
      supportingDesignPackages.push(designPackage);
    }
  }

  return supportingDesignPackages;
}

/**
 * Decides on the design package ID based on the current page context. Specifically, it takes into account
 * the current web's design package ID and web template. It has a fallback for any web template.
 *
 * public only for testing purposes
 */
export function _chooseDesignPackageId(pageContext: ISpPageContext): string {
  let designPackageId: string = Guid.Empty;
  // try getting it from _spPageContextInfo
  // if third party were enabled, we would have to wait for the design package manifest to return here
  if (pageContext.DesignPackageId && _hasFirstPartyDesignPackage(pageContext.DesignPackageId)) {
    designPackageId = pageContext.DesignPackageId;
  }
  // if _spPageContextInfo doesn't have a design package ID set, get the default for the web template
  if (designPackageId === Guid.Empty && _templateToDesignPackageIdMap[pageContext.webTemplate] !== undefined) {
    designPackageId = _templateToDesignPackageIdMap[pageContext.webTemplate];
  }
  // if this web template doesn't have a default design package ID, go with the Team site one
  if (designPackageId === Guid.Empty) {
    designPackageId = TEAMSITE_DESIGNPACKAGEID;
  }

  return designPackageId;
}

/**
 * Returns true if the given ID corresponds to a first-party Design Package, false otherwise.
 */
function _hasFirstPartyDesignPackage(id: string): boolean {
  return _idToDesignPackageMap[id] !== undefined;
}

/**
 * Retrieves the design package and gets the resources for it.
 */
function _getDesignPackage(resources: IDesignPackageResources, designPackageId: string): IDesignPackage {
  function _assignResources(designPackage: IDesignPackage, title: string, description: string): void {
    designPackage.title = title;
    designPackage.description = description;
  }

  const designPackage: IDesignPackage = _idToDesignPackageMap[designPackageId]();
  switch(Guid.normalizeLower(designPackageId))
  {
    case TEAMSITE_DESIGNPACKAGEID:
      _assignResources(designPackage, resources.teamSiteTitle, resources.teamSiteDescription);
      break;
    case REPORTSITE_DESIGNPACKAGEID:
      _assignResources(designPackage, resources.reportSiteTitle, resources.reportSiteDescription);
      break;
    case PORTFOLIOSITE_DESIGNPACKAGEID:
      _assignResources(designPackage, resources.portfolioSiteTitle, resources.portfolioSiteDescription);
      break;
    case BLANKSITE_DESIGNPACKAGEID:
      _assignResources(designPackage, resources.blankSiteTitle, resources.blankSiteDescription);
      break;
    default:
      throw new Error('Invalid DesignPackageId: ' + designPackageId)
  }
  return designPackage
}

/**
 * The set of string resources required for Design Packages, which must be passed in
 * due to horrendous code repository constraints.
 */
export interface IDesignPackageResources {
  teamSiteTitle: string;
  teamSiteDescription: string;

  reportSiteTitle: string;
  reportSiteDescription: string;

  portfolioSiteTitle: string;
  portfolioSiteDescription: string;

  blankSiteTitle: string;
  blankSiteDescription: string;
}

export interface IDesignPackageAssets {
    reportSitePreviewUrl: string,
    portfolioSitePreviewUrl: string,
    blankSitePreviewUrl: string,
    teamSitePreviewUrl?: string
}

export default IDesignPackage;
/// <reference types="mocha" />
import * as chai from 'chai';
import IDesignPackage, * as DesignPackageProvider from './DesignPackageProvider';
import WebTemplateType from '../../dataSources/web/WebTemplateType';
import { MockSpPageContext } from './../../mocks/MockSpPageContext';

const assert = chai.assert;

describe('DesignPackage tests', () => {
  const resources: DesignPackageProvider.IDesignPackageResources = {
    teamSiteTitle: "***teamSiteTitle",
    teamSiteDescription: "***teamSiteDescription",

    reportSiteTitle: "***reportSiteTitle",
    reportSiteDescription: "***reportSiteDescription",

    portfolioSiteTitle: "***portfolioSiteTitle",
    portfolioSiteDescription: "***portfolioSiteDescription",

    blankSiteTitle: "***blankSiteTitle",
    blankSiteDescription: "***blankSiteDescription"
  };
  let pageContext: MockSpPageContext;
  beforeEach(() => {
    pageContext = new MockSpPageContext();
  });

  describe('_chooseDesignPackage', () => {
    it('prefers context designPackageId over template default', (done: MochaDone) => {
      pageContext.DesignPackageId = DesignPackageProvider.REPORTSITE_DESIGNPACKAGEID
      pageContext.webTemplate = WebTemplateType.teamSite.toString();
      assert.isTrue(DesignPackageProvider._chooseDesignPackageId(pageContext) === DesignPackageProvider.REPORTSITE_DESIGNPACKAGEID);

      pageContext.DesignPackageId = DesignPackageProvider.TEAMSITE_DESIGNPACKAGEID;
      pageContext.webTemplate = WebTemplateType.sitePagePublishing.toString();
      assert.isTrue(DesignPackageProvider._chooseDesignPackageId(pageContext) === DesignPackageProvider.TEAMSITE_DESIGNPACKAGEID);

      done();
    });

    it('chooses the correct default for each template', (done: MochaDone) => {
      pageContext.DesignPackageId = undefined;

      pageContext.webTemplate = WebTemplateType.teamSite.toString();
      assert.isTrue(DesignPackageProvider._chooseDesignPackageId(pageContext) === DesignPackageProvider.TEAMSITE_DESIGNPACKAGEID);

      pageContext.webTemplate = WebTemplateType.sitePagePublishing.toString();
      assert.isTrue(DesignPackageProvider._chooseDesignPackageId(pageContext) === DesignPackageProvider.REPORTSITE_DESIGNPACKAGEID);

      pageContext.webTemplate = WebTemplateType.group.toString();
      assert.isTrue(DesignPackageProvider._chooseDesignPackageId(pageContext) === DesignPackageProvider.TEAMSITE_DESIGNPACKAGEID);

      pageContext.webTemplate = '34'/* not a normal template ID */;
      assert.isTrue(DesignPackageProvider._chooseDesignPackageId(pageContext) === DesignPackageProvider.TEAMSITE_DESIGNPACKAGEID);

      done();
    });
  });
  
  describe('getDesignPackage', () => {
    it('does not allow undefined or null parameters', (done: MochaDone) => {
      assert.throws(() => { DesignPackageProvider.getDesignPackage(undefined, undefined) }, Error);

      done();
    });

    it('returns with resources', (done: MochaDone) => {
      pageContext.DesignPackageId = DesignPackageProvider.TEAMSITE_DESIGNPACKAGEID;
      let designPackage: IDesignPackage = DesignPackageProvider.getDesignPackage(resources, pageContext); 
      assert.equal(designPackage.title, resources.teamSiteTitle)
      assert.equal(designPackage.description, resources.teamSiteDescription);

      pageContext.DesignPackageId = DesignPackageProvider.REPORTSITE_DESIGNPACKAGEID;
      designPackage = DesignPackageProvider.getDesignPackage(resources, pageContext);
      assert.equal(designPackage.title, resources.reportSiteTitle)
      assert.equal(designPackage.description, resources.reportSiteDescription);

      pageContext.DesignPackageId = DesignPackageProvider.PORTFOLIOSITE_DESIGNPACKAGEID;
      designPackage = DesignPackageProvider.getDesignPackage(resources, pageContext);
      assert.equal(designPackage.title, resources.portfolioSiteTitle)
      assert.equal(designPackage.description, resources.portfolioSiteDescription);

      pageContext.DesignPackageId = DesignPackageProvider.BLANKSITE_DESIGNPACKAGEID;
      designPackage = DesignPackageProvider.getDesignPackage(resources, pageContext);
      assert.equal(designPackage.title, resources.blankSiteTitle)
      assert.equal(designPackage.description, resources.blankSiteDescription);

      done();
    });
  });

  describe('getDesignPackagesForTemplate', () => {
    it('returns empty for nonsupported templates', (done: MochaDone) => {
      assert.lengthOf(DesignPackageProvider.getDesignPackagesForTemplate(resources, WebTemplateType.mySite), 0);

      done();
    });

    it('returns non-empty for supported templates', (done: MochaDone) => {
      assert.isAtLeast(DesignPackageProvider.getDesignPackagesForTemplate(resources, WebTemplateType.group).length, 1);
      assert.isAtLeast(DesignPackageProvider.getDesignPackagesForTemplate(resources, WebTemplateType.teamSite).length, 1);
      assert.isAtLeast(DesignPackageProvider.getDesignPackagesForTemplate(resources, WebTemplateType.sitePagePublishing).length, 1);

      done();
    });
  });
});
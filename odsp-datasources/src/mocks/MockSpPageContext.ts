import ISpPageContext from './../interfaces/ISpPageContext';

/**
 * Mock implementation of ISpPageContext to serve testing purposes.
 */
export class MockSpPageContext implements ISpPageContext {

    // NOTE: Be extremely careful about modifying any of the values in here - you likely will break some
    //       unit tests that are using the values down here.
    //       A change to an existing value should be treated as a breaking change.

    public currentLanguage: number = 1033;
    public currentUICultureName: string = 'en-US';
    public env: string = 'Mock';
    public DesignPackageId: string = '00000000-0000-0000-0000-000000000000';
    public groupAlias: string = undefined;
    public groupId: string = undefined;
    public groupType: string = undefined;
    public guestsEnabled = true;
    public hasManageWebPermissions: boolean = true;
    public isAnonymousGuestUser = false;
    public isSiteAdmin: boolean = true;
    public layoutsUrl: string = '_layouts/15';
    public listBaseTemplate: number = 119;
    public listId: string = '{425bc5c0-37d7-4f65-8ccd-eeffc7b0275b}';
    public serverRequestPath: string = 'home.aspx';
    public siteAbsoluteUrl: string = 'https://microsoft.sharepoint.com/teams/odsp';
    public siteClientTag: string = '0$$16.0.4524.1209';
    public systemUserKey: string = 'i:0h.f|membership|1224afed8160213e@live.com';
    public userDisplayName: string = 'Ilango Rengaramanujam';
    public userId: number = 4;
    public userLoginName: string = 'ilango@microsoft.com';
    public viewId: string = '0';
    public webAbsoluteUrl: string = 'https://microsoft.sharepoint.com/teams/odsp/design';
    public webDescription: string = "This is a mock site.";
    public webId: string = '{9a37a0e9-d80e-4563-880d-141457f0710a}';
    public webLogoUrl: string = '_layouts/15/images/siteicon.png';
    public webServerRelativeUrl: string = '/teams/odsp/design';
    public webTemplate: string = '22';
    public webTitle: string = 'My Mock Site';
}

export default MockSpPageContext;

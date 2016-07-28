import IContext from './../interfaces/IContext.ts';

/**
 * Mock implementation of IContext to serve testing purposes.
 */
class MockContext implements IContext {
    public currentLanguage: number = 1033;
    public currentUICultureName: string = 'en-US';
    public env: string = 'Mock';
    public groupAlias: string = undefined;
    public groupId: string = undefined;
    public groupType: string = undefined;
    public guestsEnabled = true;
    public hasManageWebPermissions: boolean = true;
    public isAnonymousGuestUser = false;
    public isCustomList: boolean = false;
    public isSiteAdmin: boolean = true;
    public layoutsUrl: string = '_layouts/15';
    public listBaseTemplate: number = 119;
    public listId: string = '{425bc5c0-37d7-4f65-8ccd-eeffc7b0275b}';
    public serverRequestPath: string = 'home.aspx';
    public siteClientTag: string = '0$$16.0.4524.1209';
    public systemUserKey: string = 'i:0h.f|membership|1224afed8160213e@live.com';
    public userDisplayName: string = 'Ilango Rengaramanujam';
    public userId: string = '4';
    public userLoginName: string = 'ilango@microsoft.com';
    public viewId: string = '0';
    public webAbsoluteUrl: string = 'https://microsoft-my.server.com/personal/example';
    public webLogoUrl: string = '_layouts/15/images/siteicon.png';
    public webServerRelativeUrl: string = '/personal/example';
    public webTemplate: string = '22';
    public webTitle: string = 'My Mock Site';
}

export default MockContext;

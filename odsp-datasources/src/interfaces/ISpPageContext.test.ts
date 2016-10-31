import * as chai from 'chai';
import { getServerUrl, getSafeWebServerRelativeUrl } from './ISpPageContext';

const { expect } = chai;

describe('SpPageContext', () => {
    describe('getServerUrl', () => {
        it('works with root site', () => {
            let pageContext = {
                webAbsoluteUrl: 'http://elcraig-dev3',
                // webServerRelativeUrl comes from the server as / for the root site
                webServerRelativeUrl: '/'
            };
            expect(getServerUrl(pageContext)).to.equal('http://elcraig-dev3');

            pageContext = {
                webAbsoluteUrl: 'http://elcraig-dev3',
                // not actually what server does, but doesn't hurt to handle it
                webServerRelativeUrl: ''
            };
            expect(getServerUrl(pageContext)).to.equal('http://elcraig-dev3');

            pageContext = {
                webAbsoluteUrl: 'https://microsoft.sharepoint.com',
                webServerRelativeUrl: '/'
            };
            expect(getServerUrl(pageContext)).to.equal('https://microsoft.sharepoint.com');
        });

        it('works with subsite of root', () => {
            let pageContext = {
                webAbsoluteUrl: 'https://microsoft.sharepoint.com/test',
                webServerRelativeUrl: '/test'
            };
            expect(getServerUrl(pageContext)).to.equal('https://microsoft.sharepoint.com');

            // special case: subsite name is same as tenant's subdomain
            pageContext = {
                webAbsoluteUrl: 'https://microsoft.sharepoint.com/microsoft',
                webServerRelativeUrl: '/microsoft'
            };
            expect(getServerUrl(pageContext)).to.equal('https://microsoft.sharepoint.com');
        });

        it('works in general case', () => {
            let pageContext = {
                webAbsoluteUrl: 'https://microsoft.sharepoint.com/teams/elcraigtest',
                webServerRelativeUrl: '/teams/elcraigtest'
            };
            expect(getServerUrl(pageContext)).to.equal('https://microsoft.sharepoint.com');

            pageContext = {
                webAbsoluteUrl: 'https://microsoft.sharepoint.com/teams/elcraigtest/test',
                webServerRelativeUrl: '/teams/elcraigtest/test'
            };
            expect(getServerUrl(pageContext)).to.equal('https://microsoft.sharepoint.com');
        });
    });

    describe('getSafeWebServerRelativeUrl', () => {
        it('works with root site', () => {
            let pageContext = {
                // webServerRelativeUrl comes from the server as / for the root site
                webServerRelativeUrl: '/'
            };
            expect(getSafeWebServerRelativeUrl(pageContext)).to.equal('');

            pageContext = {
                // not actually what server does, but doesn't hurt to handle it
                webServerRelativeUrl: ''
            };
            expect(getSafeWebServerRelativeUrl(pageContext)).to.equal('');
        });

        it('works in general case', () => {
            let pageContext = {
                webServerRelativeUrl: '/teams/elcraigtest'
            };
            expect(getSafeWebServerRelativeUrl(pageContext)).to.equal('/teams/elcraigtest');
        });
    });
});

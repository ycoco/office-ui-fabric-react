import * as chai from 'chai';
import * as sinon from 'sinon';
import { MockSpPageContext } from './../../mocks/MockSpPageContext';
import { FollowDataSource } from './FollowDataSource';

const expect = chai.expect;

class TestFollowDataSource extends FollowDataSource {
    public needsRequestDigest(url: string) {
        return false;
    }
}

describe("FollowDataSource", () => {
    let requests = [];
    let server: sinon.SinonFakeServer;
    let responseVal: any;
    let pageContext: MockSpPageContext;
    let followDataSource: TestFollowDataSource;
    before(() => {

        pageContext = new MockSpPageContext();
        server = sinon.fakeServer.create();
        server.autoRespond = true;
        server.respondImmediately = true;
        responseVal = 'OK';
        server.respondWith((req) => {
            requests.push(req);
            let toResponse = req.url.indexOf(pageContext.webAbsoluteUrl) != -1 ? '{"d":{"IsFollowingFeatureEnabled":true}}' : '{"d":{"IsFollowingFeatureEnabled":false}}';
            req.respond(200, { 'Content-Type': 'application/text' }, toResponse);
        });
    });

    after(() => {
        server.restore();
    });

    it('caches results for isFollowFeatureEnabled for the SPWeb correctly', (done) => {
        followDataSource = new TestFollowDataSource(pageContext);
        followDataSource.isFollowFeatureEnabled().then((result) => {
            expect(result).equals(true);
            expect(requests, '#Requests after initial call to isFollowFeatureEnabled').to.have.lengthOf(1);
            followDataSource = new TestFollowDataSource(pageContext);
            return followDataSource.isFollowFeatureEnabled();
        }).then((result) => {
            expect(result).equals(true);
            // should be cached and not make another request
            expect(requests, '#Requests after second call to isFollowFeatureEnabled').to.have.lengthOf(1);
            followDataSource = new TestFollowDataSource(
                {
                    ...pageContext,
                    webAbsoluteUrl: 'https://microsoft.sharepoint.com/teams/odsp/engineering',
                    webId: '{9a37a0e9-e08d-1234-880d-141457f0701b}'
                }
            );

            return followDataSource.isFollowFeatureEnabled();
        }).then((result) => {
            expect(result).equals(false);
            // should make another request
            expect(requests).to.have.lengthOf(2);
        }).done(done, done);
    });
});

import { FollowDataSource } from '@ms/odsp-datasources/lib/Follow';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import * as sinon from 'sinon';

export class MockFollowDataSource extends FollowDataSource {
  constructor(private _isFollowing: boolean) {
    super(null);
    this.followSite = sinon.stub().returns(Promise.wrap(null));
    this.unfollowSite = sinon.stub().returns(Promise.wrap(null));
  }

  /**
   * @override
   */
  public isSiteFollowed(webUrl: string, onlyCache?: boolean, bypassCache?: boolean): Promise<boolean> {
    return Promise.wrap(this._isFollowing);
  }
}

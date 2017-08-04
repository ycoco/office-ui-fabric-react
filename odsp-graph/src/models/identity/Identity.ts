
import {
    IThumbnailSet
} from '../thumbnail/Thumbnail';

export interface IIdentity {
    id?: string;
    email?: string;
    displayName: string;
    thumbnails?: IThumbnailSet;
}

export interface IIdentitySet {
    user?: IIdentity;
    application?: IIdentity;
    device?: IIdentity;
}

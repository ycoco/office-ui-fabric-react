import { IUploader, UPLOADSTATE_CHANGE } from './IUploader';
import { UploadState } from './Upload';
import { UploadError } from './UploadError';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';

export abstract class BaseUploader implements IUploader {
    public state: UploadState;
    public error: UploadError;

    private _events: EventGroup;

    constructor() {
        this._events = new EventGroup(this);
    }

    public start() {
        // must override in sub-classes
    }

    public abort() {
        // must override in sub-classes
    }

    protected updateState(state: UploadState) {
        if (state !== this.state) {
            this.state = state;
            this._events.raise(UPLOADSTATE_CHANGE, state);
        }
    }
}

export default BaseUploader;
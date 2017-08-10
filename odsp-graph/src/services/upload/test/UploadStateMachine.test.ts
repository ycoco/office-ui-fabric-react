
import {
    UploadStateMachine,
    IUploadConfiguration,
    IUploadState
} from '../UploadStateMachine';
import { ActivityBandwidthVerifier, IActivityBandwidthVerifierParams } from '../ActivityBandwidthVerifier';
import {
    UploadService,
    ICreateSessionResponse,
    IGetUploadStatusResponse,
    ConflictBehavior,
    IUploadFragmentResponse,
    ICreateSessionParams,
    IUploadFragmentParams,
    ICommitParams
} from '../UploadService';
import { IItem } from '../../../models/item/Item';
import { GraphError } from '../../../models/error/Error';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Signal from '@ms/odsp-utilities/lib/async/Signal';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('UploadStateMachine', () => {
    const FILE_SIZE = 8 * 60 * 1024 * 1024; // 320 MB; the max fragment size is 60 MB
    const FILE_NAME = 'test';
    const FOLDER_URL = 'https://graph/item';
    const ITEM_ETAG = 'A!14.1';

    const ITEM_ID = 'B!12';
    const DRIVE_ID = 'CID';
    const ITEM = <IItem>{
        id: ITEM_ID,
        parentReference: {
            driveId: DRIVE_ID
        }
    };

    let uploadStateMachine: UploadStateMachine;

    let createSessionSpy: sinon.SinonSpy;
    let pendingCreateSession: Signal<ICreateSessionResponse>;

    let uploadFragmentSpy: sinon.SinonSpy;
    let pendingUploadFragment: Signal<IUploadFragmentResponse | IItem>;

    let commitSpy: sinon.SinonSpy;
    let pendingCommit: Signal<IItem>;

    let getStatusSpy: sinon.SinonSpy;
    let pendingGetStatus: Signal<IGetUploadStatusResponse>;

    let cancelSessionSpy: sinon.SinonSpy;
    let pendingCancelSession: Signal<void>;

    let onProgressStub: sinon.SinonStub;
    let onWaitSpy: sinon.SinonSpy;
    let onPromptForConflictBehaviorSpy: sinon.SinonSpy;

    let pendingConflictBehavior: Signal<ConflictBehavior>;
    let conflictBehaviorPrompt: Signal<GraphError>;

    let doesActivityHaveRemainingCapacityStub: sinon.SinonStub;
    let didActivityHaveExtraCapacityStub: sinon.SinonStub;

    let file: File = <any>{
        slice: (start: number, end: number) => ({
            start: start,
            end: end,
            size: end - start
        }),
        size: FILE_SIZE
    };

    beforeEach(() => {
        createSessionSpy = sinon.spy(() => {
            pendingCreateSession = new Signal<ICreateSessionResponse>();
            return pendingCreateSession.getPromise();
        });
        uploadFragmentSpy = sinon.spy(() => {
            pendingUploadFragment = new Signal<IUploadFragmentResponse | IItem>();
            return pendingUploadFragment.getPromise();
        });
        commitSpy = sinon.spy(() => {
            pendingCommit = new Signal<IItem>();
            return pendingCommit.getPromise();
        });
        getStatusSpy = sinon.spy(() => {
            pendingGetStatus = new Signal<IGetUploadStatusResponse>();
            return pendingGetStatus.getPromise();
        });
        cancelSessionSpy = sinon.spy(() => {
            pendingCancelSession = new Signal<void>();
            return pendingCancelSession.getPromise();
        });

        conflictBehaviorPrompt = new Signal<GraphError>();

        onProgressStub = sinon.stub();
        onWaitSpy = sinon.spy((duration: number) => Promise.wrap<void>());
        onPromptForConflictBehaviorSpy = sinon.spy((error: GraphError) => {
            conflictBehaviorPrompt.complete(error);

            pendingConflictBehavior = new Signal<ConflictBehavior>();

            return pendingConflictBehavior.getPromise();
        });

        const uploadService: UploadService = <any>{
            createSession: createSessionSpy,
            uploadFragment: uploadFragmentSpy,
            commit: commitSpy,
            getStatus: getStatusSpy,
            cancelSession: cancelSessionSpy
        };

        doesActivityHaveRemainingCapacityStub = sinon.stub();
        doesActivityHaveRemainingCapacityStub.returns(true);

        didActivityHaveExtraCapacityStub = sinon.stub();
        didActivityHaveExtraCapacityStub.returns(false);

        const activityBandwidthVerifier: ActivityBandwidthVerifier = <any>{
            doesActivityHaveRemainingCapacity: doesActivityHaveRemainingCapacityStub,
            didActivityHaveExtraCapacity: didActivityHaveExtraCapacityStub
        };

        const activityBandwidthVerifierType: new (params: IActivityBandwidthVerifierParams) => ActivityBandwidthVerifier = <any>(() => activityBandwidthVerifier);

        uploadStateMachine = new UploadStateMachine({}, {
            activityBandwidthVerifierType: activityBandwidthVerifierType,
            uploadService: uploadService,
            useCommitForUpload: true
        });
    });

    describe('#advanceState', () => {
        let configuration: IUploadConfiguration;
        let initialState: IUploadState;
        let finalState: IUploadState;

        const SESSION_URL = 'session://test';

        let nextState: Promise<void>;

        beforeEach(() => {
            configuration = {
                qosData: {
                    uploadId: '1'
                },
                content: file,
                fileName: FILE_NAME,
                itemUrl: FOLDER_URL,
                eTag: ITEM_ETAG,
                onWait: onWaitSpy,
                onProgress: onProgressStub,
                onPromptForConfictBehavior: onPromptForConflictBehaviorSpy
            };

            initialState = {};
        });

        function advanceState(): void {
            nextState = uploadStateMachine.advanceState(configuration, initialState).then((state: IUploadState) => {
                finalState = state;
            });
        }

        describe('with no session', () => {
            let createSessionParams: ICreateSessionParams;

            beforeEach(() => {
                initialState = {
                    conflictBehavior: 'replace'
                };

                advanceState();

                createSessionParams = createSessionSpy.args[0][0];
            });

            it('creates a session', () => {
                const {
                    itemUrl,
                    fileName,
                    conflictBehavior,
                    eTag
                } = createSessionParams;

                expect(itemUrl).to.equal(FOLDER_URL);
                expect(fileName).to.equal(FILE_NAME);
                expect(conflictBehavior).to.equal('replace');
                expect(eTag).to.equal(ITEM_ETAG);
            });

            describe('when the session is created', () => {
                beforeEach(() => {
                    pendingCreateSession.complete({
                        uploadUrl: SESSION_URL,
                        nextExpectedRanges: ['blah-blah'],
                        expirationDateTime: ''
                    });

                    return nextState;
                });

                it('sets session URL', () => {
                    expect(finalState.sessionUrl).to.equal(SESSION_URL);
                });

                it('sets next expected ranges', () => {
                    expect(finalState.nextExpectedRanges).to.deep.equal(['blah-blah']);
                });
            });
        });

        describe('with an unbounded next expected range', () => {
            let uploadFragmentParams: IUploadFragmentParams;

            const MAX_FRAGMENT_SIZE = 60 * 1024 * 1024;

            beforeEach(() => {
                initialState = {
                    conflictBehavior: 'replace',
                    sessionUrl: SESSION_URL,
                    nextExpectedRanges: [`0-`],
                    speed: 1
                };

                advanceState();

                uploadFragmentParams = uploadFragmentSpy.args[0][0];
            });

            it('uploads a fragment', () => {
                const {
                    sessionUrl,
                    fileSize,
                    startByte,
                    endByte,
                    content,
                    timeout
                } = uploadFragmentParams;

                expect(sessionUrl).to.equal(SESSION_URL);
                expect(fileSize).to.equal(FILE_SIZE);
                expect(startByte).to.equal(0);
                expect(endByte).to.equal(MAX_FRAGMENT_SIZE);
                expect(content).to.deep.equal(file.slice(0, MAX_FRAGMENT_SIZE));
                expect(timeout).to.equal(60 * 1000);
            });

            describe('when there is more to upload', () => {
                beforeEach(() => {
                    pendingUploadFragment.complete({
                        nextExpectedRanges: ['blah-blah'],
                        expirationDateTime: ''
                    });

                    return nextState;
                });

                it('updates next expected ranges', () => {
                    expect(finalState.nextExpectedRanges).to.deep.equal(['blah-blah']);
                });

                it('preserves the speed', () => {
                    expect(finalState.speed).to.equal(1);
                });
            });

            describe('when the upload is complete', () => {
                beforeEach(() => {
                    pendingUploadFragment.complete(ITEM);

                    return nextState;
                });

                it('sets the item', () => {
                    expect(finalState.item).to.deep.equal(ITEM);
                });
            });

            describe('when the session has expired', () => {
                const ERROR = new GraphError(new Error(), {
                    status: 404
                });

                beforeEach(() => {
                    pendingUploadFragment.error(ERROR);

                    return nextState;
                });

                it('clears the error', () => {
                    expect(finalState.error).equals(undefined);
                });

                it('clears the session URL', () => {
                    expect(finalState.sessionUrl).equals(undefined);
                });
            });

            describe('when there is a version mismatch', () => {
                const ERROR = new GraphError(new Error(), {
                    status: 412
                });

                let promptError: GraphError;

                beforeEach(() => {
                    pendingUploadFragment.error(ERROR);

                    return conflictBehaviorPrompt.getPromise().then((error: GraphError) => {
                        promptError = error;
                    });
                });

                it('passes the error to the prompt', () => {
                    expect(promptError).to.equal(ERROR);
                });

                describe('when the conflict is resolved', () => {
                    beforeEach(() => {
                        pendingConflictBehavior.complete('rename');

                        return nextState;
                    });

                    it('clears the error', () => {
                        expect(finalState.error).equals(undefined);
                    });

                    it('sets the conflict behavior', () => {
                        expect(finalState.conflictBehavior).to.equal('rename');
                    });
                });
            });

            describe('when there is a name conflict', () => {
                const ERROR = new GraphError(new Error(), {
                    status: 409
                });

                let promptError: GraphError;

                beforeEach(() => {
                    pendingUploadFragment.error(ERROR);

                    return conflictBehaviorPrompt.getPromise().then((error: GraphError) => {
                        promptError = error;
                    });
                });

                it('passes the error to the prompt', () => {
                    expect(promptError).to.equal(ERROR);
                });

                describe('when the conflict is resolved', () => {
                    beforeEach(() => {
                        pendingConflictBehavior.complete('rename');

                        return nextState;
                    });

                    it('clears the error', () => {
                        expect(finalState.error).equals(undefined);
                    });

                    it('sets the conflict behavior', () => {
                        expect(finalState.conflictBehavior).to.equal('rename');
                    });
                });
            });

            describe('when the rate becomes unacceptable', () => {
                beforeEach(() => {
                    doesActivityHaveRemainingCapacityStub.withArgs(123).returns(false);

                    uploadFragmentParams.onProgress(123);

                    return nextState;
                });

                it('halves the fragment size', () => {
                    expect(finalState.speed).to.equal(1 / 2);
                });
            });

            describe('when there is any other error', () => {
                const ERROR = new GraphError(new Error(), {
                    status: 499
                });

                beforeEach(() => {
                    pendingUploadFragment.error(ERROR);

                    return nextState;
                });

                it('sets the error', () => {
                    expect(finalState.error).to.equal(ERROR);
                });
            });
        });

        describe('with a bounded next expected range', () => {
            let uploadFragmentParams: IUploadFragmentParams;

            const START_BYTE = 1024;
            const END_BYTE = 2048;

            beforeEach(() => {
                initialState = {
                    conflictBehavior: 'replace',
                    sessionUrl: SESSION_URL,
                    nextExpectedRanges: [`${START_BYTE}-${END_BYTE - 1}`]
                };

                advanceState();

                uploadFragmentParams = uploadFragmentSpy.args[0][0];
            });

            it('uploads a fragment', () => {
                const {
                    startByte,
                    endByte,
                    content
                } = uploadFragmentParams;

                expect(startByte).to.equal(START_BYTE);
                expect(endByte).to.equal(END_BYTE);
                expect(content).to.deep.equal(file.slice(START_BYTE, END_BYTE));
            });
        });

        describe('with a minimum fragment size', () => {
            let uploadFragmentParams: IUploadFragmentParams;

            const MIN_FRAGMENT_SIZE = 32 * 1024;

            beforeEach(() => {
                initialState = {
                    conflictBehavior: 'replace',
                    sessionUrl: SESSION_URL,
                    speed: 1 / 1920,
                    nextExpectedRanges: [`0-`]
                };

                advanceState();

                uploadFragmentParams = uploadFragmentSpy.args[0][0];
            });

            it('uploads a fragment', () => {
                const {
                    startByte,
                    endByte,
                    content
                } = uploadFragmentParams;

                expect(startByte).to.equal(0);
                expect(endByte).to.equal(MIN_FRAGMENT_SIZE);
                expect(content).to.deep.equal(file.slice(0, MIN_FRAGMENT_SIZE));
            });

            describe('when the rate becomes unacceptable', () => {
                beforeEach(() => {
                    const lastByte = 123;

                    doesActivityHaveRemainingCapacityStub.withArgs(lastByte).returns(false);

                    // This should have no effect since the speed is the minimum.
                    uploadFragmentParams.onProgress(lastByte);

                    pendingUploadFragment.complete({
                        nextExpectedRanges: ['blah-blah'],
                        expirationDateTime: ''
                    });

                    return nextState;
                });

                it('preserves the fragment size', () => {
                    expect(finalState.speed).to.equal(1 / 1920);
                });

                it('still uploads a fragment', () => {
                    expect(finalState.nextExpectedRanges).to.deep.equal(['blah-blah']);
                });
            });

            describe('when the rate was plenty fast', () => {
                beforeEach(() => {
                    didActivityHaveExtraCapacityStub.returns(true);

                    pendingUploadFragment.complete({
                        nextExpectedRanges: ['blah-blah'],
                        expirationDateTime: ''
                    });

                    return nextState;
                });

                it('increases the fragment size', () => {
                    expect(finalState.speed).to.equal(1 / 1920 * Math.pow(2, 1 / 4));
                });
            });
        });

        describe('when there are no more expected ranges', () => {
            let commitParams: ICommitParams;

            beforeEach(() => {
                initialState = {
                    conflictBehavior: 'replace',
                    nextExpectedRanges: [],
                    sessionUrl: SESSION_URL
                };

                advanceState();

                commitParams = commitSpy.args[0][0];
            });

            it('commits the session', () => {
                const {
                    itemUrl,
                    fileName,
                    sessionUrl,
                    conflictBehavior
                } = commitParams;

                expect(itemUrl).to.equal(FOLDER_URL);
                expect(fileName).to.equal(FILE_NAME);
                expect(sessionUrl).to.equal(SESSION_URL);
                expect(conflictBehavior).to.equal('replace');
            });

            describe('when the commit succeeds', () => {
                beforeEach(() => {
                    pendingCommit.complete(ITEM);

                    return nextState;
                });

                it('updates the item', () => {
                    expect(finalState.item).to.deep.equal(ITEM);
                });
            });

            describe('when the session has failed', () => {
                beforeEach(() => {
                    pendingCommit.error(new GraphError(new Error(), {
                        status: 410,
                        response: {
                            error: {
                                code: 'uploadSessionFailed'
                            }
                        }
                    }));

                    return nextState;
                });

                it('clears the error', () => {
                    expect(finalState.error).equals(undefined);
                });

                it('clears the session URL', () => {
                    expect(finalState.sessionUrl).equals(undefined);
                });
            });

            describe('when there is any other error', () => {
                const ERROR = new GraphError(new Error(), {
                    status: 499
                });

                beforeEach(() => {
                    pendingCommit.error(ERROR);

                    return nextState;
                });

                it('sets the error', () => {
                    expect(finalState.error).to.equal(ERROR);
                });
            });
        });
    });
});

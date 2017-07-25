
import graft, * as Graft from '../../../odsp-utilities/graft/Graft';
import { expect } from 'chai';

interface ITarget {
    id?: string;
    name?: string;
    displayName?: string;
    photo?: {
        width?: number;
        height?: number;
        originalUrl?: string;
    };
    size?: number;
    authors?: string[];
    editors?: string[];
    childCount?: number;
    thumbnail?: {
        width: number;
        height: number;
        src: string;
    };
}

describe('graft', () => {
    it('overrides and merges fields', () => {
        let base: ITarget = {
            id: 'test',
            name: 'Test item',
            photo: {
                width: 400,
                height: 300
            },
            authors: ['person1', 'person2'],
            childCount: 7
        };

        graft(base, {
            name: 'Renamed item',
            photo: {
                originalUrl: 'http://thumbnail/test.jpg'
            },
            authors: ['person3']
        });

        expect(base).to.deep.equal({
            id: 'test',
            name: 'Renamed item',
            photo: {
                width: 400,
                height: 300,
                originalUrl: 'http://thumbnail/test.jpg'
            },
            authors: ['person3'],
            childCount: 7
        });
    });

    it('reflects a new field', () => {
        let base: ITarget = {
            name: 'Test'
        };

        graft(base, {
            size: 3
        });

        expect(base).to.deep.equal({
            name: 'Test',
            size: 3
        });
    });

    it('reflects a new object', () => {
        let base: ITarget = {
            name: 'Test'
        };

        graft(base, {
            photo: {
                width: 400,
                height: 300
            }
        });

        expect(base).to.deep.equal({
            name: 'Test',
            photo: {
                width: 400,
                height: 300
            }
        });
    });

    it('reflects a new array', () => {
        let base: ITarget = {
            name: 'Test'
        };

        graft(base, {
            editors: [
                'person1',
                'person2'
            ]
        });

        expect(base).to.deep.equal({
            name: 'Test',
            editors: [
                'person1',
                'person2'
            ]
        });
    });
});

describe('Graft', () => {
    describe('#replace', () => {
        it('replaces a field', () => {
            let base: ITarget = {
                thumbnail: {
                    width: 400,
                    height: 300,
                    src: 'test'
                }
            };

            graft(base, {
                thumbnail: Graft.replace({
                    src: 'other'
                })
            });

            expect(base).to.deep.equal({
                thumbnail: {
                    src: 'other'
                }
            });
        });
    });

    describe('#optional', () => {
        it('optionally sets a field', () => {
            let base: ITarget = {
                name: 'Existing'
            };

            graft(base, {
                name: Graft.optional(undefined)
            });

            expect(base).to.deep.equal({
                name: 'Existing'
            });
        });
    });

    describe('#remove', () => {
        it('removes a field', () => {
            let base: ITarget = {
                name: 'Test',
                childCount: 7
            };

            graft(base, {
                childCount: Graft.remove<number>()
            });

            expect(base).to.deep.equal({
                name: 'Test'
            });
        });
    });

    describe('#backup', () => {
        it('supplies a missing field', () => {
            let base: ITarget = {
                name: 'Test'
            };

            graft(base, {
                displayName: Graft.backup('Backup')
            });

            expect(base).to.deep.equal({
                name: 'Test',
                displayName: 'Backup'
            });
        });

        it('ignores an existing field', () => {
            let base: ITarget = {
                name: 'Test',
                displayName: 'Existing'
            };

            graft(base, {
                displayName: Graft.backup('Backup')
            });

            expect(base).to.deep.equal({
                name: 'Test',
                displayName: 'Existing'
            });
        });
    });
});

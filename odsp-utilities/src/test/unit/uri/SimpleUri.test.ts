
import SimpleUri from '../../../odsp-utilities/uri/SimpleUri';
import { expect } from 'chai';

describe('SimpleUri', () => {
    describe('#authority', () => {
        it('handles relative', () => {
            expect(new SimpleUri('/').authority).to.equal('');
        });

        it('handles absolute without /', () => {
            expect(new SimpleUri('https://test').authority).to.equal('https://test');
        });

        it('handles absolute with /', () => {
            expect(new SimpleUri('https://test/').authority).to.equal('https://test');
        });

        it('handles bad scheme', () => {
            expect(new SimpleUri('/bad/scheme://').authority).to.equal('');
        });
    });

    describe('#path', () => {
        it('', () => {
            expect(new SimpleUri('https://test').path).to.equal('');
        });

        it('', () => {
            expect(new SimpleUri('/').path).to.equal('/');
        });

        it('', () => {
            expect(new SimpleUri('https://test/').path).to.equal('/');
        });

        it('', () => {
            expect(new SimpleUri('/bad/scheme://').path).to.equal('/bad/scheme://');
        });
    });

    describe('#segments', () => {
        it('', () => {
            expect(new SimpleUri('https://test').segments).to.deep.equal(['']);
        });

        it('', () => {
            expect(new SimpleUri('/').segments).to.deep.equal(['', '']);
        });

        it('', () => {
            expect(new SimpleUri('/foo').segments).to.deep.equal(['', 'foo']);
        });

        it('', () => {
            expect(new SimpleUri('/foo/').segments).to.deep.equal(['', 'foo', '']);
        });

        it('', () => {
            expect(new SimpleUri('/foo/bar').segments).to.deep.equal(['', 'foo', 'bar']);
        });

        it('', () => {
            expect(new SimpleUri('/bad/scheme://').segments).to.deep.equal(['', 'bad', 'scheme:', '', '']);
        });
    });
});

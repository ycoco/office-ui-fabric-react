import chai = require('chai');
import Guid from '../../../odsp-utilities/guid/Guid';

var expect = chai.expect;

describe('Guid', () => {
    it('generates valid GUIDs', () => {
        const guidRegex = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/;
        let lastGuid;
        for (let i = 0; i < 10; i++) {
            let guid = Guid.generate();
            expect(guid).to.not.equal(lastGuid, 'GUID is not unique');
            expect(guid).to.match(guidRegex);
            lastGuid = guid;
        }
    });

    const guidUpper = 'DBB7EA91-ABC3-4626-B6D5-24DDDC7E1676';
    const guidUpperBrackets = '{DBB7EA91-ABC3-4626-B6D5-24DDDC7E1676}';
    const guidLower = 'dbb7ea91-abc3-4626-b6d5-24dddc7e1676';
    const guidLowerBrackets = '{dbb7ea91-abc3-4626-b6d5-24dddc7e1676}';

    describe('normalizeLower', () => {
        it('handles invalid input', () => {
            expect(Guid.normalizeLower(null)).to.eq('');
            expect(Guid.normalizeLower(undefined)).to.eq('');
            expect(Guid.normalizeLower('')).to.eq('');
            // doesn't verify input is a GUID
            expect(Guid.normalizeLower('Hi')).to.eq('hi');
        });


        it('changes to lowercase', () => {
            expect(Guid.normalizeLower(guidLower)).to.eq(guidLower);
            expect(Guid.normalizeLower(guidUpper)).to.eq(guidLower);
        });

        it('removes brackets', () => {
            expect(Guid.normalizeLower(guidLowerBrackets)).to.eq(guidLower);
            expect(Guid.normalizeLower(guidUpperBrackets)).to.eq(guidLower);
        });

        it('adds/keeps brackets', () => {
            expect(Guid.normalizeLower(guidLowerBrackets, true)).to.eq(guidLowerBrackets);
            expect(Guid.normalizeLower(guidUpperBrackets, true)).to.eq(guidLowerBrackets);
            expect(Guid.normalizeLower(guidLower, true)).to.eq(guidLowerBrackets);
            expect(Guid.normalizeLower(guidUpper, true)).to.eq(guidLowerBrackets);
        });
    });

    describe('normalizeUpper', () => {
        it('handles invalid input', () => {
            expect(Guid.normalizeUpper(null)).to.eq('');
            expect(Guid.normalizeUpper(undefined)).to.eq('');
            expect(Guid.normalizeUpper('')).to.eq('');
            // doesn't verify input is a GUID
            expect(Guid.normalizeUpper('Hi')).to.eq('HI');
        });

        it('changes to lowercase', () => {
            expect(Guid.normalizeUpper(guidUpper)).to.eq(guidUpper);
            expect(Guid.normalizeUpper(guidLower)).to.eq(guidUpper);
        });

        it('removes brackets', () => {
            expect(Guid.normalizeUpper(guidUpperBrackets)).to.eq(guidUpper);
            expect(Guid.normalizeUpper(guidLowerBrackets)).to.eq(guidUpper);
        });

        it('adds/keeps brackets', () => {
            expect(Guid.normalizeUpper(guidUpperBrackets, true)).to.eq(guidUpperBrackets);
            expect(Guid.normalizeUpper(guidLowerBrackets, true)).to.eq(guidUpperBrackets);
            expect(Guid.normalizeUpper(guidUpper, true)).to.eq(guidUpperBrackets);
            expect(Guid.normalizeUpper(guidLower, true)).to.eq(guidUpperBrackets);
        });
    });
});

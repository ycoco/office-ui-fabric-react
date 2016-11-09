import { expect } from 'chai';

import DriveSpaceHelper from '../../../odsp-utilities/string/DriveSpaceHelper';

describe('FileSizeFormatter', () => {
    it('can ignore zero', () => {
        expect(DriveSpaceHelper.getDisplayString(0, { ignoreZero: true })).to.equal('');
    });

    it('can format 0 bytes', () => {
        expect(DriveSpaceHelper.getDisplayString(0)).to.equal('0 bytes');
    });

    it('can format a byte', () => {
        expect(DriveSpaceHelper.getDisplayString(1)).to.equal('1 byte');
    });

    it('can format 2 bytes', () => {
        expect(DriveSpaceHelper.getDisplayString(2)).to.equal('2 bytes');
    });

    it('can format 1023 bytes', () => {
        expect(DriveSpaceHelper.getDisplayString(1023)).to.equal('1023 bytes');
    });

    it('can format a kilobyte', () => {
        expect(DriveSpaceHelper.getDisplayString(1024)).to.equal('1 KB');
    });

    it('can format 1.22 kilobytes', () => {
        expect(DriveSpaceHelper.getDisplayString(1252)).to.equal('1.22 KB');
    });

    it('can format close enough megabyte', () => {
        expect(DriveSpaceHelper.getDisplayString(1024 * 1024 - 1)).to.equal('1.00 MB');
    });

    it('can format partial megabyte', () => {
        expect(DriveSpaceHelper.getDisplayString(1024 * 1024 - (1024 * 1024 / 100))).to.equal('0.99 MB');
    });

    it('can format a megabyte', () => {
        expect(DriveSpaceHelper.getDisplayString(1024 * 1024)).to.equal('1 MB');
    });

    it('can format a gigabyte', () => {
        expect(DriveSpaceHelper.getDisplayString(1024 * 1024 * 1024)).to.equal('1 GB');
    });

    it('can format a terabyte', () => {
        expect(DriveSpaceHelper.getDisplayString(1024 * 1024 * 1024 * 1024)).to.equal('1 TB');
    });

    it('can format correct precision for 456.789', () => {
        expect(DriveSpaceHelper.getDisplayString(456.789)).to.equal('457 bytes');
    });

    it('can format correct precision for 45.678', () => {
        expect(DriveSpaceHelper.getDisplayString(45.6789)).to.equal('45.7 bytes');
    });

    it('can format correct precision for 4.5678', () => {
        expect(DriveSpaceHelper.getDisplayString(4.5678)).to.equal('4.57 bytes');
    });

    it('does not trim non-zero decimals', () => {
        expect(DriveSpaceHelper.getDisplayString(4.067, { trimDecimal: true })).to.equal('4.07 bytes');
    });

    it('trims zero from after the decimal place', () => {
        expect(DriveSpaceHelper.getDisplayString(4.599, { trimDecimal: true })).to.equal('4.6 bytes');
        expect(DriveSpaceHelper.getDisplayString(4.999, { trimDecimal: true })).to.equal('5 bytes');
    });
});

import { expect } from 'chai';

import FileSizeFormatter = require('../../../odsp-utilities/string/FileSizeFormatter');

describe('FileSizeFormatter', () => {
    it('can format 0 bytes', () => {
        expect(FileSizeFormatter.formatSize(0)).to.equal('');
    });

    it('can format a byte', () => {
        expect(FileSizeFormatter.formatSize(1)).to.equal('1 byte');
    });

    it('can format 2 bytes', () => {
        expect(FileSizeFormatter.formatSize(2)).to.equal('2 bytes');
    });

    it('can format a kilobyte', () => {
        expect(FileSizeFormatter.formatSize(1024)).to.equal('1 KB');
    });

    it('can format 1.22 kilobytes', () => {
        expect(FileSizeFormatter.formatSize(1252)).to.equal('1.22 KB');
    });

    it('can format a megabyte', () => {
        expect(FileSizeFormatter.formatSize(1024 * 1024)).to.equal('1 MB');
    });

    it('can format a gigabyte', () => {
        expect(FileSizeFormatter.formatSize(1024 * 1024 * 1024)).to.equal('1 GB');
    });
});

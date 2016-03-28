
/// <reference path='../../../../mocha/mocha.d.ts' />
/// <reference path='../../../../chai/chai.d.ts' />

import * as Alignments from 'odsp-shared/models/image/Alignments';
import ISize = require('odsp-shared/base/ISize');
import { expect } from 'chai';

describe('Alignments', () => {
    let fit: Alignments.IAlignment;
    let center: Alignments.IAlignment;
    let cover: Alignments.IAlignment;

    beforeEach(() => {
        fit = Alignments.fitCenter;
        center = Alignments.center;
        cover = Alignments.coverCenter;
    });

    describe('#getAlignment', () => {
        describe('by string', () => {
            it('gets fit', () => {
                expect(Alignments.getAlignment('fit')).to.equal(fit);
            });

            it('gets center', () => {
                expect(Alignments.getAlignment('center')).to.equal(center);
            });

            it('gets cover', () => {
                expect(Alignments.getAlignment('cover')).to.equal(cover);
            });
        });

        describe('by enum', () => {
            it('gets fit', () => {
                expect(Alignments.getAlignment(Alignments.AlignmentType.fit)).to.equal(fit);
            });

            it('gets center', () => {
                expect(Alignments.getAlignment(Alignments.AlignmentType.center)).to.equal(center);
            });

            it('gets cover', () => {
                expect(Alignments.getAlignment(Alignments.AlignmentType.cover)).to.equal(cover);
            });
        });

        it('gets default', () => {
            expect(Alignments.getAlignment(undefined)).to.equal(cover);
        });
    });

    describe('behaviors', () => {
        let bounds: ISize;
        let content: ISize;

        beforeEach(() => {
            bounds = {
                width: 400,
                height: 400
            };

            content = {
                width: 1600,
                height: 800
            };
        });

        describe('fit', () => {
            it('scales smallest dimension', () => {
                let transform = fit.getTransform(content, bounds);

                expect(transform.scale).to.equal(0.25);
                expect(transform.translate.x).to.equal(0);
                expect(transform.translate.y).to.equal(100);
            });
        });

        describe('center', () => {
            it('does not scale', () => {
                let transform = center.getTransform(content, bounds);

                expect(transform.scale).to.equal(1);
                expect(transform.translate.x).to.equal(-600);
                expect(transform.translate.y).to.equal(-200);
            });
        });

        describe('cover', () => {
            it('scales largest dimension', () => {
                let transform = cover.getTransform(content, bounds);

                expect(transform.scale).to.equal(0.5);
                expect(transform.translate.x).to.equal(-200);
                expect(transform.translate.y).to.equal(0);
            });
        });
    });

    describe('#center', () => {
        it('has correct name', () => {
            expect(Alignments.center.name).to.equal('center');
        });
    });

    describe('#top', () => {
        it('has correct name', () => {
            expect(Alignments.top.name).to.equal('top');
        });
    });

    describe('#fitWidth', () => {
        it('has correct name', () => {
            expect(Alignments.fitWidth.name).to.equal('fitWidth');
        });
    });

    describe('#fitHeight', () => {
        it('has correct name', () => {
            expect(Alignments.fitHeight.name).to.equal('fitHeight');
        });
    });

    describe('#fit', () => {
        it('has correct name', () => {
            expect(Alignments.fit.name).to.equal('fit');
        });
    });

    describe('#cover', () => {
        it('has correct name', () => {
            expect(Alignments.cover.name).to.equal('cover');
        });
    });

    describe('#fitCenter', () => {
        it('has correct name', () => {
            expect(Alignments.fitCenter.name).to.equal('fit-center');
        });
    });

    describe('#coverCenter', () => {
        it('has correct name', () => {
            expect(Alignments.coverCenter.name).to.equal('cover-center');
        });
    });
});

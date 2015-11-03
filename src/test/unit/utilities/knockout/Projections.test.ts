
/// <reference path='../../../../mocha/mocha.d.ts' />
/// <reference path='../../../../chai/chai.d.ts' />
/// <reference path='../../../../knockout/knockout.projections.d.ts' />

import 'odsp-shared/utilities/knockout/Projections';

import ko = require('knockout');
import chai = require('chai');

const expect = chai.expect;

describe('Projections', () => {
    describe('#map', () => {
        // Do a sanity test of the dependency on the knockout-projections library.
        let sourceArray: KnockoutObservableArray<number>;
        let targetArray: KnockoutMappedObservableArray<number>;

        beforeEach(() => {
            sourceArray = ko.observableArray<number>();
            sourceArray.push(1, 2, 3);

            targetArray = sourceArray.map((value: number) => value);
        });

        it('handles array changes', () => {
            sourceArray([5, 6, 7, 2, 4, 3]);

            expect(targetArray()).to.deep.equal(sourceArray());
        });
    });
});

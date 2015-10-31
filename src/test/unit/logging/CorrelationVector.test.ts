// <reference path="../../../chai/chai.d.ts" />
/// <reference path="../../../mocha/mocha.d.ts" />

import chai = require("chai");
import CorrelationVector from 'odsp-utilities/logging/CorrelationVector';
import Guid from 'odsp-utilities/guid/Guid';

let assert = chai.assert;

describe('CorrelationVector', function() {
    it('has empty root and parent', function() {
        var vector = new CorrelationVector();
        assert.equal(Guid.Empty, vector.root);
        assert.equal(Guid.Empty, vector.parent);
    });

    it('reads properties correctly', function() {
        var currentGuid = Guid.generate();
        var parentGuid = Guid.generate();
        var rootGuid = Guid.generate();
        var vector = new CorrelationVector({
            current: parentGuid,
            root: rootGuid
        },
            currentGuid);
        assert.equal(currentGuid, vector.current);
        assert.equal(parentGuid, vector.parent);
        assert.equal(rootGuid, vector.root);
    });

    it('converts to a string properly', function() {
        var currentGuid = Guid.generate();
        var parentGuid = Guid.generate();
        var rootGuid = Guid.generate();
        var vector = new CorrelationVector({
            current: parentGuid,
            root: rootGuid
        },
            currentGuid);
        assert.equal(rootGuid + '#' + parentGuid + '#' + currentGuid, vector.toString());
    });

    it('it chains vectors correctly', function() {
        var currentGuid = Guid.generate();
        var parentGuid = Guid.generate();
        var rootGuid = Guid.generate();
        var parentVector = new CorrelationVector(
            {
                current: parentGuid,
                root: rootGuid
            },
            currentGuid);

        var childVector = new CorrelationVector(parentVector);
        assert.equal(parentVector.root, childVector.root);
        assert.equal(parentVector.current, childVector.parent);
        assert.notEqual(parentVector.current, childVector.current);
    });
});
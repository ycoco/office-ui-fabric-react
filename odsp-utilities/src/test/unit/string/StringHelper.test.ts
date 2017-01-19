import { expect } from 'chai';
import * as StringHelper from '../../../odsp-utilities/string/StringHelper';

describe("StringHelper", () => {
    describe("format", () => {
        it("Can format a simple string", () => {
            expect(StringHelper.format("Test {0} String", "Foo")).to.equal("Test Foo String");
        });

        it("Can format a string with multiple parameters", () => {
            const template = "Test {0}, {1}, {2}";
            expect(StringHelper.format(template, "A", "B", "C")).to.equal("Test A, B, C");
        });

        it("Can format a string that reuses a parameter", () => {
            const template = "Test {0}, {0}, {0}";
            expect(StringHelper.format(template, "A", "B", "C")).to.equal("Test A, A, A");
        });

        it("Accepts 0 as a parameter", () => {
            expect(StringHelper.format("Test {0}", 0)).to.equal("Test 0");
        });

        it("Accepts false as a parameter", () => {
            expect(StringHelper.format("{0}", false)).to.equal("false");
        });

        it("Accepts '' as a parameter", () => {
            expect(StringHelper.format("{0}", '')).to.equal("");
        });

        it("Accepts undefined as a parameter", () => {
            expect(StringHelper.format("{0}", undefined)).to.equal("undefined");
        });

        it("Will substitute undefined for a missing parameter", () => {
            expect(StringHelper.format("{0}")).to.equal("undefined");
        });

        it("Converts null to ''", () => {
            expect(StringHelper.format("{0}", null)).to.equal("");
        });
    });
});
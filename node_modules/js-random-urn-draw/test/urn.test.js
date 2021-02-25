'use strict';

const chai = require("chai");
const assert = chai.assert;
const Urn = require("../urn.js");


describe("Urn", () => {

    it("should fail to initialize with non-array", () => {
        assert.throws(() => {
            new Urn(1);
        }, Error);
        assert.throws(() => {
            new Urn('a');
        }, Error);
        assert.throws(() => {
            new Urn({});
        }, Error);
        assert.throws(() => {
            new Urn(null);
        }, Error);
    });

    it("should initialize with array", () => {
        assert.doesNotThrow(() => {
            new Urn([]);
        }, Error);
        assert.doesNotThrow(() => {
            new Urn();
        }, Error);
    });

    it("with replacement - it should be drawn one item that put it back", () => {
        const content = [1, 2, 3];
        const urn = new Urn(content);
        let item = urn.drawOne();
        assert.isNumber(item);
        assert.lengthOf(urn.content, 3);
        assert.lengthOf(urn.extractedContent, 0);
    });

    it("with replacement - it should be possible to draw more items than there are in the urn", () => {
        const content = [1, 2, 3];
        const urn = new Urn(content);
        let items = urn.draw(5);
        assert.isArray(items);
        assert.isNumber(items[0]);
        assert.lengthOf(urn.content, 3);
        assert.lengthOf(urn.extractedContent, 0);
        assert.lengthOf(items, 5);
    });

    it("without replacement - it should be drawn one item that is NOT put back", () => {
        const content = [1, 2, 3];
        const urn = new Urn(content, false);
        let item = urn.drawOne();
        assert.isNumber(item);
        assert.lengthOf(urn.content, 2);
        assert.lengthOf(urn.extractedContent, 1);
    });

    it("without replacement - it should NOT be possible to draw more items than there are in the urn", () => {
        const content = [1, 2, 3];
        const urn = new Urn(content, false);
        let items = urn.draw(5);
        assert.isArray(items);
        assert.isNumber(items[0]);
        assert.lengthOf(urn.content, 0);
        assert.lengthOf(urn.extractedContent, 3);
        assert.lengthOf(items, 3);

    });

    it("up to 1000x shaking urn content [1,2,3] should lead to [3,2,1] - with a high probability", () => {
        const content = [1, 2, 3];
        const urn = new Urn(content, false);
        let resorted = false;
        for (let i = 0; i < 1000; i++) {
            let items = urn.shake();
            if (JSON.stringify(items) === JSON.stringify([3, 2, 1])) {
                resorted = true;
                break;
            }
        }
        assert.isTrue(resorted);
    });

});

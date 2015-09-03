/// <reference path="../../../chai/chai.d.ts" />
/// <reference path="../../../mocha/mocha.d.ts" />

import chai = require('chai');
var assert = chai.assert;

import HtmlEncoding = require('../../../local/encoding/HtmlEncoding');

describe('HtmlEncoding', () => {
    it('returns regular string properly', () => {
        var input = 'This is a test.';
        assert.equal(input, HtmlEncoding.encodeText(input), "input is identical to output since nothing needs to be encoded");
    });

    it('returns encoded string properly', () => {
        var input = "This is a <test>.";
        assert.equal("This is a &lt;test&gt;.", HtmlEncoding.encodeText(input), "Encode < and >");

        input = "This is a &test.";
        assert.equal("This is a &amp;test.", HtmlEncoding.encodeText(input), "Encode &");

        input = "This is a 'test' or " + '"test".';
        assert.equal("This is a &#39;test&#39; or &quot;test&quot;.", HtmlEncoding.encodeText(input), "Encode single and double quotes");
    });

    it('encodes all the chars properly', () => {
        var input = "<>&'" + '"';
        assert.equal("&lt;&gt;&amp;&#39;&quot;", HtmlEncoding.encodeText(input), "Each char encoded properly");
    });
});
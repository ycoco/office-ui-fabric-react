import chai = require('chai');
var assert = chai.assert;

import Sanitize from '../../../odsp-utilities/encoding/Sanitize';

describe('Sanitize', () => {
    function getInnerText(html: string) {
        var root = document.createElement('div');
        root.innerHTML = html;
        return root.innerText;
    }

    it('doesn\'t sanitize just text', () => {
        var input = 'testing123 testing hello world!';
        assert.equal(input, Sanitize.getTextFromHtml(input), "[getTextFromHtml] input same as output since there is nothing to scrub");
        assert.equal(input, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] input same as output since there is nothing to scrub");
    });

    it('simple input should match the output of innerText', () => {
        var input = '<DIV>Hello, world!</div>';
        var expectedOutput = getInnerText(input);
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] test case 1: output matches innerText output");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] test case 1: output matches innerText output");

        input = '<div>Hello, world!</div><span>some stuff</span>';
        expectedOutput = getInnerText(input);
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] test case 2: output matches innerText output");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] test case 2: output matches innerText output");

        input = '<div>Hello,<div blah="blah">blah</div> world!</div>';
        expectedOutput = getInnerText(input);
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] test case 3: output matches innerText output");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] test case 3: output matches innerText output");

        input = '<div>Hello, world!</div><table><tr><td>for layout</td></tr></table>';
        expectedOutput = getInnerText(input);
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] test case 4: output matches innerText output");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] test case 4: output matches innerText output");

        input = '<div>Hello, world!</div><table><tr><td>for layout</td></tr></table>';
        expectedOutput = getInnerText(input);
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] test case 5: output matches innerText output");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] test case 5: output matches innerText output");

        input = '<>Hello, world!< div>';
        expectedOutput = getInnerText(input);
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] test case 6: output matches innerText output");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] test case 6: output matches innerText output");

        // Test removal of comments
        input = '<!-- hello this is a comment -->';
        expectedOutput = getInnerText(input);
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] output matches innerText output, removes comment");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] output matches innerText output, removes comment");

        input = '<div>Hello,<!-- hello this is a comment --><table><tr><td>for <!-- hello this is a comment -->layout</td></tr></table> world!</div><table><tr><td>for <!-- hello this is a comment -->layout</td></tr></table>';
        expectedOutput = getInnerText(input);
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] output matches innerText output, removes comments");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] output matches innerText output, removes comments");

        input = '<div>Hello,<!-- hello this is a comment --> world!</div><table><tr><td>for <!-- hello this is a comment -->layout</td></tr></table>';
        expectedOutput = getInnerText(input);
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] output matches innerText output, removes comments 2");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] output matches innerText output, removes comments 2");
    });

    it('still works with non-valid HTML with mismatched and invalid tags', () => {
        var input = 'testing123 testing hello world!<div>';
        var expectedOutput = 'testing123 testing hello world!';
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] invalid html 1");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] invalid html 1");

        input = 'testing123 <foobar afejwaoif>testing hello world!<div>';
        expectedOutput = 'testing123 testing hello world!';
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] invalid html 2");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] invalid html 2");

        input = 'testing123 <foobar afejwaoif>testing </input iawefjoiawejf>hello world!<div>';
        expectedOutput = 'testing123 testing hello world!';
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] invalid html 3");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] invalid html 3");

        input = 'testing123 <foobar afejwaoif>tes<scr<scr<scr<scr<script>alert("foo");</script>ipt>ipt>ipt>ipt>ting </input iawefjoiawejf>hello world!<div>';
        expectedOutput = 'testing123 testing hello world!';
        assert.equal(true, Sanitize.getTextFromHtml(input).indexOf('<script>') === -1, "[getTextFromHtml] invalid html 4");
        assert.equal(true, Sanitize.decodeHtmlEntities(input).indexOf('<script>') === -1, "[decodeHtmlEntities] invalid html 4");
    });

    it('correctly removes script and style tags and contents thereof', () => {
        var input = '<script>alert("hello world!")<!-- comment --></script><style>css stuff</style>waehfiauweh';
        var expectedOutput = 'waehfiauweh';
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] output matches innerText output, removes script and style tags and contents inside");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] output matches innerText output, removes script and style tags and contents inside");

        input = '<script stuff>alert("hello world!")<!-- commawfewfaeent --></script><style feawfewa="fawe">css stuff</style>waehfiauweh';
        expectedOutput = 'waehfiauweh';
        assert.equal(expectedOutput, Sanitize.getTextFromHtml(input), "[getTextFromHtml] output matches innerText output, removes script and style tags and contents inside 2");
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] output matches innerText output, removes script and style tags and contents inside 2");
    });

    it('correctly decodes html entities', () => {
        var input = '&amp; space &#123; &#125; &lt; &gt; &#58;';
        var expectedOutput = '& space { } < > :';
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] output matches innerText output, removes script and style tags and contents inside");

        input = '<script stuff>alert("hello world!")<!-- commawfewfaeent --></script><style feawfewa="fawe">css stuff</style>&amp; space &#123; &#125; &lt; &gt; &#58;';
        expectedOutput = '& space { } < > :';
        assert.equal(expectedOutput, Sanitize.decodeHtmlEntities(input), "[decodeHtmlEntities] output matches innerText output, removes script and style tags and contents inside 2");
    });
});
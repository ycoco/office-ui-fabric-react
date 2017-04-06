import chai = require('chai');
var assert = chai.assert;

import {ProtocolHandlerEncodeOption, ProtocolHandlerHelper} from '../../../odsp-utilities/protocolHandler/ProtocolHandlerHelper';

describe('ProtocolHandler', () => {
    it('return regular protocol Handler string', () => {
        var appName = "ms-word";
        var strUrl = "http://msft.spoppe.com/my.docx";
        var command = ProtocolHandlerHelper.protocolCommand.View;
        assert.equal("ms-word:ofv|u|http://msft.spoppe.com/my.docx", ProtocolHandlerHelper.CreateProtocolHandlerUrl(appName, strUrl, command), "regular protocol handler match");
    });

    it('return protocol Handler with new command and default save url', () => {
        var appName = "ms-excel";
        var strUrl = "http://msft-my.spoppe.com/my.docx";
        var command = ProtocolHandlerHelper.protocolCommand.New;
        assert.equal("ms-excel:nft|u|http://msft-my.spoppe.com/my.docx|s|http://my/doclib", ProtocolHandlerHelper.CreateProtocolHandlerUrl(appName, strUrl, command, "http://my/doclib"),
            "protocol handler with new command match");
    });

    it('return protocol Handler with edit command for Excel Coauthoring', () => {
        var appName = "ms-excel";
        var strUrl = "http://msft-my.spoppe.com/my.docx";
        var command = ProtocolHandlerHelper.protocolCommand.Edit;
        var isSPO = true;
        var encodeOption = ProtocolHandlerEncodeOption.none;
        assert.equal("ms-excel:ofe|ofc|u|http://msft-my.spoppe.com/my.docx",
                    ProtocolHandlerHelper.CreateProtocolHandlerUrl(appName, strUrl, command, "http://my/doclib", encodeOption, isSPO),
                    "protocol handler with edit command match");

        encodeOption = ProtocolHandlerEncodeOption.encodeCommand;
        assert.equal("ms-excel:ofe%7Cofc%7Cu%7Chttp://msft-my.spoppe.com/my.docx",
                    ProtocolHandlerHelper.CreateProtocolHandlerUrl(appName, strUrl, command, "http://my/doclib", encodeOption, isSPO),
                    "protocol handler with edit command and encodecommand match");

        encodeOption = ProtocolHandlerEncodeOption.encodeUrl;
        assert.equal("ms-excel:ofe%7Cofc%7Cu%7Chttp://msft-my.spoppe.com/my.docx",
                    ProtocolHandlerHelper.CreateProtocolHandlerUrl(appName, strUrl, command, "http://my/doclib", encodeOption, isSPO),
                    "protocol handler with edit command and encodecommand match");
    });

    it('return protocol Handler with appName array', () => {
        var appName = "ms-publisher|UsePlain";
        var strUrl = "http://msft-my.spoppe.com/new.docx";
        var command = ProtocolHandlerHelper.protocolCommand.New;
        assert.equal("ms-publisher:http://msft-my.spoppe.com/new.docx", ProtocolHandlerHelper.CreateProtocolHandlerUrl(appName, strUrl, command, "http://my/test"),
            "protocol handler with appName having 2 elements match");

        appName = "ms-onenote|UsePlain|IgnoreCheck";
        strUrl = "http://microsoft-my.sharepoint.com/my.docx";
        command = ProtocolHandlerHelper.protocolCommand.Edit;
        assert.equal("ms-onenote:ofe|u|http://microsoft-my.sharepoint.com/my.docx", ProtocolHandlerHelper.CreateProtocolHandlerUrl(appName, strUrl, command, "http://my/OneDrive"),
            "protocol handler with appName having 3 elements and Edit match");
    });

});

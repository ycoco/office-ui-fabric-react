/// <reference path='../../../mocha/mocha.d.ts' />
/// <reference path='../../../chai/chai.d.ts' />

import chai = require('chai');
import sinon = require('sinon');
import IUserVoiceStrings from 'odsp-shared/controls/userVoice/IUserVoiceStrings';
import UserVoiceButtonConfiguration from 'odsp-shared/controls/userVoice/UserVoiceButtonConfiguration';
import UserVoiceWidget from 'odsp-shared/controls/userVoice/UserVoiceWidget';
import UserVoiceWidgetConfiguration, { IUserVoiceWidgetConfiguration } from 'odsp-shared/controls/userVoice/UserVoiceWidgetConfiguration';
import UserVoiceWidgetMode from 'odsp-shared/controls/userVoice/UserVoiceWidgetMode';

const expect = chai.expect;
let widgetContainer: HTMLElement;
let config: UserVoiceWidgetConfiguration;
let strings: IUserVoiceStrings; //UserVoiceStringsOverride;
let widgetLoadingStartCallback: SinonStub;
let widgetSuccessCallback: SinonStub;
let widgetFailureCallback: SinonStub;
let widgetContainerId = "od-userVoicePane-body";
let userVoicePanelTitle = "Submit user feedback!";
let feedbackButtonText = "Send feedback";
let suggestionButtonText = "Send suggestions";
let userVoiceFallbackLine1 = "Test fallback text";

let widgetConfigInit = () => {
    widgetLoadingStartCallback = sinon.stub();
    widgetSuccessCallback = sinon.stub();
    widgetFailureCallback = sinon.stub();

    let buttons: Array<UserVoiceButtonConfiguration> = [];
    buttons.push(new UserVoiceButtonConfiguration(feedbackButtonText,
                                                    UserVoiceWidgetMode.contact,
                                                    "userVoiceFeedbackIcon"));
    buttons.push(new UserVoiceButtonConfiguration(suggestionButtonText,
                                                    UserVoiceWidgetMode.feedback,
                                                    "userVoiceSuggestionIcon"));

    config = new UserVoiceWidgetConfiguration(<IUserVoiceWidgetConfiguration>{
        buttons:    buttons,
        workloadId: "Dfd5i0Gc315P3xPxxXADUQ",
        forumUrl:   "http://zombo.com",
        forumId:    "123456",
        userEmail:  "test@test.com",
        locale:     "en-us"
    });
    config.onUserVoiceStart = widgetLoadingStartCallback;
    config.onUserVoiceSuccess = widgetSuccessCallback;
    config.onUserVoiceFailure = widgetFailureCallback;

    strings = <IUserVoiceStrings>{
        panel_title: userVoicePanelTitle,
        fallback_line1: userVoiceFallbackLine1
    };
};

let widgetConfigReset = () => {
    let existingContainer = document.getElementById(widgetContainerId);
    if (Boolean(existingContainer)) {
        document.body.removeChild(existingContainer);
    }
    (window as any).UserVoice = null;
};

let breakWidgetConfig = () => {
    if (!!config) {
        config.workloadId = null;
        config.forumUrl = "BAD-DATA";
        config.forumId = "BAD-DATA";
    };
};

// utility function for clicking in phantomjs / cross-browser
let click = (el: HTMLElement) => {
    var ev = document.createEvent("MouseEvent");
    ev.initMouseEvent(
        "click",
        true /* bubble */, true /* cancelable */,
        window, null,
        0, 0, 0, 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    el.dispatchEvent(ev);
};

describe('UserVoiceWidget-Main', () => {
    beforeEach(widgetConfigInit);
    afterEach(widgetConfigReset);

    it('test failure case 1', () => {
        let widget = new UserVoiceWidget(config, strings);
        widget.renderIn(null/*parentDiv*/, widgetSuccessCallback, widgetFailureCallback);

        expect(widgetSuccessCallback.called).to.be.false;
        expect(widgetFailureCallback.called).to.be.true;
    });

    it('test failure case 2', () => {
        breakWidgetConfig();
        widgetContainer = document.createElement('div');
        document.body.appendChild(widgetContainer);

        let widget = new UserVoiceWidget(config, strings);
        widget.renderIn(widgetContainer, widgetSuccessCallback, widgetFailureCallback);

        // test the button is present
        let button: HTMLParagraphElement = (document.getElementsByClassName('userVoiceFeedbackIcon')[0] as any) as HTMLParagraphElement;
        expect(button).to.not.be.undefined;

        // click the button
        click(button);

        expect(widgetLoadingStartCallback.called).to.be.true;
        expect(widgetFailureCallback.called).to.be.true;
        expect(widgetContainer.innerHTML).to.contain(userVoiceFallbackLine1);
    });

    it('rendersIn works correctly', () => {
        widgetContainer = document.createElement('div');
        document.body.appendChild(widgetContainer);

        let widget = new UserVoiceWidget(config, strings);
        widget.renderIn(widgetContainer, widgetSuccessCallback, widgetFailureCallback);

        expect(widgetContainer.innerHTML).to.contain(userVoicePanelTitle);
        expect(widgetContainer.innerHTML).to.contain(feedbackButtonText);
        expect(widgetContainer.innerHTML).to.contain(suggestionButtonText);
        expect(widgetSuccessCallback.called).to.be.true;
        expect(widgetFailureCallback.called).to.be.false;
    });
});

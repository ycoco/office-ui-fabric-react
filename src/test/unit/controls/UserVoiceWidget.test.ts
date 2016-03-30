/// <reference path='../../../mocha/mocha.d.ts' />
/// <reference path='../../../chai/chai.d.ts' />

import chai = require('chai');
import sinon = require('sinon');
import UserVoiceButtonConfiguration from 'odsp-shared/controls/userVoice/UserVoiceButtonConfiguration';
import UserVoiceStringsOverride from 'odsp-shared/controls/userVoice/UserVoiceStringsOverride';
import UserVoiceWidget from 'odsp-shared/controls/userVoice/UserVoiceWidget';
import UserVoiceWidgetConfiguration from 'odsp-shared/controls/userVoice/UserVoiceWidgetConfiguration';
import UserVoiceWidgetMode from 'odsp-shared/controls/userVoice/UserVoiceWidgetMode';

const expect = chai.expect;
let widgetContainer: HTMLElement;
let widgetLoadingStartCallback: SinonStub;
let widgetSuccessCallback: SinonStub;
let widgetFailureCallback: SinonStub;
let widgetContainerId = "od-userVoicePane-body";
let userVoicePanelTitle = "Submit user feedback!";
let feedbackButtonText = "Send feedback";
let suggestionButtonText = "Send suggestions";
let userVoiceFallbackLine1 = "Test fallback text";

let widgetConfigInit = () => {
    let config: UserVoiceWidgetConfiguration = UserVoiceWidget.configuration();
    let existingContainer = document.getElementById(widgetContainerId);
    if (Boolean(existingContainer)) {
        document.body.removeChild(existingContainer);
    }
    (window as any).UserVoice = null;
    widgetLoadingStartCallback = sinon.stub();
    widgetSuccessCallback = sinon.stub();
    widgetFailureCallback = sinon.stub();

    // Add the buttons
    let buttons: Array<UserVoiceButtonConfiguration> = [];
    buttons.push(new UserVoiceButtonConfiguration(feedbackButtonText,
                                                    UserVoiceWidgetMode.contact,
                                                    "userVoiceFeedbackIcon"));
    buttons.push(new UserVoiceButtonConfiguration(suggestionButtonText,
                                                    UserVoiceWidgetMode.feedback,
                                                    "userVoiceSuggestionIcon"));

    config.buttons = buttons;

    // Set other config options
    config.workloadId = "Dfd5i0Gc315P3xPxxXADUQ";
    config.forumUrl = "http://zombo.com";
    config.userEmail = "test@test.com";
    config.locale = "en-us";
    config.onUserVoiceStart = widgetLoadingStartCallback;
    config.onUserVoiceSuccess = widgetSuccessCallback;
    config.onUserVoiceFailure = widgetFailureCallback;

    // Set a custom override string
    const strings: UserVoiceStringsOverride = UserVoiceWidget.strings();
    strings.panel_title = userVoicePanelTitle;
    strings.fallback_line1 = userVoiceFallbackLine1;
};

let breakWidgetConfig = () => {
    let config: UserVoiceWidgetConfiguration = UserVoiceWidget.configuration();
    config.workloadId = null;
    config.forumUrl = "BAD-DATA";
    config.forumId = "BAD-DATA";
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

    it('test failure case 1', () => {
        UserVoiceWidget.renderIn("od-badUserVoiceContainerId", widgetSuccessCallback, widgetFailureCallback);

        expect(widgetSuccessCallback.called).to.be.false;
        expect(widgetFailureCallback.called).to.be.true;
    });

    it('test failure case 2', () => {
        breakWidgetConfig();
        widgetContainer = document.createElement('div');
        widgetContainer.id = widgetContainerId;
        document.body.appendChild(widgetContainer);

        UserVoiceWidget.renderIn(widgetContainer.id, widgetSuccessCallback, widgetFailureCallback);

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
        widgetContainer.id = widgetContainerId;
        document.body.appendChild(widgetContainer);

        UserVoiceWidget.renderIn(widgetContainer.id, widgetSuccessCallback, widgetFailureCallback);

        expect(widgetContainer.innerHTML).to.contain(userVoicePanelTitle);
        expect(widgetContainer.innerHTML).to.contain(feedbackButtonText);
        expect(widgetContainer.innerHTML).to.contain(suggestionButtonText);
        expect(widgetSuccessCallback.called).to.be.true;
        expect(widgetFailureCallback.called).to.be.false;
    });
});

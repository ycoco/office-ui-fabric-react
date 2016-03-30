/**
 * @file UserVoiceWidget.tsx
 * @Copyright (c) Microsoft Corporation.  All rights reserved.
 */

import ODSPDomUtils = require("odsp-utilities/domUtils/DomUtils");
import HtmlEncoding = require('odsp-utilities/encoding/HtmlEncoding');
import StringHelper = require('odsp-shared/utilities/string/StringHelper');
import { Qos as QosEvent, ResultTypeEnum } from 'odsp-utilities/logging/events/Qos.event';
import IUserVoice from "./IUserVoice";
import UserVoiceButtonConfiguration from "./UserVoiceButtonConfiguration";
import UserVoiceStringsOverride from "./UserVoiceStringsOverride";
import UserVoiceWidgetConfiguration from "./UserVoiceWidgetConfiguration";
import UserVoiceWidgetMode from "./UserVoiceWidgetMode";

class UserVoiceWidget {
    private static configObj: UserVoiceWidgetConfiguration = new UserVoiceWidgetConfiguration();
    private static stringsObj: UserVoiceStringsOverride = new UserVoiceStringsOverride();

    ///
    /// reusable components IDs
    ///
    private static welcomePanelId: string = "welcomePanel";
    private static widgetPanelId: string = "widgetPanel";
    private static uvWidgetId: string = "uvwidget";

    private static termsOfServiceUrl: string = "https://sharepoint.uservoice.com/tos";
    private static privacyPolicyUrl: string = "https://sharepoint.uservoice.com/tos#privacy-policy";

    ///
    /// present the control into the given Div
    ///
    public static renderIn(parentDivId: string, onSuccessCallback: () => void, onFailureCallback: (T: string) => void): void {
        // Show the uservoice buttons
        try {
            UserVoiceWidget.showButtons(parentDivId);

            if (onSuccessCallback) {
                onSuccessCallback();
            }
        } catch (ex) {
            if (onFailureCallback) {
                onFailureCallback(ex);
            }
        }
    }

    ///
    /// exposes the widget configuration
    ///
    public static configuration(): UserVoiceWidgetConfiguration {
        return UserVoiceWidget.configObj;
    }

    ///
    /// exposes the widget strings
    ///
    public static strings(): UserVoiceStringsOverride {
        return UserVoiceWidget.stringsObj;
    }

    ///
    /// load widget library from UserVoice and execute a callback
    ///
    private static ensureWidgetLoaded(onLoadCallback: () => void, mode: string, onFailureCallback: () => void): void {
        try {

            if (!onLoadCallback) {
                this.onUserVoiceError("ensureWidgetLoaded", "onLoadCallback is undefined in ensureWidgetLoaded");
            }

            if (!(UserVoiceWidget.configuration().workloadId)) {
                UserVoiceWidget.errorCallback(mode, "UserVoice control download failed; Incorrect workload id");
                onFailureCallback();
            }

            if ((window as any).UserVoice) {
                onLoadCallback();
            } else {
                let uv: HTMLScriptElement = document.createElement("script");
                uv.type = "text/javascript";
                uv.async = true;
                uv.src = "https://widget.uservoice.com/" + UserVoiceWidget.configuration().workloadId + ".js";
                let s: HTMLScriptElement = document.getElementsByTagName("script")[0];
                s.parentNode.insertBefore(uv, s);

                /* tslint:disable:ban-native-functions */
                uv.addEventListener("load", (ev: Event) => {
                    if ((window as any).UserVoice) {
                        onLoadCallback();
                    } else {
                        // If UserVoice workload ID is not correct, the site will still download empty JS file
                        UserVoiceWidget.errorCallback(mode, "UserVoice control download failed; Incorrect workload id");
                        onFailureCallback();
                    }
                });

                /* tslint:disable:ban-native-functions */
                uv.addEventListener("error", (ev: ErrorEvent) => {
                    UserVoiceWidget.errorCallback(mode, "UserVoice control download failed; Incorrect url; Message: " + ev.message);
                    onFailureCallback();
                });
            }
        } catch (ex) {
            UserVoiceWidget.errorCallback(mode, "UserVoice control initialization failed; Error: " + ex);
        }
    }

    ///
    /// show the buttons dialog
    ///
    private static showButtons(parentDivId: string): void {
        let parentDiv: HTMLElement = document.getElementById(parentDivId);
        if (!parentDiv) {
            this.onUserVoiceError("showButtons", "parentDiv " + parentDivId + " is not found");
        }

        parentDiv.innerHTML = "";

        let fragment: any = document.createDocumentFragment();

        // Welcome panel (with buttons)
        let welcomePanelDiv: HTMLDivElement = <HTMLDivElement>this.createElementWrapper(fragment,
                                                                                        "div",
                                                                                        "",
                                                                                        {
                                                                                            id: UserVoiceWidget.welcomePanelId,
                                                                                            class: "uvwelcome-panel"
                                                                                        });

        this.createElementWrapper(welcomePanelDiv, "div", UserVoiceWidget.strings().panel_title, {class: "ms-font-xl uvwelcome-title"});

        UserVoiceWidget.configuration().buttons.forEach((buttonConfig: UserVoiceButtonConfiguration) => {
            let div: HTMLDivElement = <HTMLDivElement> this.createElementWrapper(welcomePanelDiv,
                                                                                 "div",
                                                                                 "",
                                                                                 {class: "uvwelcome-Button"});
            let button: HTMLButtonElement = <HTMLButtonElement>this.createElementWrapper(div,
                                                                                         "button",
                                                                                         "",
                                                                                         {
                                                                                             class: "ms-Button ms-Button--primary"
                                                                                         });
            button.onclick = UserVoiceWidget.getButtonHandler(buttonConfig.buttonWidgetMode);
            let span: HTMLSpanElement = <HTMLSpanElement>this.createElementWrapper(button, "span", "", {class: "ms-Button-icon"});
            this.createElementWrapper(span, "i", "", {class: buttonConfig.iconClass});
            this.createElementWrapper(button, "span", buttonConfig.buttonText, {class: "ms-Button-label"});
        });

        // Widget panel (shows the widget and the policy links)
        let widgetPanelDiv: HTMLDivElement = <HTMLDivElement>this.createElementWrapper(fragment, "div", "", {class: "uvwidget-panel"});
        widgetPanelDiv.id = UserVoiceWidget.widgetPanelId;
        widgetPanelDiv.hidden = true;

        let widgetDiv: HTMLDivElement = <HTMLDivElement>this.createElementWrapper(widgetPanelDiv, "div", "");
        widgetDiv.id = UserVoiceWidget.uvWidgetId;

        // Privacy and terms of service links
        let widgetPolicyDiv: HTMLDivElement = <HTMLDivElement>this.createElementWrapper(widgetPanelDiv,
                                                                                        "div",
                                                                                        "",
                                                                                        {class: "uvwidget-policy"});
        this.createElementWrapper(widgetPolicyDiv,
                                  "a",
                                  UserVoiceWidget.strings().uservoice_terms_of_service_link_caption,
                                  {
                                      href: UserVoiceWidget.termsOfServiceUrl,
                                      class: "ms-font-s"
                                  });
        this.createElementWrapper(widgetPolicyDiv, "span", " | ", {class: "ms-font-s"});
        this.createElementWrapper(widgetPolicyDiv,
                                  "a",
                                  UserVoiceWidget.strings().uservoice_privacy_policy_link_caption,
                                  {
                                      href: UserVoiceWidget.privacyPolicyUrl,
                                      class: "ms-font-s"
                                  });

        parentDiv.appendChild(fragment);
    }

    ///
    /// get handler for the button callback
    ///
    private static getButtonHandler(userVoiceMode: UserVoiceWidgetMode): any {
        return () => {

            var mode: string = UserVoiceButtonConfiguration.getMode(userVoiceMode);

            UserVoiceWidget.startCallback(mode);
            UserVoiceWidget.ensureWidgetLoaded(() => UserVoiceWidget.showUserVoice(mode),
                                               mode,
                                               () => UserVoiceWidget.showFallbackWidgetUnavailableExperience());
        };
    }

    ///
    /// Present the UserVoice control
    ///
    private static showUserVoice(userVoiceMode: string): void {
        let userVoice: IUserVoice = <IUserVoice>(window as any).UserVoice;

        try {
            document.getElementById(UserVoiceWidget.welcomePanelId).hidden = true;
            document.getElementById(UserVoiceWidget.widgetPanelId).hidden = false;

            userVoice.push(["set", UserVoiceWidget.configuration().configuation(UserVoiceWidget.strings())]);
            userVoice.push(["identify", { email: UserVoiceWidget.configuration().userEmail}]);
            userVoice.push(["embed", "#" + UserVoiceWidget.uvWidgetId, { mode: userVoiceMode }]);

            // Log success
            UserVoiceWidget.successCallback(userVoiceMode);
        } catch (ex) {

            // Log failure
            UserVoiceWidget.errorCallback(userVoiceMode, ex);
        }
    }

    ///
    /// fallback experience for the case when UV widget is not availabe
    ///
    private static showFallbackWidgetUnavailableExperience() {
        document.getElementById(UserVoiceWidget.welcomePanelId).hidden = true;
        document.getElementById(UserVoiceWidget.widgetPanelId).hidden = false;

        let parentDiv: HTMLElement = document.getElementById(UserVoiceWidget.widgetPanelId);
        if (!parentDiv) {
            throw "parentDiv " + UserVoiceWidget.widgetPanelId + " is not found";
        }

        parentDiv.innerHTML = "";

        let fragment: any = document.createDocumentFragment();
        var fragementDiv = this.createElementWrapper(fragment, "div", "", {class: "uvfallback-panel"});

        this.createElementWrapper(fragementDiv,
                                  "div",
                                  UserVoiceWidget.strings().fallback_line1,
                                  {class: "ms-font-xl uvfallback-title"});
        this.createElementWrapper(fragementDiv,
                                  "div",
                                  UserVoiceWidget.strings().fallback_line2,
                                  {class: "ms-font-m uvfallback-subtitle"});
        let options: HTMLDivElement = <HTMLDivElement>this.createElementWrapper(fragementDiv,
                                                                                "div",
                                                                                UserVoiceWidget.strings().fallback_line3,
                                                                                {class: "ms-font-m uvfallback-options"});
        let list: HTMLUListElement = <HTMLUListElement>this.createElementWrapper(options,
                                                                                 "ul",
                                                                                 "",
                                                                                 {class: "uvfallback-ul"});
        let listElement: HTMLLIElement = <HTMLLIElement>this.createElementWrapper(list, "li", "", {});
        let forumLinkStartTag = StringHelper.format('<a href="{0}">', UserVoiceWidget.configuration().forumUrl);
        listElement.innerHTML = StringHelper.format(HtmlEncoding.encodeText(UserVoiceWidget.strings().fallback_line4),
                                  forumLinkStartTag, "</a>");
        this.createElementWrapper(list, "li", UserVoiceWidget.strings().fallback_line5);
        this.createElementWrapper(list, "li", UserVoiceWidget.strings().fallback_line6);

        parentDiv.appendChild(fragment);
    }

    private static startCallback(mode: string): void {
        if (UserVoiceWidget.configuration().onUserVoiceStart) {
            UserVoiceWidget.configuration().onUserVoiceStart(mode);
        }
    }

    private static successCallback(mode: string): void {
        if (UserVoiceWidget.configuration().onUserVoiceSuccess) {
            UserVoiceWidget.configuration().onUserVoiceSuccess(mode);
        }
    }

    private static errorCallback(mode: string, error: string): void {
        if (UserVoiceWidget.configuration().onUserVoiceFailure) {
            UserVoiceWidget.configuration().onUserVoiceFailure(mode, error);
        }
    }

    private static onUserVoiceError(functionName: string, errorMessage?: any): void {
        let qosEvent = new QosEvent({ name: ("UserVoice." + functionName) });
        qosEvent.end({ resultType: ResultTypeEnum.Failure, error: errorMessage });
    }

    private static createElementWrapper(parentElement: HTMLElement, elementTag: string, text: string, attributes?: { [key: string]: string; }): HTMLElement {
        // Create the element
        const createdElement: HTMLElement = ODSPDomUtils.ce(elementTag, attributes);

        // Set the text in the element
        ODSPDomUtils.setText(createdElement, text);

        // Append the element to the parent and return it
        parentElement.appendChild(createdElement);
        return createdElement;
    }
}

export default UserVoiceWidget;
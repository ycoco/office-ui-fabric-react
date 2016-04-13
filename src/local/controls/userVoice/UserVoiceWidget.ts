/**
 * @file UserVoiceWidget.tsx
 * @Copyright (c) Microsoft Corporation.  All rights reserved.
 */

import ODSPDomUtils from 'odsp-utilities/domUtils/DomUtils';
import HtmlEncoding from 'odsp-utilities/encoding/HtmlEncoding';
import StringHelper = require('odsp-shared/utilities/string/StringHelper');
import { Qos as QosEvent, ResultTypeEnum } from 'odsp-utilities/logging/events/Qos.event';
import IUserVoice from "./IUserVoice";
import UserVoiceButtonConfiguration from "./UserVoiceButtonConfiguration";
import IUserVoiceStrings from "./IUserVoiceStrings";
import UserVoiceWidgetConfiguration from "./UserVoiceWidgetConfiguration";
import UserVoiceWidgetMode from "./UserVoiceWidgetMode";

class UserVoiceWidget {
    ///
    /// reusable components IDs
    ///
    private static welcomePanelId: string = "welcomePanel";
    private static widgetPanelId: string = "widgetPanel";
    private static uvWidgetId: string = "uvwidget";

    private static termsOfServiceUrl: string = "https://sharepoint.uservoice.com/tos";
    private static privacyPolicyUrl: string = "https://sharepoint.uservoice.com/tos#privacy-policy";

   private configuration: UserVoiceWidgetConfiguration;
   private strings: IUserVoiceStrings;

    constructor(config: UserVoiceWidgetConfiguration, strings: IUserVoiceStrings) {
        this.configuration = config;
        this.strings = strings;
    }

    ///
    /// present the control into the given Div
    ///
    public renderIn(parentDiv: HTMLElement, onSuccessCallback: () => void, onFailureCallback: (T: string) => void): void {
        // Show the uservoice buttons
        try {
            this.showButtons(parentDiv);

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
    /// load widget library from UserVoice and execute a callback
    ///
    private ensureWidgetLoaded(onLoadCallback: () => void, mode: string, onFailureCallback: () => void): void {
        try {

            if (!onLoadCallback) {
                this.onUserVoiceError("ensureWidgetLoaded", "onLoadCallback is undefined in ensureWidgetLoaded");
            }

            if (!(this.configuration.workloadId)) {
                this.errorCallback(mode, "UserVoice control download failed; Incorrect workload id");
                onFailureCallback();
            }

            if ((window as any).UserVoice) {
                onLoadCallback();
            } else {
                let uv: HTMLScriptElement = document.createElement("script");
                uv.type = "text/javascript";
                uv.async = true;
                uv.src = "https://widget.uservoice.com/" + this.configuration.workloadId + ".js";
                let s: HTMLScriptElement = document.getElementsByTagName("script")[0];
                s.parentNode.insertBefore(uv, s);

                /* tslint:disable:ban-native-functions */
                uv.addEventListener("load", (ev: Event) => {
                    if ((window as any).UserVoice) {
                        onLoadCallback();
                    } else {
                        // If UserVoice workload ID is not correct, the site will still download empty JS file
                        this.errorCallback(mode, "UserVoice control download failed; Incorrect workload id");
                        onFailureCallback();
                    }
                });

                /* tslint:disable:ban-native-functions */
                uv.addEventListener("error", (ev: ErrorEvent) => {
                    this.errorCallback(mode, "UserVoice control download failed; Incorrect url; Message: " + ev.message);
                    onFailureCallback();
                });
            }
        } catch (ex) {
            this.errorCallback(mode, "UserVoice control initialization failed; Error: " + ex);
        }
    }

    ///
    /// show the buttons dialog
    ///
    private showButtons(parentDiv: HTMLElement): void {
        if (!parentDiv) {
            this.onUserVoiceError("showButtons", "parentDiv is not found");
        }

        parentDiv.innerHTML = "";

        let fragment: any = document.createDocumentFragment();

        // Welcome panel (with buttons)
        let welcomePanelDiv: HTMLDivElement = <HTMLDivElement>this.createElementWrapper(fragment,
                                                                                        "div",
                                                                                        "",
                                                                                        {
                                                                                            id: UserVoiceWidget.welcomePanelId,
                                                                                            class: "uv-welcome-panel"
                                                                                        });

        this.createElementWrapper(welcomePanelDiv, "div", this.strings.panel_title, {class: "ms-font-xl uv-welcome-title"});

        this.configuration.buttons.forEach((buttonConfig: UserVoiceButtonConfiguration) => {
            let div: HTMLDivElement = <HTMLDivElement> this.createElementWrapper(welcomePanelDiv,
                                                                                 "div",
                                                                                 "",
                                                                                 {class: "uv-welcome-Button"});
            let button: HTMLButtonElement = <HTMLButtonElement>this.createElementWrapper(div,
                                                                                         "button",
                                                                                         "",
                                                                                         {
                                                                                             class: "ms-Button ms-Button--primary"
                                                                                         });
            button.onclick = this.getButtonHandler(buttonConfig.buttonWidgetMode);
            let span: HTMLSpanElement = <HTMLSpanElement>this.createElementWrapper(button, "span", "", {class: "ms-Button-icon"});
            this.createElementWrapper(span, "i", "", {class: buttonConfig.iconClass});
            this.createElementWrapper(button, "span", buttonConfig.buttonText, {class: "ms-Button-label"});
        });

        // Widget panel (shows the widget and the policy links)
        let widgetPanelDiv: HTMLDivElement = <HTMLDivElement>this.createElementWrapper(fragment, "div", "", {class: "uv-widget-panel"});
        widgetPanelDiv.id = UserVoiceWidget.widgetPanelId;
        widgetPanelDiv.hidden = true;

        let widgetDiv: HTMLDivElement = <HTMLDivElement>this.createElementWrapper(widgetPanelDiv, "div", "");
        widgetDiv.id = UserVoiceWidget.uvWidgetId;

        // Privacy and terms of service links
        let widgetPolicyDiv: HTMLDivElement = <HTMLDivElement>this.createElementWrapper(widgetPanelDiv,
                                                                                        "div",
                                                                                        "",
                                                                                        {class: "uv-widget-policy"});
        this.createElementWrapper(widgetPolicyDiv,
                                  "a",
                                  this.strings.uservoice_terms_of_service_link_caption,
                                  {
                                      href: UserVoiceWidget.termsOfServiceUrl,
                                      class: "ms-font-s"
                                  });
        this.createElementWrapper(widgetPolicyDiv, "span", " | ", {class: "ms-font-s"});
        this.createElementWrapper(widgetPolicyDiv,
                                  "a",
                                  this.strings.uservoice_privacy_policy_link_caption,
                                  {
                                      href: UserVoiceWidget.privacyPolicyUrl,
                                      class: "ms-font-s"
                                  });

        parentDiv.appendChild(fragment);
    }

    ///
    /// get handler for the button callback
    ///
    private getButtonHandler(userVoiceMode: UserVoiceWidgetMode): any {
        return () => {

            var mode: string = UserVoiceButtonConfiguration.getMode(userVoiceMode);

            this.startCallback(mode);
            this.ensureWidgetLoaded(() => this.showUserVoice(mode),
                                               mode,
                                               () => this.showFallbackWidgetUnavailableExperience());
        };
    }

    ///
    /// Present the UserVoice control
    ///
    private showUserVoice(userVoiceMode: string): void {
        let userVoice: IUserVoice = <IUserVoice>(window as any).UserVoice;

        try {
            document.getElementById(UserVoiceWidget.welcomePanelId).hidden = true;
            document.getElementById(UserVoiceWidget.widgetPanelId).hidden = false;

            userVoice.push(["set", this.configuration.userVoiceConfiguration(this.strings)]);
            userVoice.push(["identify", { email: this.configuration.userEmail}]);
            userVoice.push(["embed", "#" + UserVoiceWidget.uvWidgetId, { mode: userVoiceMode }]);

            // Log success
            this.successCallback(userVoiceMode);
        } catch (ex) {

            // Log failure
            this.errorCallback(userVoiceMode, ex);
        }
    }

    ///
    /// fallback experience for the case when UV widget is not availabe
    ///
    private showFallbackWidgetUnavailableExperience() {
        document.getElementById(UserVoiceWidget.welcomePanelId).hidden = true;
        document.getElementById(UserVoiceWidget.widgetPanelId).hidden = false;

        let parentDiv: HTMLElement = document.getElementById(UserVoiceWidget.widgetPanelId);
        if (!parentDiv) {
            throw "parentDiv " + UserVoiceWidget.widgetPanelId + " is not found";
        }

        parentDiv.innerHTML = "";

        let fragment: any = document.createDocumentFragment();
        var fragementDiv = this.createElementWrapper(fragment, "div", "", {class: "uv-fallback-panel"});

        this.createElementWrapper(fragementDiv,
                                  "div",
                                  this.strings.fallback_line1,
                                  {class: "ms-font-xl uv-fallback-title"});
        this.createElementWrapper(fragementDiv,
                                  "div",
                                  this.strings.fallback_line2,
                                  {class: "ms-font-m uv-fallback-subtitle"});
        let options: HTMLDivElement = <HTMLDivElement>this.createElementWrapper(fragementDiv,
                                                                                "div",
                                                                                this.strings.fallback_line3,
                                                                                {class: "ms-font-m uv-fallback-options"});
        let list: HTMLUListElement = <HTMLUListElement>this.createElementWrapper(options,
                                                                                 "ul",
                                                                                 "",
                                                                                 {class: "uv-fallback-ul"});
        let listElement: HTMLLIElement = <HTMLLIElement>this.createElementWrapper(list, "li", "", {});
        let forumLinkStartTag = StringHelper.format('<a href="{0}">', this.configuration.forumUrl);
        listElement.innerHTML = StringHelper.format(HtmlEncoding.encodeText(this.strings.fallback_line4),
                                  forumLinkStartTag, "</a>");
        this.createElementWrapper(list, "li", this.strings.fallback_line5);
        this.createElementWrapper(list, "li", this.strings.fallback_line6);

        parentDiv.appendChild(fragment);
    }

    private startCallback(mode: string): void {
        if (this.configuration.onUserVoiceStart) {
            this.configuration.onUserVoiceStart(mode);
        }
    }

    private successCallback(mode: string): void {
        if (this.configuration.onUserVoiceSuccess) {
            this.configuration.onUserVoiceSuccess(mode);
        }
    }

    private errorCallback(mode: string, error: string): void {
        if (this.configuration.onUserVoiceFailure) {
            this.configuration.onUserVoiceFailure(mode, error);
        }
    }

    private onUserVoiceError(functionName: string, errorMessage?: any): void {
        let qosEvent = new QosEvent({ name: ("UserVoice." + functionName) });
        qosEvent.end({ resultType: ResultTypeEnum.Failure, error: errorMessage });
    }

    private createElementWrapper(parentElement: HTMLElement, elementTag: string, text: string, attributes?: { [key: string]: string; }): HTMLElement {
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
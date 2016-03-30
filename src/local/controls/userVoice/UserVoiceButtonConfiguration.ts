/**
 * @file UserVoiceButtonConfiguration.tsx
 * @Copyright (c) Microsoft Corporation.  All rights reserved.
 */
import UserVoiceWidgetMode from "./UserVoiceWidgetMode";

class UserVoiceButtonConfiguration {
    public buttonText: string;
    public buttonWidgetMode: UserVoiceWidgetMode;
    public iconClass: string;

    public constructor(buttonText: string, buttonWidgetMode: UserVoiceWidgetMode, iconClass: string) {
        this.buttonText = buttonText;
        this.buttonWidgetMode = buttonWidgetMode;
        this.iconClass = iconClass;
    }

    public static getMode(mode: UserVoiceWidgetMode): string {
        return UserVoiceWidgetMode[mode];
    }
}

export default UserVoiceButtonConfiguration;

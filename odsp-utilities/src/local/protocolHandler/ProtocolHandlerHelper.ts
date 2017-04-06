export enum ProtocolHandlerEncodeOption {
    none = 0,
    encodeUrl = 1,
    encodeCommand = 2
};

export class ProtocolHandlerHelper {
    // tslint:disable-next-line:typedef
    public static protocolCommand = { View : 'ofv', Edit : 'ofe', New : 'nft' };

    /**
     * Create protocol handler Url based in inputs to laucch Office Client
     * @strApp: input appName, like ms-excel
     * @strUrl: input url of the file.
     * @command: input open command, like ofv or ofe for view or edit.
     * @defaultSaveUrl: optoinal input to specify save Url. Used for new operation.
     * @encodeOption: optional input to specify if we need to encode the whole output url, or only encode the command part of the url.
     * @isSPO: optional input to specify if this is for SPO output.
     */
    public static CreateProtocolHandlerUrl(
        strApp: string,
        strUrl: string,
        command: string,
        defaultSaveUrl?: string,
        encodeOption?: ProtocolHandlerEncodeOption,
        isSPO?: boolean
        ): string {
        const ret: Array<string> = [];

        // OpenApp="protocol[|UsePlain[|IgnoreCheck]]"/>
        const protocolList: Array<string> = strApp.split('|');
        if (protocolList.length === 2) {
            ret.push(protocolList[0]);
            ret.push(':');
            ret.push(strUrl);
            return ret.join('');
        } else if (protocolList.length === 3) {
            strApp = protocolList[0];
        }

        ret.push(strApp);
        ret.push(':');
        ret.push(command);
        if (isSPO && strApp === "ms-excel" && command !== this.protocolCommand.New) {
            ret.push(encodeOption === ProtocolHandlerEncodeOption.encodeCommand ? '%7Cofc' : '|ofc');
        }
        ret.push(encodeOption === ProtocolHandlerEncodeOption.encodeCommand ? '%7Cu%7C' : '|u|');
        ret.push(strUrl);
        if (command === this.protocolCommand.New) {
            ret.push(encodeOption === ProtocolHandlerEncodeOption.encodeCommand ? '%7Cs%7C' : '|s|');
            ret.push(defaultSaveUrl);
        }

        // encode uri when necessary.
        const retUrl: string = ret.join('');
        return encodeOption === ProtocolHandlerEncodeOption.encodeUrl ? encodeURI(retUrl) : retUrl;
    }
}

export default ProtocolHandlerHelper;
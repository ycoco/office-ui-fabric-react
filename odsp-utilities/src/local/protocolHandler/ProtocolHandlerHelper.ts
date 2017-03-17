export class ProtocolHandlerHelper {
    // tslint:disable-next-line:typedef
    public static protocolCommand = { View : 'ofv', Edit : 'ofe', New : 'nft' };

    public static CreateProtocolHandlerUrl(
        strApp: string,
        strUrl: string,
        command: string,
        defaultSaveUrl?: string,
        encodeUrl?: boolean
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
        ret.push('|u|');
        ret.push(strUrl);
        if (command === this.protocolCommand.New) {
            ret.push('|s|');
            ret.push(defaultSaveUrl);
        }

        // encode uri when necessary.
        const retUrl: string = ret.join('');
        return encodeUrl ? encodeURI(retUrl) : retUrl;
    }
}

export default ProtocolHandlerHelper;
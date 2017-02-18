// OneDrive:IgnoreCodeCoverage

import { IHostSettings } from '../IHostSettings';

declare const DOMParser: new () => DOMParser;
declare const ActiveXObject: new (s: string) => any;

export interface IAcronymColor {
    /**
     * Site Logo Acronym
     */
    acronym: string;

    /**
     * Site Logo Color (usually a hex rgb colour string)
     */
    color: string;
}

/**
 * This datasource makes a call to the Acronyms and Colors service and returns an IAcronymColor object.
 */
export default class SiteHeaderLogoAcronym {
    private _hostSettings: IHostSettings;
    /**
     * @constructor
     */
    constructor(hostSettings: IHostSettings) {
        this._hostSettings = hostSettings;
    }

    /**
     * Given a site name, return an URL to a REST endpoint where the site logo acronym and color information can be retrieved from.
     * The REST endpoint is through the GetAcronymsAndColors API.
     * Note: API takes in additional optional arguments like lcid, which as of this writing this method doesn't support.
     *       Please extend as appropriate.
     *
     * @param {string} siteName Name of the site.
     * @returns { string} the REST endpoint relative URL.
     */
    public getAcronymRESTUrl(siteName: string) {
        return  this._hostSettings.webServerRelativeUrl + `/_api/sphome/GetAcronymsAndColors?labels=[{Text:${encodeURIComponent('"' + siteName + '"')}}]`;
    }

    public getAcronymColor(responseText: string): IAcronymColor {
        //parse the responseText
        let rtnObj: IAcronymColor = { acronym: undefined, color: undefined };
        try {
            let response = JSON.parse(responseText);
            let responseResult = response.d.GetAcronymsAndColors.results[0];
            rtnObj.acronym = responseResult.Acronym;
            rtnObj.color = responseResult.Color;
        } catch (e) {
            // try xml parsing
            let parser = this._parseFn();
            let elements: NodeListOf<Element>;
            var xmlDoc: Document = parser(responseText);

            if (elements = xmlDoc.getElementsByTagName("element")) {
                let element = elements[0];
                for (let i = 0; i < element.childNodes.length; i++) {
                    switch (element.childNodes[i].nodeName) {
                        case 'Acronym':
                            rtnObj.acronym = element.childNodes[i].nodeValue;
                            break;
                        case 'Color':
                            rtnObj.color = element.childNodes[i].nodeValue;
                            break;
                    }
                }
            }
        }

        return rtnObj;
    }

    /**
     * Returns an XML parser.
     */
    private _parseFn(): (str: string) => Document {
        let parseXml;

        if (DOMParser) {
            parseXml = (xmlStr: string) => {
                return (new DOMParser()).parseFromString(xmlStr, "text/xml");
            };
        } else if (ActiveXObject &&
            new ActiveXObject("Microsoft.XMLDOM")) {
            parseXml = (xmlStr: string) => {
                var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(xmlStr);
                return xmlDoc;
            };
        } else {
            throw new Error("No XML parser found");
        }

        return parseXml;
    }
}

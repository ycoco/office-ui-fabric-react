import { getSafeWebServerRelativeUrl } from '../../interfaces/ISpPageContext';
import { CachedDataSource } from '../base/CachedDataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';

import { ISpPageContext } from './../../interfaces/ISpPageContext';

export enum PersonaInitialsColor {
    lightBlue,
    blue,
    darkBlue,
    teal,
    lightGreen,
    green,
    darkGreen,
    lightPink,
    pink,
    magenta,
    purple,
    black,
    orange,
    red,
    darkRed
}

/** This is an array of possible colors that the service returns as of 11 Oct 2016.
 * However, the list of colors the service returns may change.
 * This is a weak contract provided for convenience,
 * so do not take a strong dependency on this array.
 * Look at /sporel/otools/inc/sts/stsom/utilities/SPWebLogoUtility.cs for the master copy */
export const COLOR_SERVICE_POSSIBLE_COLORS: string[] = [
    '#0078d7',
    '#088272',
    '#107c10',
    '#881798',
    '#b4009e',
    '#e81123',
    '#da3b01',
    '#006f94',
    '#005e50',
    '#004e8c',
    '#a80000',
    '#4e257f'
];

namespace JsonResult {
    'use strict';

    export type __metadata = {
        type: string;
    }

    export type Result = {
        Acronym: string;
        Color: string;
        Lcid: number;
        Text: string;
    }

    export type GetAcronymsAndColor = {
        __metadata: __metadata;
        results: Result[];
    }

    export type D = {
        GetAcronymsAndColors: GetAcronymsAndColor;
    }

    export type RootObject = {
        d: D;
    }
}

/** Represents a object containing information about acronym and color. */
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
export class AcronymAndColorDataSource extends CachedDataSource {

    public static decodeAcronymColor(color: string): PersonaInitialsColor {
        return (COLOR_SERVICE_POSSIBLE_COLORS.indexOf(color) + 1);
    }

    constructor(pageContext: ISpPageContext) {
        super(pageContext, 'acronymAndColors', { cacheTimeoutTime: 86400000 /* 24h */ });
    }

    /**
     * @inheritdoc
     */
    protected getDataSourceName() {
        return 'SiteHeaderLogoAcronym';
    }

    /**
     * Given a site name, return a site logo acronym and color information through the GetAcronymsAndColors API.
     * Note: API takes in additional optional arguments like lcid, which as of this writing this method doesn't support.
     *       Please extend as appropriate.
     *
     * @param {string} siteName Name of the site.
     * @returns {Promise<IAcronymColor>} Site acronym and Color.
     */
    public getAcronymData(siteName: string): Promise<IAcronymColor> {
        return this.getAcronyms([siteName]).then((val: IAcronymColor[]) => {
            return val[0];
        }, (): IAcronymColor => {
            return {
                acronym: undefined,
                color: undefined
            };
        });
    }

    /**
     * Given an array of strings, return acronym and color information through the GetAcronymsAndColors API.
     * Note: API takes in additional optional arguments like lcid, which as of this writing this method doesn't support.
     *       Please extend as appropriate.
     *
     * @param {string[]} strings An array of strings to pass to the service.
     * @returns {Promise<IAcronymColor[]>} An array of IAcronymColor objects containing site acronym and color information.
     */
    public getAcronyms(strings: string[]): Promise<IAcronymColor[]> {
        if (this._pageContext.webServerRelativeUrl) {
            return this.getDataUtilizingCache<IAcronymColor[]>({
                getUrl: () => {   // URL
                    let requestStr = strings.map((str: string) => `{Text: ${UriEncoding.encodeURIComponent('"' + str + '"')}}`)
                        .join(',');
                    return getSafeWebServerRelativeUrl(this._pageContext) + `/_api/sphome/GetAcronymsAndColors?labels=[${requestStr}]`;
                },
                parseResponse: (responseText: string): IAcronymColor[] => { // parse the responseText
                    let response: JsonResult.RootObject = JSON.parse(responseText);
                    let responseResult: JsonResult.Result[] = response.d.GetAcronymsAndColors.results;
                    return responseResult.map((val: JsonResult.Result) => {
                        return { acronym: val.Acronym, color: val.Color };
                    });
                },
                qosName: 'GetSiteHeaderLogoAcronym'
            });
        } else {
            return Promise.wrapError();
        }
    }
}

export default AcronymAndColorDataSource;

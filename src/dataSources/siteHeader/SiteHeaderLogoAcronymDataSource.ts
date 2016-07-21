import IContext from '../base/IContext';
import DataSource from '../base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';

type IndividualAcronymColorResult = Array<{ Acronym: string, Color: string }>;

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
export default class SiteHeaderLogoAcronymDataSource extends DataSource {

    /**
     * @constructor
     */
    constructor(context: IContext) {
        super(context);
    }

    /**
     * @inheritDoc
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
        if (this._context.webServerRelativeUrl) {
            return this.getData<IAcronymColor[]>(
                () => {   // URL
                    let requestStr = strings.map((str: string) => `{Text: ${UriEncoding.encodeURIComponent('"' + str + '"')}}`)
                        .join(',');
                    return this._context.webServerRelativeUrl + `/_api/sphome/GetAcronymsAndColors?labels=[${requestStr}]`;
                },
                (responseText: string): IAcronymColor[] => { // parse the responseText

                    let response: JsonResult.RootObject = JSON.parse(responseText);
                    let responseResult: JsonResult.Result[] = response.d.GetAcronymsAndColors.results;

                    return responseResult.map((val: JsonResult.Result) => {
                        return { acronym: val.Acronym, color: val.Color };
                    });
                },
                'GetSiteHeaderLogoAcronym'
            );
        } else {
            return Promise.wrapError();
        }
    }
}

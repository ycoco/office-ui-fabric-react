import { DataSource } from '../base/DataSource';
import { ISpPageContext } from '../../interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IDesignPackage } from '../../providers/designPackage/DesignPackageProvider';
import Uri from '@ms/odsp-utilities/lib/uri/Uri';
import { IFormulaDataSource } from './IFormulaDataSource';
import WebTemplateType from '../web/WebTemplateType';
import { IFormulaDataSet } from './IFormulaDataSet';
import { FormulaDataSet } from './FormulaDataSet';

namespace ServerResponse {
  export interface IGetFormulasServerResponse {
    d: {
      GetFilteredFormulas: {
        results: IServerFormula[];
      }
    }
  }

  export interface IServerFormula {
    Description: string;
    FormulaGuid: string;
    Title: string;
    WebTemplate: string;
  }
}

export class FormulaDataSource extends DataSource implements IFormulaDataSource {

  private _cachedFormulas: IDesignPackage[];

  constructor(hostSettings: ISpPageContext) {
    super(hostSettings);

    this._parseSingleServerFormula = this._parseSingleServerFormula.bind(this);
  }

  /**
   * Retrieves formulas from the server.
   */
  public getFormulas(): Promise<IFormulaDataSet> {
    if (!this._cachedFormulas) {
      return this.getData<IDesignPackage[]>(
        /*getUrl*/this._getGetFormulasUrl.bind(this),
        /*parseResponse*/this._parseGetFormulasResponse.bind(this),
        /*qosName*/'getFilteredFormulas',
        /*getAdditionalPostData*/this._getGetFormulasPostData.bind(this)
      ).then((formulas: IDesignPackage[]) => {
        if (!this._cachedFormulas) {
          return new FormulaDataSet(formulas);
        }
      });
    }
    return Promise.wrap(new FormulaDataSet(this._cachedFormulas));
  }

  private _getGetFormulasUrl(): string {
    return Uri.concatenate(this._pageContext.webServerRelativeUrl,
      '_api',
      'recipesutility',
      'GetFilteredFormulas');
  }

  private _getGetFormulasPostData(): string {
    return JSON.stringify({
      includeUntargeted: true
    });
  }

  private _getSupportedTemplates(serverFormula: ServerResponse.IServerFormula): WebTemplateType[] {
    if (serverFormula.WebTemplate) {
      try
      {
        return JSON.parse(serverFormula.WebTemplate);
      } catch (ex) {
        return [];
      }
    }
    return [];
  }

  private _parseSingleServerFormula(serverFormula: ServerResponse.IServerFormula): IDesignPackage {
    return {
      id: serverFormula.FormulaGuid,
      chromeOptions: null,
      title: serverFormula.Title,
      description: serverFormula.Description,
      supportedTemplates: this._getSupportedTemplates(serverFormula),
      isFormula: true
    };
  }

  private _parseGetFormulasResponse(responseText: string): IDesignPackage[] {
    let getFormulasServerResponse: ServerResponse.IGetFormulasServerResponse = JSON.parse(responseText);
    if (getFormulasServerResponse.d && getFormulasServerResponse.d.GetFilteredFormulas)
    {
      let serverFormulas: ServerResponse.IServerFormula[] = getFormulasServerResponse.d.GetFilteredFormulas.results;
      if (serverFormulas && serverFormulas.length) {
        return serverFormulas.map(this._parseSingleServerFormula);
      }
    }
    return [];
  }
}
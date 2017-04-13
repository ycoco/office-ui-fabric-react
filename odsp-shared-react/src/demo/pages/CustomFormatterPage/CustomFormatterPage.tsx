import * as React from 'react';
import { formatExamples, schema, locStrings, contextInfo } from './CustomFormatterExampleData'
import { CustomFormatter } from '../../../components/CustomFormatter/CustomFormatter';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import './CustomFormatterPage.scss';

export class CustomFormatterPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='CustomFormatter'>
        <h1 className='ms-font-xxl'>Custom Formatter</h1>
        <div>CustomFormatter allows for a custom layout from a JSON blob and a data blob</div>
        <CustomFormatterExample {...formatExamples[0]} />
        <CustomFormatterExample {...formatExamples[1]} />
        <CustomFormatterExample {...formatExamples[2]} />
        <CustomFormatterExample {...formatExamples[3]} />
        <CustomFormatterExample {...formatExamples[4]} />
        <CustomFormatterExample {...formatExamples[5]} />
        <CustomFormatterExample {...formatExamples[6]} />
        <CustomFormatterExample {...formatExamples[7]} />
        <CustomFormatterExample {...formatExamples[8]} />
        <CustomFormatterExample {...formatExamples[9]} />
        <CustomFormatterExample {...formatExamples[10]} />
        <PropertiesTableSet componentName='CustomFormatter' />

      </div>
    );
  }

}

class CustomFormatterExample extends React.Component<any, any> {
  private _formatExample: any;
  private _taRenderJson: HTMLTextAreaElement;
  private _taData: HTMLTextAreaElement;
  private _divPreview: HTMLElement;
  constructor(formatExample) {
    super(formatExample);
    this._formatExample = formatExample;
  }
  public render() {
    let formatExample = this._formatExample;
    return (
      <div>
        <br />
        <div className="description">{ formatExample.description }</div>
        <div className="flex-container">
          <div className="taContainer">
            <div>Field Renderer format input</div>
            <textarea className="ta" defaultValue={ JSON.stringify(formatExample.format, null, 2) } ref={ el => this._taRenderJson = el } />
          </div>
          <div className="taContainer">
            <div>Row data</div>
            <textarea className="ta" defaultValue={ JSON.stringify(formatExample.rowData, null, 2) } ref={ el => this._taData = el } />
          </div>
        </div>
        <div>
          <button onClick={ this.reApply.bind(this) }>Re-apply</button>
        </div>
        <div dangerouslySetInnerHTML={ this.rowsOfHtml(formatExample.format,
          formatExample.curField,
          formatExample.rowData) } ref={ el => this._divPreview = el } />
        <br /><br />
      </div>
    );
  }

  private rowsOfHtml(formatter: any, curField: string, rowData: any) {
    var fullHtml = [];
    for (let i = 0; i < rowData.length; i++) {
      let exp = new CustomFormatter({
        fieldRendererFormat: JSON.stringify(formatter),
        row: rowData[i],
        currentFieldName: curField,
        rowSchema: schema,
        errorStrings: locStrings,
        pageContextInfo: contextInfo
      });
      let fieldHTML: string = exp.evaluate();
      console.log('field HTML rendered: ' + fieldHTML);
      let html = '<div class="outerCell">' + fieldHTML + '</div>';
      fullHtml.push(html);
    }
    return { __html: fullHtml.join('') };
  }

  private reApply() {
    let formatter: any = JSON.parse(this._taRenderJson.value);
    let rowData: any = JSON.parse(this._taData.value);
    let previewHTML = this.rowsOfHtml(formatter, this._formatExample.curField, rowData);
    this._divPreview.innerHTML = previewHTML.__html;
  }

}
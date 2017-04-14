import * as React from 'react';
import { formatExamples, schema, locStrings, contextInfo } from './CustomFormatterExampleData'
import { CustomFormatter } from '../../../components/CustomFormatter/CustomFormatter';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import './CustomFormatterPage.scss';

export class CustomFormatterPage extends React.Component<any, any> {
  private _elmSelect: HTMLSelectElement;
  private _elmExample: HTMLElement;

  constructor() {
    super();
    this.state = {
      currentExampleIndex: 0
    };
  }

  public render() {
    return (
      <div className='CustomFormatter'>
        <h1 className='ms-font-xxl'>Custom Formatter</h1>
        <div>CustomFormatter allows for a custom layout from a JSON blob and a data blob.
            Here are some examples. Use the dropdown below to pick an example.
        </div>
        <div>
          <select ref={ el => this._elmSelect = el } onChange={ this._onSelectionChange.bind(this) } >
            { this._renderSelItems() }
          </select>
        </div>
        <div ref={ el => this._elmExample = el }>
          <CustomFormatterExample {...formatExamples[this.state.currentExampleIndex]} />
        </div>
        <PropertiesTableSet componentName='CustomFormatter' />
      </div>
    );
  }

  private _onSelectionChange() {
    this.setState({ currentExampleIndex: this._elmSelect.selectedIndex });
  }

  private _renderSelItems() {
    return formatExamples.map((item, index) => {
      return (<option key={ index.toString() }> { item.display } </option>);
    });
  }
}

class CustomFormatterExample extends React.Component<any, any> {
  private _taRenderJson: HTMLTextAreaElement;
  private _taData: HTMLTextAreaElement;
  private _divPreview: HTMLElement;
  public render() {
    let formatExample = this.props;
    let formatterString = JSON.stringify(formatExample.format, null, 2);
    let dataString = JSON.stringify(formatExample.rowData, null, 2);
    return (
      <div>
        <br />
        <div className="description">{ formatExample.description }</div>
        <div className="flex-container">
          <div className="taContainer">
            <div>Field Renderer format input</div>
            <textarea className="ta" value={ formatterString } ref={ el => this._taRenderJson = el } onChange={ this.onFormatterChange.bind(this) } />
          </div>
          <div className="taContainer">
            <div>Row data</div>
            <textarea className="ta" value={ dataString } ref={ el => this._taData = el } onChange={ this.onDataChange.bind(this) } />
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

  private onFormatterChange(event) {
    let state = this.props;
    state.format = event.target.value;
    this.state = state;
  }

  private onDataChange(event) {
    let state = this.props;
    state.rowData = event.target.value;
    this.state = state;
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
    let previewHTML = this.rowsOfHtml(formatter, this.props.curField, rowData);
    this._divPreview.innerHTML = previewHTML.__html;
  }

}

let { expect } = chai;

import { CustomFormatter } from './CustomFormatter';
import { formatExamples, schema, locStrings, contextInfo } from '../../demo/pages/CustomFormatterPage/CustomFormatterExampleData'

const EXPECTATION_MAP = [
  { sample: formatExamples[0], result: '<div style="padding:4px;background-color:#00ff00;" >44</div>' },
  { sample: formatExamples[1], result: '<a style="padding:6px;border:1px solid #aaaaaa;display:inline-block;text-decoration:none;border-radius:5px;;"  target="_blank"  href="http://finance.yahoo.com/quote/MSFT" >Microsoft</a>' },
  { sample: formatExamples[2], result: '<img  src="http://covers.openlibrary.org/b/isbn/0345538374-M.jpg" ></img>' },
  { sample: formatExamples[3], result: '<div style="padding:4px;background-color:#9999FF;width:12.5%;" >5</div>' },
  { sample: formatExamples[4], result: '<div style="padding:4px;font-size:25px;" ><span >6026</span><span style="color:#00AA00;" >↑</span></div>' },
  { sample: formatExamples[5], result: '<div style="padding:4px;height:80px;overflow:hidden;font-size:x-small;" ><span style="display:inline-block;padding:4px;margin-right:4px;vertical-align:bottom;background-color:#ffaaaa;max-width:40px;height:40.512px;" >Jan ($5064)</span><span style="display:inline-block;padding:4px;margin-right:4px;vertical-align:bottom;background-color:#aaaaff;max-width:40px;height:48.208px;" >Feb ($6026)</span><span style="display:inline-block;padding:4px;margin-right:4px;vertical-align:bottom;background-color:#aaffaa;max-width:40px;height:70.352px;" >Mar ($8794)</span></div>' },
  { sample: formatExamples[6], result: '<div style="display:flex;padding:4px;border:1px solid #aaaaaa;" ><div style="display:inline-block;background-color:#aaaaaa;border-radius:100%;fill:#1b75bb;width:120px;height:120px;" ><svg ><path  d="M60,60 L60,0, A60,60 0 0,1 119.52688209344609,67.5199938984661 z" ></path></svg></div><div >Health Care( 27% )</div></div>' },
  { sample: formatExamples[7], result: '<a  href="alert(&#39;foo&#39;)"  target="_blank"  src="http://covers.openlibrary.org/b/isbn/&lt;script&gt;alert(&#39;foo&#39;)&lt;/script&gt;-M.jpg" >&lt;script&gt;alert(&#39;foo&#39;)&lt;/script&gt;</a>' },
  { sample: formatExamples[8], result: '<div style="color:#ff0000;" >Cyrus Balsara</div>' },
  { sample: formatExamples[9], result: '<div style="color:#ff0000;" >Tue Mar 21 2017</div>' }
]

describe('Custom Field Renderer', () => {

  for (let i = 0; i < EXPECTATION_MAP.length; i++) {
    let formatter = EXPECTATION_MAP[i].sample;
    it('testing: ' + formatter.description, () => {
      let cf = new CustomFormatter({
        fieldRendererFormat: JSON.stringify(formatter.format),
        row: formatter.rowData[0],
        currentFieldName: formatter.curField,
        rowSchema: schema,
        errorStrings: locStrings,
        pageContextInfo: contextInfo
      });
      let outputHtml: string = cf.evaluate();
      expect(outputHtml).to.equal(EXPECTATION_MAP[i].result);
    });
  };
});

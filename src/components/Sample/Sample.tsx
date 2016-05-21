import * as React from 'react';
import { ISampleProps } from './Sample.Props';

let _instance = 0;

/**
 * Sample Control
 */
export default class Sample extends React.Component<ISampleProps, {}> {

  private _instanceIdPrefix: string;

  constructor(props: ISampleProps, context?: any) {
    super(props, context);
    this._instanceIdPrefix = 'ms-Sample-' + (_instance++) + '-';
  }

  public render() {
    return (
      <div className='ms-Sample' ref='SampleRegion' onClick={ this._onClick.bind(this, this.props) }>
        { this.props.sampleText }
      </div>
    );
  }

  private _onClick(sample: ISampleProps, ev: React.MouseEvent) {
    if (sample.onClick) {
      sample.onClick(sample, ev);

      ev.stopPropagation();
      ev.preventDefault();
    }
  }
}

import * as React from 'react';
import { ISampleProps } from './Sample.Props';

/**
 * Sample Control gives an example of a very simple component
 */
export class Sample extends React.Component<ISampleProps, {}> {

  constructor(props: ISampleProps, context?: any) {
    super(props, context);
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

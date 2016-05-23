import * as React from 'react';
import { Sample, ISampleProps } from '../../../../components/index';

export class SampleExample extends React.Component<React.Props<SampleExample>, {}> {
  constructor() {
    super();
  }

  public render() {
    let sampleProps: ISampleProps = {
        sampleText: `Lorem Ipsum`,
        onClick: (sample: ISampleProps) => {
          alert(`You clicked on ${sample.sampleText}`);
        }
    };

    return (
      <Sample {...sampleProps} />
    );
  }
}

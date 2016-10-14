import * as React from 'react';
import { Sample } from './Sample';

export interface ISampleProps extends React.Props<Sample> {
  // Contents
  /** Sample text */
  sampleText: string;

  // Behavior
  /** On item clicked */
  onClick?: (item?: ISampleProps, evt?: React.MouseEvent) => void;
}

import * as React from 'react';
import './CheckCircle.scss';
import { css } from 'office-ui-fabric-react/lib/utilities/css';

export interface ICheckCircleProps extends React.Props<any> {
  isChecked?: boolean;
}

export const CheckCircle = (props: ICheckCircleProps) => (
  <svg
    className={ css(
      'ms-CheckCircle',
      { 'is-checked': props.isChecked }
      ) }
    height='20'
    width='20'
  >
    <circle className='ms-CheckCircle-circle' cx='10' cy='10' r='9' strokeWidth='1' />
    <polyline className='ms-CheckCircle-check' points='6.3,10.3 9,13 13.3,7.5' strokeWidth='1.5' fill='none' />
  </svg>
);

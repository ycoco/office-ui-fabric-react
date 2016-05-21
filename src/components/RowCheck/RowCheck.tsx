import * as React from 'react';
import './RowCheck.scss';
import { css } from '@ms/office-ui-fabric-react/lib/utilities/css';

export interface ICheckProps extends React.Props<any> {
  isChecked?: boolean;
}

// TODO: Create example page for this
export const RowCheck = (props: ICheckProps) => (
  <svg
    className={ css('ms-Check', { 'is-checked': props.isChecked }) }
    height='20'
    width='20'
  >
    <circle className='ms-Check-circle' cx='10' cy='10' r='9' strokeWidth='1' />
    <polyline className='ms-Check-check' points='6.3,10.3 9,13 13.3,7.5' strokeWidth='1.5' fill='none' />
  </svg>
);

export default RowCheck;

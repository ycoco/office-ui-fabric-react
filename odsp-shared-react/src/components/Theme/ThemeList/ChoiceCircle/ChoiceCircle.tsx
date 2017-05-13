import * as React from 'react';
// Styles were taken from the ChoiceGroup control in office-ui-fabric-react and then modified.
import './ChoiceCircle.scss';
import { css } from 'office-ui-fabric-react/lib/Utilities';

export interface IChoiceCircleProps extends React.Props<any> {
  isChecked?: boolean;
}
// TODO Move this to office-ui-fabric-react
export const ChoiceCircle = (props: IChoiceCircleProps) => (
  <div className='ms-ChoiceCircle-container'>
    <div
      className={ css(
        'ms-ChoiceCircle-outer',
        { 'ms-ChoiceCircle-isChecked': props.isChecked }
      ) }
      />
    <div
      className={ css('ms-ChoiceCircle-inner',
        { 'ms-ChoiceCircle-isChecked': props.isChecked }) }
      />
  </div>
);

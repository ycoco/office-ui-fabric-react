import * as React from 'react';
import { CheckCircle, ICheckCircleProps } from '../../../../components/index';

export interface ICheckCircleExampleState {
  isChecked: boolean;
}

export class CheckCircleExample extends React.Component<React.Props<CheckCircleExample>, ICheckCircleExampleState> {
  constructor() {
    super();

    this.state = {
      isChecked: false
    };
  }

  public render() {
    let checkProps: ICheckCircleProps = {
        isChecked: this.state.isChecked
    };

    return (
      <div
        onClick={
          (() => {
            this.setState({
              isChecked: !this.state.isChecked
            });
          }).bind(this)
        }
        style={ {
          backgroundColor: '#ff0000',
          display: 'inline-block'
          } }
      >
        <CheckCircle {...checkProps} />
      </div>
    );
  }
}

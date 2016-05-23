import * as React from 'react';
import { RowCheck, ICheckProps } from '../../../../components/index';

export interface IRowCheckExampleState {
  isChecked: boolean;
}

export default class RowCheckExample extends React.Component<React.Props<RowCheckExample>, IRowCheckExampleState> {
  constructor() {
    super();

    this.state = {
      isChecked: false
    };
  }

  public render() {
    let checkProps: ICheckProps = {
        isChecked: this.state.isChecked
    };

    return (
      <div onClick={
        (() => {
          this.setState({
            isChecked: !this.state.isChecked
          });
        }).bind(this)
      }>
        <RowCheck {...checkProps} />
      </div>
    );
  }
}

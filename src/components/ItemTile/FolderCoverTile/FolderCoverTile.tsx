import * as React from 'react';
import './FolderCoverTile.scss';

import { Async } from '@ms/office-ui-fabric-react/lib/utilities/Async/Async';

let _instance = 0;

const COVERTILE_TRANSITION_DURATION = 600;

export interface IFolderCoverRecord {
  thumbnail?: JSX.Element;
  watermarkUrl?: string;
}

export interface IFolderCoverTileProps extends React.Props<any> {
  coverRecords?: IFolderCoverRecord[];
}

export interface IFolderCoverTileState {
  next?: IFolderCoverRecord;
  current?: IFolderCoverRecord;
  last?: IFolderCoverRecord;
}

/**
 * FolderCoverTile Control that displays the thumbnail for a folder tile and controls pulsing thumbnail images.
 */
export class FolderCoverTile extends React.Component<IFolderCoverTileProps, IFolderCoverTileState> {

  private _instanceIdPrefix: string;

  private _thumbnailIndex: number;
  private _receivedPulse: boolean;
  private _async: Async;

  constructor(props: IFolderCoverTileProps, context?: any) {
    super(props, context);

    this._instanceIdPrefix = 'ms-FolderCoverTile-' + (_instance++) + '-';

    this._thumbnailIndex = 0;
    this._receivedPulse = true;
    this._async = new Async(this);

    this.state = {
      last: this._getNextRecord(),
      current: this._getNextRecord(),
      next: this._getNextRecord()
    };
  }

  public componentWillUnmount() {
    this._async.dispose();
  }

  public render() {
    return (
      <div className='ms-FolderCoverTile' ref='FolderCoverTileRegion'>
        { this._renderBlank(3) }
        { this._renderPulseRecord(this.state.last, 2) }
        { this._renderPulseRecord(this.state.current, 1) }
        { this._renderPulseRecord(this.state.next, 0) }
      </div>
    );
  }

  /**
   * When called, causes the FolderCoverTile to change to the next thumbnail using CSS transitions.
   * This can only
   */
  public pulse() {
    if (!!this.props.coverRecords && this.props.coverRecords.length > 1) {
      // Causes a className change which in turn causes transition animations
      this._receivedPulse = true;
      this.forceUpdate();

      // When the tranition animations complete, the className is restores and the thumbnail queue is advanced.
      this._async.setTimeout(() => {
        this.setState({
          last: this.state.current,
          current: this.state.next,
          next: this._getNextRecord()
        });
        this._receivedPulse = false;
        this.forceUpdate();
      }, COVERTILE_TRANSITION_DURATION);
    }
  }

  private _renderPulseRecord(record, index) {
    return (
      <div
        className={ 'ms-FolderCoverTile-item' + String(index) + (this._receivedPulse ? ' pulse' : '') }
        key={ index }
        ref={ String(index) }
        >
        { !!record.thumbnail &&
          <div className='ms-FolderCoverTile-image'>
            { record.thumbnail }
          </div> }
        { !!record.watermarkUrl &&
          <img className='ms-FolderCoverTile-watermark' src={ record.watermarkUrl } /> }
      </div>
    );
  }

  private _renderBlank(index) {
    return (
      <div
        className={ 'ms-FolderCoverTile-item' + String(index) + (this._receivedPulse ? ' pulse' : '') }
        key={ index }
        ref={ String(index) }
        >
      </div>
    );
  }

  private _getNextRecord(): IFolderCoverRecord {
    if (this.props.coverRecords && this.props.coverRecords.length) {
      this._thumbnailIndex = (this._thumbnailIndex + 1) % this.props.coverRecords.length;

      return this.props.coverRecords[this._thumbnailIndex];
    }

    return null;
  }
}

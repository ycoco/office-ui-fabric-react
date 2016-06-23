import * as React from 'react';
import './FolderCoverTile.scss';

import { Async } from '@ms/office-ui-fabric-react/lib/utilities/Async/Async';

let _instance = 0;

const COVERTILE_TRANSITION_DURATION = 600;

export interface IFolderCoverRecord {
  thumbnail?: JSX.Element;
}

export interface IFolderCoverTileProps extends React.Props<FolderCoverTile> {
  coverRecords?: IFolderCoverRecord[];
  childCount?: number;
  watermarkUrl?: string;
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
  public static defaultProps = {
    coverRecords: [],
    childCount: 0
  };

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
    let {
      coverRecords,
      childCount
    } = this.props;

    if (!childCount && (!coverRecords || coverRecords.length === 0)) {
      return (
        <div className='ms-FolderCoverTile' ref='FolderCoverTileRegion'>
          <div className='ms-FolderCoverTile-empty' />
        </div>
      );
    }

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
    let {
      coverRecords
    } = this.props;

    if (!!coverRecords && coverRecords.length > 1) {
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

  private _renderPulseRecord(record: IFolderCoverRecord, index) {
    let {
      coverRecords,
      childCount,
      watermarkUrl
    } = this.props;

    if (index >= Math.max(childCount, coverRecords.length)) {
      return null;
    }

    if (!record) {
      return this._renderBlank(index);
    }

    return (
      <div
        className={ 'ms-FolderCoverTile-item' + String(index) + (this._receivedPulse ? ' pulse' : '') }
        key={ index }
        ref={ String(index) }
        >
        { record.thumbnail &&
          <div className='ms-FolderCoverTile-image'>
            { record.thumbnail }
          </div> }
        { watermarkUrl &&
          <img className='ms-FolderCoverTile-watermark' src={ watermarkUrl } /> }
      </div>
    );
  }

  private _renderBlank(index) {
    let {
      coverRecords,
      childCount,
      watermarkUrl
    } = this.props;

    if (index >= Math.max(childCount, coverRecords.length)) {
      return null;
    }

    return (
      <div
        className={ 'ms-FolderCoverTile-item' + String(index) + (this._receivedPulse ? ' pulse' : '') }
        key={ index }
        ref={ String(index) }
        >
        { watermarkUrl &&
          <img className='ms-FolderCoverTile-watermark' src={ watermarkUrl } /> }
      </div>
    );
  }

  private _getNextRecord(): IFolderCoverRecord {
    let {
      coverRecords
    } = this.props;

    if (coverRecords && coverRecords.length) {
      this._thumbnailIndex = (this._thumbnailIndex + 1) % coverRecords.length;

      return coverRecords[this._thumbnailIndex];
    }

    return null;
  }
}

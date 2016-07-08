import * as React from 'react';
import { Dialog, DialogType } from '@ms/office-ui-fabric-react/lib/Dialog';
import { Spinner } from '@ms/office-ui-fabric-react/lib/Spinner';
import { FocusZone } from '@ms/office-ui-fabric-react/lib/FocusZone';
import { getRTL } from '@ms/office-ui-fabric-react/lib/utilities/rtl';
import './ShareIFrame.scss';

export interface IShareIFrameProps {
  /** The URL of the page that the IFrame will display. */
  url: string;
  /** The title of the page that is going to be shared. */
  title?: string;
  /**
  * The share label
  * @default 'Share'
  */
  shareLabel?: string;
  /**
   * The loading label
   * @default 'Loading'
   */
  loadingLabel?: string;
  /**
   * If true the share dialog will be displayed. If false it will not be displayed
   * @default false
   */
  shareVisible?: boolean;
  /** Callback when the dialog is dismissed */
  onClose?: () => void;
  /** The css class of the dialog */
  className?: string;
  /** The css class of the iFrame */
  frameClass?: string;
}

export interface IShareIFrameState {
  /** If true then the page within the frame is loading. If false then it has completed loading */
  frameLoading?: boolean;
  /** If true the frame is present within the dialog. If false the frame is moved offscreen. Used for loading.  */
  frameVisible?: boolean;
}

/** The share page requires a custom iframe which provides additional methods for legacy calls. */
interface ICustomIFrame extends HTMLIFrameElement {
  cancelPopUp: () => void;
  commitPopup: (url: string) => void;
  autoSizeSuppressScrollbar: (callback: any) => void;
}

export class ShareIFrame extends React.Component<IShareIFrameProps, IShareIFrameState>  {
  public static defaultProps: IShareIFrameProps = {
    url: '',
    title: null,
    shareLabel: 'Share',
    loadingLabel: 'Loading',
    shareVisible: false,
    onClose: null,
    className: '',
    frameClass: ''
  };

  private _shareFrameHeight: string = '321px';
  private _sharedWithFrameHeight: string = '295px';
  private _frameWidth: string = '595px';

  private _frame: HTMLIFrameElement;

  constructor(props: IShareIFrameProps) {
    super(props);
    this.state = { frameLoading: true, frameVisible: false };
  }

  public componentWillReceiveProps(nextProps: IShareIFrameProps) {
    if (nextProps.shareVisible && !this.state.frameVisible) {
      this.setState({ frameLoading: true, frameVisible: false });
    }
  }

  public render() {
    let title = this.props.title ? ' \'' + this.props.title + '\'' : '';
    let shareTitle = this.props.shareLabel + title;
    return (
      <Dialog
        isOpen={ this.props.shareVisible }
        onDismiss={ this._closeDialog.bind(this) }
        type={ DialogType.close }
        title={ shareTitle }
        isBlocking={ false }
        containerClassName={ 'od-share-DialogContainer' }
        contentClassName={ 'od-share-DialogContent' }
        >
        <div>
          { this.state.frameLoading ? (<Spinner label={ this.props.loadingLabel } className={ 'shareSpinner' }/>) : (null) }
          <FocusZone>
            <iframe src={ this.props.url }
              className={ 'ShareFrame ' + this.props.frameClass + (this.state.frameVisible ? ' frameVisible' : ' frameLoading') }
              ref={ (frame: HTMLIFrameElement) => this._setupIframeElementFunctions(frame) }
              onLoad={ () => this._frameLoad() }
              height={ this._shareFrameHeight }
              width={ this._frameWidth }
              title={ this.props.shareLabel }
              />
          </FocusZone>
        </div>
      </Dialog>
    );
  }

  private _closeDialog(ev: React.MouseEvent) {
    // Reset the state
    this.setState({ frameLoading: true, frameVisible: false });
    if (this.props.onClose) {
      this.props.onClose();
    }
    ev.stopPropagation();
    ev.preventDefault();
  }

  private _frameLoad() {
    const aspForm: HTMLElement = this._frame.contentWindow.document.getElementById('aspnetForm');
    const sharedWithTab: HTMLElement = this._frame.contentWindow.document.getElementById('lnkSharedWithDlg');
    const shareDialogTab: HTMLElement = this._frame.contentWindow.document.getElementById('lnkShrDlg');

    // The aspform gets an unhandled submit event from the "Close" button on the
    // shared with page. This causes the page to attempt to send an email when really
    // the dialog should close. Adding this event listener here prevents this bad behavior.
    if (aspForm) {
      aspForm.addEventListener('submit', (ev: any) => this._closeDialog(ev));
    }

    if (sharedWithTab) {
      sharedWithTab.addEventListener('click', (ev: any) => this._sharedWithTabClick());
    }

    if (shareDialogTab) {
      shareDialogTab.addEventListener('click', (ev: any) => this._updateFrameHeight());
      shareDialogTab.focus();
    }

    if (getRTL()) {
      this._frame.contentDocument.documentElement.dir = 'rtl';
    }

    this._updateFrameHeight();

    this.setState({ frameLoading: false, frameVisible: true });
  }

  private _sharedWithTabClick() {
    this._frame.height = this._sharedWithFrameHeight;
  }

  private _updateFrameHeight() {
    const workSpace: HTMLElement = this._frame.contentWindow.document.getElementById('s4-workspace');

    if (workSpace) {
      workSpace.style.height = 'auto';
      workSpace.style.overflow = '';
      let workSpaceRect: ClientRect = workSpace.getBoundingClientRect();

      this._frame.height = workSpaceRect.height + 'px';
      workSpace.style.overflow = 'auto';
    }
  }

  private _setupIframeElementFunctions(iframe: HTMLIFrameElement) {
    if (iframe) {
      let customIFrame: ICustomIFrame = iframe as ICustomIFrame;
      // iframe needs additional methods to support the legacy calls that the share page makes.
      customIFrame.cancelPopUp = this._closeDialog.bind(this);
      customIFrame.commitPopup = (url: string) => {
        this.props.onClose();
      };
      customIFrame.autoSizeSuppressScrollbar = (callback: any) => {
        callback();
      };
    }

    this._frame = iframe;
  }
}
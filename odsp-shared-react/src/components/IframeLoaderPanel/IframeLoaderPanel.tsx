// External packages
import * as React from 'react';
import { Panel, PanelType, IPanelProps } from 'office-ui-fabric-react/lib/Panel';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

// Local packages
import './IframeLoaderPanel.scss';

const IFRAME_HEIGHT_OFFSET = 50;
const IFRAME_HEIGHT_MIN = 50;

export interface IframeLoaderPanelProps {
    /** Properties to pass through for panel */
    panelProps: IPanelProps;

    /** Target URL to be loaded inside the iframe */
    url: string;

    /** Callback when the iframe completes loading */
    onLoad: (frame: HTMLIFrameElement) => void;
}

export class IframeLoaderPanel extends React.Component<IframeLoaderPanelProps, any> {
    private _frame: HTMLIFrameElement;

    public static defaultProps = {
        panelProps: {
            type: PanelType.largeFixed,
        }
    };

    constructor(props: IframeLoaderPanelProps) {
        super(props);
    }

    public render() {
        // This is to override "height: 100%" for ".ms-IframeLoader-iframe" that
        // is defined in odsp-next.
        let iframeStyle = {
            height: this._getIframeHeight()
        };
        return (
            <Panel
                className='ms-IframeLoaderPanel'
                firstFocusableSelector='ms-TextField-field'
                isOpen={ true }
                { ...this.props.panelProps } >
                <iframe
                    className="ms-IframeLoader-iframe"
                    src={ this.props.url }
                    ref={ (frame: HTMLIFrameElement) => { this._frame = frame} }
                    onLoad={ this._onLoad }
                    style={ iframeStyle }
                />
            </Panel>
        );
    }

    public componentWillUnmount() {
        if (this._frame) {
            this._frame.src = '';
        }
    }

    @autobind
    private _onLoad(): void {
        if (this.props.onLoad) {
            this.props.onLoad(this._frame);
        }
    }

    private _getIframeHeight(): string {
        let height = document.body.clientHeight - IFRAME_HEIGHT_OFFSET;
        height = (height < IFRAME_HEIGHT_MIN) ? IFRAME_HEIGHT_MIN : height;
        return height + 'px';
    }
}

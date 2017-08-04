import * as React from 'react';
import './Uploader.scss';
import { CommandButton } from 'office-ui-fabric-react';

export interface IUploaderProps {
    label: string;
    onInputChange: (ev: Event) => void;
    isFolderUpload?: boolean;
}

export class Uploader extends React.Component<IUploaderProps, any> {
    private _inputElement: HTMLInputElement;
    constructor(props: IUploaderProps) {
        super(props);
    }

    public componentDidMount() {
        if (this._inputElement && this.props.isFolderUpload) {
            // Currently react doesn't have webkitdirectory as an attribute, so it must be added to the ref,
            // rather than as part of the input.
            this._inputElement.webkitdirectory = true;
        }
    }

    public render() {
        return (
            <div className='ms-ContextualMenu-uploader'>
                <div className='ContextualMenu-uploadInput'>
                    <input
                        type='file'
                        multiple={ true }
                        onChange={ this._onChange.bind(this) }
                        ref={ (c: HTMLInputElement) => this._inputElement = c }
                        data-is-focusable={ false }
                    />
                </div>
                <CommandButton
                    role='menuitem'
                    className='ms-ContextualMenu-uploader'
                    text={ this.props.label }
                    onClick={ () => this._inputElement.click() }>
                </CommandButton>
            </div>);
    }

    private _onChange(ev: Event) {
        this.props.onInputChange(ev);
    }
}

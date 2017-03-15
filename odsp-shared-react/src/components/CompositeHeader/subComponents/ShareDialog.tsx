import * as React from 'react';
import { ShareIFrame } from '../ShareIFrame';
import { IShareButtonProps } from '../CompositeHeader.Props';

export interface IShareDialogProps {
  shareButton: IShareButtonProps;
  title: string;
  onCloseCallback: () => void;
}

export const ShareDialog: React.StatelessComponent<IShareDialogProps> = (props: IShareDialogProps) => {
  return (
    <ShareIFrame url={ props.shareButton.url }
      title={ props.title }
      shareLabel={ props.shareButton.shareLabel }
      shareVisible={ true }
      onClose={ props.onCloseCallback }
      frameClass={ 'ShareFrame' }
      />
  );
}
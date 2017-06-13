import * as React from 'react';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { CommandButton } from 'office-ui-fabric-react/lib/Button';
import { css } from 'office-ui-fabric-react/lib/Utilities';
import { IFollowProps, FollowState } from '../CompositeHeader.Props';

export const FollowButton: React.StatelessComponent<IFollowProps> = (props: IFollowProps) => {
  const followProps = props;

  function _onFollowClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    const { followAction, followState } = props;
    if (followAction && followState !== FollowState.transitioning) {
      followAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  return (
    <CommandButton
      text={
        props.responsiveMode >= ResponsiveMode.small &&
        (followProps.notFollowedLabel && followProps.followState !== FollowState.followed ?
          followProps.notFollowedLabel :
          followProps.followLabel)
      }
      iconProps={{ iconName: followProps.followState === FollowState.notFollowing ? 'FavoriteStar' : 'FavoriteStarFill' }}
      className={ css(
        'ms-CompositeHeader-collapsible',
        {
          'follow-animation-card': followProps.followState === FollowState.transitioning
        }
      ) }
      disabled={ followProps.followState === FollowState.transitioning }
      ariaLabel={ followProps.followState === FollowState.followed ? followProps.followedAriaLabel : followProps.notFollowedAriaLabel }
      onClick={ _onFollowClick }
      aria-pressed={ followProps.followState === FollowState.followed }
      aria-busy={ followProps.followState === FollowState.transitioning }
      title={ followProps.followState === FollowState.followed ? followProps.followedHoverText : followProps.notFollowedHoverText }
      >
    </CommandButton>
  );
}

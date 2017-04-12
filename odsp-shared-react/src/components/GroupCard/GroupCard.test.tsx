import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';
import * as sinon from 'sinon';
import chai = require('chai');

import { GroupCard } from './GroupCard';
import { IGroupCardProps } from './GroupCard.Props';
import { IMembersInfoProps } from '../MembersInfo/MembersInfo.Props';

const expect = chai.expect;
let groupTitle = 'Computer Science Rocks';
let groupLinks = [
    { title: 'Home', href: 'http://www.cnn.com' },
    { title: 'Conversations', href: 'http://www.cnn.com' },
    { title: 'Calendar', href: 'http://www.foxnews.com' },
    { title: 'Files', href: 'http://www.usatoday.com' },
    { title: 'Notebook', href: 'http://news.bbc.co.uk' },
    { title: 'Site', href: 'http://www.usatoday.com' }
  ];
let siteLogo = {
  siteTitle: 'Computer Science Rocks',
  siteAcronym: 'CS',
  siteLogoBgColor: '#7E3877' };
let membersText = '129 members';
let joinedString = 'Joined';
let joinString = 'Join';
let joiningString = 'Joining...';
let leaveGroupString = 'Leave group';
let leavingGroupString = 'Leaving...';
let onJoinClick = sinon.spy();
let onJoinedClick = sinon.spy();
let onLeaveGroupClick = sinon.spy();

describe('GroupCard for non-member', () => {
  let component;
  let renderedDOM;

  let membersInfoProps: IMembersInfoProps = {
    membersText: membersText,
    onJoined: {
      onJoinedString: joinedString,
      onJoinedAction: onJoinedClick
    },
    onLeaveGroup: {
      onLeaveGroupString: leaveGroupString,
      onLeavingGroupString: leavingGroupString,
      onLeaveGroupAction: onLeaveGroupClick
    },
    onJoin: {
      onJoinString: joinString,
      onJoiningString: joiningString,
      onJoinAction: onJoinClick
    },
    isMemberOfCurrentGroup: false
  };

  let groupCardProps: IGroupCardProps = {
    title: groupTitle,
    links: groupLinks,
    siteLogo: siteLogo,
    membersInfoProps: membersInfoProps,
    enableJoinLeaveGroup: true
  };

  before(() => {
    component = ReactTestUtils.renderIntoDocument(
      <GroupCard {...groupCardProps} />
    );
    renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
  });

  it('should render Join button', () => {
    const joinButton: HTMLButtonElement = renderedDOM.getElementsByClassName('ms-membersInfo-joinButton')[0];
    expect(joinButton.textContent).to.equals(joinString);
  });

  it('should not render Joined button', () => {
    const joinedButton: HTMLButtonElement = renderedDOM.getElementsByClassName('ms-membersInfo-joinedButton')[0];
    expect(joinedButton).to.be.undefined;
  });

  it('should hide Join button and display loading spinner and Joining... after click Join', () => {
    const joinButton: HTMLButtonElement = renderedDOM.getElementsByClassName('ms-membersInfo-joinButton')[0];
    ReactTestUtils.Simulate.click(joinButton);
    const joinButtonAfterClick: HTMLButtonElement = renderedDOM.getElementsByClassName('ms-membersInfo-joinButton')[0];
    const loadingSpinner: HTMLElement = renderedDOM.getElementsByClassName('ms-membersInfo-joinButton-spinner')[0];
    expect(onJoinClick.called).to.equal(true);
    expect(joinButtonAfterClick).to.be.undefined;
    expect(loadingSpinner.textContent).to.equals(joiningString);
  });
});

describe('GroupCard for member', () => {
  let component;
  let renderedDOM;

  let membersInfoProps: IMembersInfoProps = {
    membersText: membersText,
    onJoined: {
      onJoinedString: joinedString,
      onJoinedAction: onJoinedClick
    },
    onLeaveGroup: {
      onLeaveGroupString: leaveGroupString,
      onLeavingGroupString: leavingGroupString,
      onLeaveGroupAction: onLeaveGroupClick
    },
    onJoin: {
      onJoinString: joinString,
      onJoiningString: joiningString,
      onJoinAction: onJoinClick
    },
    isMemberOfCurrentGroup: true
  };

  let groupCardProps: IGroupCardProps = {
    title: groupTitle,
    links: groupLinks,
    siteLogo: siteLogo,
    membersInfoProps: membersInfoProps,
    enableJoinLeaveGroup: true
  };

  before(() => {
    component = ReactTestUtils.renderIntoDocument(
      <GroupCard {...groupCardProps} />
    );
    renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
  });

  it('should not render Join button', () => {
    const joinButton: HTMLButtonElement = renderedDOM.getElementsByClassName('ms-membersInfo-joinButton')[0];
    expect(joinButton).to.be.undefined;
  });

  it('should render Joined button', () => {
    const joinedButton: HTMLButtonElement = renderedDOM.getElementsByClassName('ms-membersInfo-joinedButton')[0];
    expect(joinedButton.textContent).to.equals(joinedString);
  });

  it('should render leave group contextual menu after click joined button', () => {
    const joinedButton: HTMLButtonElement = renderedDOM.getElementsByClassName('ms-membersInfo-joinedButton')[0];
    ReactTestUtils.Simulate.click(joinedButton);
    expect(onJoinedClick.called).to.equal(true);
    const leaveGroup = document.getElementsByClassName('ms-membersInfo-joinedButtonContextualMenu-leaveGroup')[0];
    expect(leaveGroup.textContent).to.equals(leaveGroupString);
  });
});

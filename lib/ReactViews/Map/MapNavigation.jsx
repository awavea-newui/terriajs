'use strict';

import React from 'react';

import Compass from './Navigation/Compass.jsx';
import MyLocation from './Navigation/MyLocation.jsx';
import ZoomControl from './Navigation/ZoomControl.jsx';
import SettingPanel from './Panels/SettingPanel.jsx';
import SharePanel from './Panels/SharePanel/SharePanel.jsx';
import DropdownPanel from './Panels/DropdownPanel.jsx';

import FullScreenButton from './Navigation/FullScreenButton.jsx';
import ObserveModelMixin from '../ObserveModelMixin';
import ViewerMode from '../../Models/ViewerMode';

// The map navigation region
const MapNavigation = React.createClass({
    mixins: [ObserveModelMixin],
    propTypes: {
        terria: React.PropTypes.object,
        viewState: React.PropTypes.object.isRequired,
        allBaseMaps: React.PropTypes.array,
    },

    render() {
        return (
            <div className='map-navigation'>
                <ul className='map-navigation__menu'>
                    <li>
                        <FullScreenButton terria={this.props.terria} viewState={this.props.viewState} />
                    </li>
                    <li>
                        <SettingPanel terria={this.props.terria} allBaseMaps={this.props.allBaseMaps}/>
                    </li>
                    <li>
                        <DropdownPanel btnClass="btn--map btn--share"
                                       btnText="Share"
                                       btnTitle="change settings"
                                       className="share-panel">
                            <SharePanel terria={this.props.terria}/>
                        </DropdownPanel>
                    </li>
                    <li>
                        <div><a className='btn btn--map about-link__button' href='#' title='about'> About </a></div>
                    </li>
                </ul>
                <If condition={this.props.terria.viewerMode !== ViewerMode.Leaflet}>
                    <Compass terria={this.props.terria}/>
                </If>
                <MyLocation terria={this.props.terria}/>
                <ZoomControl terria={this.props.terria}/>
            </div>
        );
    }
});

export default MapNavigation;

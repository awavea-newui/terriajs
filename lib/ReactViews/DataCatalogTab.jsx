'use strict';

import DataCatalogMember from './DataCatalog/DataCatalogMember.jsx';
import DataPreview from './Preview/DataPreview.jsx';
import ObserveModelMixin from './ObserveModelMixin';
import React from 'react';
import SearchHeader from './Search/SearchHeader.jsx';
import SearchBox from './Search/SearchBox.jsx';
import CatalogItemNameSearchProviderViewModel from '../ViewModels/CatalogItemNameSearchProviderViewModel.js';
import defined from 'terriajs-cesium/Source/Core/defined';
import knockout from 'terriajs-cesium/Source/ThirdParty/knockout';

// The DataCatalog Tab
const DataCatalogTab = React.createClass({
    mixins: [ObserveModelMixin],

    propTypes: {
        terria: React.PropTypes.object,
        viewState: React.PropTypes.object
    },

    componentWillMount() {
        this.searchProvider = new CatalogItemNameSearchProviderViewModel({terria: this.props.terria});

        knockout.getObservable(this.props.viewState.searchState, 'catalogSearchText').subscribe(function(newText) {
            this.searchProvider.search(newText);
            if (this.searchBox) {
                this.searchBox.setText(newText);
            }
        }, this);
    },

    onSearchTextChanged(newText) {
        this.props.viewState.searchState.catalogSearchText = newText;
    },

    render() {
        const terria = this.props.terria;
        return (
            <div className="panel-content">
                <div className="data-explorer">
                    <SearchBox initialText={this.props.viewState.searchState.catalogSearchText}
                               onSearchTextChanged={this.onSearchTextChanged}
                               ref={ref => {this.searchBox = ref;}} />
                    {this.renderDataCatalog()}
                </div>
                <div className="data-preview__wrapper">
                    <DataPreview terria={terria}
                                 viewState={this.props.viewState}
                                 previewed={this.props.viewState.previewedItem}
                    />
                </div>
            </div>);
    },

    renderDataCatalog() {
        const terria = this.props.terria;
        const isSearching = !!this.props.viewState.searchState.catalogSearchText.length;
        const items = isSearching ?
            this.searchProvider.searchResults.map(result => result.catalogItem) :
            terria.catalog.group.items;

        return (
            <ul className='data-catalog'>
                <SearchHeader searchMessage={this.searchProvider.searchMessage} />
                {isSearching && <label className='label'>Search results</label>}
                {items
                    .filter(defined)
                    .map((item, i) => (
                        <DataCatalogMember viewState={this.props.viewState}
                                           member={item}
                                           manageIsOpenLocally={isSearching}
                                           key={item.uniqueId}
                        />
                    ))
                }
            </ul>);
    }
});

module.exports = DataCatalogTab;

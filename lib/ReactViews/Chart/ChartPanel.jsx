'use strict';

import Chart from './Chart.jsx';
import ChartData from '../../Charts/ChartData';
import ChartPanelDownloadButton from './ChartPanelDownloadButton';
import ClassList from 'class-list';
import defined from 'terriajs-cesium/Source/Core/defined';
import Loader from '../Loader.jsx';
import ObserveModelMixin from '../ObserveModelMixin';
import React from 'react';
import VarType from '../../Map/VarType';

const height = 250;

const ChartPanel = React.createClass({
    mixins: [ObserveModelMixin],

    propTypes: {
        terria: React.PropTypes.object.isRequired,
        onHeightChange: React.PropTypes.func,
        viewState: React.PropTypes.object.isRequired,
        animationDuration: React.PropTypes.number
    },

    closePanel() {
        const chartableItems = this.props.terria.catalog.chartableItems;
        for (let i = chartableItems.length - 1; i >= 0; i--) {
            const item = chartableItems[i];
            if (item.isEnabled && defined(item.tableStructure)) {
                item.tableStructure.columns
                    .filter(column=>column.isActive)
                    .forEach(column=>column.toggleActive());
            }
        }
    },

    componentDidUpdate() {
        if (defined(this.props.onHeightChange)) {
            this.props.onHeightChange();
        }
    },

    bringToFront() {
        // Bring chart to front.
        this.props.viewState.switchComponentOrder(this.props.viewState.componentOrderOptions.chart);
    },

    toggleBodyClass(isVisible) {
        const body = document.body;
        if(isVisible) {
            ClassList(body).add('chart-is-visible');
        } else {
            ClassList(body).remove('chart-is-visible');
        }
        this.props.terria.currentViewer.notifyRepaintRequired();
        // toggleBodyClass was introduced in 3542ad0 - why does it do this?
        // // Allow any animations to finish, then trigger a resize.
        // setTimeout(function() {
        //     triggerResize();
        // }, this.props.animationDuration || 1000); // This 1000 should match the default duration in LineChart.
    },

    render() {
        const chartableItems = this.props.terria.catalog.chartableItems;
        let data = [];
        let xUnits;
        let xType;
        const itemsToInactivate = [];
        for (let i = chartableItems.length - 1; i >= 0; i--) {
            const item = chartableItems[i];
            if (item.isEnabled && defined(item.tableStructure)) {
                const xColumn = getXColumn(item);
                if (defined(xColumn)) {
                    const yColumns = item.tableStructure.columnsByType[VarType.SCALAR].filter(column=>column.isActive);
                    if (yColumns.length > 0) {
                        if (!defined(xType)) {
                            xType = xColumn.type;
                        } else if (xColumn.type !== xType) {
                            // If this x column type doesn't match the previous one, flag it to turn it off.
                            itemsToInactivate.push(i);
                            continue;
                        }
                        const yColumnNumbers = yColumns.map(yColumn=>item.tableStructure.columns.indexOf(yColumn));
                        const pointArrays = item.tableStructure.toPointArrays(xColumn, yColumns);
                        const thisData = pointArrays.map(chartDataFunctionFromPoints(item, yColumns, yColumnNumbers));
                        data = data.concat(thisData);
                        xUnits = defined(xUnits) ? xUnits : xColumn.units;
                    }
                }
            }
        }
        // This changes chartableItems. Does this trigger a re-render?
        itemsToInactivate.forEach(i=>{
            chartableItems[i].tableStructure.columns.forEach(column=>{
                column.isActive = false;
            });
        });

        const isLoading = (chartableItems.length > 0) && (chartableItems[chartableItems.length - 1].isLoading);
        const isVisible = (data.length > 0) || isLoading;

        this.toggleBodyClass(isVisible);

        if (!isVisible) {
            return null;
        }
        let loader;
        let chart;
        if (isLoading) {
            loader = <Loader/>;
        }
        if (data.length > 0) {
            // TODO: use a calculation for the 34 pixels taken off...
            chart = (
                <Chart data={data} axisLabel={{x: xUnits, y: undefined}} height={height - 34}/>
            );
        }
        return (
            <div className={`chart-panel__holder ${(this.props.viewState && this.props.viewState.componentOnTop === this.props.viewState.componentOrderOptions.chart) ? 'is-top' : ''}`} onClick={this.bringToFront}>
                <div className="chart-panel__holder__inner">
                    <div className="chart-panel" style={{height: height}}>
                        <div className="chart-panel__body">
                            <div className="chart-panel__header" style={{height: 41, boxSizing: 'border-box'}}>
                                <label className="chart-panel__section-label label">{loader || 'Charts'}</label>
                                <ChartPanelDownloadButton chartableItems={this.props.terria.catalog.chartableItems} errorEvent={this.props.terria.error} />
                                <button type='button' className="btn btn--close-chart-panel" onClick={this.closePanel} />
                            </div>
                            <div>
                                {chart}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

/**
 * Gets the column that will be used for the X axis of the chart.
 *
 * @returns {TableColumn}
 */
function getXColumn(item) {
    return item.timeColumn || (item.tableStructure && item.tableStructure.columnsByType[VarType.SCALAR][0]);
}

/**
 * Returns a function that will create a {@link ChartData} object for a let of points and a column index.
 *
 * @param item The item to create a chart for
 * @param yColumns Columns that can be used for the y index of the chart.
 * @param yColumnNumbers TODO: What is this?
 * @returns {Function} that returns a {@link ChartData}
 */
function chartDataFunctionFromPoints(item, yColumns, yColumnNumbers) {
    return (points, index)=>
        new ChartData(points, {
            id: item.uniqueId + '-' + yColumnNumbers[index],
            name: yColumns[index].name,
            categoryName: item.name,
            units: yColumns[index].units,
            color: yColumns[index].color
        });
}

module.exports = ChartPanel;

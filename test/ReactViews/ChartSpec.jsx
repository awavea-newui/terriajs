'use strict';

/*global expect,fail*/
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';

// Note getMountedInstance will be built into React 15, and not available in v2.0.0 of react-shallow-testutils
// cf. https://github.com/sheepsteak/react-shallow-testutils/commit/8daa3c2361acfa6ec45f533cf7eea5751c51bf24
import {getMountedInstance} from 'react-shallow-testutils';

import Chart  from '../../lib/ReactViews/Chart/Chart';
import ChartData  from '../../lib/Charts/ChartData';
import TableStructure  from '../../lib/Map/TableStructure';

describe('Chart', function() {

    it('loads data from a url', function(done) {
        // React.createElement(Chart, {
        //     key: 'chart',
        //     axisLabel: {
        //         x: previewXLabel,
        //         y: undefined
        //     },
        //     url: defined(sources) ? sources[0] : undefined,
        //     data: sourceDataAsTableStructure(sourceData),
        //     xColumn: node.attribs['x-column'],
        //     yColumns: yColumns,
        //     styling: styling,
        //     highlightX: node.attribs['highlight-x'],
        //     // columnNames: columnNames,  // Not sure yet if we need this; ideally Chart would get it direct from data.
        //     // columnUnits: columnUnits,
        //     transitionDuration: 300
        // });
        const chart = <Chart url='test/csv_nongeo/time_series.csv'/>;
        const renderer = ReactTestUtils.createRenderer();
        renderer.render(chart);
        const instance = getMountedInstance(renderer);
        instance.getChartDataPromise(instance.getChartParameters()).then(function(data) {
            expect(data.length).toEqual(1);
            expect(data[0].points.length).toEqual(8);
        }).then(done).otherwise(fail);
    });

    it('can have TableStructure data passed directly', function(done) {
        const csvString = 'x,y\r\n1,5\r\n3,8\r\n4,-3\r\n';
        const tableStructure = TableStructure.fromCsv(csvString);
        const chart = <Chart tableStructure={tableStructure} />;
        const renderer = ReactTestUtils.createRenderer();
        renderer.render(chart);
        const instance = getMountedInstance(renderer);
        instance.getChartDataPromise(instance.getChartParameters()).then(function(data) {
            expect(data.length).toEqual(1);
            expect(data[0].name).toEqual('y');
            expect(data[0].points.length).toEqual(3);
        }).then(done).otherwise(fail);
    });

    it('can have an array of ChartData passed directly', function(done) {
        const chartData = new ChartData([{x: 2, y: 5}, {x: 6, y: 2}], {name: 'foo'});
        const chart = <Chart data={[chartData]} />;
        const renderer = ReactTestUtils.createRenderer();
        renderer.render(chart);
        const instance = getMountedInstance(renderer);
        instance.getChartDataPromise(instance.getChartParameters()).then(function(data) {
            expect(data.length).toEqual(1);
            expect(data[0].name).toEqual('foo');
            expect(data[0].points.length).toEqual(2);
        }).then(done).otherwise(fail);
    });

});
'use strict';

/*global require*/
var CesiumMath = require('terriajs-cesium/Source/Core/Math');
var defined = require('terriajs-cesium/Source/Core/defined');
var defineProperties = require('terriajs-cesium/Source/Core/defineProperties');
var FunctionParameter = require('./FunctionParameter');
var inherit = require('../Core/inherit');
var Rectangle = require('terriajs-cesium/Source/Core/Rectangle');

/**
 * A parameter that specifies a bounding box/extent on the globe.
 *
 * @alias BBOXParameter
 * @constructor
 * @extends FunctionParameter
 *
 * @param {Object} options Object with the following properties:
 * @param {Terria} options.terria The Terria instance.
 * @param {String} options.id The unique ID of this parameter.
 * @param {String} [options.name] The name of this parameter.  If not specified, the ID is used as the name.
 * @param {String} [options.description] The description of the parameter.
 * @param {Boolean} [options.defaultValue] The default value.
 */
var BBOXParameter = function(options) {
    FunctionParameter.call(this, options);

    this.defaultValue = options.defaultValue;
};

inherit(FunctionParameter, BBOXParameter);

defineProperties(BBOXParameter.prototype, {
    /**
     * Gets the type of this parameter.
     * @memberof DateTimeParameter.prototype
     * @type {String}
     */
    type: {
        get: function() {
            return 'bbox';
        }
    },
});

BBOXParameter.prototype.formatValueAsString = function(value) {
    if (!defined(value)) {
        return '-';
    }

    var sw = CesiumMath.toDegrees(Rectangle.southwest(value));
    var ne = CesiumMath.toDegrees(Rectangle.northeast(value));

    return 'BBOX: '+Math.abs(sw.latitude) + '°' + (sw.latitude < 0 ? 'S ' : 'N ') +
           Math.abs(sw.longitude) + '°' + (sw.longitude < 0 ? 'W' : 'E') + ' to ' +
           Math.abs(ne.latitude) + '°' + (ne.latitude < 0 ? 'S ' : 'N ') +
           Math.abs(ne.longitude) + '°' + (ne.longitude < 0 ? 'W' : 'E');
};

module.exports = BBOXParameter;

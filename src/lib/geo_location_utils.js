/**
* Copyright 2012-2019, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var countries = require("i18n-iso-countries");
var Lib = require('../lib');

// Minimize for browser.
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

var locationmodeToIdFinder = {
    'ISO-3': Lib.identity,
    'USA-states': Lib.identity,
    'country names': countryNameToISO3
};

function countryNameToISO3(countryName) {
    // Remove trailing and double spaces
    countryName = countryName.trim().replace(/ +(?= )/g, '');
    var iso3 = countries.getAlpha3Code(countryName, 'en');
    if(!iso3) {
        Lib.log('Unrecognized country name: ' + countryName + '.');
        return false;
    }
    return iso3;
}

function locationToFeature(locationmode, location, features) {
    if(!location || typeof location !== 'string') return false;

    var locationId = locationmodeToIdFinder[locationmode](location);
    var filteredFeatures;
    var f, i;

    if(locationId) {
        if(locationmode === 'USA-states') {
            // Filter out features out in USA
            //
            // This is important as the Natural Earth files
            // include state/provinces from USA, Canada, Australia and Brazil
            // which have some overlay in their two-letter ids. For example,
            // 'WA' is used for both Washington state and Western Australia.
            filteredFeatures = [];
            for(i = 0; i < features.length; i++) {
                f = features[i];
                if(f.properties && f.properties.gu && f.properties.gu === 'USA') {
                    filteredFeatures.push(f);
                }
            }
        } else {
            filteredFeatures = features;
        }

        for(i = 0; i < filteredFeatures.length; i++) {
            f = filteredFeatures[i];
            if(f.id === locationId) return f;
        }

        Lib.log([
            'Location with id', locationId,
            'does not have a matching topojson feature at this resolution.'
        ].join(' '));
    }

    return false;
}

module.exports = {
    locationToFeature: locationToFeature
};

/*-------------------------------------------------------------------------
 | Main
 | ========================================================================
 | Main file.
 -------------------------------------------------------------------------*/


var color = d3.scale.category20();

var state = {
    year: 2016,
    minimum: 2013,
    ministryHighlighted: null,
    sliderMouseDown: false,
    subscribers: [],
    subscribe: function(callback) {
        this.subscribers.push(callback)
    },
    notify: function() {
        for (var sub in this.subscribers) {
            this.subscribers[sub](this)
        }
    }
};

var yearValues = getYearValues();
var ministryValues = getMinistryValues();
var sideValues = ["O", "U", "V"];
var sideSigns = [-1, 1, 1];
var yearsScale = d3.scale.linear()
    .domain(yearValues)
    .range(d3.range(0, yearValues.length - 1, 1));
var ministriesScale = d3.scale.ordinal()
    .domain(ministryValues)
    .range(d3.range(0, ministryValues.length - 1, 1));
var sidesScale = d3.scale.ordinal()
    .domain(sideValues)
    .range(sideSigns);
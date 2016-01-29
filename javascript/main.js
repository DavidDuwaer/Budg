/*-------------------------------------------------------------------------
 | Main
 | ========================================================================
 | Main file.
 -------------------------------------------------------------------------*/

var yearValues = getYearValues();

var color = d3.scale.category20b();

var state = {
    year: 2016,
    minimum: +yearValues[0],
    ministryHighlighted: null,
    budgetScale: {"U": 1, "V": 1, "O": 1},
    getSigns: function() {
        return [this.budgetScale["U"], this.budgetScale["V"], this.budgetScale["O"]]
    },
    sliderMouseDown: false,
    subscribers: [],
    subscribe: function(callback) {
        this.subscribers.push(callback)
    },
    notify: function(source) {
        for (var sub in this.subscribers) {
            this.subscribers[sub](this, source)
        }
    }
};


var ministryValues = getMinistryValues();
var sideValues = getBudgetTypes();
var sideSigns = state.getSigns();
var yearsScale = d3.scale.linear()
    .domain(yearValues)
    .range(d3.range(0, yearValues.length - 1, 1));
var ministriesScale = d3.scale.ordinal()
    .domain(ministryValues)
    .range(d3.range(0, ministryValues.length - 1, 1));
var sidesScale = d3.scale.ordinal()
    .domain(sideValues)
    .range(sideSigns);
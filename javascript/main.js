/*-------------------------------------------------------------------------
 | Main
 | ========================================================================
 | Main file.
 -------------------------------------------------------------------------*/

var yearValues = api.getYearValues();

var color = d3.scale.category20b();

var state = {
    year: 2016,
    minimum: +yearValues[0],
    ministryHighlighted: null,

    /*
     * U, V, and O signs respectively (-1, 0 or 1)
     */
    budgetScale: {"U": 1, "V": 1, "O": 1},
    getSigns: function() {
        return [this.budgetScale["U"], this.budgetScale["V"], this.budgetScale["O"]]
    },

    /*
     * @param budgetType A string containing "O", "U" or "V"
     * @return The sign in which the inputted budget type should occur
     * in the visualisations
     */
    getSign: function(budgetType)
    {
        return this.budgetScale[budgetType];
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


var ministryValues = api.getMinistryValues();
//var sideValues = getBudgetTypes();
var sideSigns = state.getSigns();
var yearsScale = d3.scale.linear()
    .domain(yearValues)
    .range(d3.range(0, yearValues.length - 1, 1));
var ministriesScale = d3.scale.ordinal()
    .domain(ministryValues)
    .range(d3.range(0, ministryValues.length - 1, 1));
//var sidesScale = d3.scale.ordinal()
//    .domain(sideValues)
//    .range(sideSigns);

function ColorService()
{
    this.ministry = function(ministryName)
    {
        return d3.scale.category20b();
    }
}

colorService = new ColorService();
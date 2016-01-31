/*-------------------------------------------------------------------------
 | Main
 | ========================================================================
 | Main file.
 -------------------------------------------------------------------------*/

var color = d3.scale.category20b();

var state = {
    year: 2016,
    minimum: +api.getYearValues()[0],
    ministryHighlighted: null,
    rainbow: $("input[name='rainbow'][value='on']").is(':checked'),

    /*
     * U, V, and O signs respectively (-1, 0 or 1)
     */
    budgetScale: {"U": 1, "V": 1, "O": 0},
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
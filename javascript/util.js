/*-------------------------------------------------------------------------
 | Utility
 | ========================================================================
 | The utility file includes utility functions.
 -------------------------------------------------------------------------*/

/**
 * Calls the API to select which years to display.
 * @param years An array of years to select
 */
function selectYears(years) {
    retrieveYears(years).done(function(json){
        visualize(json);
    })

    $(".js-option__years").each(function(i, e) {
        if ($.inArray(+e.name, years) != -1) {
            e.checked = true;
        } else {
            e.checked = false;
        }
    })
}
/*-------------------------------------------------------------------------
 | API
 | ========================================================================
 | The API forms a layer through which the JSON data can be retrieved and
 | accessed. This enhances decoupling and other scripts should use the
 | API rather than manipulate the data directly.
 -------------------------------------------------------------------------*/

// TODO: refactor into one part that gets and stores the JSON file, and another part that selects the years.
/**
 * Retrieves the selected years.
 * @param selectedYears An array of selected years
 * @returns A promise object
 */
function retrieveYears(selectedYears) {
    var deferred = new $.Deferred();

    $.getJSON("data/budget.json", function(data) {
        var tree = [];
        var name = data["name"];
        var years = data["children"];
        for (var index in years) {
            var year = years[index];
            if ($.inArray(year["name"], selectedYears) != -1) {
                tree.push(year);
            }
        }
        // found it, return this object.
        var d3Tree = JSON.parse(JSON.stringify({"name": name, "children": tree}));
        deferred.resolve(d3Tree);
    })

    return deferred.promise();
}
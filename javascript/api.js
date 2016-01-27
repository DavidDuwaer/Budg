/*-------------------------------------------------------------------------
 | API
 | ========================================================================
 | The API forms a layer through which the JSON data can be retrieved and
 | accessed. This enhances decoupling and other scripts should use the
 | API rather than manipulate the data directly.
 -------------------------------------------------------------------------*/

var json;

/**
 * Retrieve or return data.
 */
function getData() {
    if (json == undefined) {
        $.ajax({
            url: "data/budget.json",
            dataType: 'json',
            async: false,
            success: function (data) {
                json = data;
            }
        });
    }
    return json;
}

/*
 * Select year from json.
 * @param json          D3 parse-able JSON object
 * @param selectedYear  The year to select
 * @returns {year} or {null}
 */
function selectYear(json, selectedYear) {
    var years = json["children"];
    for (var index in years) {
        var year = years[index];
        if (year["name"] == selectedYear) {
            return year;
        }
    }
}
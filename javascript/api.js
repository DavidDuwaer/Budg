/*-------------------------------------------------------------------------
 | API
 | ========================================================================
 | The API forms a layer through which the JSON data can be retrieved and
 | accessed. This enhances decoupling and other scripts should use the
 | API rather than manipulate the data directly.
 -------------------------------------------------------------------------*/

function Api()
{
    var json;

    var getData = function() {
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

    this.getTestData = function() {
        var output = null;
        $.ajax({
            url: "data/flare.json",
            dataType: 'json',
            async: false,
            success: function (data) {
                output = data;
            }
        });

        return output
    }

    /**
     * Get the year values
     * @returns {Array} Array of integers representing all the years
     * covered in the dataset
     */
    this.getYearValues = function() {
        var data = getData();
        var values = [];
        for (var year in data) {
            values.push(year)
        }
        return values
    }

    /**
     * Get the ministry values
     * @returns {Array} Array of strings with all ministry names
     * covered in the dataset
     */
    this.getMinistryValues = function() {
        var data = getData()["2013"]["O"];
        var values = [];
        for (var ministry in data) {
            values.push(ministry)
        }

        return values
    }

    /*
     * @return Data object of format
     *         {<ministry>:
     *             {<department>:
     *                 {<year>:
     *                     {<o,u or v>: <amount>}
     *                 }
     *             }
     *         }
     */
    this.getRawData = function(){
        var data = getData()
        var output = {}
        for (var yearKey in data) { // root --> 2013-2015
            for (var typeKey in data[yearKey]) { // 2013-2015 --> OUV
                for (var ministryKey in data[yearKey][typeKey]) { // OUV --> ministry
                    if (!output.hasOwnProperty(ministryKey)) output[ministryKey] = {}
                    for (var departmentKey in data[yearKey][typeKey][ministryKey]) { // ministry --> department
                        if (!output[ministryKey].hasOwnProperty(departmentKey))
                            output[ministryKey][departmentKey] = {}
                        if (!output[ministryKey][departmentKey].hasOwnProperty(yearKey))
                            output[ministryKey][departmentKey][yearKey] = {}
                        if (!output[ministryKey][departmentKey][yearKey].hasOwnProperty(typeKey))
                            output[ministryKey][departmentKey][yearKey][typeKey] = data[yearKey][typeKey][ministryKey][departmentKey]
                    }
                }
            }
        }

        return output
    };

    /*
     * @param uvo Array of format: {U: <int>, V: <int>, O: <int>}, with each <int> being -1, 0 or 1, specifying the
     *            sign in which the budget component contributes in the returned data object
     *
     * @return Data object of format
     *         {<ministry>:
     *             {<department>:
     *                 {<year>: <amount>}
     *             }
     *         }
     */
    this.getSpecificData = function(uvo){
        var data = getData()
        var output = {}
        for (var yearKey in data) { // root --> 2013-2015
            for (var typeKey in data[yearKey]) { // 2013-2015 --> OUV
                for (var ministryKey in data[yearKey][typeKey]) { // OUV --> ministry
                    if (!output.hasOwnProperty(ministryKey))
                        output[ministryKey] = {}
                    for (var departmentKey in data[yearKey][typeKey][ministryKey]) { // ministry --> department
                        if (!output[ministryKey].hasOwnProperty(departmentKey))
                            output[ministryKey][departmentKey] = {}
                        if (!output[ministryKey][departmentKey].hasOwnProperty(yearKey))
                            output[ministryKey][departmentKey][yearKey] = 0
                        output[ministryKey][departmentKey][yearKey] += data[yearKey][typeKey][ministryKey][departmentKey] * uvo[typeKey]
                    }
                }
            }
        }

        return output
    };

    /*
     * @param uvo  Array of format: {U: <int>, V: <int>, O: <int>}, with each <int> being -1, 0 or 1, specifying the
     *             sign in which the budget component contributes in the returned data object
     * @param year An integer (!, no string) containing the year on which the return data object is focussed
     *
     * @return Data object of format
     *         {<ministry>:
     *             {<department>:<amount>}
     *         }
     */
    this.getSpecificDataForYear = function(uvo, year){
        var data = getData()
        var output = {}
        for (var typeKey in data[year]) { // 2013-2015 --> OUV
            for (var ministryKey in data[year][typeKey]) { // OUV --> ministry
                if (!output.hasOwnProperty(ministryKey))
                    output[ministryKey] = {}
                for (var departmentKey in data[year][typeKey][ministryKey]) { // ministry --> department
                    if (!output[ministryKey].hasOwnProperty(departmentKey))
                        output[ministryKey][departmentKey] = 0
                    output[ministryKey][departmentKey] += data[year][typeKey][ministryKey][departmentKey] * uvo[typeKey]
                }
            }
        }
        return output;
    };
}

api = new Api();
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

    function getYearValues() {
        var data = getData()
        var values = []
        for (var year in data) {
            values.push(year)
        }
        return values
    }

    function getMinistryValues() {
        var data = getData()["2013"]["O"]
        var values = []
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
                if (!output.hasOwnProperty(ministryKey)) output[ministryKey] = {}
                for (var departmentKey in data[year][typeKey][ministryKey]) { // ministry --> department
                    if (!output[ministryKey].hasOwnProperty(departmentKey)) output[ministryKey][departmentKey] = 0
                    output[ministryKey][departmentKey] += data[year][typeKey][ministryKey][departmentKey] * uvo[typeKey]
                }
            }
        }
        console.log(output)
        return wrapTree("Begroting", JSONtoD3Tree(output))
    };

    function JSONtoD3Tree(tree, name) {
        var d3Tree = []
        for (var key in tree) {
            var value = tree[key]
            if (typeof value === 'object') {
                var object = {}
                object['name'] = key
                object['children'] = JSONtoD3Tree(value)
                d3Tree.push(object)
            } else {
                var leaf = {}
                leaf['name'] = key
                leaf['size'] = value
                d3Tree.push(leaf)
            }
        }

        return JSON.parse(JSON.stringify(d3Tree))
    }

    function wrapTree(name, tree) {
        return {"name": name, "children": tree}
    }
}

api = new Api();
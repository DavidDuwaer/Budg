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

// TODO: make generic
function getYearValues() {
    return ["2013", "2014", "2015", "2016"];
}

// TODO: make generic
function getMinistryValues() {
    return [
        "A: Infrastructuurfonds",
        "B: Gemeentefonds",
        "C: Provinciefonds",
        "F: Diergezondheidsfonds",
        "H: BES-fonds",
        "I: De Koning",
        "IIa: De Staten Generaal",
        "IIb: Overige Hoge Colleges van Staat",
        "III: Algemene Zaken",
        "IV: Koninkrijksrelaties",
        "IXa: Nationale Schuld",
        "IXb: Financiën",
        "J: Deltafonds",
        "V: Buitenlandse Zaken",
        "VI: Veiligheid en Justitie",
        "VII: Binnenlandse Zaken en Koninkrijksrelaties",
        "VIII: Onderwijs: Cultuur en Wetenschap",
        "X: Defensie",
        "XII: Infrastructuur en Milieu",
        "XIII: Economische Zaken",
        "XV: Sociale Zaken en Werkgelegenheid",
        "XVI: Volksgezondheid: Welzijn en Sport",
        "XVII: Buitenlandse Handel & Ontwikkelingssamenwerking",
        "XVIII: Wonen en Rijksdienst"
    ]
}

// TODO: make generic
function getBudgetTypes() {
    return ["U", "V", "O"];
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
    return null;
}

function selectByName(d3tree, name) {
    for (var object in d3tree) {
        if (object["name"] == name) {
            return name["children"];
        }
    }

    return undefined;
}

function setOUV(json, scale) {
    var types = {}
    for(var type in json["children"]) {
        var name = json["children"][type]["name"]
        var children = json["children"][type]["children"]
        types[name] = children
    }
    var U = types["U"]
    var V = types["V"]
    var O = types["O"]
    for (var key in O) {
        var name = O[key]["name"]
        for (var subkey in selectByName(O, name)) {
            O[key]["children"][subkey]["size"] = O[key]["children"][subkey]["size"] * scale["O"]
            try {
                O[key]["children"][subkey]["size"] += V[key]["children"][subkey]["size"] * scale["V"]
            } catch(e) {}
            try {
                O[key]["children"][subkey]["size"] += U[key]["children"][subkey]["size"] * scale["U"]
            } catch(e) {}
        }
    }
    var wrap = {"name": "Begroting", "children": O}
    return JSON.parse(JSON.stringify(wrap));
}




function Api()
{
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
    this.getRawData = function(){};

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
    this.getSpecificData = function(uvo){};

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
    this.getSpecificDataForYear = function(uvo, year){};
}

api = new Api();
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
    return ["O", "U", "V"];
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

function setOUV(json, scale) {
    var U = json["children"][0]
    var V = json["children"][1]
    var O = json["children"][2]
    for (var key in O["children"]) {
        for (var subkey in O["children"][key]["children"]) {
            O["children"][key]["children"][subkey]["size"] = O["children"][key]["children"][subkey]["size"] * scale["O"]
            try {
                O["children"][key]["children"][subkey]["size"] += V["children"][key]["children"][subkey]["size"] * scale["V"]
            } catch(e) {}
            try {
                O["children"][key]["children"][subkey]["size"] += U["children"][key]["children"][subkey]["size"] * scale["U"]
            } catch(e) {}
        }
    }
    return JSON.parse(JSON.stringify(O));
}
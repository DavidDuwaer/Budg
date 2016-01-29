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

function JSONtoD3Tree(tree, name) {
    var d3Tree = []
    for (var key in tree) {
        var value = tree[key]
        if (Array.isArray(value)) {
            var object = []
            object['name'] = key
            object['children'] = JSONtoD3Tree(value)
            d3Tree.push(object)
        } else {
            var leaf = []
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

function selectByName(d3tree, name) {
    for (var object in d3tree) {
        if (object["name"] == name) {
            return object;
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
        for (var subkey in O[key]["children"]) {
            var subname = O[key]["children"][subkey]["name"]

            O[key]["children"][subkey]["size"] *= scale["O"]
            O[key]["children"][subkey]["size"] += selectByName(selectByName(V, name)["children"], subname)["size"] * scale["V"]
            O[key]["children"][subkey]["size"] += selectByName(selectByName(U, name)["children"], subname)["size"] * scale["U"]
        }
    }
    var wrap = {"name": "Begroting", "children": O}
    return JSON.parse(JSON.stringify(wrap));
}
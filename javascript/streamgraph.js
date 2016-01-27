/**
 * Created by david on 27-1-2016.
 */

var layers0, layers1, area;

function drawStreamGraph()
{
    var n = 20, // number of layers
        m = 200, // number of samples per layer
        stack = d3.layout.stack().offset("wiggle");
    //layers0 = stack(d3.range(n).map(function() { return bumpLayer(m); })),
    //layers1 = stack(d3.range(n).map(function() { return bumpLayer(m); }));
    layers0 = stack(multipleTimeSeries);
    layers1 = stack(multipleTimeSeries);

    var width = 960,
        height = 500;

    /*
     * Define scales
     */
    var x = d3.scale.linear()
        .domain([0, yearValues.length - 1])
        .range([0, width]);
    var y = d3.scale.linear()
        .domain([0, d3.max(layers0.concat(layers1), function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
        .range([height, 0]);
    var yReverse = d3.scale.linear()
        .domain([0, d3.max(layers0.concat(layers1), function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
        .range([0, height]);

    /*
     * Returns path attribute as a function of d
     */
    area = d3.svg.area()
        .x(function(d) { return x(d.x); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });

    /*
     * Draw canvas
     */
    var canvas = d3.select("#streamGraphDiv").append("svg")
        .attr("width", width)
        .attr("height", height);

    /*
     * Draw stream graph
     */
    canvas.selectAll("path")
        .data(layers0)
        .enter().append("path")
        .attr("d", area)
        .style("fill", function(d) { return d[0].c; });

    /*
     * Append tooltips
     */
    canvas.selectAll("path")
        .data(layers0)
        .append("svg:title")
        .text(function(d) { return d[0].name; });

    /*
     * Add in-graph labels
     */
    var labels = canvas.selectAll("text")
        .data(layers0)
        .enter()
        .append("text");
    canvas.selectAll("text")
        .data(layers0)
        .attr("text-anchor", "middle")
        .attr("class", "streamGraphLabel")
        .attr("x", function(d) {
            //console.log(yReverse(d[0].y));
            var xc = 0, yMax = 0;
            $.each(d, function(i, point)
            {
                console.log(yReverse(point.y) + " : " + x(point.x));
                if (yReverse(point.y) >= 30 && x(point.x) != 0 && x(point.x) != width)
                {
                    if (point.y > yMax)
                    {
                        xc = x(point.x);
                        yMax = y;
                    }
                }
            });
            return xc;
        })
        .attr("y", function(d) {
            var yc = 0, yMax = 0;
            $.each(d, function(i, point)
            {
                if (yReverse(point.y) > 30 && x(point.x) != 0 && x(point.x) != width)
                {
                    if (point.y > yMax)
                    {
                        yc = y(point.y0 + 0.5 * point.y);
                        yMax = y;
                    }
                }
            });
            return yc;
        })
        .text(function(d) {
            var txt = "", yMax = 0;
            $.each(d, function(i, point)
            {
                if (yReverse(point.y) > 30 && x(point.x) != 0 && x(point.x) != width)
                {
                    if (point.y > yMax)
                    {
                        txt = point.name;
                        yMax = y;
                    }
                }
            });
            return txt;
        });
}

function drawLegend()
{
    /*
     * Draw legend
     */
    var legendRows = d3.select("#colorLegendDiv").select("table")
        .selectAll("tr")
        .data(layers0)
        .enter()
        .append("tr");
    legendRows.append("td")
        .attr("class", "legendSample")
        .attr("bgcolor", function(d) {
            return d[0].c;
        });
    legendRows.append("td")
        .append("text")
        .text(function(d) {
            return d[0].name;
        });
}

function transition() {
    d3.selectAll("path")
        .data(function() {
            var d = layers1;
            layers1 = layers0;
            return layers0 = d;
        })
        .transition()
        .duration(2500)
        .attr("d", area);
}

/*
 * Set data independent scales
 */
//    var color = d3.scale.linear()
//            .range(["#c30", "#ea8"]);
var color = d3.scale.category20();

/*
 * Make data arrays
 */
var yearValues = ["2013", "2014", "2015", "2016"];
var ministryValues = [
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
    //"Rijk",
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
];
var sideValues = ["O", "U", "V"];
var sideSigns = [-1, 1, 1];
console.log(yearValues[0]);
var yearsScale = d3.scale.linear()
    .domain(yearValues)
    .range(d3.range(0, yearValues.length - 1, 1));
var ministriesScale = d3.scale.ordinal()
    .domain(ministryValues)
    .range(d3.range(0, ministryValues.length - 1, 1));
var sidesScale = d3.scale.ordinal()
    .domain(sideValues)
    .range(sideSigns);

var multipleTimeSeries = [];
for (var i = 0; i < ministryValues.length; i++)
{
    multipleTimeSeries[i] = [];
    for (var j = 0; j < yearValues.length; j++)
    {
        multipleTimeSeries[i][j] = {x: yearValues[j], y: 0, name: ""};
    }
}

$.getJSON("data/budget.json", function ( data )
{
    var years = data.children;
    $.each(years, function(i, year)
    {
        var yearI = yearsScale(year.name);
        var sides = year.children;
        $.each(sides, function(j, side)
        {
            var ministries = side.children;
            $.each(ministries, function(k, ministry)
            {
                var ministryI = ministriesScale(ministry.name);
                var departments = ministry.children;
                $.each(departments, function(l, department)
                {
                    var amount = sidesScale(side.name) * department.size;
                    //var amount = department.size;
                    multipleTimeSeries[ministryI][yearI] = {
                        x: yearsScale(year.name),
                        y: multipleTimeSeries[ministryI][yearI].y + amount,
                        name: ministry.name,
                        c: color(ministry.name)
                    };
                });
                console.log("(" + ministryI + ", " + yearI + ") " + ministry.name + " :: " + multipleTimeSeries[ministryI][yearI].y + " :: " + sidesScale(side.name));
            });
        });
    });
    drawStreamGraph();
    drawLegend();
});
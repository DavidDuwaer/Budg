/**
 * Created by david on 27-1-2016.
 */

var layers0, layers1, area;

var streamGraphWidth = $("#streamGraphDiv").width() - getScrollbarWidth();
var streamGraphHeight = getHeight();
var xSliderScale = d3.scale.linear()
    .domain([0, yearValues.length - 1])
    .range([1.5, streamGraphWidth - 1.5]);

function drawStreamGraph()
{
    var stack = d3.layout.stack().offset("wiggle");
    layers0 = stack(multipleTimeSeries);
    layers1 = stack(multipleTimeSeries);

    var width = streamGraphWidth,
        height = streamGraphHeight;

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
    canvas.selectAll("text")
        .data(layers0)
        .enter()
        .append("text");
    canvas.selectAll("text")
        .data(layers0)
        .attr("text-anchor", "middle")
        .attr("class", "streamGraphLabel")
        .attr("x", function(d) {
            var xc = 0, yMax = 0;
            $.each(d, function(i, point)
            {
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

    canvas.append("line")
        .attr("x1", xSliderScale(yearsScale(state.year)))
        .attr("y1", 0)
        .attr("x2", xSliderScale(yearsScale(state.year)))
        .attr("y2", height)
        .attr("class", "streamGraphSlider")
        .attr("id", "streamGraphSlider")
        .on("mousedown", sliderMouseDown);
    d3.select(window)
        .on("mouseup", mouseUp);
    canvas
        .on("mousemove", canvasMouseMove)
        .on("mousedown", canvasMouseDown);
}

function sliderMouseDown()
{
    state.sliderMouseDown = true;
}

function mouseUp()
{
    state.sliderMouseDown = false;
}

function canvasMouseMove()
{
    if (state.sliderMouseDown)
    {
        var X = d3.mouse(this);
        var xa = Math.round(X[0] * (yearValues.length - 1)/streamGraphWidth);
        xa = Math.max(0, xa);
        xa = Math.min(yearValues.length - 1, xa);
        var slider = d3.select("#streamGraphSlider");
        slider
            .attr("x1", xSliderScale(xa))
            .attr("x2", xSliderScale(xa));
        state.year = xa + state.minimum;
        state.notify();
    }

    /*
     * Change cursor appearance with respect to slider
     */
    if (mouseAtSlider(this)) {
        d3.select("body")
            .style("cursor", "pointer");
    }
    else
    {
        d3.select("body")
            .style("cursor", "default");
    }
}

function mouseAtSlider(parentObject)
{
    var result = false;
    var XMouse = d3.mouse(parentObject);
    var xSlider = d3.select("#streamGraphSlider").attr("x1");
    if (Math.abs(XMouse[0] - xSlider) < 20)
        result = true;
    return result;
}

function canvasMouseDown()
{
    if (mouseAtSlider(this))
        sliderMouseDown();
}

function drawLegend()
{
    /*
     * Draw legend
     */
    var legendRows = d3.select("#colorLegendDiv")
        .selectAll("span")
        .attr("class", "legend__item")
        .data(layers0)
        .enter()
        .append("span")
        .attr("class", "legend__item")
    legendRows.append("span")
        .attr("class", "legend__color")
        .attr("style", function(d) {
            return "background-color:" + d[0].c + ";";
        });
    legendRows.append("span")
        .attr("class", "legend__name")
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

/*
 * Make data arrays
 */


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
            });
        });
    });
    drawStreamGraph();
    drawLegend();
});
/**
 * Created by david on 27-1-2016.
 */

function StreamGraph()
{
    var data = api.getSpecificData(state.budgetScale);

    /*
     * Create stack layers
     */
    var stackLayers = [];
    var i = 0,
        j,
        yearValues = api.getYearValues();
    $.each(data, function(ministry, departments)
    {
        stackLayers[i] = [];
        $.each(yearValues, function(j, year)
        {
            j = parseInt(year) - yearValues[0];
            stackLayers[i][j] = {
                x: yearsScale(year),
                y: 0,
                name: ministry
            };
        });
        $.each(departments, function(department, years)
        {
            $.each(years, function(year, amount)
            {
                j = parseInt(year) - yearValues[0];
                stackLayers[i][j].y = stackLayers[i][j].y + amount;
                j++;
            });
        });
        i++;
    });

    var width = $("#streamGraphDiv").width() - getScrollbarWidth(),
        height = getHeight();

    /*
     * The ministry to which the streamGraph is zoomed in. When null, the streamGraph is zoomed
     * out and shows all ministries.
     */
    var ministryZoomed = null;

    var stack = d3.layout.stack().offset("wiggle");
    var stackLayout0 = stack(stackLayers);
    var stackLayout1 = stack(stackLayers);

    /*
     * Define scales
     */
    var x = d3.scale.linear()
        .domain([0, yearValues.length - 1])
        .range([0, width]);
    var xSliderScale = d3.scale.linear()
        .domain([0, yearValues.length - 1])
        .range([1.5, width - 1.5]);
    var y = d3.scale.linear()
        .domain([0, d3.max(stackLayers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
        .range([height, 0]);
    var yReverse = d3.scale.linear()
        .domain([0, d3.max(stackLayers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
        .range([0, height]);

    /*
     * Returns path attribute as a function of d
     */
    var area = d3.svg.area()
        .x(function(d) { return x(d.x); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });

    this.draw = function(stackLayout)
    {
        /*
         * Add canvas
         */
        var canvas = d3.select("#streamGraphDiv").append("svg")
            .attr("width", width)
            .attr("height", height);

        d3.select("#streamGraphDiv").append("div")
            .attr("class", "year-label")

        /*
         * Draw stream graph into canvas
         */
        canvas.selectAll("path")
            .data(stackLayout)
            .enter().append("path")
            .attr("d", area)
            .style("fill", function(d) {
                //console.log(colorService.ministry(d[0].name));
                //console.log(d[0].name);
                return color(d[0].name);
            });

        /*
         * Add tooltips
         */
        canvas.selectAll("path")
            .data(stackLayout)
            .append("svg:title")
            .text(function(d) { return d[0].name; });

        /*
         * Add in-graph labels
         */
        canvas.selectAll("text")
            .data(stackLayout)
            .enter()
            .append("text");
        canvas.selectAll("text")
            .data(stackLayout)
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

        /*
         * Add invisible covering layer so that label text can't be selected
         */
        canvas.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .style("opacity", "0")
            .style("cursor", "inherit");

        /*
         * Add slider
         */
        var slider = canvas.append("line")
            .attr("x1", xSliderScale(yearsScale(state.year)))
            .attr("y1", 0)
            .attr("x2", xSliderScale(yearsScale(state.year)))
            .attr("y2", height)
            .attr("class", "streamGraphSlider")
            .attr("id", "streamGraphSlider");

        /*
         * Add mouse behavior
         */
        canvas
            .on("mousedown", canvasMouseDown)
            .on("mousemove", canvasMouseMove);
        slider
            .on("mousedown", sliderMouseDown);
        d3.select(window)
            .on("mouseup", mouseUp);
    };

    this.draw(stackLayout0);

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
            var xa = Math.round(X[0] * (yearValues.length - 1)/width);
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
            .attr("class", "legend__item");
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

    function zoomTo(ministryZoomed)
    {
        if (ministryZoomed = null)
        {
            /*
             * Zoom out
             */
        }
        else
        {
            /*
             * Zoom in
             */
            // Find requested ministry in array
            var requestedI = ministriesScale(ministryZoomed);
            // Get parts of array preceding and succeeding requested ministry
            // Build new part (of the departments of the requested ministry) part of array

            // Concatenate pre, new and suc parts of array to form new array
            // Draw streamgraph with current array
            // Animate streamgraph to array where height of all pre and suc points are 0.
        }
    }

    /*
     * Set data independent scales
     */
//    var color = d3.scale.linear()
//            .range(["#c30", "#ea8"]);

    /*
     * Make data arrays
     */

    //
    //var multipleTimeSeries = {};
    //$.each(ministryValues, function(i, ministryName) {
    //    multipleTimeSeries[ministryName] = {};
    //    $.each(yearValues, function(j, yearValue)
    //    {
    //        multipleTimeSeries[ministryName][yearValue] =
    //        {
    //            x: yearValues[j],
    //            y: 0,
    //            name: ""
    //        }
    //    });
    //});
    //{
    //    multipleTimeSeries[i] = [];
    //    for (var j = 0; j < yearValues.length; j++)
    //    {
    //        multipleTimeSeries[i][j] = {x: yearValues[j], y: 0, name: ""};
    //    }
    //}

    //$.getJSON("data/budget.json", function ( data )
    //{
    //    var years = data.children;
    //    $.each(years, function(i, year)
    //    {
    //        var yearI = yearsScale(year.name);
    //        var sides = year.children;
    //        $.each(sides, function(j, side)
    //        {
    //            var ministries = side.children;
    //            $.each(ministries, function(k, ministry)
    //            {
    //                var ministryI = ministriesScale(ministry.name);
    //                var departments = ministry.children;
    //                $.each(departments, function(l, department)
    //                {
    //                    var amount = department.size;
    //                    //var amount = department.size;
    //                    multipleTimeSeries[ministry.name][year.name] = {
    //                        x: yearsScale(year.name),
    //                        y: multipleTimeSeries[ministry.name][year.name].y + amount,
    //                        name: ministry.name,
    //                        c: color(ministry.name)
    //                    };
    //                });
    //            });
    //        });
    //    });
        //this.draw(layers0);
        //drawLegend();
    //});
};

$(document).ready(function() {
    $(".year-label").html(state.year)
    state.subscribe(function(state) {
        $(".year-label").html(state.year)
    })
})


streamGraph = new StreamGraph();
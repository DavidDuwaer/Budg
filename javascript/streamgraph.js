/**
 * Created by david on 27-1-2016.
 */

function StreamGraph(dataSetIndex)
{
    $(".year-label").remove();
    $("#streamGraph" + dataSetIndex).remove();
    var yearValues = api.getYearValues();
    var ministryValues = api.getMinistryValues(dataSetIndex);
    var yearsScale = d3.scale.linear()
        .domain(yearValues)
        .range(d3.range(0, yearValues.length - 1, 1));
    var ministriesScale = d3.scale.ordinal()
        .domain(ministryValues)
        .range(d3.range(0, ministryValues.length - 1, 1));
    var data = api.getSpecificData(dataSetIndex, state.budgetScale);
    var sliderOffset = 10;


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
                if (yearValues.indexOf(parseInt(year)) != -1)
                {
                    j = parseInt(year) - yearValues[0];
                    stackLayers[i][j].y = stackLayers[i][j].y + amount;
                    j++;
                }
            });
        });
        i++;
    });

    var width = $("#streamGraphDiv").width() - getScrollbarWidth(),
        height = getHeight()/2;

    /*
     * The ministry to which the streamGraph is zoomed in. When null, the streamGraph is zoomed
     * out and shows all ministries.
     */
    var ministryZoomed = null;

    var stack = d3.layout.stack().offset("wiggle");
    var stackLayout0 = stack(stackLayers);

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
            .style("width", width)
            .style("height", height)
            .attr("id", "streamGraph" + dataSetIndex);

        d3.select("#streamGraphDiv").append("div")
            .attr("class", "year-label noselect")
            .text(state.year);

        /*
         * Draw stream graph into canvas
         */

        canvas.selectAll("path")
            .data(stackLayout)
            .enter().append("path")
            .attr("class", "noselect")
            .attr("id", function(d) { return d[0].name; })
            .attr("d", area)
            .style("fill", function(d) {
                //console.log(colorService.ministry(d[0].name));
                //console.log(d[0].name);
                return color(dataSetIndex, d[0].name);
            })
            .attr("stroke", "black")
            .attr("stroke-width", 0)
            .attr("clip-path", function(d) { return "url(#" + d[0].name.replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g,"") + "Clip)"; });

        canvas.selectAll("clipPath") // clippaths to fake inside strokes
            .data(stackLayout)
            .enter().append("clipPath")
            .attr("class", "noselect")
            .attr("id", function(d) { return d[0].name.replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g,"") + "Clip"; })
            .append("path")
            .attr("d", area);

        /*
         * Add tooltips
         */
        var paths = canvas.selectAll("path");
        paths
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
            .attr("class", "streamGraphLabel noselect")
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
         * Add slider
         */
        var slider = canvas.append("line")
            .attr("x1", xSliderScale(yearsScale(state.year)) - sliderOffset)
            .attr("y1", 0)
            .attr("x2", xSliderScale(yearsScale(state.year)) - sliderOffset)
            .attr("y2", height)
            .attr("class", "streamGraphSlider noselect")
            .attr("id", "streamGraphSlider");

        /*
         * Add interactivity
         */
        canvas
            .on("mousedown", canvasMouseDown)
            .on("mousemove", canvasMouseMove);
        paths
            .data(stackLayout)
            .on("mouseover", pathMouseOver)
            .on("mouseout", pathMouseOut);
        slider
            .on("mousedown", sliderMouseDown);
        d3.select(window)
            .on("mouseup", mouseUp);
        canvas.selectAll("path")
            .on("click", function(d) {
                treemaps[dataSetIndex].zoomOn(d[0].name)
            });
    };

    this.draw(stackLayout0);

    function sliderMouseDown()
    {
        state.sliderMouseDown = true;
    }

    function mouseUp()
    {
        state.sliderMouseDown = false;
        snapSlider();
    }

    function snapSlider() {
        var x = d3.select("#streamGraphSlider").attr("x1");
        var section = Math.round(x * (yearValues.length - 1)/width);
        var snapX = section * width / (yearValues.length - 1);
        snapX = Math.min(snapX, width - sliderOffset);
        snapX = Math.max(snapX, sliderOffset);
        d3.select("#streamGraphSlider")
            .attr("x1", snapX)
            .attr("x2", snapX);
        var newYear = section + state.minimum;
        if (state.year == newYear) {
            // Happy new year
        } else {
            state.year = section + state.minimum;
            state.notify()
        }
    }

    function canvasMouseMove()
    {
        if (state.sliderMouseDown)
        {
            var position = d3.mouse(this);

            d3.select("#streamGraphSlider")
                .attr("x1", position[0])
                .attr("x2", position[0])
        }

        if (mouseAtSlider(this))
        {
            d3.select("body")
                .style("cursor", "move");
        }
        else
        {
            d3.select("body")
                .style("cursor", "inherit");
        }
    }

    this.updateMinistryHighlight = function()
    {
        d3.select("#streamGraph" + dataSetIndex)
            .selectAll("path")
            .data(stackLayout0)
            .attr("stroke-width", function(d) {
                var result = 0;
                if (ministrySimilarityClass(dataSetIndex, d[0].name) ==
                    ministrySimilarityClass(highlightState.dataSetIndex, highlightState.ministry)) result = 4;
                return result;
            });
    };

    highlightState.subscribe(this.updateMinistryHighlight);

    function pathMouseOver(d)
    {
        highlightState.dataSetIndex = dataSetIndex;
        highlightState.ministry = d[0].name;
        highlightState.notify();
        //d3.select(this)
        //    .style("opacity", "0.8");
        //setHeaderColor(getColor(d[0].name));
        //setHeader(d[0].name);
    }

    function pathMouseOut(d)
    {
        highlightState.dataSetIndex = null;
        highlightState.ministry = null;
        highlightState.notify();
        //d3.select(this)
        //    .style("opacity", "1");
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
}

$(document).ready(function() {
    $(".year-label").html(state.year);
    state.subscribe(function(state) {
        $(".year-label").html(state.year)
    });

    //state.subscribe(function(state, source) {
    //    if (source == "changeview") {
    //        StreamGraph()
    //    }
    //})
});

streamGraphs = [];
streamGraphs[0] = new StreamGraph(0);
streamGraphs[1] = new StreamGraph(1);
/*-------------------------------------------------------------------------
 | Legend
 | ========================================================================
 | This file communicates with the D3 library and uses the utility
 | functions from the utility script.
 -------------------------------------------------------------------------*/

function Legend(dataSetIndex)
{
    var rows;

    var data = api.getMinistryValues(dataSetIndex);
    var ministries = new Array();
    $.each(data, function(i, ministryName)
    {
        ministries.push(ministryName);
    });

    this.draw = function()
    {
        var sidePanelHeight = 0;
        var sidePanel = d3.select("#sidePanel");
        sidePanel
            .select(".control-tabs")
            .attr("class", function(e) {
                sidePanelHeight = this.getBoundingClientRect().height;
                return "control-tabs"; });
        sidePanel
            .selectAll(".tab-view")
            .style("height", (getHeight() - sidePanelHeight) + "px")
            .style("overflow-y", "scroll");
        var legendRows = d3.select("#colorLegendDiv" + dataSetIndex)
            .selectAll("span")
            .attr("class", "legend__item")
            .data(ministries)
            .enter()
            .append("span")
            .attr("class", "legend__item")
            .on("mouseover", mouseOver)
            .on("mouseout", mouseOut);
        rows = d3.select("#colorLegendDiv" + dataSetIndex).selectAll("span");
        legendRows.append("span")
            .attr("class", "legend__color")
            .attr("style", function(d) {
                return "background-color:" + color(dataSetIndex, d) + ";";
            });
        legendRows.append("span")
            .attr("class", "legend__name")
            .append("text")
            .text(function(d) {
                return d;
            });
    };

    this.draw();

    this.updateMinistryHighlight = function()
    {
        rows.data(ministries)
            .style("border-color", function(d) {
                var result = "transparent";
                if (ministrySimilarityClass(dataSetIndex, d) ==
                    ministrySimilarityClass(highlightState.dataSetIndex, highlightState.ministry)) result = "black";
                return result;
            });
    };

    highlightState.subscribe(this.updateMinistryHighlight);

    function mouseOver(d)
    {
        highlightState.dataSetIndex = dataSetIndex;
        highlightState.ministry = simpleChars(d);
        highlightState.notify();
    }

    function mouseOut(d)
    {
        highlightState.dataSetIndex = null;
        highlightState.ministry = null;
        highlightState.notify();
    }
}

legend0 = new Legend(0);
legend1 = new Legend(1);
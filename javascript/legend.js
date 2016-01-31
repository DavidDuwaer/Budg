/**
 * Created by david on 29-1-2016.
 */

function Legend()
{
    var rows;

    var data = api.getMinistryValues();
    var ministries = new Array();
    $.each(data, function(i, ministryName)
    {
        ministries.push(ministryName);
    });

    this.draw = function()
    {
        var legendRows = d3.select("#colorLegendDiv")
            .selectAll("span")
            .attr("class", "legend__item")
            .data(ministries)
            .enter()
            .append("span")
            .attr("class", "legend__item");
        rows = d3.select("#colorLegendDiv").selectAll("span");
        legendRows.append("span")
            .attr("class", "legend__color")
            .attr("style", function(d) {
                return "background-color:" + color(d) + ";";
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
                if (d == highlightState.ministry) result = "black";
                return result;
            });
    };

    highlightState.subscribe(this.updateMinistryHighlight);
}

legend = new Legend();
/**
 * Created by david on 29-1-2016.
 */

function Legend()
{
    var data = api.getMinistryValues();
    console.log(data);
    var ministries = new Array();
    $.each(data, function(ministryName, ministryChildren)
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
    }

    this.draw();
}

legend = new Legend();
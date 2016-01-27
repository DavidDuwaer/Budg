/*-------------------------------------------------------------------------
 | Treemap
 | ========================================================================
 | This file communicates with the D3 library and uses the utility
 | functions from the utility script.
 -------------------------------------------------------------------------*/

// Global variables
var w = 1125 - 30,
    h = 600,
    x = d3.scale.linear().range([0, w]),
    y = d3.scale.linear().range([0, h]),
    color = d3.scale.category20c(),
    root,
    node,
    svg,
    tooltip;

// Select years
visualize(selectYear(getData(), 2013));

function visualize(data) {
    d3.select("#canvas div").remove();

    var treemap = d3.layout.treemap()
        .round(false)
        .size([w, h])
        .sticky(true)
        .value(function(d) { return d.size; });

    svg = d3.select("#canvas").append("div")
        .attr("class", "chart")
        .style("width", w + "px")
        .style("height", h + "px")
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("transform", "translate(.5,.5)");
    node = root = data;

    setHeader(root.name)

    var nodes = treemap.nodes(root)
        .filter(function(d) { return !d.children; });


    var cell = svg.selectAll("g")
        .data(nodes)
        .enter()
            .append("svg:g")
            .attr("class", "cell")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .on("click", function(d) { return zoom(node == d.parent ? root : d.parent, d); })
            .on("mouseover", function(d) {
                updateBreadcrumbs(d)
                d3.select(this)
                    .style("opacity", "0.8")
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .style("opacity", "1")
            });

    cell.append("svg:rect")
        .attr("width", function(d) { return d.dx - 1; })
        .attr("height", function(d) { return d.dy - 1; })
        .style("fill", function(d) { return color(d.parent.name); })


    cell.append("svg:text")
        .attr("x", function(d) { return d.dx / 2; })
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.name; })
        .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });

    d3.select(window).on("click", function() { zoom(root); });

    d3.select("select").on("change", function() {
        treemap.value(this.value == "size" ? size : count).nodes(root);
        zoom(node);
    });
}

function size(d) {
    return d.size;
}

function count(d) {
    return 1;
}

function updateBreadcrumbs(d) {
    var breadcrumbs = getBreadcrumbs(d);
    setHeader(breadcrumbs)
}

function setHeader(name) {
    $(".js-breadcrumbs").html(name)
}

function zoom(d, child) {
    if (d == root) {
        setHeader(d.name);
    } else {
        updateBreadcrumbs(child)
    }
    var kx = w / d.dx, ky = h / d.dy;
    x.domain([d.x, d.x + d.dx]);
    y.domain([d.y, d.y + d.dy]);

    var t = svg.selectAll("g.cell").transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    t.select("rect")
        .attr("width", function(d) { return kx * d.dx - 1; })
        .attr("height", function(d) { return ky * d.dy - 1; })

    t.select("text")
        .attr("x", function(d) { return kx * d.dx / 2; })
        .attr("y", function(d) { return ky * d.dy / 2; })
        .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });

    node = d;
    d3.event.stopPropagation();

}
// Global variables
var w = 1125 - 30,
    h = 600,
    x = d3.scale.linear().range([0, w]),
    y = d3.scale.linear().range([0, h]),
    color = d3.scale.category20c(),
    root,
    node,
    svg;

d3.json("data/budget.json", function(data) {
    visualize(data);
});

$(".js-option__years").each(function(i, e) {
    e.checked = true;
})

$(".js-option__years").change(function(e) {
    var checked = []
    $(".js-option__years").each(function(i, e) {
        if (e.checked) {checked.push(+e.name)}
    })
    //checked = [2014, 2015]
    console.log("Selecting")
    console.log(checked)
    selectYears(checked);
})

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

    console.log("visualize")
    node = root = data;

    var nodes = treemap.nodes(root)
        .filter(function(d) { return !d.children; });

    var cell = svg.selectAll("g")
        .data(nodes)
        .enter()
            .append("svg:g")
            .attr("class", "cell")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .on("click", function(d) { return zoom(node == d.parent ? root : d.parent); })

    cell.append("svg:rect")
        .attr("width", function(d) { return d.dx - 1; })
        .attr("height", function(d) { return d.dy - 1; })
        .style("fill", function(d) { return color(d.parent.name); });

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

function retrieveYears(selectedYears) {
    var deferred = new $.Deferred();

    $.getJSON("data/budget.json", function(data) {
        var tree = [];
        var name = data["name"];
        var years = data["children"];
        for (var index in years) {
            var year = years[index];
            if ($.inArray(year["name"], selectedYears) != -1) {
                tree.push(year);
            }
        }
        // found it, return this object.
        var d3Tree = JSON.parse(JSON.stringify({"name": name, "children": tree}));
        deferred.resolve(d3Tree);
    })

    return deferred.promise();
}

function selectYears(years) {
    retrieveYears(years).done(function(json){
        console.log(json);
        visualize(json);
    })
}

function zoom(d) {
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
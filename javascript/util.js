/*-------------------------------------------------------------------------
 | Utility
 | ========================================================================
 | The utility file includes utility functions.
 -------------------------------------------------------------------------*/

function getBreadcrumbs(d) {
    var breadcrumbs = [];
    var index = 0;
    var element = d;
    while (element.parent != null) {
        breadcrumbs[index++] = element.name;
        element = element.parent;
    }

    return breadcrumbs.reverse().join(" / ");
}

function getHeight() {
    return $(window).height() - $(".js-breadcrumbs").outerHeight() - 20;
}

function JSONtoD3Tree(json, name) {
    return wrapTree(name, JSONtoD3TreeRecur(json))
}

function JSONtoD3TreeRecur(tree) {
    var d3Tree = []
    for (var key in tree) {
        var value = tree[key]
        if (typeof value === 'object') {
            var object = {}
            object['name'] = key
            object['children'] = JSONtoD3Tree(value)
            d3Tree.push(object)
        } else {
            var leaf = {}
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

function getScrollbarWidth() {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
}

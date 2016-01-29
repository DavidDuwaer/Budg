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
    return JSON.parse(JSON.stringify(wrapTree(name, JSONtoD3TreeRecur(json))))
}

function JSONtoD3TreeRecur(tree) {
    var d3Tree = []
    for (var key in tree) {
        var value = tree[key]
        if (typeof value === 'object') {
            d3Tree.push({"name": key, "children": JSONtoD3TreeRecur(value)})
        } else {
            d3Tree.push({"name": key, "size": value})
        }
    }

    return d3Tree
}

function wrapTree(name, tree) {
    return {"name": name, "children": tree};
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

function markValueInTable(name) {
    $(".legend__name").removeAttr("style")
    $(".legend__name text").each(function(i, e) {
        if (e.innerHTML == name) {
            var container = $(e).parent().parent().find(".legend__name")
            container.css("background-color", "#E7BA52")
        }
    })
}

function getColor(name) {
    var texts = $(".legend__name text")
    for (var i in $(".legend__name text")) {
        if (texts[i].innerHTML == name) {
            return $(texts[i]).parent().parent().find(".legend__color").css("background-color");
        }
    }
    return false
}

function findAssocNode(name) {
    for (var key in root["children"]) {
        if (name == root["children"][key]["name"]) {
            var node = root["children"][key]["children"][0]
            node["propagate"] = false
            return node
        }
    }
}

function zoomOn(name) {
    var child = findAssocNode(name);
    console.log(child.parent.name)
    markValueInTable(child.parent.name)
    zoom(child.parent, child);
}

function changeView(view) {
    switch(view) {
        case "u":
            state.budgetScale = {"U": 0, "V": 1, "O": 1}
            break
        case "v":
            state.budgetScale = {"U": 0, "V": 1, "O": 0}
            break
        case "o":
            state.budgetScale = {"U": 0, "V": 0, "O": 1}
            break
        case "uv":
            state.budgetScale = {"U": 1, "V": 1, "O": 0}
            break
    }
    state.notify("changeview")
}

function updateBreadcrumbs(d) {
    var breadcrumbs = getBreadcrumbs(d);
    setHeader(breadcrumbs)
}

function setHeader(name) {
    $(".js-breadcrumbs").html(name)
}

function setHeaderColor(color) {
    if (state.rainbow) {
        $(".js-breadcrumbs").css("background-color", color)
    }
}

function setRainbow(value) {
    state.rainbow = value
    if (!value) {
        $(".js-breadcrumbs").removeAttr("style")
    }
}
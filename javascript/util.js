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

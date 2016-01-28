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

function getWidth() {
    return 1125 - 30;
}

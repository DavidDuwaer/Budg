function showView(link, view) {
    $('.tab-view').removeClass('tab-view--active');
    $('.' + view + '-view').addClass('tab-view--active');
    $('.tab').removeClass('tab--active');
    $(link).addClass('tab--active');
}


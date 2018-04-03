import 'babel-polyfill';
import 'url-search-params-polyfill';
import 'whatwg-fetch';
import { isTouchDevice } from 'utils';

// Carousel caption parallax
$('.content-main').scroll(function() {
    var scrollTop = $('.content-main').scrollTop();
    var imgPos = scrollTop / 2 + 'px';
    $('.carousel-item').css('background-position', '50% ' + imgPos);
    $('.carousel-caption').css('opacity', 1 - scrollTop / 400);
});


if ( !isTouchDevice() ) {
    $('html').addClass('no-touch');
    $('[data-toggle="tooltip"]').tooltip();
}

// Function for responsive wire item

var filterOpen = false;
var previewOpen = false;

window.manageTopics = new Event('manage_topics');

function isGrid() {
    if ( $('.wire-articles__item').hasClass('wire-articles__item--grid')) {
        return true;
    }
    else {
        return false;
    }
}

function responsiveWireItem() {    

    if (filterOpen && !previewOpen) {
        document.getElementsByClassName('wire-column__main')[0].classList.add('wire-articles__one-side-pane');
        document.getElementsByClassName('wire-column__main')[0].classList.remove('wire-articles__two-side-panes');
        if ( isGrid() ) {        
            $('.wire-articles__item-wrap').removeClass().addClass('wire-articles__item-wrap col-sm-12 col-md-6 col-xl-4 col-xxl-3');
        }
    } else if (filterOpen && previewOpen) {
        document.getElementsByClassName('wire-column__main')[0].classList.remove('wire-articles__one-side-pane');
        document.getElementsByClassName('wire-column__main')[0].classList.add('wire-articles__two-side-panes');
        if ( isGrid() ) {
            $('.wire-articles__item-wrap').removeClass().addClass('wire-articles__item-wrap col-sm-12 col-md-12 col-xl-6 col-xxl-4');
        }
    } else if (!filterOpen && previewOpen) {
        document.getElementsByClassName('wire-column__main')[0].classList.remove('wire-articles__two-side-panes');
        document.getElementsByClassName('wire-column__main')[0].classList.add('wire-articles__one-side-pane');
        if ( isGrid() ) {
            $('.wire-articles__item-wrap').removeClass().addClass('wire-articles__item-wrap col-sm-12 col-md-6 col-xl-4 col-xxl-3');
        }
    } else {
        document.getElementsByClassName('wire-column__main')[0].classList.remove('wire-articles__one-side-pane');
        document.getElementsByClassName('wire-column__main')[0].classList.remove('wire-articles__two-side-panes');
        if ( isGrid() ) {
            $('.wire-articles__item-wrap').removeClass().addClass('wire-articles__item-wrap col-sm-6 col-md-4 col-xl-3 col-xxl-2');
        }
    }
}

// Toggle left bar navigation

document.getElementsByClassName('content-bar__menu--nav')[0].onclick = function(){
    document.getElementsByClassName('wire-column__nav')[0].classList.toggle('wire-column__nav--open');
    document.getElementsByClassName('content-bar__menu--nav')[0].classList.toggle('content-bar__menu--nav--open');
    
    // responsive wire item
    filterOpen = !filterOpen;
    responsiveWireItem();
};


// Open article from wire list

var listItem = document.getElementsByClassName('wire-articles__item');

var currentItem;
for(var i = 0; i < listItem.length; i++) {
    listItem[i].onclick = function(event) {
        document.getElementsByClassName('wire-articles__item')[0].classList.toggle('wire-articles__item--open');

        // responsive wire item
        previewOpen = !previewOpen;
        responsiveWireItem();

        if (event.target.classList[0] === 'no-bindable') {
            document.getElementsByClassName('wire-articles__versions')[0].classList.toggle('wire-articles__versions--open');
            return false;
        }

        if (currentItem !== this) {
            document.getElementsByClassName('wire-column__preview')[0].classList.add('wire-column__preview--open');
            return currentItem = this;
        } else {
            document.getElementsByClassName('wire-column__preview')[0].classList.remove('wire-column__preview--open');
            return currentItem = null;
        }
    };
}

// Show and hide multi action bar

$('.wire-articles__item-select input').click(function(){
    $('.multi-action-bar').toggleClass('multi-action-bar--open');
});

$('.multi-action-bar .btn').click(function(){
    $('.multi-action-bar').removeClass('multi-action-bar--open');
});

// Top bar search items

var searchForm = document.getElementsByClassName('search__form')[0];
var searchInput = document.getElementsByClassName('search__input')[0];

searchInput.onfocus = function() {
    searchForm.classList.add('searchForm--active');
};

document.getElementsByClassName('search__clear')[0].onclick = function() {
    searchInput.value = '';
};

// close preview on mobile
$('.wire-column__preview__mobile-bar button').click(function(){
    $('.wire-column__preview').removeClass('wire-column__preview--open');
    
    previewOpen = !previewOpen;
    responsiveWireItem();
});

// design view dropdown fix
$('[data-toggle="dropdown"]').dropdown();
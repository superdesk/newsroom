// @flow

// Toggle left bar navigation

document.getElementsByClassName('content-bar__menu--nav')[0].onclick = function(){
    document.getElementsByClassName('wire-column__nav')[0].classList.toggle('wire-column__nav--open');
    document.getElementsByClassName('content-bar__menu--nav')[0].classList.toggle('content-bar__menu--nav--open');
};


// Open article from wire list


// Open article from wire list

var listItem = document.getElementsByClassName('wire-articles__item');

var currentItem;
for(var i = 0; i < listItem.length; i++) {
    listItem[i].onclick = function(event) {
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

// Top bar search items

var searchForm = document.getElementsByClassName('search__form')[0];
var searchInput = document.getElementsByClassName('search__input')[0];

searchInput.onfocus = function() {
    searchForm.classList.add('searchForm--active');
};

document.getElementsByClassName('search__clear')[0].onclick = function() {
    searchInput.value = '';
};

// (function () {
    'use strict';

    var slideshow = document.querySelector('body');
    var container = slideshow.querySelector('#images-container');
    var buttons = slideshow.querySelector('#buttons');
    var supportsProgress;
    var loadedImageCount, imageCount;
    var progressElem, statusElem;
    statusElem = slideshow.querySelector('#status');
    progressElem = slideshow.querySelector('progress');

    //settings
    var defaultColumnsNumber = 8;
    var defaultRowsNumber = 5;

    var visibleColumns = {
        minimum: 0,
        maximum: defaultColumnsNumber - 1
    };
    
    var visibleRows = {
        minimum: 1,
        maximum: 3
    };


supportsProgress = progressElem &&
        // IE does not support progress
        progressElem.toString().indexOf('Unknown') === -1;

    getInitContent(defaultRowsNumber, defaultColumnsNumber);

    buttons.querySelectorAll('button').forEach(function(selector) {
        selector.addEventListener('click', modifyGrid);
    }, this);

    function modifyGrid() {
        switch (this.id) {
            case 'addX':
                addX();
                break;

            case 'addY':
                addY();
                break;

            case 'add':
                getInitContent(defaultRowsNumber, defaultColumnsNumber);
                break;

            case 'reset':
                empty(container);
                break;

            default:
                return;
        }
    }

    //--- actions

    function getInitContent(defaultRowsNumber, defaultColumnsNumber) {
        var fragment = document.createDocumentFragment();
        var el;

        for (var i = 0; i < defaultRowsNumber; i++) {
            el = document.createElement('div');
            el.appendChild(getItemsFragment(defaultColumnsNumber));
            fragment.appendChild(el);
        }

        container.insertBefore(fragment, container.firstChild);
        var imgLoad = imagesLoaded(container);
        imgLoad.on('progress', onProgress);
        imgLoad.on('always', onAlways);
        // reset progress counter
        imageCount = imgLoad.images.length;
        resetProgress();
        updateProgress(0);
    }

    function addX() {
        if (container.hasChildNodes()) {
            // add new images
            var fragment = getItemsFragment(defaultColumnsNumber, 1);
            let getRandomVisibleRow = randomVisibleRow();
            // add as first child
            container.childNodes[getRandomVisibleRow].insertBefore(fragment, container.childNodes[getRandomVisibleRow].firstChild);
            // remove last child
            container.childNodes[getRandomVisibleRow].removeChild(container.childNodes[getRandomVisibleRow].lastChild)
        } else {
            getInitContent(defaultRowsNumber, defaultColumnsNumber);
            return;
        }
        // use ImagesLoaded
        var imgLoad = imagesLoaded(container);
        imgLoad.on('progress', onProgress);
        imgLoad.on('always', onAlways);
        // reset progress counter
        imageCount = imgLoad.images.length;
        resetProgress();
        updateProgress(0);
    };

    function addY() {
        if (container.hasChildNodes()) {
            let image = getItemsFragment(defaultColumnsNumber, 1);
            // let getRandomRowForNewImage = randomVisibleRow();
            let getRandomColumn = randomColumn();
            let column = getColumnItems(getRandomColumn);

            //loop trough all and replace them with new array
            //not neccessary since i replace only first child
            column[0].replaceChild(image.firstChild, column[0].firstChild);

            container.childNodes.forEach(function (row, currentRow) {
                row.replaceChild(column[currentRow], container.childNodes[currentRow].childNodes[getRandomColumn]);
            });
            // use ImagesLoaded
            var imgLoad = imagesLoaded(container);
            imgLoad.on('progress', onProgress);
            imgLoad.on('always', onAlways);
            // reset progress counter
            imageCount = imgLoad.images.length;
            resetProgress();
            updateProgress(0);
        } else {
            getInitContent(defaultRowsNumber, defaultColumnsNumber);
            return;
        }
    };

    function getColumnItems(columnNumber) {
        var getRandomColumn = typeof columnNumber !== 'undefined' ? columnNumber : randomColumn();
        let columnImages = [];

        container.childNodes.forEach(function (row, currentRow) {
            let columnImage = row.childNodes[getRandomColumn];
            columnImages.push(columnImage);
        });

        return columnImages;
    }

    function empty(elem) {
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
    }

    //---grid modification

    function getItemsFragment(defaultColumnsNumber, itemsNumber) {
        var width = Math.round(window.innerWidth / defaultColumnsNumber);
        var height = Math.round(window.innerWidth / defaultColumnsNumber);
        var itemsFragment = document.createDocumentFragment();
        if (typeof itemsNumber !== 'undefined') {
            var defaultColumnsNumber = itemsNumber;
        }
        for (var i = 0; i < defaultColumnsNumber; i++) {
            var item = getImageItem(width, height);
            itemsFragment.appendChild(item);
        }
        return itemsFragment;
    }

    // return an <li> with a <img> in it
    function getImageItem(width, height) {

        var item = document.createElement('div');
        item.className = 'is-loading';
        var img = document.createElement('img');
        var rando = Math.ceil(Math.random() * 100);
        // random parameter to prevent cached images
        img.src =
            // use lorempixel for great random images
            'http://lorempixel.com/' + width + '/' + height + '/' + '?' + rando;
        item.appendChild(img);
        return item;
    }

    //---progress

    function resetProgress() {
        statusElem.style.opacity = 1;
        loadedImageCount = 0;
        if (supportsProgress) {
            progressElem.setAttribute('max', imageCount);
        }
    }

    function updateProgress(value) {
        if (supportsProgress) {
            progressElem.setAttribute('value', value);
        } else {
            // if you don't support progress elem
            statusElem.textContent = value + ' / ' + imageCount;
        }
    }

    // triggered after each item is loaded
    function onProgress(imgLoad, image) {
        // change class if the image is loaded or broken
        image.img.parentNode.className = image.isLoaded ? '' : 'is-broken';
        // update progress element
        loadedImageCount++;
        updateProgress(loadedImageCount);
    }

    // hide status when done
    function onAlways() {
        statusElem.style.opacity = 0;
    }

    function randomVisibleRow() {
        return Math.floor(Math.random() * (visibleRows.maximum - visibleRows.minimum + 1)) + visibleRows.minimum;
    }

    function randomColumn() {
        return Math.floor(Math.random() * (defaultColumnsNumber - 0)) + 0;
    }
// })();
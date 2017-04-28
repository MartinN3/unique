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
    var totalImages = defaultRowsNumber * defaultColumnsNumber;

    var visibleColumns = {
        minimum: 0,
        maximum: defaultColumnsNumber - 1
    };
    
    var visibleRows = {
        minimum: 1,
        maximum: 3
    };

    var width = window.innerWidth;
    var height = window.innerHeight;


supportsProgress = progressElem &&
        // IE does not support progress
        progressElem.toString().indexOf('Unknown') === -1;

    getInitContent();

    buttons.querySelectorAll('button').forEach(function(selector) {
        selector.addEventListener('click', modifyGrid);
    }, this);

    function loopFunctions() {
        if (height < container.clientHeight) {
            Velocity(container, {
                translateY: height - container.clientHeight +'px'
            }, {
                easing: "easeInOutBack",
                loop: true,
                /* Wait 10s before alternating back. */
                delay: 5000
            });
        }
    }

    function modifyGrid() {
        switch (this.id) {
            case 'addX':
                addX();
                break;

            case 'addY':
                addY();
                break;

            case 'add':
                getInitContent();
                break;

            case 'reset':
                empty(container);
                break;

            default:
                return;
        }
    }

    //--- actions

    function getInitContent() {
        var fragment = document.createDocumentFragment();

        fragment.appendChild(getItemsFragment(totalImages));
        container.insertBefore(fragment, container.firstChild);
        var msnry = new Masonry( container, {
            itemSelector: '.grid-item',
            columnWidth: Math.round(window.innerWidth / defaultColumnsNumber)

        });

        var imgLoad = imagesLoaded(container);
        imgLoad.on('progress', onProgress);
        imgLoad.on('always', onAlways);
        // reset progress counter
        imageCount = imgLoad.images.length;
        resetProgress();
        updateProgress(0);

        loopFunctions();
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

    function getItemsFragment(itemsNumber) {
        var width = Math.round(window.innerWidth / defaultColumnsNumber);
        var height = Math.round(window.innerWidth / defaultColumnsNumber);
        var itemsFragment = document.createDocumentFragment();

        for (var i = 0; i < itemsNumber; i++) {
            var item = getImageItem(width, height);
            item.classList.add('grid-item');
            item.style.width=width+'px';
            item.style.height=height+'px';
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
        if (image.isLoaded) {
            image.img.parentNode.classList.remove('is-loading')
        } else {
            image.img.parentNode.classList.remove('is-loading')
            image.img.parentNode.classList.add('is-broken')
        }
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
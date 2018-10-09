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
var defaultRowsNumber = 6;
var totalImages = defaultRowsNumber * defaultColumnsNumber;
var itemWidth = Math.floor(window.innerWidth / defaultColumnsNumber);
var itemHeight = itemWidth;
var gridMap = {};
var timeouts = [];

supportsProgress = progressElem &&
    // IE does not support progress
    progressElem.toString().indexOf('Unknown') === -1;

getInitContent();

buttons.querySelectorAll('button').forEach(function (selector) {
    selector.addEventListener('click', modifyGrid);
}, this);

function loopFunctions() {
    if (window.innerHeight < container.clientHeight) {
        Velocity(container, {
            translateY: window.innerHeight - container.clientHeight + 'px'
        }, {
            easing: "easeInOutBack",
            loop: true,
            /* Wait 10s before alternating back. */
            delay: 5000
        });
    }

    timeoutLoop();
    function timeoutLoop() {
        if(Math.random() < 0.5) {
            if(Math.random() < 0.5) {
                addY('fromBottom');
            } else {
                addY('fromTop');
            }
        } else {
            if(Math.random() < 0.5) {
                addX('fromLeft');
            } else {
                addX('fromRight');
            }
        }


        timeouts.push(setTimeout(timeoutLoop, 2000));
    }

}

function modifyGrid() {
    switch (this.id) {
        case 'addXfromRight':
            addX('fromRight');
            break;
        case 'addXfromLeft':
            addX('fromLeft');
            break;

        case 'addYfromBottom':
            addY('fromBottom');
            break;

        case 'addYfromTop':
            addY('fromTop');
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
    createGridMap();

    var fragment = document.createDocumentFragment();
    fragment.appendChild(getItemsFragment(totalImages, 0));
    container.insertBefore(fragment, container.firstChild);

    addImagesLoaded();
    loopFunctions();
}

function addX(direction) {
    let rowNumber = randomRow();
    let newPosition = (direction == 'fromRight') ? -1 : 1;

    let newItem = 'grid-item-' + (Object.keys(gridMap).length);
    let newItemId = Object.keys(gridMap).length;

    let row = [];
    row.push(newItem);

    let defaultColumnsNumberMinus = defaultColumnsNumber - 1;

    Object.keys(gridMap).forEach(function (gridItem, number) {
        if (gridMap[gridItem].y == rowNumber) {

            //Zjistim jestli jsem pridal z prava nebo z leva
            if (newPosition == -1) {
                //Zajimaji me obrazky vlevo od pridaneho z prava
                if (gridMap[gridItem].x < defaultColumnsNumberMinus + 1) {
                    gridMap[gridItem].x = gridMap[gridItem].x - 1;
                    row.push(gridItem);
                }
            } else {
                //Nyni me zajimaji vpravo od pridaneho zleva
                if (gridMap[gridItem].x > -1) {
                    gridMap[gridItem].x = gridMap[gridItem].x + 1;
                    row.push(gridItem);
                }
            }
        }
    });

    if (newPosition == -1) {
        gridMap[newItem] = {
            x: defaultColumnsNumberMinus,
            y: rowNumber
        }
    } else {
        gridMap[newItem] = {
            x: 0,
            y: rowNumber
        }
    }

    let setMultiplier = (direction == 'fromRight') ? 1 : -1;
    var fragment = document.createDocumentFragment();
    fragment.appendChild(getItemsFragment(1, newItemId, (setMultiplier * itemWidth)));
    container.insertBefore(fragment, container.firstChild);


    addImagesLoaded(function () {
        animate(row, direction, itemWidth);
    });
}

function addY(direction) {
    let columnNumber = randomColumn();
    let newPosition = (direction == 'fromBottom') ? -1 : 1;

    let newItem = 'grid-item-' + (Object.keys(gridMap).length);
    let newItemId = Object.keys(gridMap).length;

    let column = [];
    column.push(newItem);

    let defaultRowsNumberMinus = defaultRowsNumber - 1;

    Object.keys(gridMap).forEach(function (gridItem, number) {
        if (gridMap[gridItem].x == columnNumber) {

            //Zjistim jestli jsem pridal ze spodu nebo z hora
            if (newPosition == -1) {
                //Zajimaji me obrazky nahoru od pridaneho z dola
                if (gridMap[gridItem].y < defaultRowsNumberMinus + 1) {
                    gridMap[gridItem].y = gridMap[gridItem].y - 1;
                    column.push(gridItem);
                }
            } else {
                //Nyni me zajimaji dolu od pridaneho zhora
                if (gridMap[gridItem].y > -1) {
                    gridMap[gridItem].y = gridMap[gridItem].y + 1;
                    column.push(gridItem);
                }
            }
        }
    });

    if (newPosition == -1) {
        gridMap[newItem] = {
            x: columnNumber,
            y: defaultRowsNumberMinus
        }
    } else {
        gridMap[newItem] = {
            x: columnNumber,
            y: 0
        }
    }

    let setMultiplier = (direction == 'fromBottom') ? 1 : -1;
    var fragment = document.createDocumentFragment();
    fragment.appendChild(getItemsFragment(1, newItemId, false, (setMultiplier * itemHeight)));
    container.insertBefore(fragment, container.firstChild);


    addImagesLoaded(function () {
        animate(column, direction, itemHeight);
    });
}

function animate(array, direction, dimension) {

    switch (direction) {
        case 'fromLeft':
            array.forEach(function (item) {
                Velocity(document.getElementById(item), {
                    translateX: '+=' + (dimension * 1) + 'px'
                }, {
                    easing: "easeInOutBack",
                });
            });
            break;
        case 'fromRight':
            array.forEach(function (item) {
                Velocity(document.getElementById(item), {
                    translateX: '+=' + (dimension * -1) + 'px'
                }, {
                    easing: "easeInOutBack",
                });
            });
            break;
        case 'fromTop':
            array.forEach(function (item) {
                Velocity(document.getElementById(item), {
                    translateY: '+=' + (dimension * 1) + 'px'
                }, {
                    easing: "easeInOutBack",
                });
            });
            break;
        case 'fromBottom':
            array.forEach(function (item) {
                Velocity(document.getElementById(item), {
                    translateY: '+=' + (dimension * -1) + 'px'
                }, {
                    easing: "easeInOutBack",
                });
            });
            break;
    }
}

function empty(elem) {
    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }

    for (var i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
    //quick reset of the timer array you just cleared
    timeouts = [];
}


function createGridMap() {
    for (let i = 0, j = 0, k = 0; i < totalImages; i++, j++) {

        let itemId = 'grid-item-' + i;

        if (j == defaultColumnsNumber) {
            j = 0;
            k++
        }

        gridMap[itemId] = {
            x: j,
            y: k
        }
    }
}

function getItemsFragment(itemsNumber, countIdFrom, addedX = false, addedY = false) {
    var itemsFragment = document.createDocumentFragment();

    for (let i = 0; i < itemsNumber; i++) {
        var item = getImageItem();
        let itemId = 'grid-item-' + countIdFrom++;

        addProperties(item, itemId, gridMap[itemId].x, gridMap[itemId].y, addedX, addedY);

        itemsFragment.appendChild(item);
    }

    return itemsFragment;
}

function addProperties(item, id, axisX, axisY, addedX, addedY) {
    item.classList.add('grid-item');
    item.id = id;
    item.style.width = itemWidth + 'px';
    item.style.height = itemHeight + 'px';
    item.style.position = 'absolute';
    item.style.left = axisX * itemWidth + 'px';
    item.style.top = axisY * itemHeight + 'px';

    if (addedX) {
        item.style.left = axisX * itemWidth + addedX + 'px';
    }

    if (addedY) {
        item.style.top = axisY * itemHeight + addedY + 'px';
    }
}

function getImageItem() {
    var item = document.createElement('div');
    item.className = 'is-loading';
    var img = document.createElement('img');
    var rando = Math.ceil(Math.random() * 100);
    // random parameter to prevent cached images
    img.src =
        // use lorempixel for great random images
        'https://loremflickr.com/' + itemWidth + '/' + itemHeight + '/' + '?' + rando;
        // 'http://lorempixel.com/' + itemWidth + '/' + itemHeight + '/';

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

function addImagesLoaded(setDone) {
    var imgLoad = imagesLoaded(container);
    imgLoad.on('progress', onProgress);
    imgLoad.on('always', onAlways);
    if (setDone) {
        imgLoad.on('done', setDone);
    }
    // reset progress counter
    imageCount = imgLoad.images.length;
    resetProgress();
    updateProgress(0);
}

// hide status when done
function onAlways() {
    statusElem.style.opacity = 0;
}

function randomRow() {
    return Math.floor(Math.random() * (defaultRowsNumber - 0)) + 0;
}

function randomColumn() {
    return Math.floor(Math.random() * (defaultColumnsNumber - 0)) + 0;
}
// })();
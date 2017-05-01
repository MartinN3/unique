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

var visibleColumns = {
    minimum: 0,
    maximum: defaultColumnsNumber - 1
};


var itemWidth = Math.floor(window.innerWidth / defaultColumnsNumber);
var itemHeight = itemWidth;

var gridMap = {

}

var imagesMap = {
    'rows': {
    },
    'columns': {
    }
}

var addedX = {};
var addedY = {};
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

    // timeoutLoop();

    function timeoutLoop() {
        addX();
        addY()
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

    createGridMap();

    var fragment = document.createDocumentFragment();
    fragment.appendChild(getItemsFragment(totalImages, 0));
    container.insertBefore(fragment, container.firstChild);

    addImagesLoaded();

    loopFunctions();
}

// function addX() {
//     if (container.hasChildNodes()) {
//
//         let rowNumber = randomRow();
//         let row = getRowItems(rowNumber);
//
//         let lastGridItem = row.slice(-1)[0];
//
//         let newPositionX = document.getElementById(lastGridItem).offsetLeft + itemWidth;
//         let newPositionY = document.getElementById(lastGridItem).offsetTop;
//
//         let image = getItemsFragment(1);
//         let appendedImageId = 'grid-item-' + container.childNodes.length;
//
//         image.childNodes[0].id = appendedImageId
//         image.childNodes[0].style.left = newPositionX + 'px';
//         image.childNodes[0].style.top = newPositionY + 'px';
//         image.childNodes[0].style.position = 'absolute';
//
//
//         container.appendChild(image);
//
//         if (typeof addedX[rowNumber] == 'undefined') {
//             addedX[rowNumber] = [];
//         }
//
//         addedX[rowNumber].push(appendedImageId);
//
//         addedX[rowNumber].forEach(function (item) {
//             row.push(item);
//         });
//
//         function animateRow() {
//             row.forEach(function (item) {
//                 Velocity(document.getElementById(item), {
//                     translateX: '+=-' + itemWidth + 'px'
//                 }, {
//                     easing: "easeInOutBack",
//                 });
//             });
//         }
//
//         var imgLoad = imagesLoaded(container);
//         imgLoad.on('progress', onProgress);
//         imgLoad.on('always', animateRow);
//         // reset progress counter
//         imageCount = imgLoad.images.length;
//         resetProgress();
//         updateProgress(0);
//
//
//     } else {
//         getInitContent(defaultRowsNumber, defaultColumnsNumber);
//         return;
//     }
//     ;
// }

function addX(direction) {
    let rowNumber = randomRow();
    let newPosition = (direction == 'fromRight') ? -1 : 1;

    let row = [];

    let newItem = 'grid-item-' + (Object.keys(gridMap).length);
    let newItemId = Object.keys(gridMap).length;

    row.push(newItem);

    let defaultColumnsNumberMinus = defaultColumnsNumber - 1;

    // getImageItem(Object.keys(gridMap));

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

    var fragment = document.createDocumentFragment();
    fragment.appendChild(getItemsFragment(1, newItemId));
    container.insertBefore(fragment, container.firstChild);

    animate(row, direction, itemWidth);
}

// function getDirection(direction) {
//
//     this.direction = direction;
//
//     let directionObject = {};
//
//     switch (this.direction) {
//         case 'fromLeft':
//             directionObject = {
//                 translate: 'translateX',
//                 multiplier: 1
//             }
//             break;
//         case 'fromRight':
//             directionObject = {
//                 translate: 'translateX',
//                 multiplier: -1
//             }
//             break;
//         case 'fromTop':
//             directionObject = {
//                 translate: 'translateY',
//                 multiplier: 1
//             }
//             break;
//         case 'fromBottom':
//             directionObject = {
//                 translate: 'translateY',
//                 multiplier: -1
//             }
//             break;
//         }
//
//         return directionObject;
// }

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

// function addY() {
//     if (container.hasChildNodes()) {
//
//         let columnNumber = randomColumn();
//         let column = getColumnItems(columnNumber);
//
//         let lastColumnItem = column.slice(-1)[0];
//
//         let newPositionX = document.getElementById(lastColumnItem).offsetLeft;
//         let newPositionY = document.getElementById(lastColumnItem).offsetTop + itemHeight;
//
//         let image = getItemsFragment(1);
//         let appendedImageId = 'grid-item-' + container.childNodes.length;
//
//         image.childNodes[0].id = appendedImageId
//         image.childNodes[0].style.left = newPositionX + 'px';
//         image.childNodes[0].style.top = newPositionY + 'px';
//         image.childNodes[0].style.position = 'absolute';
//
//         container.appendChild(image);
//
//         if (typeof addedY[columnNumber] == 'undefined') {
//             addedY[columnNumber] = [];
//         }
//
//         addedY[columnNumber].push(appendedImageId);
//
//         addedY[columnNumber].forEach(function (item) {
//             column.push(item);
//         });
//
//         function animateColumn() {
//             column.forEach(function (item) {
//                 Velocity(document.getElementById(item), {
//                     translateY: '+=-' + itemHeight + 'px'
//                 }, {
//                     easing: "easeInOutBack",
//                 });
//             });
//         }
//
//         var imgLoad = imagesLoaded(container);
//         imgLoad.on('progress', onProgress);
//         imgLoad.on('always', animateColumn);
//         // reset progress counter
//         imageCount = imgLoad.images.length;
//         resetProgress();
//         updateProgress(0);
//     } else {
//         getInitContent(defaultRowsNumber, defaultColumnsNumber);
//         return;
//     }
//     ;
// }

// function mapPosition() {
//
//     let coordinates = {
//         'coordinatesX': getPosition(itemWidth, defaultColumnsNumber),
//         'coordinatesY': getPosition(itemHeight, defaultRowsNumber)
//     };
//
//     return coordinates;
// }



// function getColumnItems(columnNumber) {
//     var getRandomColumn = typeof columnNumber !== 'undefined' ? columnNumber : randomColumn();
//     let columnImages = [];
//
//     for (var currentRow = 0; currentRow < defaultRowsNumber; currentRow++) {
//         let columnImage = container.childNodes[getRandomColumn + (defaultColumnsNumber * currentRow)].id;
//         columnImages.push(columnImage);
//     }
//
//     return columnImages;
// }
//
// function getRowItems(rowNumber) {
//     var getRandomRow = typeof rowNumber !== 'undefined' ? rowNumber : randomRow();
//     let rowImages = [];
//
//     for (var currentColumn = 0; currentColumn < defaultColumnsNumber; currentColumn++) {
//         let rowImage = container.childNodes[currentColumn + (defaultColumnsNumber * getRandomRow)].id;
//         rowImages.push(rowImage);
//     }
//
//     return rowImages;
// }


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

//---grid modification

// function getItemsFragment(itemsNumber) {
//     var itemsFragment = document.createDocumentFragment();
//     let coordinates = mapPosition();
//
//     function addProperties(item, i, j, k) {
//         item.classList.add('grid-item');
//         item.id = 'grid-item-' + i;
//         item.style.width = itemWidth + 'px';
//         item.style.height = itemHeight + 'px';
//         item.style.position = 'absolute';
//         item.style.left = coordinates.coordinatesX[j] + 'px';
//         item.style.top = coordinates.coordinatesY[k] + 'px';
//     }
//
//     for (let i = 0, j = 0, k = 0; i < itemsNumber; i++, j++) {
//         var item = getImageItem();
//
//         addProperties(item, i, j, k);
//
//
//         if (j == defaultColumnsNumber) {
//             j = 0;
//             k++
//         }
//
//         gridMap[item.id] = {
//             x: j,
//             y: k
//         }
//
//
//         if (typeof imagesMap.columns[j] == 'undefined') {
//             imagesMap.columns[j] = [];
//         }
//         if (typeof imagesMap.rows[k] == 'undefined') {
//             imagesMap.rows[k] = [];
//         }
//
//         imagesMap.columns[j].push(item.id);
//         imagesMap.rows[k].push(item.id);
//
//         itemsFragment.appendChild(item);
//     }
//     return itemsFragment;
// }

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

function getItemsFragment(itemsNumber, countIdFrom) {
    var itemsFragment = document.createDocumentFragment();

    for (let i = 0; i < itemsNumber; i++) {
        var item = getImageItem();
        let itemId = 'grid-item-' + countIdFrom++;

        addProperties(item, itemId, gridMap[itemId].x, gridMap[itemId].y);

        itemsFragment.appendChild(item);
    }

    return itemsFragment;
}

function addProperties(item, id, axisX, axisY) {
    item.classList.add('grid-item');
    item.id = id;
    item.style.width = itemWidth + 'px';
    item.style.height = itemHeight + 'px';
    item.style.position = 'absolute';
    item.style.left = axisX * itemWidth + 'px';
    item.style.top = axisY * itemHeight + 'px';
}

function getImageItem() {
    var item = document.createElement('div');
    item.className = 'is-loading';
    var img = document.createElement('img');
    var rando = Math.ceil(Math.random() * 100);
    // random parameter to prevent cached images
    img.src =
        // use lorempixel for great random images
        'http://lorempixel.com/' + itemWidth + '/' + itemHeight + '/' + '?' + rando;
        // 'http://lorempixel.com/' + itemWidth + '/' + itemHeight + '/';

    item.appendChild(img);
    return item;
}

function getPosition(dimension, iterations) {

    let position = [];

    for (let i = 0; i < iterations; i++) {
        position.push(dimension * i);
    }

    return position;
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

function addImagesLoaded() {
    var imgLoad = imagesLoaded(container);
    imgLoad.on('progress', onProgress);
    imgLoad.on('always', onAlways);
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
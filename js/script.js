// (function () {
'use strict';

var slideshow = document.querySelector('body');
var header = slideshow.querySelector('header');
var container = slideshow.querySelector('#images-container');
var buttons = slideshow.querySelector('#buttons');
var supportsProgress;
var loadedImageCount, imageCount;
var progressElem, statusElem;
statusElem = slideshow.querySelector('#status');
progressElem = slideshow.querySelector('progress');

//settings
var defaultColumnsNumber = 8;
var defaultRowsNumber = 4;
var totalImages = defaultRowsNumber * defaultColumnsNumber;
var itemWidth = Math.floor(window.innerWidth / defaultColumnsNumber);
var itemHeight = itemWidth;
var gridMap = {};
var timeouts = [];
var imagesInFolderCount = 0;

supportsProgress = progressElem &&
    // IE does not support progress
    progressElem.toString().indexOf('Unknown') === -1;

getInitContent();

buttons.querySelectorAll('button').forEach(function (selector) {
    selector.addEventListener('click', modifyGrid);
}, this);

function loopFunctions() {
    timeoutLoop();
    function timeoutLoop() {
        for (let i = 0; i < defaultRowsNumber; i++) {
            timeouts.push(setTimeout(function () {
                if(isOdd(i)) {
                    addX('fromRight', i);
                    console.log('fromRight', i);
                } else {
                    addX('fromLeft', i);
                    console.log('fromLeft', i);
                }
            }, 2000 * i));
        }
        timeouts.push(setTimeout( timeoutLoop , 2000 * defaultRowsNumber));
        timeouts.push(setTimeout(timeoutGrowLoop, 15000));
    }

    function timeoutGrowLoop() {
        let columnNumber = randomColumn();
        let rowNumber = randomRow();
        let item = '';

        Object.keys(gridMap).forEach(function (gridItem, number) {
            if (gridMap[gridItem].x == columnNumber) {
                if (gridMap[gridItem].y == rowNumber) {
                    item = gridItem;
                }
            }
        });

        //this resets timeout array
        animateGrow(item);
        clearTimeouts();
        timeouts.push(setTimeout(loopFunctions, 8000));
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

        case 'clearTimeouts':
            clearTimeouts();
            break;

        default:
            return;
    }
}

//--- actions

function getInitContent() {
    createGridMap();

    loadJSON("slideshow_images_info.json", function(response) {
        var actual_JSON = JSON.parse(response);
        imagesInFolderCount = actual_JSON.count;
    });

    container.style.width = defaultColumnsNumber * itemWidth + 'px';
    container.style.height = defaultRowsNumber * itemHeight + 'px';

    var fragment = document.createDocumentFragment();
    fragment.appendChild(getItemsFragment(totalImages, 0));
    container.insertBefore(fragment, container.firstChild);

    addImagesLoaded();
    loopFunctions();
}

function getImageInFolderIndex() {
    return randomIntFromInterval(0, imagesInFolderCount);
}

function addX(direction, rowNumberPushed) {
    if (container.hasChildNodes()) {
        let rowNumber = (typeof rowNumberPushed == undefined) ? randomRow() : rowNumberPushed;
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
    } else {
        getInitContent();
    }
}

function addY(direction, columnNumberPushed) {
    if (container.hasChildNodes()) {
        let columnNumber = (typeof columnNumberPushed == undefined) ? randomRow() : columnNumberPushed;
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

        let fragment = document.createDocumentFragment();
        fragment.appendChild(getItemsFragment(1, newItemId, false, (setMultiplier * itemHeight)));
        container.insertBefore(fragment, container.firstChild);

        addImagesLoaded(function () {
            animate(column, direction, itemHeight);
        });
    } else {
        getInitContent();
    }
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

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function empty(elem) {
    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }

    clearTimeouts();
}

function clearTimeouts() {
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
        var item = getImageItem(getImageInFolderIndex());
        let itemId = 'grid-item-' + countIdFrom++;

        addProperties(item, itemId, gridMap[itemId].x, gridMap[itemId].y, addedX, addedY);

        itemsFragment.appendChild(item);
    }

    return itemsFragment;
}

function loadJSON(file, callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
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

function getImageItem(id) {
    var item = document.createElement('div');
    item.className = 'is-loading';
    var img = document.createElement('img');

    // var rando = Math.ceil(Math.random() * 100);
    // random parameter to prevent cached images
    img.src =
        // use lorempixel for great random images
        // 'http://loremflickr.com/' + itemWidth + '/' + itemHeight + '/' + '?' + rando;
        // 'http://loremflickr.com/' + itemWidth + '/' + itemHeight + '/';
        'http://195.113.232.52:5000/nekofeed/feed/slideshow_indexed_image?index='+ id;

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

function animateGrow(item) {
    let itemAnimated = document.getElementById(item);
    let translate = getTranslate(itemAnimated);
    let distancePositionX = parseInt(itemAnimated.style.left, 10) + parseInt(translate.x, 10);
    let distancePositionY = parseInt(itemAnimated.style.top, 10) + parseInt(translate.y, 10);
    let distanceWidth = container.clientWidth - parseInt(itemAnimated.style.width, 10);
    let distanceHeight = container.clientHeight - parseInt(itemAnimated.style.height, 10);

    Velocity(itemAnimated, {
        width: '+=' + distanceWidth + 'px',
        height: '+=' + distanceHeight + 'px',
        left: '=-' + distancePositionX + 'px',
        top: '=-' + distancePositionY + 'px',
        translateX: parseInt(translate.x, 10) + (parseInt(translate.x, 10) * -1) + 'px',
        translateY: parseInt(translate.y, 10) + (parseInt(translate.y, 10) * -1) + 'px',
    }, {
        easing: "easeInOutBack",
        loop: 1,
        delay: 3000,
        begin: function(elements) { itemAnimated.classList.add('show-detail'); },
        complete: function(elements) { itemAnimated.classList.remove('show-detail'); }
    });


    function getTranslate(item) {
        var matrix = item.style.transform;
        let translate = {};
// translateX
        var matchX = matrix.match(/translateX\((-?\d+\.?\d*px)\)/);
        if(matchX) {
            translate.x = matchX[1];
        } else {
            translate.x = 0;
        }

// translateY
        var matchY = matrix.match(/translateY\((-?\d+\.?\d*px)\)/);
        if(matchY) {
            translate.y = matchY[1];
        } else {
            translate.y = 0;
        }

        return translate;
    }

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

function isEven(n) {
    return n % 2 == 0;
}

function isOdd(n) {
    return Math.abs(n % 2) == 1;
}
// })();
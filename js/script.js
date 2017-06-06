// (function () {
'use strict';

var Velocity = require('velocity-animate');
var imagesLoaded = require('imagesloaded');
var shuffle = require('lodash.shuffle');

const slideshow = document.querySelector('body');
const container = slideshow.querySelector('#images-container');
const adContainer = slideshow.querySelector('#ads-container');
const buttons = slideshow.querySelector('#buttons');
let supportsProgress;
let loadedImageCount, imageCount;
const statusElem = slideshow.querySelector('#status');
const progressElem = slideshow.querySelector('progress');

//settings
const defaultColumnsNumber = 8;
const defaultRowsNumber = 4;
const totalGridImages = defaultRowsNumber * defaultColumnsNumber;
const itemWidth = Math.floor(window.innerWidth / defaultColumnsNumber);
const itemHeight = Math.floor(window.innerWidth / defaultColumnsNumber);
const gridMap = {};
const timeouts = [];
let idGlobalCounter = 0;
let eventCounters = {};

const imagesMagazine = [];
const usedImagesMagazine = [];
const adsMagazine = [];
const usedAdsMagazine = [];
let options = {};

supportsProgress = progressElem &&
    // IE does not support progress
    progressElem.toString().indexOf('Unknown') === -1;

getInitContent();

var loopFunctions = {
    init: function () {
        this.handleAnimations();
    },
    handleAnimations: function () {
        window.addEventListener('addX', function (e) {
            console.log(e.detail.rowNumber);

            e.detail.rowNumber++;
            if (e.detail.signPlusOrMinus === '+') {
                e.detail.signPlusOrMinus = '-';
            } else {
                e.detail.signPlusOrMinus = '+';
            }
            if (e.detail.rowNumber === defaultRowsNumber) {
                eventCounters.addX = 0;
                timeouts.push(setTimeout(function () {
                    this.animateGrow();
                }.bind(this), options.slideshow_maximum_speed * 1000));

            } else {
                eventCounters.addX =+ 1;
                this.timeBetweenGalleryLoop(e.detail.signPlusOrMinus, e.detail.rowNumber);
            }
        }.bind(this));

        window.addEventListener('animateGrow', function (e) {
            eventCounters.animateGrow += 1;

            if (eventCounters.animateGrow === 3) {
                eventCounters.animateGrow = 0;
                this.animateAdd();
            } else {
                this.timeBetweenGalleryLoop('+', 0);
            }
        }.bind(this));

        window.addEventListener('animateAd', function (e) {
                this.timeBetweenGalleryLoop('+', 0);
        }.bind(this));

        eventCounters.animateGrow = 0;
        this.addX('+', 0);
    },
    animateGrow: function() {
        cleanGrid();
        let item = Object.keys(gridMap)[getRandomInt(0, Object.keys( gridMap ).length - 1)];
        let itemAnimated = document.getElementById(item);

        Velocity(itemAnimated, {
            width: container.clientWidth + 'px',
            height: container.clientWidth + 'px',
            left: 0,
            top: 0,
            translateX: 0,
            translateY: 0,
        }, {
            easing: "easeInOutBack",
            duration: (options.slideshow_fade_duration || 2) * 1000,
            begin: function() {
                itemAnimated.classList.add('show-detail');
            },
        });

        Velocity(itemAnimated, 'reverse', {
            delay: options.slideshow_ad_duration * 100,
            complete: function () {
                itemAnimated.classList.remove('show-detail');
                let evt = new CustomEvent('animateGrow', { detail: itemAnimated });
                window.dispatchEvent(evt);
            }
        });
    },
    timeBetweenGalleryLoop: function (direction, sign) {
        if (imagesMagazine.length === 0) {
            usedImagesMagazine.forEach(function (item) {
                imagesMagazine.push(item);
            });
            imagesMagazine.reverse();
            usedImagesMagazine.length = 0;

            timeouts.push(setTimeout(function () {
                this.addX(direction, sign);
            }.bind(this), options.slideshow_time_between_gallery_loop * 100));
        } else {
            timeouts.push(setTimeout(function () {
                this.addX(direction, sign);
            }.bind(this), options.slideshow_maximum_speed * 1000));
        }
    },
    addX: function(dir, number) {
        if (container.hasChildNodes()) {
            let constructInformation = new PushGridMapFromDirection({
                axisToPush: 'x',
                signPlusOrMinus: dir,
                rowNumber: number
            });

            console.log(constructInformation);

            //TODO Unite fill grid with images to some function

            let fragment = document.createDocumentFragment();
            let addedX = itemWidth * parseInt(constructInformation.signPlusOrMinus + 1);
            let item = getImageItem();

            addProperties(item, constructInformation.addedItem, constructInformation.x, constructInformation.y, addedX);
            fragment.appendChild(item);
            container.insertBefore(fragment, container.firstChild);

            addImagesLoaded(function () {
                constructInformation.gridItemsToPush.forEach(function (item) {
                    Velocity(document.getElementById(item), {
                        translateX: '+=' + (itemWidth * parseInt(constructInformation.signPlusOrMinus + 1)) + 'px'
                    }, {
                        easing: "easeInOutBack",
                        duration: (options.slideshow_slideInDuration || 1.5) * 1000,
                    });
                });
            }.bind(this));

            let evt = new CustomEvent('addX', { detail: constructInformation });
            window.dispatchEvent(evt);
        } else {
            getInitContent();
        }
    },
    animateAdd: function () {
        getAdItem();

        let adsContainer = document.getElementById('ads-container');

        Velocity(adsContainer, {
            opacity: 1,
        }, {
            easing: "easeInOutBack",
        });

        Velocity(adsContainer, 'reverse', {
            delay: '8000',
            complete: function () {
                while (adsContainer.firstChild) {
                    adsContainer.removeChild(adsContainer.firstChild);
                }
                let evt = new CustomEvent('animateAd');
                window.dispatchEvent(evt);
            }
        });
    },
};

//--- actions

function getInitContent() {
    if (!container.hasChildNodes()) {
        //TODO init container preloader until we loadMagazine with data

        //load data
        (function initContainer() {
            container.style.width = defaultColumnsNumber * itemWidth + 'px';
            container.style.height = defaultRowsNumber * itemHeight + 'px';
        })();

        //This function is loaded once
        (function createGridMap() {
            for (let i = 0, j = 0, k = 0; i < totalGridImages; i++, j++) {

                let itemId = 'grid-item-' + idGlobalCounter;

                idGlobalCounter++;

                if (j === defaultColumnsNumber) {
                    j = 0;
                    k++;
                }

                gridMap[itemId] = {
                    x: j,
                    y: k
                };
            }
        })();

        //load all available images from source json to magazine
        (function loadMagazine() {
            loadJSON("/demoData/slideshow_images_info.json", function(response) {
                let parsedJSON = JSON.parse(response);

                parsedJSON.list.forEach(function (item) {
                    imagesMagazine.push(item);
                });

                parsedJSON.adList.forEach(function (item) {
                    adsMagazine.push(item);
                });

                options = parsedJSON.options;

                //TODO Unite fill grid with images to some function
                let fragment = document.createDocumentFragment();

                Object.keys(gridMap).forEach(function (gridItem) {
                    let item = getImageItem(true);
                    addProperties(item, gridItem, gridMap[gridItem].x, gridMap[gridItem].y);
                    fragment.appendChild(item);
                });

                container.insertBefore(fragment, container.firstChild);

                addImagesLoaded();

                //TODO remove container preloader since we got magazine loaded and now we rely on imagesloaded to pretty load each image
                loopFunctions.init();
            });
        })();

    } else {
        empty(container);
        getInitContent();
    }
}

function addToGridMap(positionAxisX, positionAxisY) {
    let itemId = 'grid-item-' + idGlobalCounter;
    idGlobalCounter++;

    gridMap[itemId] = {
        x: positionAxisX,
        y: positionAxisY
    };

    return itemId;
}

function PushGridMapFromDirection(opts) {
    opts = extend({
        rowNumber: opts.rowNumber === undefined ? (opts.y === undefined ? randomRow() : opts.y) : opts.rowNumber,
        columnNumber: opts.x === undefined ? randomColumn() : opts.x,
        signPlusOrMinus: opts.signPlusOrMinus === undefined ? (Math.round(Math.random()) ? '+' : '-') : opts.signPlusOrMinus,
        axisToPush: Math.round(Math.random()) ? 'x' : 'y'
    }, opts);
    opts = extend({
        x: opts.axisToPush === 'x' ? (opts.signPlusOrMinus === '+' ? defaultColumnsNumber - 1 : 0) : opts.columnNumber,
        y: opts.axisToPush === 'y' ? (opts.signPlusOrMinus === '+' ? 0 : defaultRowsNumber - 1) : opts.rowNumber,
    }, opts);
    opts = extend({
        gridItemsToPush:  pushGridMapItems(),
        addedItem: addToGridMap(opts.x,opts.y)
    }, opts);
    extend(this, opts);

    this.gridItemsToPush.push(this.addedItem);

    function pushGridMapItems() {
        let gridItemsToPush = [];

        Object.keys(gridMap).forEach(function (gridItem) {
            if (opts.axisToPush === 'x') {
                if (opts.signPlusOrMinus === '+') {
                    if (gridMap[gridItem].x <= opts.x && gridMap[gridItem].y === opts.y) {

                        gridItemsToPush.push(gridItem);
                        gridMap[gridItem].x = gridMap[gridItem].x - 1;

                    }
                } else if (opts.signPlusOrMinus === '-') {
                    if (gridMap[gridItem].x >= opts.x && gridMap[gridItem].y === opts.y) {

                        gridItemsToPush.push(gridItem);
                        gridMap[gridItem].x = gridMap[gridItem].x + 1;

                    }
                }
            } else if (opts.axisToPush === 'y') {
                if (opts.signPlusOrMinus === '-') {
                    if (gridMap[gridItem].y >= opts.y && gridMap[gridItem].x === opts.x) {

                        gridItemsToPush.push(gridItem);
                        gridMap[gridItem].y = gridMap[gridItem].y - 1;

                    }
                } else if (opts.signPlusOrMinus === '+') {
                    if (gridMap[gridItem].y <= opts.y && gridMap[gridItem].x === opts.x) {

                        gridItemsToPush.push(gridItem);
                        gridMap[gridItem].y = gridMap[gridItem].y + 1;

                    }
                }
            }
        });

        return gridItemsToPush;
    }

    //TODO vratit jiny object nez ten co mu posilam extendnuty o opts
    return opts;
}

function empty(elem) {
    clearTimeouts();

    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }

    //empty items magazines
    imagesMagazine.length = 0;
    usedImagesMagazine.length = 0;
    adsMagazine.length = 0;
    usedAdsMagazine.length = 0;

    //DeepClean of gridMap object
    Object.keys(gridMap).forEach(function(key) { delete gridMap[key]; });
}

function clearTimeouts() {
    for (let i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
    //quick reset of the timer array you just cleared
    timeouts.length = 0;
}

function cleanGrid() {
    let cleanItems = [];

    Object.keys(gridMap).forEach(function (gridItem) {
        if (gridMap[gridItem].x >= defaultColumnsNumber || gridMap[gridItem].x < 0) {
            cleanItems.push(gridItem);
        }
        else if (gridMap[gridItem].y >= defaultRowsNumber || gridMap[gridItem].y < 0) {
            cleanItems.push(gridItem);
        }
    });

    console.log(cleanItems);

    cleanItems.forEach(function (item) {
        delete gridMap[item];
        container.removeChild(document.getElementById(item));
    });

    cleanItems.length = 0;
}

function addProperties(item, itemId, axisX, axisY, addedX, addedY) {
    item.classList.add('grid-item');
    item.id = itemId;
    item.style.width = itemWidth + 'px';
    item.style.height = itemHeight + 'px';
    item.style.position = 'absolute';
    item.style.left = axisX * itemWidth + 'px';
    item.style.top = axisY * itemHeight + 'px';

    if (addedX) {
        item.style.left = axisX * itemWidth + addedX  + 'px';
    }

    if (addedY) {
        item.style.top = axisY * itemHeight + (addedY * -1) + 'px';
    }
}

function getAdItem() {
    let fragment = document.createDocumentFragment();
    let adFromMagazine;

    if (adsMagazine.length === 0) {
        usedAdsMagazine.forEach(function (item) {
            adsMagazine.push(item);
        });
        adsMagazine.reverse();
        usedAdsMagazine.length = 0;
    }

    adFromMagazine = adsMagazine.pop();
    usedAdsMagazine.push(adFromMagazine);

    if (adFromMagazine.content === 'image') {
        fragment.appendChild(
            getImageItem2(adFromMagazine.url)
        );
    } else if (adFromMagazine.content === 'video') {
        fragment.appendChild(
            getVideoItem(adFromMagazine.url)
        );
    }

    adContainer.insertBefore(fragment, adContainer.firstChild);
}

function getImageItem2(url) {
    let img = document.createElement('img');
    img.src = url;
    img.classList.add('ad');
    return img;
}

function getVideoItem(url) {
    let video = document.createElement('video');
    video.autoplay = true;
    video.src = url;
    video.classList.add('ad');
    return video;
}

function getImageItem(init) {
    let item = document.createElement('div');

    let img = document.createElement('img');
    item.appendChild(img);

    let textWrapper = document.createElement('div');
    item.appendChild(textWrapper);

    if (imagesMagazine.length === 0 && init === true) {
        usedImagesMagazine.forEach(function (item) {
            imagesMagazine.push(item);
        });
        imagesMagazine.reverse();
        usedImagesMagazine.length = 0;
    }

    let imageFromMagazine = imagesMagazine.pop();
    usedImagesMagazine.push(imageFromMagazine);

    item.classList.add('is-loading');
    img.src =
        // use lorempixel for great random images
        // 'http://loremflickr.com/' + itemWidth + '/' + itemHeight + '/' + '?' + rando;
        // 'http://loremflickr.com/' + itemWidth + '/' + itemHeight + '/';
        imageFromMagazine.url;

    textWrapper.innerHTML =
        '<span class="userName">'+ imageFromMagazine.texts.user_name +'</span>' +
        '<span class="userThanks">'+ imageFromMagazine.texts.full_name +'</span>' +
        '<span class="userHashtags">'+ imageFromMagazine.texts.caption +'</span>';

    return item;
}
// triggered after each item is loaded
function onProgress(imgLoad, image) {
    // change class if the image is loaded or broken
    if (image.isLoaded) {
        image.img.parentNode.classList.remove('is-loading');
    } else {
        image.img.parentNode.classList.remove('is-loading');
        image.img.parentNode.classList.add('is-broken');
    }

    loadedImageCount++;
}

function addImagesLoaded(setDone) {
    var imgLoad = imagesLoaded(container);
    imgLoad.on('progress', onProgress);
    if (setDone) {
        imgLoad.on('done', setDone);
    }
    // reset progress counter
    imageCount = imgLoad.images.length;
}

// hide status when done
function randomRow() {
    return Math.floor(Math.random() * (defaultRowsNumber - 0)) + 0;
}

function randomColumn() {
    return Math.floor(Math.random() * (defaultColumnsNumber - 0)) + 0;
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

function extend(target, source) {
    if (source) {
        for (var key in source) {
            var val = source[key];
            if (typeof val !== "undefined") {
                target[key] = val;
            }
        }
    }
    return target;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// })();
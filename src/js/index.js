const popupTemplate = require('../../popup.hbs');
const reviewTemplate = require('../../popup-review.hbs');


export default function () {
    let mapContainer = document.querySelector('.map');

    let map = {
        places: {},
        yMap: undefined,
        cluster:undefined,
        init: function() {
            (async() => {
                try {
                    let map = this.yMap = await this.mapInit();
                    this.addClusterization();

                    map.events.add('click', this.bindClick.bind(this));
                    mapContainer.addEventListener('click', this.closePopup.bind(this));
                    mapContainer.addEventListener('click', this.addReview.bind(this));

                } catch (e) {
                    console.error(e);
                }
            })();

        },
        mapInit: function () {
            return new Promise(function (resolve) {
                let map;

                this.getUserCoords()
                    .then(function (coords) {
                        map = new ymaps.Map('map', {
                            center: coords,
                            zoom: 12
                        });

                        resolve(map);
                    });
            }.bind(this));
        },
        getUserCoords: function () {
            return new Promise(function (resolve) {
                let coords;
                ymaps.geolocation.get()
                    .then(function (result) {
                        coords = result.geoObjects.position;
                        resolve(coords);
                    }, function(e) {
                        coords = [55.754347, 37.622453];
                        resolve(coords);
                    });
            });
        },
        addClusterization: function () {
            this.clusterer = new ymaps.Clusterer({
                preset: 'islands#invertedVioletClusterIcons',
                groupByCoordinates: false,
                clusterDisableClickZoom: true,
                clusterHideIconOnBalloonOpen: false,
                clusterBalloonContentLayout: 'cluster#balloonCarousel'
            });

            this.clusterer.events.add('click', function (event) {
                let target = event.get('target');
                let coords;

                if (target.constructor.name != 'o') return; // Проверка на placemark

                coords = target.geometry.getCoordinates();
                this.renderPopup(coords)
                    .then((template) => {
                        this.openPopup(coords, template);
                    });
            }.bind(this));

            this.yMap.geoObjects.add(this.clusterer);
        },
        bindClick: function (event) {
            let coords = event.get('coords');
            coords[0] = Number(coords[0].toFixed(5));
            coords[1] = Number(coords[1].toFixed(5));

            if(this.yMap.balloon.isOpen()) {
                this.yMap.balloon.close();
            } else {
                this.renderPopup(coords)
                    .then((template) => {
                        this.openPopup(coords, template);
                    });
            }
        },
        renderPopup: function (coordinates) {
            return new Promise(resolve => {
                this.getAddress(coordinates)
                    .then((result) => {
                        let html;
                        let address = result;
                        let coordsString = coordinates.toString();
                        let place = this.places[`${coordsString}`];
                        let rewiews = this.renderReviews({
                            reviews: place
                        });

                        let context = {
                            address: address,
                            coordinates: coordinates,
                            reviews: rewiews,
                        };

                        html = popupTemplate(context);
                        resolve(html);
                    })
            })
        },
        renderReviews:function (reviews) {
          let html =  reviewTemplate(reviews);

          return html;
        },
        getAddress: function (coordinates) {
            return ymaps.geocode(coordinates).then(function (result) {
                let object = result.geoObjects.get(0);
                return (String(object.getAddressLine()));
            });
        },
        openPopup: function (coordinates, html) {
            this.yMap.balloon.open(coordinates, {
                contentBody: html,
            },{
                closeButton: false,
                maxHeight: 'auto',
                layout: 'default#imageWithContent',
            });
        },
        closePopup: function (event) {
          let target = event.target;

          if (target.classList.contains('js-popup-close')) {
              this.yMap.balloon.close();
          }
        },
        addReview: function (event) {
            let target = event.target;

            if (target.classList.contains('js-popup-add')) {
                let form = document.querySelector('.js-popup-form');
                let inputs = form.querySelectorAll('.js-popup-required');
                let authorField = form.querySelector('.js-popup-author');
                let placeField = form.querySelector('.js-popup-place');
                let commentField = form.querySelector('.js-popup-comment');
                let reviews = document.querySelector('.js-popup-reviews');

                if (this.validateInputs(inputs)) {
                    let coords = target.dataset.coords;

                    let review = {
                        author: authorField.value,
                        place: placeField.value,
                        comment: commentField.value,
                        date: this.getCurrentDate(),
                        time: this.getCurrentTime()
                    };

                    if (coords in this.places) {
                        this.places[`${coords}`].push(review);
                    } else {
                        this.places[`${coords}`] = new Array();
                        this.places[`${coords}`].push(review);
                    }

                    let mapCoords = coords.split(',');

                    let preparedReviews = this.renderReviews({
                        reviews: this.places[coords]
                    });

                    this.createMarker(mapCoords);
                    reviews.innerHTML = preparedReviews;
                }
            }
        },
        validateInputs: function (inputs) {
            for (let i = 0; i < inputs.length; i++) {
                let input = inputs[i];

                if (input.value === '') {
                    input.focus();
                    input.style.outlineColor = 'red';

                    return false;
                }
            }

            return true;
        },
        getCurrentDate: function() {
            const today = new Date();
            let day = today.getDate();
            let month = today.getMonth()+1;
            let year = today.getFullYear();

            day = this.correctTime(day);
            month = this.correctTime(month);

            const string = `${day}.${month}.${year}`;

            return string
        },
        getCurrentTime: function () {
            const today = new Date();
            let hours = today.getHours();
            let minutes = today.getMinutes();
            let seconds = today.getSeconds();

            hours = this.correctTime(hours);
            minutes = this.correctTime(minutes);
            seconds = this.correctTime(seconds);

            const string = `${hours}:${minutes}:${seconds}`;

            return string;
        },
        correctTime: function (item) {
            if (item < 10) {
                item = "0" + item;
            }
            return item;
        },
        createMarker: function (coordinates) {
            let data = {
                clusterCaption: 'метка <strong>1</strong>'
            };

            let placemark = new ymaps.Placemark(coordinates, data);
            this.clusterer.add(placemark);
        }
    };

    map.init();
}

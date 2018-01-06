const templateElement = require('../../popup.hbs');

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
                var target = event.get('target');
                let objects = target.getGeoObjects();

                // TODO: Допилить функционал получения координат при клике на метки
                console.log(objects);
                objects.forEach(function (element) {
                    console.log(element.geometry.getCoordinates());
                })
            }.bind(this));

            this.yMap.geoObjects.add(this.clusterer);
        },
        bindClick: function (event) {
            let coords = event.get('coords');

            if(this.yMap.balloon.isOpen()) {
                this.yMap.balloon.close();
            } else {
                this.renderPopup(coords).then((template) => {
                    this.openPopup(coords, template);
                });
            }
            // this.createMarker(coords);
        },
        renderPopup: function (coordinates) {
            return new Promise(resolve => {
                let html;
                let address;

                this.getAddress(coordinates)
                    .then(function (result) {
                        address = result;

                        let context = {
                            address: address,
                        };

                        html = templateElement(context);
                        resolve(html);
                    })
            })
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
        createMarker: function (coordinates) {
            let data = {
                clusterCaption: 'метка <strong>1</strong>'
            };

            this.clusterer.add(new ymaps.Placemark(coordinates, data));
        }
    };

    map.init();
}

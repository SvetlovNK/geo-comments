const templateElement = require('../../popup.hbs');

export default function () {
    let map = {
        objects: {},
        yMap: undefined,
        cluster:undefined,
        init: function() {
            (async() => {
                try {
                    let map = this.yMap = await this.mapInit();
                    this.addClusterization();

                    map.events.add('click', this.bindClick.bind(this));

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
            const html = templateElement();

            this.yMap.balloon.open(coords, {
                contentBody: html,
            },{
                closeButton: false,
                maxHeight: 'auto',
                layout: 'default#imageWithContent',
            });

            this.createMarker(coords);
        },
        createMarker: function (coordinates) {
            let data = {
                clusterCaption: 'метка <strong>1</strong>'
            };

            this.clusterer.add(new ymaps.Placemark(coordinates, data));
            this.clusterer.add(new ymaps.Placemark(coordinates, data));
            this.clusterer.add(new ymaps.Placemark(coordinates, data));
            this.clusterer.add(new ymaps.Placemark(coordinates, data));
            this.clusterer.add(new ymaps.Placemark(coordinates, data));
            this.clusterer.add(new ymaps.Placemark(coordinates, data));
            this.clusterer.add(new ymaps.Placemark(coordinates, data));
            this.clusterer.add(new ymaps.Placemark(coordinates, data));
            console.log(coordinates);
        }
    };

    map.init();
}

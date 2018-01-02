export default function () {
    let map = {
        objects: {},
        yMap: undefined,
        init: function() {
            (async() => {
                try {
                    let map = this.yMap = await this.mapInit();

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
        bindClick: function (event) {
            let coords = event.get('coords');
            console.log(this);
            this.yMap.balloon.open(coords, {
                // contentHeader:'Событие!',
                contentBody:'<p>Кто-то щелкнул по карте.</p>' +
                '<p>Координаты щелчка: ' + [
                    coords[0].toPrecision(6),
                    coords[1].toPrecision(6)
                ].join(', ') + '</p>',
                // contentFooter:'<sup>Щелкните еще раз</sup>'
            });

            this.createMarker(coords);
        },
        createMarker: function (coordinates) {
            this.yMap.geoObjects.add(new ymaps.Placemark(coordinates));
        }
    };

    map.init();
}

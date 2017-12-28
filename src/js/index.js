export default function () {
    let map = {
        yMap: undefined,
        userCoords: undefined,
        init: function() {
            (async() => {
                try {
                    this.mapInit();
                } catch (e) {
                    console.error(e);
                }
            })();

        },
        mapInit: function () {
            (async() => {
                try {
                    let map = this.yMap;

                    this.getUserCoords()
                        .then(function (coords) {
                            console.log(coords);
                            map = new ymaps.Map('map', {
                                center: coords,
                                zoom: 12
                            });
                        });
                } catch (e) {
                    console.error(e);
                }
            })();
        },
        getUserCoords: function () {
            return new Promise(function (resolve) {
                let coords;
                ymaps.geolocation.get()
                    .then(function (result) {
                        coords = result.geoObjects.position;
                        resolve(coords);
                    }, function(e) {
                        console.log('2');
                        coords = [55.754347, 37.622453];
                        resolve(coords);
                    });
            });
        }
    };

    map.init();
}

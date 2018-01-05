// SCSS
import './styles/main.scss';

// scripts
import map from './js/index'

document.addEventListener("DOMContentLoaded", function(event) {
    ymaps.ready(function () {
        console.log('ready');
        map();
    });
});
// ==UserScript==
// @name        OpenStreetMap on rent.591.com.tw
// @namespace   https://github.com/gslin/openstreetmap-on-rent.591.com.tw
// @match       https://rent.591.com.tw/home/*
// @grant       GM_xmlhttpRequest
// @version     0.20210620.1
// @author      Gea-Suan Lin <gslin@gslin.com>
// @description Embed OpenStreetMap on rent.591.com.tw.
// @require     https://unpkg.com/leaflet@1.7.1/dist/leaflet.js
// @license     MIT
// ==/UserScript==

(() => {
    'use strict';

    const icon = L.icon({iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'});

    let sem = 0;
    let ob = new window.MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (sem > 0) {
                    return;
                }

                let addr_el = document.querySelector('div.address * + span');
                if (!addr_el) {
                    return;
                }

                // Uninstall
                ob.disconnect();
                sem++;

                let addr = addr_el.innerText;

                let url = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(addr) + '&format=json';
                GM_xmlhttpRequest({
                    method: 'GET',
                    onload: res => {
                        let r = JSON.parse(res.responseText);
                        let r0 = r[0];

                        // leaflet css
                        let leaflet_css_el = document.createElement('link');
                        leaflet_css_el.setAttribute('href', 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css');
                        leaflet_css_el.setAttribute('rel', 'stylesheet');
                        document.getElementsByTagName('head')[0].appendChild(leaflet_css_el);

                        // leaflet map element
                        let map_el = document.createElement('div');
                        map_el.setAttribute('style', 'height: 400px; width: 800px;');
                        addr_el.parentElement.insertAdjacentElement('afterend', map_el);

                        let map = L.map(map_el).setView([r0.lat, r0.lon], 17);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                        L.marker([r0.lat, r0.lon], {icon: icon}).addTo(map);
                    },
                    url: url,
                });
            });
        });
    });

    ob.observe(document, {
        childList: true,
        subtree: true,
    });
})();

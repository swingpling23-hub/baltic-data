// ======================================
// OPENSEAMAP
// ======================================

const overviewMap = L.map('overview-map').setView([58.5, 18.5], 5);

// OpenStreetMap bas

L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }
).addTo(overviewMap);

// OpenSeaMap ovanpå

L.tileLayer(
    'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenSeaMap'
    }
).addTo(overviewMap);

// Strategiska platser

L.marker([57.65, 18.30])
    .addTo(overviewMap)
    .bindPopup('Gotland');

L.marker([55.25, 14.90])
    .addTo(overviewMap)
    .bindPopup('Bornholm');

L.marker([54.71, 20.50])
    .addTo(overviewMap)
    .bindPopup('Kaliningrad');

L.marker([59.44, 24.75])
    .addTo(overviewMap)
    .bindPopup('Tallinn');

L.marker([60.17, 24.94])
    .addTo(overviewMap)
    .bindPopup('Helsingfors');

L.marker([55.71, 21.13])
    .addTo(overviewMap)
    .bindPopup('Klaipeda');

L.marker([54.53, 18.55])
    .addTo(overviewMap)
    .bindPopup('Gdynia');

L.marker([56.16, 15.59])
    .addTo(overviewMap)
    .bindPopup('Karlskrona');


// ======================================
// KABELKARTA
// ======================================

const cableMap = L.map('cable-map').setView([58.0, 18.0], 5);

L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }
).addTo(cableMap);

fetch('baltic-power-cables.geojson')
.then(response => response.json())
.then(data => {

    L.geoJSON(data, {

        style: {
            color: '#00ffff',
            weight: 4,
            opacity: 0.9
        },

        onEachFeature: function(feature, layer) {

            layer.bindPopup(`
                <b>${feature.properties.name}</b><br>
                ${feature.properties.country}<br>
                ${feature.properties.type}
            `);

        }

    }).addTo(cableMap);

})
.catch(error => {

    console.error(
        'GeoJSON kunde inte läsas:',
        error
    );

});

setTimeout(() => {

    overviewMap.invalidateSize();
    cableMap.invalidateSize();

}, 500);


// ======================================
// RSS FLÖDEN
// ======================================

const proxyUrl =
'https://api.rss2json.com/v1/api.json?rss_url=';

const feeds = [

'https://feeds.bbci.co.uk/news/world/europe/rss.xml',

'https://www.svt.se/nyheter/rss.xml',

'https://feeds.expressen.se/nyheter/',

'https://rss.dw.com/xml/rss-en-eu',

'https://www.navalnews.com/feed/'

];


// ======================================
// NYCKELORD
// ======================================

const keywords = [

'drone',
'drones',
'uav',

'explosive',
'explosives',
'bomb',

'sabotage',

'terror',
'terrorism',
'terrorist',

'hack',
'hacker',
'hacking',
'cyber',
'cyberattack',

'warplane',
'fighter',
'fighter jet',

'defense',
'defence',
'military',
'army',
'navy',

'putin',
'kremlin',

'trump',

'nato',

'russia',
'russian',

'baltic',
'baltic sea',
'östersjön',

'critical infrastructure',

'undersea cable',
'subsea cable',

'gotland'

];


// ======================================
// FLIKAR
// ======================================

function showTab(tabName) {

    document
        .querySelectorAll('.feed-container')
        .forEach(feed => {

            feed.classList.add('hidden');

        });

    document
        .getElementById(tabName + '-feed')
        .classList.remove('hidden');

}


// ======================================
// NYHETER
// ======================================

const seenArticles = new Set();

let firstLoad = true;

async function fetchFeeds() {

    for (const feed of feeds) {

        try {

            const response =
                await fetch(
                    proxyUrl +
                    encodeURIComponent(feed)
                );

            if (!response.ok)
                continue;

            const data =
                await response.json();

            if (!data.items)
                continue;

            data.items.forEach(item => {

                const content =
                    (
                        item.title +
                        ' ' +
                        (item.description || '')
                    )
                    .toLowerCase();

                const relevant =
                    keywords.some(keyword =>
                        content.includes(
                            keyword.toLowerCase()
                        )
                    );

                if (
                    relevant &&
                    !seenArticles.has(item.link)
                ) {

                    seenArticles.add(item.link);

                    renderArticle(
                        item,
                        !firstLoad
                    );

                }

            });

        }

        catch(error) {

            console.error(error);

        }

    }

    firstLoad = false;

}


// ======================================
// ARTIKLAR
// ======================================

function renderArticle(item, isNew) {

    const articleDate =
        new Date(item.pubDate);

    const now =
        new Date();

    const diffDays =
        Math.floor(
            (now - articleDate)
            / 86400000
        );

    let container;

    if (diffDays < 1) {

        container =
            document.getElementById(
                'today-feed'
            );

    }

    else if (diffDays < 2) {

        container =
            document.getElementById(
                'yesterday-feed'
            );

    }

    else {

        container =
            document.getElementById(
                'older-feed'
            );

    }

    const div =
        document.createElement('div');

    div.className = 'news-item';

    if (isNew) {

        div.classList.add(
            'new-flash'
        );

    }

    div.innerHTML = `
    ${item.link}
       ${item.title}
    </a>
    `;

    container.prepend(div);

    while (
        container.children.length > 75
    ) {

        container.removeChild(
            container.lastChild
        );

    }

}


// ======================================
// START
// ======================================

fetchFeeds();

setInterval(
    fetchFeeds,
    60000
);

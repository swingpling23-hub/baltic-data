// ======================================
// OPENSEAMAP + ÖSTERSJÖKARTA
// ======================================

const overviewMap = L.map('overview-map').setView([58.5, 18.5], 5);

L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        maxZoom: 19
    }
).addTo(overviewMap);

L.tileLayer(
    'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
    {
        opacity: 0.9
    }
).addTo(overviewMap);

// Strategiska platser

[
    [57.65, 18.30, 'Gotland'],
    [55.25, 14.90, 'Bornholm'],
    [54.71, 20.50, 'Kaliningrad'],
    [59.44, 24.75, 'Tallinn'],
    [60.17, 24.94, 'Helsingfors'],
    [55.71, 21.13, 'Klaipeda'],
    [54.53, 18.55, 'Gdynia'],
    [56.16, 15.59, 'Karlskrona']
].forEach(place => {

    L.marker([place[0], place[1]])
        .addTo(overviewMap)
        .bindPopup(place[2]);

});

// ======================================
// KABELKARTA
// ======================================

const cableMap = L.map('cable-map')
    .setView([58.0, 18.0], 5);

L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        maxZoom: 19
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
// RSS-KÄLLOR
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

const securityKeywords = [

'sabotage',

'drone',
'drones',
'uav',

'explosive',
'explosives',
'bomb',

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

'nordbalt',
'estlink',
'swepol',
'baltic cable',

'undersea cable',
'subsea cable',
'power cable',

'cable damage',
'cable break',
'cable cut',

'anchor dragging',
'ship anchor',

'shadow fleet',

'pipeline',

'kaliningrad',
'gotland',
'bornholm'
];

// ======================================
// LIVE-KLOCKA
// ======================================

function updateClock() {

    const now = new Date();

    const clock =
        document.getElementById(
            'live-clock'
        );

    if (clock) {

        clock.textContent =
            now.toLocaleTimeString('sv-SE');

    }

}

updateClock();

setInterval(
    updateClock,
    1000
);

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
        .getElementById(
            tabName + '-feed'
        )
        .classList.remove('hidden');

}

// ======================================
// NYHETER
// ======================================

const seenArticles = new Set();

let firstLoad = true;

async function fetchFeeds() {

    let foundArticles = 0;

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

                const content = (

                    item.title +

                    ' ' +

                    (item.description || '')

                ).toLowerCase();

                const relevant =

                    securityKeywords.some(
                        keyword =>
                            content.includes(
                                keyword.toLowerCase()
                            )
                    );

                if (

                    relevant &&

                    !seenArticles.has(item.link)

                ) {

                    seenArticles.add(item.link);

                    foundArticles++;

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

    const updateDiv =
        document.getElementById(
            'last-update'
        );

    if (updateDiv) {

        updateDiv.textContent =
            'Senaste RSS: ' +
            new Date()
            .toLocaleTimeString('sv-SE');

    }

    firstLoad = false;

}

// ======================================
// ARTIKLAR
// ======================================

function renderArticle(
    item,
    isNew
) {

    const articleDate =
        new Date(item.pubDate);

    const now =
        new Date();

    const diffDays =
        Math.floor(
            (now - articleDate) /
            86400000
        );

    // Ignorera äldre än 5 dagar

    if (diffDays > 5) {
        return;
    }

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

    div.className =
        'news-item';

    if (isNew) {

        div.classList.add(
            'new-flash'
        );

    }

    const articleLink =
        document.createElement('a');

    articleLink.href =
        item.link;

    articleLink.target =
        '_blank';

    articleLink.rel =
        'noopener noreferrer';

    articleLink.textContent =
        item.title;

    const sourceDiv =
        document.createElement('div');

    sourceDiv.className =
        'source';

    sourceDiv.textContent =
        articleDate
        .toLocaleTimeString(
            'sv-SE',
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );

    div.appendChild(articleLink);
    div.appendChild(sourceDiv);

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

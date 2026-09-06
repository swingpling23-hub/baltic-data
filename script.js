// ======================================
// KABELKARTA
// ======================================

const cableMap = L.map('cable-map', {
    zoomControl: true
}).setView([58.5, 18.5], 5);

L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
        maxZoom: 19
    }
).addTo(cableMap);

// Läs in elkablar från GeoJSON-fil

fetch('baltic-power-cables.geojson')

.then(response => response.json())

.then(data => {

    L.geoJSON(data, {

        style: function(feature) {

            return {
                color: '#00ffff',
                weight: 4,
                opacity: 0.9
            };

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

    console.error('Kunde inte läsa GeoJSON:', error);

});

setTimeout(() => {
    cableMap.invalidateSize();
}, 500);

// ======================================
// NYHETSFLÖDE
// ======================================

const proxyUrl =
    'https://api.rss2json.com/v1/api.json?rss_url=';

// Nyhetskällor

const feeds = [

    'https://www.svt.se/nyheter/rss.xml',

    'https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/',

    'https://feeds.expressen.se/nyheter/',

    'https://feeds.bbci.co.uk/news/world/rss.xml',

    'https://feeds.bbci.co.uk/news/world/europe/rss.xml',

    'https://www.navalnews.com/feed/'

];

// Nyckelord för Östersjön / säkerhet / OSINT

const keywords = [

    'baltic',
    'baltic sea',
    'östersjön',

    'cable',
    'power cable',
    'subsea',
    'undersea',
    'kabel',

    'sabotage',
    'hybrid attack',
    'hybrid warfare',

    'critical infrastructure',

    'espionage',
    'spy',
    'spioneri',

    'drone',
    'uav',
    'drönare',

    'military',
    'militär',

    'navy',
    'warship',
    'fleet',

    'exercise',
    'övning',

    'pipeline',

    'nato',

    'russia',
    'russian',
    'ryssland',

    'estonia',
    'estland',

    'finland',

    'sweden',
    'sverige',

    'gotland',

    'incident'
];

const seenArticles = new Set();

let firstLoad = true;

// ======================================
// HÄMTA RSS
// ======================================

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

                const textToCheck =
                    (
                        item.title +
                        ' ' +
                        (item.description || '')
                    )
                    .toLowerCase();

                const relevant =

                    keywords.some(keyword =>
                        textToCheck.includes(
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
                        data.feed.title,
                        !firstLoad
                    );

                }

            });

        }

        catch (error) {

            console.error(
                'Fel vid hämtning:',
                error
            );

        }

    }

    firstLoad = false;

}

// ======================================
// RENDRERA NYHET
// ======================================

function renderArticle(
    item,
    sourceTitle,
    isNew
) {

    const container =
        document.getElementById(
            'osint-feed'
        );

    const div =
        document.createElement('div');

    div.className =
        'news-item';

    if (isNew) {

        div.classList.add(
            'new-flash'
        );

    }

    const date =
        new Date(item.pubDate);

    const timeString =
        isNaN(date)
            ? ''
            : date.toLocaleString(
                'sv-SE'
            );

    div.innerHTML = `

        ${item.link}

           ${item.title}

        </a>

        <div class="source">

            ${timeString}
            |
            ${sourceTitle}

        </div>

    `;

    container.prepend(div);

    // Behåll max 50 artiklar

    while (
        container.children.length > 50
    ) {

        container.removeChild(
            container.lastChild
        );

    }

}

// ======================================
// STARTA FLÖDET
// ======================================

fetchFeeds();

// Uppdatera varje minut

setInterval(
    fetchFeeds,
    60000
);

// ==================================
// KABELKARTA
// ==================================

const cableMap = L.map('cable-map').setView([57.5, 18.5], 6);

L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
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
                weight: 3,
                opacity: 0.9
            }
        }).addTo(cableMap);

    })
    .catch(err => {
        console.log('GeoJSON saknas:', err);
    });

setTimeout(() => {
    cableMap.invalidateSize();
}, 500);

// ==================================
// NYHETSFLÖDE
// ==================================

const proxyUrl =
'https://api.rss2json.com/v1/api.json?rss_url=';

const feeds = [

'https://www.svt.se/nyheter/rss.xml',

'https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/',

'https://feeds.expressen.se/nyheter/',

'https://feeds.bbci.co.uk/news/world/rss.xml',

'https://feeds.bbci.co.uk/news/world/europe/rss.xml',

'https://www.navalnews.com/feed/'

];

const keywords = [

'baltic',
'baltic sea',
'östersjön',

'cable',
'kabel',

'sabotage',
'espionage',
'spioneri',

'drone',
'drönare',

'military',
'militär',

'navy',
'flotta',

'nato',

'russia',
'ryssland',

'undersea',
'subsea',

'pipeline',

'critical infrastructure',

'incident',

'exercise',
'övning'

];

const seenArticles = new Set();
let firstLoad = true;

async function fetchFeeds() {

    for (const feed of feeds) {

        try {

            const response =
                await fetch(proxyUrl + encodeURIComponent(feed));

            const data =
                await response.json();

            if (!data.items) continue;

            data.items.forEach(item => {

                const text =
                    (
                        item.title +
                        " " +
                        (item.description || "")
                    ).toLowerCase();

                const relevant =
                    keywords.some(keyword =>
                        text.includes(keyword)
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

        } catch (err) {

            console.error(err);

        }
    }

    firstLoad = false;
}

function renderArticle(
    item,
    sourceTitle,
    isNew
) {

    const container =
        document.getElementById("osint-feed");

    const article =
        document.createElement("div");

    article.className = "news-item";

    if (isNew) {
        article.classList.add("new-flash");
    }

    const date =
        new Date(item.pubDate);

    article.innerHTML = `
        ${item.link}
            ${item.title}
        </a>

        <div class="source">
            ${date.toLocaleString("sv-SE")}
            |
            ${sourceTitle}
        </div>
    `;

    container.prepend(article);

    while (container.children.length > 50) {
        container.removeChild(
            container.lastChild
        );
    }
}

fetchFeeds();

setInterval(
    fetchFeeds,
    60000
);

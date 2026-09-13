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

const incidentLayer = L.layerGroup().addTo(overviewMap);

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

const cableMap = L.map('cable-map').setView([58.0, 18.0], 5);

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
        console.error('GeoJSON kunde inte läsas:', error);
    });

setTimeout(() => {
    overviewMap.invalidateSize();
    cableMap.invalidateSize();
}, 500);

// ======================================
// RSS-KÄLLOR
// ======================================

const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=';
const vmaFeed = 'https://www.krisinformation.se/RSSPage/17974';

const feeds = [
    'https://feeds.bbci.co.uk/news/world/europe/rss.xml',
    'https://www.svt.se/nyheter/rss.xml',
    'https://feeds.expressen.se/nyheter/',
    'https://rss.dw.com/rdf/rss-en-eu',
    'https://www.navalnews.com/feed/',
    'https://rss.dw.com/rdf/rss-en-ger',
    'https://rss.dw.com/rdf/rss-en-world',
    'https://yle.fi/rss/uutiset/tuoreimmat',
    'https://svenska.yle.fi/rss/senaste-nytt',
    'https://www.rp.pl/rss/7061-rzeczpospolita',
    'https://tvn24.pl/najnowsze.xml',
    'https://news.err.ee/rss',
    'https://www.postimees.ee/rss',
    'https://eng.lsm.lv/rss/',
    'https://www.delfi.lv/rss/',
    'https://www.lrt.lt/rss',
    'https://www.delfi.lt/rss/',
    'https://www.nato.int/rss/news.xml',
    'https://breakingdefense.com/feed/',
    'https://www.defensenews.com/arc/outboundfeeds/rss/',
    'https://www.maritime-executive.com/rss/all',
    'https://gcaptain.com/feed/',
    'https://www.hisutton.com/feed',
    'https://feeds.bbci.co.uk/news/world/rss.xml'
];

// ======================================
// PRIORITERING
// ======================================

const criticalKeywords = [
    'cable cut',
    'cable damage',
    'estlink',
    'nordbalt',
    'sabotage',
    'hybrid attack',
    'shadow fleet',
    'explosive device',
    'nord stream'
];

const warningKeywords = [
    'submarine',
    'warship',
    'missile',
    'gps jamming',
    'electronic warfare',
    'drone',
    'ais spoofing'
];
const borderAlertKeywords = [
    'airspace violation',
    'airspace breach',
    'entered airspace',
    'border violation',
    'crossed border',
    'unidentified aircraft',
    'unidentified drone',
    'russian drone',
    'belarusian drone',
    'military drone',
    'fighter scrambled',
    'nato scramble',
    'intercepted aircraft',
    'air force response',
    'foreign military personnel',
    'armed individuals',
    'suspected soldiers',
    'saboteurs',
    'infiltration',
    'cross-border incident',
'airspace intrusion',
'airspace incursion',
'russian aircraft',
'belarusian aircraft',
'military aircraft',
'fighter jets scrambled',
'air policing',
'drone incursion',
'drone violation',
'border guards',
'nato fighters',
'scramble mission',
'shahed',
'shaheed',
'fpv drone'

];

// ======================================
// NYCKELORD
// ======================================

const securityKeywords = [
    'nordbalt',
    'estlink',
    'estlink 1',
    'estlink 2',
    'swepol',
    'swepol link',
    'baltic cable',
    'undersea cable',
    'subsea cable',
    'power cable',
    'electric cable',
    'fiber cable',
    'fibre cable',
    'fiber optic cable',
    'telecommunications cable',
    'data cable',
    'internet cable',
    'cable damage',
    'cable break',
    'cable cut',
    'cable fault',
    'critical infrastructure',
    'energy infrastructure',
    'offshore infrastructure',
    'underwater infrastructure',
    'undersea infrastructure',
    'marine infrastructure',
    'seabed infrastructure',
    'pipeline',
    'gas pipeline',
    'oil pipeline',
    'nord stream',
    'anchor dragging',
    'ship anchor',
    'shadow fleet',
    'seabed survey',
    'bathymetric survey',
    'sabotage',
    'hybrid warfare',
    'hybrid threat',
    'hybrid attack',
    'hybrid operation',
    'hybrid activity',
    'grey zone',
    'gray zone',
    'foreign interference',
    'foreign influence',
    'covert operation',
    'covert activity',
    'information warfare',
    'disinformation',
    'misinformation',
    'critical incident',
    'espionage',
    'spy',
    'spying',
    'intelligence operation',
    'surveillance',
    'reconnaissance',
    'state-sponsored',
    'hack',
    'hacker',
    'hacking',
    'cyber',
    'cyberattack',
    'cyber security',
    'cybersecurity',
    'cyber espionage',
    'ransomware',
    'malware',
    'data breach',
    'network intrusion',
    'ddos',
    'industrial control system',
    'scada',
    'threat actor',
    'critical systems',
    'drone',
    'drones',
    'uav',
    'uas',
    'naval drone',
    'sea drone',
    'underwater drone',
    'unmanned vessel',
    'autonomous vessel',
    'usv',
    'uuv',
    'loitering munition',
    'explosive',
    'explosives',
    'bomb',
    'blast',
    'terror',
    'terrorism',
    'terrorist',
    'military',
    'defense',
    'defence',
    'army',
    'navy',
    'air force',
    'warship',
    'frigate',
    'destroyer',
    'corvette',
    'submarine',
    'submarines',
    'fighter',
    'fighter jet',
    'warplane',
    'bomber',
    'strategic bomber',
    'tu-95',
    'tu-160',
    'il-20',
    'su-27',
    'su-35',
    'f-35',
    'gripen',
    'jas 39',
    'awacs',
    'electronic warfare',
    'special forces',
    'missile',
    'missiles',
    'strike group',
    'fleet',
    'task force',
    'amphibious',
    'landing ship',
    'minehunter',
    'minesweeper',
    'missile boat',
    'patrol ship',
    'patrol vessel',
    'exercise',
    'military exercise',
    'naval exercise',
    'air policing',
    'baltops',
    'joint expeditionary force',
    'jef',
    'nato',
    'nato summit',
    'maritime security',
    'coast guard',
    'maritime surveillance',
    'vessel tracking',
    'ais spoofing',
    'gps jamming',
    'gps interference',
    'signal disruption',
    'border security',
    'exclusion zone',
    'merchant ship',
    'commercial shipping',
    'cargo vessel',
    'container vessel',
    'bulk carrier',
    'tanker',
    'oil tanker',
    'lng carrier',
    'baltic',
    'baltic sea',
    'östersjön',
    'gulf of finland',
    'gulf of bothnia',
    'bothnian sea',
    'archipelago sea',
    'kattegat',
    'skagerrak',
    'öresund',
    'aland',
    'åland',
    'gotland',
    'gotland island',
    'visby',
    'bornholm',
    'kaliningrad',
    'tallinn',
    'helsinki',
    'helsingfors',
    'klaipeda',
    'gdynia',
    'karlskrona',
    'sweden',
    'swedish',
    'finland',
    'finnish',
    'estonia',
    'estonian',
    'latvia',
    'latvian',
    'lithuania',
    'lithuanian',
    'poland',
    'polish',
    'denmark',
    'danish',
    'germany',
    'german',
    'norway',
    'norwegian',
    'belarus',
    'belarusian',
    'united kingdom',
    'britain',
    'british',
    'france',
    'french',
    'russia',
    'russian',
    'ukraine',
    'ukrainian',
    'moscow',
    'kremlin',
    'putin',
    'china',
    'chinese',
    'united states',
    'usa',
    'trump',
    'european union',
    'eu',
    'frontex',
    'saceur',
    'shape',
    'power grid',
    'electricity grid',
    'energy grid',
    'power infrastructure',
    'substation',
    'transformer station',
    'transformer substation',
    'power station',
    'high-voltage line',
    'high voltage line',
    'high-voltage power line',
    'high voltage power line',
    'transmission line',
    'transmission network',
    'grid sabotage',
    'explosive device',
    'explosive devices',
    'power sabotage',
    'electrical infrastructure'
];

const searchKeywords = securityKeywords.map(keyword => keyword.toLowerCase());

const locationMap = {
    gotland: [57.65, 18.30],
    bornholm: [55.25, 14.90],
    kaliningrad: [54.71, 20.50],
    tallinn: [59.44, 24.75],
    helsinki: [60.17, 24.94],
    helsingfors: [60.17, 24.94],
    klaipeda: [55.71, 21.13],
    gdynia: [54.53, 18.55],
    karlskrona: [56.16, 15.59],
    stockholm: [59.33, 18.07],
    åland: [60.15, 20.00],
    aland: [60.15, 20.00],
    'baltic sea': [58.50, 18.50],
    östersjön: [58.50, 18.50],
    'gulf of finland': [59.50, 25.50],
    estlink: [59.40, 24.90],
    'estlink 1': [59.40, 24.90],
    'estlink 2': [59.40, 24.90],
    nordbalt: [55.60, 20.40],
    swepol: [55.30, 15.90],
    estonia: [58.7, 25.0],
latvia: [56.9, 24.6],
lithuania: [55.2, 23.8],
belarus: [53.9, 27.6],

narva: [59.38, 28.20],
tartu: [58.37, 26.73],

daugavpils: [55.87, 26.53],
rezekne: [56.51, 27.34],

visaginas: [55.60, 26.43],
vilnius: [54.68, 25.28],

suwalki: [54.10, 22.93],
pskov: [57.81, 28.33],
saint petersburg: [59.93, 30.31],

brest: [52.10, 23.70],
grodno: [53.68, 23.83],

riga: [56.95, 24.10],
kaunas: [54.90, 23.90]

};

function findLocation(articleText) {
    for (const place in locationMap) {
        if (articleText.includes(place)) {
            return {
                name: place,
                coords: locationMap[place]
            };
        }
    }
    return null;
}

function addIncidentToMap(item, priority, location) {

    let color = '#ff9900';
    let radius = 7;

    if (priority === 'critical') {
        color = '#ff0000';
        radius = 10;
    }

    if (priority === 'border-alert') {
        color = '#00bfff';
        radius = 9;
    }

    L.circleMarker(location.coords, {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.8,
        weight: 2
    })
    .addTo(incidentLayer)
    .bindPopup(`
        <b>${item.title}</b><br>
        ${location.name}
    `);
}


// ======================================
// LIVE-KLOCKA
// ======================================

function updateClock() {
    const now = new Date();
    const clock = document.getElementById('live-clock');
    if (clock) {
        clock.textContent = now.toLocaleTimeString('sv-SE');
    }
}

updateClock();
setInterval(updateClock, 1000);

// ======================================
// NÄSTA RSS-SÖKNING
// ======================================

let nextRefresh = 120;

function updateRefreshCounter() {
    const element = document.getElementById('next-update');
    if (!element) return;

    element.textContent = 'Nästa sökning om: ' + nextRefresh + ' sek';
    nextRefresh--;

    if (nextRefresh < 0) {
        nextRefresh = 120;
    }
}

updateRefreshCounter();
setInterval(updateRefreshCounter, 1000);

// ======================================
// FLIKAR
// ======================================

function showTab(tabName) {
    document.querySelectorAll('.feed-container').forEach(feed => {
        feed.classList.add('hidden');
    });

    const targetFeed = document.getElementById(tabName + '-feed');
    if (targetFeed) {
        targetFeed.classList.remove('hidden');
    }
}

// ======================================
// NYHETER
// ======================================

const seenArticles = new Set();
let firstLoad = true;

async function fetchFeeds() {
    for (const feed of feeds) {
        try {
            const response = await fetch(proxyUrl + encodeURIComponent(feed));
            if (!response.ok) continue;

            const data = await response.json();
            if (!data.items) continue;

            data.items.forEach(item => {
                const content = (
    item.title + ' ' +
    (item.description || '') + ' ' +
    (item.content || '')
).toLowerCase();

                const relevant = searchKeywords.some(keyword => content.includes(keyword));

                if (relevant && !seenArticles.has(item.link)) {
                    seenArticles.add(item.link);
                    renderArticle(item, !firstLoad);
                }
            });
        } catch(error) {
            console.error('Fel i RSS-flöde:', feed, error);
        }
    }

    const updateDiv = document.getElementById('last-update');
    if (updateDiv) {
        updateDiv.textContent = 'Senaste RSS: ' + new Date().toLocaleTimeString('sv-SE');
    }

    firstLoad = false;
}

// ======================================
// ARTIKLAR
// ======================================

function renderArticle(item, isNew) {
    const articleDate = new Date(item.pubDate);
    const now = new Date();
    const diffDays = Math.floor((now - articleDate) / 86400000);

    if (diffDays > 5) {
        return;
    }

    let container;
    if (diffDays < 1) {
        container = document.getElementById('today-feed');
    } else if (diffDays < 2) {
        container = document.getElementById('yesterday-feed');
    } else {
        container = document.getElementById('older-feed');
    }

    if (!container) return;

    const div = document.createElement('div');
    div.className = 'news-item';

    const articleText = (
    item.title + ' ' +
    (item.description || '') + ' ' +
    (item.content || '')
).toLowerCase();

    const location = findLocation(articleText);
    const isCritical = criticalKeywords.some(keyword => articleText.includes(keyword));
    const isWarning = warningKeywords.some(keyword => articleText.includes(keyword));
    const isBorderAlert = borderAlertKeywords.some(keyword =>
    articleText.includes(keyword));

    if (location) {

    if (isCritical) {
        addIncidentToMap(item, 'critical', location);

    } else if (isBorderAlert) {
        addIncidentToMap(item, 'border-alert', location);

    } else if (isWarning) {
        addIncidentToMap(item, 'warning', location);
    }

}


    if (isCritical) {

    div.classList.add('priority-critical');

} else if (isBorderAlert) {

    div.classList.add('priority-border');

} else if (isWarning) {

    div.classList.add('priority-warning');

}

    

    const articleLink = document.createElement('a');
    articleLink.href = item.link;
    articleLink.target = '_blank';
    articleLink.rel = 'noopener noreferrer';
    articleLink.textContent = item.title;

    const sourceDiv = document.createElement('div');
    sourceDiv.className = 'source';

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (articleDate.toDateString() === today.toDateString()) {
        sourceDiv.textContent = 'Idag ' + articleDate.toLocaleTimeString('sv-SE', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (articleDate.toDateString() === yesterday.toDateString()) {
        sourceDiv.textContent = 'Igår ' + articleDate.toLocaleTimeString('sv-SE', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else {
        sourceDiv.textContent = articleDate.toLocaleString('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    div.appendChild(articleLink);
    div.appendChild(sourceDiv);
    container.prepend(div);

    while (container.children.length > 75) {
        container.removeChild(container.lastChild);
    }
}

function showVMA(item) {
    const banner = document.getElementById('vma-banner');
    const text = document.getElementById('vma-text');
    if (!banner || !text) return;

    text.textContent = item.title;
    banner.classList.remove('hidden');
    banner.classList.add('active');
}

function clearVMA() {
    const banner = document.getElementById('vma-banner');
    if (!banner) return;

    banner.classList.remove('active');
    banner.classList.add('hidden');
}

async function fetchVMA() {
    try {
        const response = await fetch(proxyUrl + encodeURIComponent(vmaFeed));
        if (!response.ok) {
            clearVMA();
            return;
        }

        const data = await response.json();
        if (!data.items) {
            clearVMA();
            return;
        }

        const vmaItem = data.items.find(item => {
            const text = (item.title + ' ' + (item.description || '')).toLowerCase();
            return (
                text.includes('vma') ||
                text.includes('viktigt meddelande till allmänheten')
            );
        });

        if (vmaItem) {
            showVMA(vmaItem);
        } else {
            clearVMA();
        }
    } catch(error) {
        console.error('VMA-fel:', error);
        clearVMA();
    }
}

// ======================================
// START
// ======================================
fetchFeeds();
fetchVMA();

setInterval(() => {
    fetchFeeds();
    fetchVMA();
    nextRefresh = 120;
}, 120000);

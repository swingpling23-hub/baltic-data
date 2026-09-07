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

    // =========================
    // KABLAR & INFRASTRUKTUR
    // =========================

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

    // =========================
    // SABOTAGE & HYBRIDKRIG
    // =========================

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

    // =========================
    // SPIONAGE
    // =========================

    'espionage',
    'spy',
    'spying',

    'intelligence operation',
    'surveillance',
    'reconnaissance',

    'state-sponsored',

    // =========================
    // CYBER
    // =========================

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

    // =========================
    // DRÖNARE
    // =========================

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

    // =========================
    // EXPLOSIVA HÄNDELSER
    // =========================

    'explosive',
    'explosives',

    'bomb',

    'blast',

    'terror',
    'terrorism',
    'terrorist',

    // =========================
    // MILITÄRT
    // =========================

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

    // =========================
    // ÖVNINGAR
    // =========================

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

    // =========================
    // MARITIM SÄKERHET
    // =========================

    'maritime surveillance',

    'vessel tracking',

    'ais spoofing',

    'gps jamming',
    'gps interference',

    'signal disruption',

    'border security',

    'exclusion zone',

    // =========================
    // HANDELSFARTYG
    // =========================

    'merchant ship',

    'commercial shipping',

    'cargo vessel',

    'container vessel',

    'bulk carrier',

    'tanker',
    'oil tanker',

    'lng carrier',

    // =========================
    // GEOGRAFI
    // =========================

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

    // =========================
    // LÄNDER
    // =========================

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

    // =========================
    // RYSSLAND / UKRAINA
    // =========================

    'russia',
    'russian',

    'ukraine',
    'ukrainian',

    'moscow',

    'kremlin',

    'putin',

    // =========================
    // KINA
    // =========================

    'china',
    'chinese',

    // =========================
    // USA
    // =========================

    'united states',
    'usa',

    'trump',

    // =========================
    // ORGANISATIONER
    // =========================

    'european union',
    'eu',

    'frontex',

    'saceur',

    'shape'
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
// NÄSTA RSS-SÖKNING
// ======================================

let nextRefresh = 60;

function updateRefreshCounter() {

const element =
document.getElementById(
'next-update'
);

if (!element) return;

element.textContent =
'Nästa sökning om: ' +
nextRefresh +
' sek';

nextRefresh--;

if (nextRefresh < 0) {

nextRefresh = 60;

}

}

updateRefreshCounter();

setInterval(
updateRefreshCounter,
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
new Date().toLocaleTimeString(
'sv-SE'
);

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
document.createElement(
'div'
);

div.className =
'news-item';

if (isNew) {

div.classList.add(
'new-flash'
);

}

const articleLink =
document.createElement(
'a'
);

articleLink.href =
item.link;

articleLink.target =
'_blank';

articleLink.rel =
'noopener noreferrer';

articleLink.textContent =
item.title;

const sourceDiv =
document.createElement(
'div'
);

sourceDiv.className =
'source';

sourceDiv.textContent =
articleDate.toLocaleTimeString(
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

setInterval(() => {

fetchFeeds();

nextRefresh = 60;

}, 60000);

// Fråga om tillåtelse för notiser
if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
}

// Initiera elkabelskartan nere till vänster (Högspänning via EMODnet WMS - Ingen API krävs)
const cableMap = L.map('cable-map', {
    zoomControl: true,
    attributionControl: false
}).setView([57.5, 18.5], 6);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
}).addTo(cableMap);

// EMODnet WMS-lager enbart för kraftkablar (pcablesbshcontis)
L.tileLayer.wms('https://ows.emodnet-humanactivities.eu/wms?', {
    layers: 'pcablesbshcontis',
    format: 'image/png',
    transparent: true
}).addTo(cableMap);

setTimeout(() => {
    cableMap.invalidateSize();
}, 400);

// OSINT & Säkerhetsflöde med nyckelordsfilter
const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=';
let seenOsintArticles = new Set();
let isFirstLoad = true;

const feeds = {
    osint: [
        'https://www.svt.se/nyheter/utrikes/rss.xml',
        'https://www.svt.se/nyheter/inrikes/rss.xml',
        'https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/',
        'https://feeds.expressen.se/nyheter/'
    ]
};

// Säkerhetsrelaterade nyckelord
const securityKeywords = ['sabotage', 'drönare', 'sprängning', 'spioneri', 'kabel', 'militär', 'försvar', 'östersjön', 'övning', 'incident'];

async function fetchFeeds() {
    for (const url of feeds.osint) {
        try {
            const response = await fetch(proxyUrl + encodeURIComponent(url));
            if (!response.ok) continue;
            const data = await response.json();
            
            if (!data.items) continue;

            data.items.forEach(item => {
                const textToCheck = (item.title + " " + (item.description || "")).toLowerCase();
                const isRelevant = securityKeywords.some(keyword => textToCheck.includes(keyword));

                // Filtrera eller prioritera nyheter baserat på säkerhetstema
                if (isRelevant && !seenOsintArticles.has(item.link)) {
                    seenOsintArticles.add(item.link);
                    renderArticle(item, data.feed.title, 'osint-feed', !isFirstLoad);
                    
                    if (!isFirstLoad && Notification.permission === "granted") {
                        new Notification("Säkerhetsvarning / OSINT", {
                            body: item.title,
                            icon: "https://github.githubassets.com/favicons/favicon.png"
                        });
                    }
                }
            });
        } catch (error) { 
            console.error("Fel vid hämtning av flöde:", error); 
        }
    }
    isFirstLoad = false;
}

function renderArticle(item, sourceTitle, targetId, isNew) {
    const container = document.getElementById(targetId);
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'news-item';
    if (isNew) {
        div.classList.add('new-flash'); // Lägger till blinkande effekt på nya objekt
    }
    
    const date = new Date(item.pubDate);
    const timeString = isNaN(date) ? "" : date.toLocaleTimeString('sv-SE', {hour: '2-digit', minute:'2-digit'});
    
    div.innerHTML = `
        <a href="${item.link}" target="_blank">${item.title}</a>
        <div class="source">${timeString} | ${sourceTitle || "Nyhetskälla"}</div>
    `;
    
    container.prepend(div);
}

fetchFeeds();
setInterval(fetchFeeds, 180000);

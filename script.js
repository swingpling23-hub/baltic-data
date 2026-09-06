// Fråga om tillåtelse för notiser i webbläsaren
if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
}

// Initiera elkabelskartan nere till vänster och centrera över Östersjön/Gotland
const cableMap = L.map('cable-map').setView([57.5, 18.5], 7);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap, EMODnet'
}).addTo(cableMap);

// Lägg till EMODnet-lager specifikt för undervattensströmkablar (kraftkablar)
L.tileLayer.wms('https://ows.emodnet-humanactivities.eu/wms?', {
    layers: 'pcablesbshcontis',
    format: 'image/png',
    transparent: true,
    attribution: '© EMODnet Human Activities'
}).addTo(cableMap);

// Proxy för att kringgå CORS-blockeringar när vi hämtar RSS
const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=';

let seenOsintArticles = new Set();
let isFirstLoad = true;

const feeds = {
    osint: [
        'https://www.svt.se/nyheter/rss.xml',
        'https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/',
        'https://feeds.expressen.se/nyheter/',
        'https://nitter.poast.org/OSINTtechnical/rss',
        'https://nitter.poast.org/OSINTdefender/rss',
        'https://nitter.poast.org/wartranslated/rss'
    ]
};

async function fetchFeeds() {
    for (const url of feeds.osint) {
        try {
            const response = await fetch(proxyUrl + encodeURIComponent(url));
            if (!response.ok) continue;
            const data = await response.json();
            
            data.items.slice(0, 3).forEach(item => {
                if (!seenOsintArticles.has(item.link)) {
                    seenOsintArticles.add(item.link);
                    renderArticle(item, data.feed.title, 'osint-feed');
                    
                    if (!isFirstLoad && Notification.permission === "granted") {
                        new Notification("OSINT Uppdatering", {
                            body: item.title,
                            icon: "https://github.githubassets.com/favicons/favicon.png"
                        });
                    }
                }
            });
        } catch (error) { 
            console.error("Fel vid hämtning av OSINT:", error); 
        }
    }
    isFirstLoad = false;
}

function renderArticle(item, sourceTitle, targetId) {
    const container = document.getElementById(targetId);
    const div = document.createElement('div');
    div.className = 'news-item';
    
    const date = new Date(item.pubDate);
    const timeString = date.toLocaleTimeString('sv-SE', {hour: '2-digit', minute:'2-digit'});
    
    div.innerHTML = `
        <a href="${item.link}" target="_blank">${item.title}</a>
        <div class="source">${timeString} | ${sourceTitle || "Nyhetskälla"}</div>
    `;
    
    container.prepend(div);
}

fetchFeeds();
setInterval(fetchFeeds, 180000);

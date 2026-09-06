// Fråga om tillåtelse för notiser
if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
}

// Proxy för att kringgå CORS-blockeringar när vi hämtar RSS
const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=';
let seenOsintArticles = new Set();
let isFirstLoad = true;

const feeds = {
    osint: [
        'https://www.svt.se/nyheter/rss.xml',
        'https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/',
        'https://feeds.expressen.se/nyheter/'
    ]
};

async function fetchFeeds() {
    for (const url of feeds.osint) {
        try {
            const response = await fetch(proxyUrl + encodeURIComponent(url));
            if (!response.ok) continue;
            const data = await response.json();
            
            if (!data.items) continue;

            data.items.slice(0, 3).forEach(item => {
                if (!seenOsintArticles.has(item.link)) {
                    seenOsintArticles.add(item.link);
                    renderArticle(item, data.feed.title, 'osint-feed');
                    
                    if (!isFirstLoad && Notification.permission === "granted") {
                        new Notification("Nyhetsuppdatering", {
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

function renderArticle(item, sourceTitle, targetId) {
    const container = document.getElementById(targetId);
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'news-item';
    
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

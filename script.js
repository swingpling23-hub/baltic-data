// Fråga om tillåtelse för notiser i webbläsaren
if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
}

// Proxy för att kringgå CORS-blockeringar när vi hämtar RSS
const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=';

// Håller koll på vilka OSINT-artiklar vi redan skickat notis om
let seenOsintArticles = new Set();
let isFirstLoad = true;

// Samlade RSS-flöden
const feeds = {
    osint: [
        'https://www.svt.se/nyheter/rss.xml',
        'https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/',
        'https://feeds.expressen.se/nyheter/',
        'https://nitter.poast.org/OSINTtechnical/rss',
        'https://nitter.poast.org/OSINTdefender/rss',
        'https://nitter.poast.org/wartranslated/rss'
    ],
    gov: [
        'https://polisen.se/aktuellt/rss/hela-landet/nyheter-och-handelser/',
        'https://www.forsvarsmakten.se/sv/rss/nyheter/'
    ]
};

async function fetchFeeds() {
    // 1. Hämta och rendera OSINT-flöden (med notiser)
    for (const url of feeds.osint) {
        try {
            const response = await fetch(proxyUrl + encodeURIComponent(url));
            if (!response.ok) continue;
            const data = await response.json();
            
            // Kolla de 3 senaste uppdateringarna per källa
            data.items.slice(0, 3).forEach(item => {
                if (!seenOsintArticles.has(item.link)) {
                    seenOsintArticles.add(item.link);
                    renderArticle(item, data.feed.title, 'osint-feed');
                    
                    // Skicka bara notiser för nya inlägg EFTER första laddningen
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

    // 2. Hämta Myndigheter (utan notiser)
    document.getElementById('gov-feed').innerHTML = ''; // Rensa för att bygga om listan rent
    for (const url of feeds.gov) {
        try {
            const response = await fetch(proxyUrl + encodeURIComponent(url));
            if (!response.ok) continue;
            const data = await response.json();
            
            data.items.slice(0, 5).forEach(item => {
                renderArticle(item, data.feed.title, 'gov-feed');
            });
        } catch (error) { 
            console.error("Fel vid hämtning av myndighetsdata:", error); 
        }
    }
    
    isFirstLoad = false;
}

function renderArticle(item, sourceTitle, targetId) {
    const container = document.getElementById(targetId);
    const div = document.createElement('div');
    div.className = 'news-item';
    
    // Formatera datum snyggt
    const date = new Date(item.pubDate);
    const timeString = date.toLocaleTimeString('sv-SE', {hour: '2-digit', minute:'2-digit'});
    
    div.innerHTML = `
        <a href="${item.link}" target="_blank">${item.title}</a>
        <div class="source">${timeString} | ${sourceTitle || "Nyhetskälla"}</div>
    `;
    
    // Lägg till högst upp
    container.prepend(div);
}

// Starta hämtningen och schemalägg uppdateringar
fetchFeeds();
// Uppdaterar flödena var 3:e minut (180 000 millisekunder)
setInterval(fetchFeeds, 180000);

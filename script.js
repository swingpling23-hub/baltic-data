// ===========================
// Notiser
// ===========================

if ("Notification" in window) {
    if (
        Notification.permission !== "granted" &&
        Notification.permission !== "denied"
    ) {
        Notification.requestPermission();
    }
}

// ===========================
// Elkabelkarta
// ===========================

const cableMap = L.map("cable-map", {
    zoomControl: true,
    attributionControl: false
}).setView([57.5, 18.5], 6);

L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
        maxZoom: 19
    }
).addTo(cableMap);

const cableLayer = L.tileLayer.wms(
    "https://ows.emodnet-humanactivities.eu/wms?",
    {
        layers: "pcablesbshcontis",
        format: "image/png",
        transparent: true
    }
);

cableLayer.on("tileerror", function (e) {
    console.error("WMS-fel:", e);
});

cableLayer.addTo(cableMap);

setTimeout(() => {
    cableMap.invalidateSize();
}, 500);

// ===========================
// RSS
// ===========================

const proxyUrl =
    "https://api.rss2json.com/v1/api.json?rss_url=";

const feeds = {
    osint: [
        "https://www.svt.se/nyheter/utrikes/rss.xml",
        "https://www.svt.se/nyheter/inrikes/rss.xml",
        "https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/",
        "https://feeds.expressen.se/nyheter/"
    ]
};

const securityKeywords = [
    "sabotage",
    "drönare",
    "sprängning",
    "spioneri",
    "kabel",
    "militär",
    "försvar",
    "östersjön",
    "övning",
    "incident"
];

let seenOsintArticles = new Set();
let isFirstLoad = true;

// ===========================
// Hämta flöden
// ===========================

async function fetchFeeds() {

    let foundArticles = 0;

    for (const url of feeds.osint) {

        try {

            const response = await fetch(
                proxyUrl + encodeURIComponent(url)
            );

            if (!response.ok) {
                console.warn("Fel vid hämtning:", url);
                continue;
            }

            const data = await response.json();

            if (!data.items) {
                continue;
            }

            data.items.forEach(item => {

                const textToCheck =
                    (item.title + " " +
                        (item.description || ""))
                    .toLowerCase();

                const isRelevant =
                    securityKeywords.some(keyword =>
                        textToCheck.includes(keyword)
                    );

                if (
                    isRelevant &&
                    !seenOsintArticles.has(item.link)
                ) {

                    foundArticles++;

                    seenOsintArticles.add(item.link);

                    renderArticle(
                        item,
                        data.feed?.title || "Nyhetskälla",
                        "osint-feed",
                        !isFirstLoad
                    );

                    if (
                        !isFirstLoad &&
                        "Notification" in window &&
                        Notification.permission === "granted"
                    ) {

                        new Notification(
                            "Säkerhetsvarning / OSINT",
                            {
                                body: item.title
                            }
                        );
                    }
                }
            });

        } catch (error) {

            console.error(
                "Fel vid hämtning av flöde:",
                error
            );
        }
    }

    const container =
        document.getElementById("osint-feed");

    if (
        container.children.length === 0 &&
        foundArticles === 0
    ) {
        container.innerHTML = `
            <div class="info-message">
                Inga säkerhetsrelaterade nyheter hittades.
            </div>
        `;
    }

    isFirstLoad = false;
}

// ===========================
// Rendera artikel
// ===========================

function renderArticle(
    item,
    sourceTitle,
    targetId,
    isNew
) {

    const container =
        document.getElementById(targetId);

    if (!container) {
        return;
    }

    const div = document.createElement("div");
    div.className = "news-item";

    if (isNew) {
        div.classList.add("new-flash");
    }

    const articleLink =
        document.createElement("a");

    articleLink.href = item.link;
    articleLink.target = "_blank";
    articleLink.rel = "noopener noreferrer";
    articleLink.textContent = item.title;

    const sourceDiv =
        document.createElement("div");

    sourceDiv.className = "source";

    const date = new Date(item.pubDate);

    const timeString =
        isNaN(date)
            ? ""
            : date.toLocaleTimeString(
                "sv-SE",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

    sourceDiv.textContent =
        `${timeString} | ${sourceTitle}`;

    div.appendChild(articleLink);
    div.appendChild(sourceDiv);

    if (
        container.querySelector(".info-message")
    ) {
        container.innerHTML = "";
    }

    container.prepend(div);
}

// ===========================
// Start
// ===========================

fetchFeeds();
setInterval(fetchFeeds, 180000);

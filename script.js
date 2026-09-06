// =====================
// ÖVERSIKTSKARTA
// =====================

const overviewMap = L.map('overview-map')
    .setView([58.5, 18.5], 5);

L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
        maxZoom: 19
    }
).addTo(overviewMap);

L.marker([57.7, 18.7])
    .addTo(overviewMap)
    .bindPopup('Gotland');

L.marker([59.4, 24.7])
    .addTo(overviewMap)
    .bindPopup('Tallinn');

L.marker([60.2, 25.0])
    .addTo(overviewMap)
    .bindPopup('Helsingfors');

L.marker([55.7, 21.1])
    .addTo(overviewMap)
    .bindPopup('Klaipeda');

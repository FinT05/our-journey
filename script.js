// 1. Initialize Map
const map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false, // Prevents map zoom from hijacking page scroll
    dragging: true
}).setView([52.3072, -1.1245], 11);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

// 2. Define Data Points
const points = [
    { id: 'watford', coords: [52.3077, -1.1209], zoom: 16, photo: 'photos/watford.jpg' },
    { id: 'nbs', coords: [52.2357, -0.8970], zoom: 17, photo: 'photos/nbs.jpg' },
    { id: 'haddon', coords: [52.3400, -1.0656], zoom: 15, photo: 'photos/haddon.jpg' },
    { id: 'florida1', coords: [28.3852, -81.5639], zoom: 7, photo: 'photos/florida1.jpg' },
    { id: 'southbrook', coords: [52.2535, -1.1510], zoom: 14, photo: 'photos/southbrook.jpg' },
    { id: 'field', coords: [52.2719, -1.2057], zoom: 17, photo: 'photos/field.jpg' },
    { id: 'bestival', coords: [50.63780415408228, -2.206712398078767], zoom: 11, photo: 'photos/bestival.jpg' },
    { id: 'devon', coords: [51.05614383400449, -4.181530571061345], zoom: 10, photo: 'photos/devon.jpg' },
    { id: 'italy', coords: [41.9028, 12.4964], zoom: 7, photo: 'photos/italy.jpg' },
    { id: 'cornwall', coords: [50.349614694162085, -5.15823148497319], zoom: 10, photo: 'photos/cornwall.jpg' },
    { id: 'florida2', coords: [28.3852, -81.5639], zoom: 7, photo: 'photos/florida2.jpg' },
    { id: 'middlemore', coords: [52.2794, -1.1720], zoom: 16, photo: 'photos/middlemore.jpg' },
    { id: 'amsterdam', coords: [52.3676, 4.9041], zoom: 12, photo: 'photos/amsterdam.jpg' },
    // This is the extra data used for the very last scroll
    { id: 'final-summary', coords: [35, -35], zoom: 3, photo: 'photos/favourite.jpg' } 
];

// 3. Draw the Path (Archival Style)
const pathCoords = points.slice(0, -1).map(p => p.coords); // Path excludes the "ocean" summary point
const journeyPath = L.polyline(pathCoords, {
    color: '#ff9f43',
    weight: 2,
    dashArray: '5, 10',
    opacity: 0.3
}).addTo(map);

// 4. Create the Traveling Photo Marker
const photoIcon = L.divIcon({
    className: 'photo-marker-container',
    html: `<img src="${points[0].photo}" class="map-photo" id="active-photo">`,
    iconSize: [90, 90],
    iconAnchor: [45, 45]
});

const travelingMarker = L.marker(points[0].coords, { icon: photoIcon }).addTo(map);

// 5. Intersection Observer Logic
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const photoElement = document.getElementById('active-photo');
            
            // Check for the Grand Finale summary
            if (entry.target.id === 'final-summary') {
                // 1. Zoom out to the ocean view
                map.flyTo([35, -35], 3, { animate: true, duration: 5 });
                
                // 2. Move the marker to the CENTER of that view so it's not stuck on Amsterdam
                travelingMarker.setLatLng([35, -35]);

                // 3. Swap to the favorite photo
                // MAKE SURE your file is named 'favourite.jpg' inside the 'photos' folder
                photoElement.src = 'photos/favourite.jpg'; 
                
                photoElement.style.opacity = "1";
                photoElement.style.borderColor = "#ff9f43";
                photoElement.style.boxShadow = "0 0 40px #ff9f43";

                if (journeyPath.getElement()) {
                    journeyPath.getElement().classList.add('final-path-active');
                }

            } else {
                // Standard Chapter Logic
                const index = [...document.querySelectorAll('.chapter')].indexOf(entry.target);
                const data = points[index - 1]; 
                
                if (data) {
                    map.flyTo(data.coords, data.zoom, { animate: true, duration: 4 });
                    travelingMarker.setLatLng(data.coords);
                    
                    photoElement.src = data.photo;
                    photoElement.style.opacity = "1";
                    photoElement.style.boxShadow = "0 0 20px rgba(255, 159, 67, 0.6)";
                    photoElement.style.borderColor = (data.id === 'field') ? "#ff9f43" : "#fff";
                    
                    if (journeyPath.getElement()) {
                        journeyPath.getElement().classList.remove('final-path-active');
                    }
                }
            }
            entry.target.classList.add('active');
        } else {
            entry.target.classList.remove('active');
        }
    });
}, { threshold: 0.7 });

document.querySelectorAll('.chapter').forEach(section => observer.observe(section));
let albums = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('assets/data/library.json')
        .then(response => response.json())
        .then(data => {
            albums = data;
            renderAlbums(albums);
        });

    document.getElementById('searchInput').addEventListener('input', filterAlbums);
    document.getElementById('sortArtist').addEventListener('click', () => sortAlbums('artist'));
    document.getElementById('sortAlbum').addEventListener('click', () => sortAlbums('album'));
    document.getElementById('sortTracks').addEventListener('click', () => sortAlbums('tracks'));

    const backToTop = document.getElementById('backToTop');
    window.onscroll = () => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            backToTop.style.display = "block";
        } else {
            backToTop.style.display = "none";
        }
    };
    backToTop.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
});

function renderAlbums(data) {
    const grid = document.getElementById('albumGrid');
    grid.innerHTML = '';
    data.forEach(album => {
        const col = document.createElement('div');
        col.className = 'col-xl-2 col-md-3 col-sm-6 col-12 mb-4';
        col.innerHTML = `
            <div class="card h-100">
                <div class="card-img-container">
                    <img src="assets/img/${album.thumbnail}" class="card-img-top" alt="${album.album}">
                    <div class="card-overlay">${album.album}</div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${album.artist}</h5>
                    <p class="card-text">${album.album}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary w-100 view-tracklist" data-id="${album.id}" data-bs-toggle="modal" data-bs-target="#exampleModal">View Tracklist</button>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });

    document.querySelectorAll('.view-tracklist').forEach(button => {
        button.addEventListener('click', (e) => {
            const albumId = e.target.getAttribute('data-id');
            const album = albums.find(a => a.id == albumId);
            showModal(album);
        });
    });
}

function filterAlbums() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = albums.filter(a => 
        a.artist.toLowerCase().includes(query) || 
        a.album.toLowerCase().includes(query)
    );
    renderAlbums(filtered);
}

function sortAlbums(criteria) {
    let sorted = [...albums];
    if (criteria === 'artist') {
        sorted.sort((a, b) => a.artist.localeCompare(b.artist));
    } else if (criteria === 'album') {
        sorted.sort((a, b) => a.album.localeCompare(b.album));
    } else if (criteria === 'tracks') {
        sorted.sort((a, b) => a.tracklist.length - b.tracklist.length);
    }
    renderAlbums(sorted);
}

function showModal(album) {
    document.getElementById('exampleModalLabel').innerText = `${album.artist} - ${album.album}`;
    const modalBody = document.querySelector('.modal-body');
    
    const durations = album.tracklist.map(t => {
        const parts = t.trackLength.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    });
    const totalSecs = durations.reduce((a, b) => a + b, 0);
    const avgSecs = totalSecs / album.tracklist.length;
    const maxSec = Math.max(...durations);
    const minSec = Math.min(...durations);

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

    let statsHtml = `
        <div class="mb-3 p-3 bg-light rounded">
            <p><strong>Tracks:</strong> ${album.tracklist.length}</p>
            <p><strong>Total Duration:</strong> ${formatTime(totalSecs)}</p>
            <p><strong>Average Length:</strong> ${formatTime(avgSecs)}</p>
            <p><strong>Longest:</strong> ${formatTime(maxSec)} | <strong>Shortest:</strong> ${formatTime(minSec)}</p>
        </div>
    `;

    let tracksHtml = `
        <table class="table table-hover">
            <thead>
                <tr><th>#</th><th>Title</th><th>Length</th></tr>
            </thead>
            <tbody>
                ${album.tracklist.map(t => `
                    <tr>
                        <td>${t.number}</td>
                        <td><a href="${t.url}" target="_blank" class="text-decoration-none">${t.title}</a></td>
                        <td>${t.trackLength}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    modalBody.innerHTML = statsHtml + tracksHtml;

    const modalFooter = document.querySelector('.modal-footer');
    modalFooter.innerHTML = `
        <a href="${album.tracklist[0].url}" target="_blank" class="btn btn-success">Play on Spotify</a>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close Tracklist</button>
    `;
}

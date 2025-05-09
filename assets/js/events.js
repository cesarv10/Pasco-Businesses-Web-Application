let allFeatures = [];

document.addEventListener('DOMContentLoaded', function () {
  const SURVEY_LAYER_URL =
    'https://services1.arcgis.com/mBduYxVcr3cUuRe8/arcgis/rest/services/survey123_f44001fc67e242ee84ee0bb029a4011a/FeatureServer/0';
  const QUERY_URL = `${SURVEY_LAYER_URL}/query?where=verify='yes'&outFields=OBJECTID,event_title,event_description,event_date,start_time,end_time,event_location,websiteadditional_links&f=geojson`;

  fetch(QUERY_URL)
    .then((response) => response.json())
    .then((data) => {
      allFeatures = data.features || [];
      applyDateSort(); // Initial render
    })
    .catch((error) => {
      console.error('Error loading events:', error);
      document.getElementById('events-container').innerHTML =
        '<p class="error-message">Unable to load events. Try again later.</p>';
    });

  // Sort filter dropdown
  document.getElementById('sort-filter').addEventListener('change', applyDateSort);

  // Modal close
  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('event-modal').style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('event-modal')) {
      document.getElementById('event-modal').style.display = 'none';
    }
  });

  // Saved toggle
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      this.classList.add('active');

      const showSaved = this.dataset.filter === 'saved';
      document.querySelectorAll('.event-card').forEach((card) => {
        const isSaved = card.dataset.saved === 'true';
        card.style.display = !showSaved || isSaved ? 'block' : 'none';
      });
    });
  });
});

// Helper functions
function to12Hour(timeStr) {
  if (!timeStr) return '';
  const [hour, minute] = timeStr.split(':');
  const date = new Date();
  date.setHours(+hour, +minute);
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(dateStr) {
  return dateStr
    ? new Date(dateStr).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
}

// Re-render based on sort filter
function applyDateSort() {
  const sortOrder = document.getElementById('sort-filter').value;
  const container = document.getElementById('events-container');
  container.innerHTML = '';

  const sorted = [...allFeatures].sort((a, b) => {
    const dateA = new Date(a.properties.event_date);
    const dateB = new Date(b.properties.event_date);
    return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
  });

  sorted.forEach((feature) => {
    const props = feature.properties;
    const card = createEventCard(
      formatDate(props.event_date),
      to12Hour(props.start_time),
      to12Hour(props.end_time),
      props.event_title,
      props.event_description,
      props.event_location,
      props.websiteadditional_links
    );
    container.appendChild(card);
  });
}

// Create event card
function createEventCard(date, startTime, endTime, title, description, location, website) {
  const card = document.createElement('div');
  card.className = 'event-card';
  card.dataset.saved = 'false';

  const shortDescription = description.split('. ')[0] + (description.length > 80 ? '...' : '');
  const timeString = startTime && endTime ? `${startTime} – ${endTime}` : 'Time TBD';

  card.innerHTML = `
    <h3 class="event-title">${title}</h3>
    <div class="event-datetime">
      <span class="event-date">${date}</span>
      <span class="dot-separator">•</span>
      <span class="event-time">${timeString}</span>
    </div>
    <p class="event-description">${shortDescription}</p>
    <div class="event-actions">
      <button class="save-btn"><i class="far fa-bookmark"></i> Save</button>
    </div>
  `;

  // Save toggle
  const saveButton = card.querySelector('.save-btn');
  saveButton.addEventListener('click', function (e) {
    e.stopPropagation();
    const isSaved = card.dataset.saved === 'true';
    card.dataset.saved = isSaved ? 'false' : 'true';
    saveButton.classList.toggle('saved');
    saveButton.innerHTML = isSaved
      ? '<i class="far fa-bookmark"></i> Save'
      : '<i class="fas fa-bookmark"></i> Saved';
  });

  // Open modal
  card.addEventListener('click', function (e) {
    if (e.target.closest('.save-btn')) return;

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-datetime').innerHTML = `
      <span class="modal-date">${date}</span>
      <span class="dot-separator">•</span>
      <span class="modal-time">${timeString}</span>
    `;
    document.getElementById('modal-description').textContent = description;

    const modalLocation = document.getElementById('modal-location');
    if (location) {
      const encodedLocation = encodeURIComponent(location);
      modalLocation.innerHTML = `📍 <a href="https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}" target="_blank" rel="noopener noreferrer" style="color: #000; text-decoration: underline;">${location}</a>`;
    } else {
      modalLocation.innerHTML = '';
    }

    const websiteElem = document.getElementById('modal-website');
    if (website) {
      websiteElem.innerHTML = `🔗 <a href="${website}" target="_blank" style="color: #000; text-decoration: underline;">${website}</a>`;
    } else {
      websiteElem.innerHTML = '';
    }

    document.getElementById('event-modal').style.display = 'block';
  });

  return card;
}










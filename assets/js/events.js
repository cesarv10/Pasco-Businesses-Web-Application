document.addEventListener('DOMContentLoaded', function () {
  const SURVEY_LAYER_URL =
    'https://services1.arcgis.com/mBduYxVcr3cUuRe8/arcgis/rest/services/survey123_f44001fc67e242ee84ee0bb029a4011a/FeatureServer/0';
  const QUERY_URL = `${SURVEY_LAYER_URL}/query?where=verify='yes'&outFields=OBJECTID,event_title,event_description,event_date,start_time,end_time,event_location,websiteadditional_links&f=geojson`;

  fetch(QUERY_URL)
    .then((response) => response.json())
    .then((data) => {
      const features = data.features;
      const container = document.getElementById('events-container');
      container.innerHTML = '';

      if (!features || features.length === 0) {
        container.innerHTML = '<p class="no-events">No events available. Check back later.</p>';
        return;
      }

      features.forEach((feature) => {
        const props = feature.properties;
        const title = props.event_title || '';
        const description = props.event_description || '';
        const location = props.event_location || '';
        const website = props.websiteadditional_links || '';

        const date = props.event_date
          ? new Date(props.event_date).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          : '';

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

        const startTime = to12Hour(props.start_time);
        const endTime = to12Hour(props.end_time);

        const card = createEventCard(date, startTime, endTime, title, description, location, website);
        container.appendChild(card);
      });
    })
    .catch((error) => {
      console.error('Error loading events:', error);
      document.getElementById('events-container').innerHTML =
        '<p class="error-message">Unable to load events. Try again later.</p>';
    });

  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('event-modal').style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('event-modal')) {
      document.getElementById('event-modal').style.display = 'none';
    }
  });

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
      <span class="dot-separator" style="margin: 0 8px;">•</span>
      <span class="event-time">${timeString}</span>
    </div>
    <p class="event-description">${shortDescription}</p>
    <div class="event-actions">
      <button class="save-btn"><i class="far fa-bookmark"></i> Save</button>
    </div>
  `;

  
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

  
  card.addEventListener('click', function (e) {
    if (e.target.closest('.save-btn')) return;

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-datetime').innerHTML = `
      <span class="modal-date">${date}</span>
      <span class="dot-separator" style="margin: 0 8px;">•</span>
      <span class="modal-time">${timeString}</span>
    `;
    document.getElementById('modal-description').textContent = description;

    const modalLocation = document.getElementById('modal-location');
    if (location) {
      const encodedLocation = encodeURIComponent(location);
      modalLocation.innerHTML = `📍 <a href="https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}" target="_blank" rel="noopener noreferrer" style="color: #3E748E; text-decoration: underline;">${location}</a>`;
    } else {
      modalLocation.innerHTML = '';
    }

    const websiteElem = document.getElementById('modal-website');
    if (website) {
      websiteElem.innerHTML = `🔗 <a href="${website}" target="_blank">${website}</a>`;
    } else {
      websiteElem.innerHTML = '';
    }

    document.getElementById('event-modal').style.display = 'block';
  });

  return card;
}








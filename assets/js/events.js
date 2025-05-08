document.addEventListener('DOMContentLoaded', function () {
  const SHEET_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSqIk1dRlk5Wk-yhZYvuW6_imMLbaEkuzgsdEteU5eYbLDoQE5Y3R8D-TOjejzmFXHcAw6gPrApa3Dq/pub?output=csv';

  fetch(SHEET_URL)
    .then(response => response.text())
    .then(csvData => {
      const events = parseCSV(csvData);
      const container = document.getElementById('events-container');

      console.log('Parsed headers:', Object.keys(events[0]));
      container.innerHTML = '';

      events.forEach(event => {
        const title = event['Event Title'] || event['Event Title:'] || '';
        const description = event['Event Description'] || '';
        const date = event['Event Date'] || '';
        const time = event['Event Time'] || '';

        if (title && description && date && time) {
          const eventCard = createEventCard(date, time, title, description);
          container.appendChild(eventCard);
        }
      });

      if (events.length === 0) {
        container.innerHTML =
          '<p class="no-events">No current events available. Check back later!</p>';
      }
    })
    .catch(error => {
      console.error('Error loading events:', error);
      document.getElementById('events-container').innerHTML =
        '<p class="error-message">Unable to load events at this time. Please try again later.</p>';
    });

  // Handle All Events / Saved filtering
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const showSaved = this.dataset.filter === 'saved';

      document.querySelectorAll('.event-card').forEach(card => {
        const isSaved = card.dataset.saved === 'true';
        card.style.display = (!showSaved || isSaved) ? 'block' : 'none';
      });
    });
  });
});

// CSV to JSON
function parseCSV(csv) {
  const lines = csv.split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;

    const obj = {};
    const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    for (let j = 0; j < headers.length; j++) {
      if (currentline[j]) {
        obj[headers[j]] = currentline[j].trim().replace(/^"|"$/g, '');
      }
    }

    result.push(obj);
  }

  return result;
}

// Create card element
function createEventCard(date, time, title, description) {
  const card = document.createElement('div');
  card.className = 'event-card';
  card.dataset.saved = 'false';

  card.innerHTML = `
    <div class="event-date">
      ${formatDate(date)}
      <div class="event-time">${formatTime(time)}</div>
    </div>
    <h3 class="event-title">${title}</h3>
    <p class="event-description">${description}</p>
    <div class="event-actions">
      <button class="save-btn">
        <i class="far fa-bookmark"></i> Save
      </button>
    </div>
  `;

  const saveBtn = card.querySelector('.save-btn');
  saveBtn.addEventListener('click', function () {
    const isSaved = card.dataset.saved === 'true';
    card.dataset.saved = (!isSaved).toString();
    this.classList.toggle('saved');
    this.innerHTML = isSaved
      ? '<i class="far fa-bookmark"></i> Save'
      : '<i class="fas fa-bookmark"></i> Saved';
  });

  return card;
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Format time
function formatTime(timeString) {
  const date = new Date(`1970-01-01T${timeString}`);
  if (isNaN(date.getTime())) {
    const cleaned = timeString.replace(/:00(?=\s*[AP]M)/i, '');
    return cleaned.toUpperCase();
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

  
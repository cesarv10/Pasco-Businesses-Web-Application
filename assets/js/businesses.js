// This script fetches business data from an ArcGIS Feature Service and displays it on the page.
  async function fetchBusinesses() {
    const url = 'API URL HERE'; // Replace with the actual API URL
    const response = await fetch(url);
    const data = await response.json();
    
    data.features.forEach(business => {
      const props = business.properties;
      const card = document.createElement('div');
      card.innerHTML = `
        <h3>${props.Name}</h3>
        <img src="${props.PhotoURL}" alt="${props.Name}" width="200">
        <p>${props.Description}</p>
        <p><strong>Contact:</strong> ${props.Contact}</p>
      `;
      document.getElementById('business-list').appendChild(card);
    });
  }

  fetchBusinesses();

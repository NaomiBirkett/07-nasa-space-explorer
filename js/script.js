// Wrap all code in window.onload to ensure it runs after the DOM is fully loaded
window.onload = function() {
  // Find our date picker inputs on the page
  const startInput = document.getElementById('startDate');
  const endInput = document.getElementById('endDate');

  // Call the setupDateInputs function from dateRange.js
  // This sets up the date pickers to:
  // - Default to a range of 9 days (from 9 days ago to today)
  // - Restrict dates to NASA's image archive (starting from 1995)
  setupDateInputs(startInput, endInput);

  // Use the new button id for accessibility
  const getImagesButton = document.getElementById('getImagesBtn');
  // Find the gallery container
  const gallery = document.getElementById('gallery');

  // Modal elements
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalExplanation = document.getElementById('modalExplanation');
  const closeModal = document.getElementById('closeModal');

  // NASA APOD API key and endpoint
  const API_KEY = '2r3TfqUOrK3rzyfApK7tT4MR9fbRT5dePJHJxIWQ';
  const API_URL = 'https://api.nasa.gov/planetary/apod';

  // Array of fun space facts
  const spaceFacts = [
    "Did you know? One million Earths could fit inside the Sun!",
    "Did you know? Venus spins backwards compared to most planets.",
    "Did you know? A day on Mercury is longer than its year.",
    "Did you know? Neutron stars can spin 600 times per second.",
    "Did you know? There are more trees on Earth than stars in the Milky Way.",
    "Did you know? The footprints on the Moon will be there for millions of years.",
    "Did you know? Jupiter has at least 95 moons.",
    "Did you know? Space is completely silent—there’s no air to carry sound.",
    "Did you know? The hottest planet in our solar system is Venus.",
    "Did you know? Saturn could float in water because it’s mostly gas."
  ];

  // Function to pick and display a random fact
  function showRandomFact() {
    const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
    const spaceFactDiv = document.getElementById('spaceFact');
    spaceFactDiv.textContent = randomFact;
  }

  // Show a random fact on page load
  showRandomFact();

  // When opening modal, move focus to close button for accessibility
  function openModal() {
    modal.style.display = 'flex';
    closeModal.focus();
  }

  // When closing modal, return focus to the Get Images button
  function closeModalFunc() {
    modal.style.display = 'none';
    // Remove video or link from modal when closing
    if (document.getElementById('modalVideo')) {
      document.getElementById('modalVideo').remove();
    }
    if (document.getElementById('modalVideoLink')) {
      document.getElementById('modalVideoLink').remove();
    }
    modalImg.style.display = 'block';
    getImagesButton.focus();
    // Remove enlarged class if present
    modalImg.classList.remove('enlarged');
  }

  // Listen for button clicks
  getImagesButton.addEventListener('click', () => {
    // Show a new random fact each time the button is clicked
    showRandomFact();

    // Get the selected start and end dates from the inputs
    const startDate = startInput.value;
    const endDate = endInput.value;

    // Check if both dates are selected
    if (!startDate || !endDate) {
      alert('Please select both a start and end date.');
      return;
    }

    // Show a loading message in the gallery
    gallery.innerHTML = `<p>Loading space photos...</p>`;

    // Build the API URL with the selected dates
    const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

    // Fetch images from NASA's APOD API
    fetch(url)
      .then(response => response.json())
      .then(data => {
        gallery.innerHTML = '';

        const images = Array.isArray(data) ? data : [data];

        images.forEach(item => {
          const div = document.createElement('div');
          div.className = 'gallery-item';

          if (item.media_type === 'image') {
            // Show image, title, and date
            div.innerHTML = `
              <img src="${item.url}" alt="${item.title} - NASA Astronomy Picture of the Day" style="cursor:pointer;" />
              <p><strong>${item.title}</strong> (${item.date})</p>
            `;
            div.querySelector('img').addEventListener('click', () => {
              modalImg.style.display = 'block';
              modalImg.src = item.hdurl || item.url;
              modalImg.alt = `${item.title} - NASA Astronomy Picture of the Day`;
              modalTitle.textContent = item.title;
              modalDate.textContent = item.date;
              modalExplanation.textContent = item.explanation;
              // Hide video if previously shown
              if (document.getElementById('modalVideo')) {
                document.getElementById('modalVideo').remove();
              }
              if (document.getElementById('modalVideoLink')) {
                document.getElementById('modalVideoLink').remove();
              }
              openModal();
            });
          } else if (item.media_type === 'video') {
            // Show a video thumbnail or a play icon with title/date
            // Try to get a YouTube thumbnail if possible
            let thumb = 'https://img.youtube.com/vi/' + getYouTubeID(item.url) + '/hqdefault.jpg';
            let isYouTube = getYouTubeID(item.url) !== null;
            if (!isYouTube) {
              // Use a generic video icon if not YouTube
              thumb = 'https://upload.wikimedia.org/wikipedia/commons/7/75/Video-Icon.png';
            }
            div.innerHTML = `
              <div style="position:relative; cursor:pointer;">
                <img src="${thumb}" alt="Video: ${item.title}" style="width:100%;height:200px;object-fit:cover;border-radius:4px;filter:brightness(0.7);" />
                <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;color:white;">&#9658;</span>
              </div>
              <p><strong>${item.title}</strong> (${item.date})</p>
            `;
            div.querySelector('div').addEventListener('click', () => {
              modalImg.style.display = 'none';
              modalTitle.textContent = item.title;
              modalDate.textContent = item.date;
              modalExplanation.textContent = item.explanation;
              // Remove previous video/link if any
              if (document.getElementById('modalVideo')) {
                document.getElementById('modalVideo').remove();
              }
              if (document.getElementById('modalVideoLink')) {
                document.getElementById('modalVideoLink').remove();
              }
              if (isYouTube) {
                const iframe = document.createElement('iframe');
                iframe.id = 'modalVideo';
                iframe.width = '100%';
                iframe.height = '400';
                iframe.src = `https://www.youtube.com/embed/${getYouTubeID(item.url)}`;
                iframe.frameBorder = '0';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                iframe.title = item.title;
                modalExplanation.parentNode.insertBefore(iframe, modalExplanation);
              } else {
                const link = document.createElement('a');
                link.id = 'modalVideoLink';
                link.href = item.url;
                link.target = '_blank';
                link.textContent = 'Watch Video';
                link.style.display = 'block';
                link.style.margin = '20px 0';
                link.style.fontWeight = 'bold';
                link.style.color = '#0b3d91';
                link.setAttribute('aria-label', `Watch video: ${item.title}`);
                modalExplanation.parentNode.insertBefore(link, modalExplanation);
              }
              openModal();
            });
          }

          gallery.appendChild(div);
        });

        if (gallery.children.length === 0) {
          gallery.innerHTML = `<p>No images found for this date range.</p>`;
        }
      })
      .catch(error => {
        gallery.innerHTML = `<p>Sorry, there was a problem loading images.</p>`;
        console.error('Error fetching images:', error);
      });
  });

  // Helper function to extract YouTube video ID from URL
  function getYouTubeID(url) {
    // Handles various YouTube URL formats
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  // Close modal when the close button is clicked
  closeModal.addEventListener('click', closeModalFunc);

  // Also close modal when clicking outside the modal content
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModalFunc();
    }
  });

  // Allow closing modal with ESC key for accessibility
  document.addEventListener('keydown', (event) => {
    if (modal.style.display === 'flex' && (event.key === 'Escape' || event.key === 'Esc')) {
      closeModalFunc();
    }
  });

  // Add event listener to modal image for enlarging on click
  modalImg.addEventListener('click', () => {
    modalImg.classList.toggle('enlarged');
  });
};

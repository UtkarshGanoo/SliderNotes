document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = 'list'; // Adjust the URL as per your API endpoint
    let isSpeaking = false;
    let currentUtterance;
  
    // Fetch images and render
    fetchTextFiles(apiUrl);
  
    function fetchTextFiles(apiUrl) {
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          const textUrls = data.files.map(file => {
            return `${file}`; // Assuming all files are .txt
          });
          renderTextSlides(textUrls);
        })
        .catch(error => {
          console.error('Error fetching text files:', error);
        });
    }
  
    function renderTextSlides(urls) {
      var mySwiper = new Swiper(".mySwiper", {
        direction: "vertical",
        zoom: true,
        loop: true,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
      });
  
      urls.forEach((url, index) => {
        fetch(url)
          .then(response => response.text())
          .then(text => {
            const textContent = `<p class="speak">${text}</p>`;
            const swiperSlide = document.createElement('div');
            swiperSlide.classList.add('swiper-slide');
            swiperSlide.innerHTML = `<div class="swiper-zoom-container"><div class="text-content">${textContent}</div></div>`;
            document.querySelector('.swiper-wrapper').appendChild(swiperSlide);
            mySwiper.update(); // Update Swiper after adding a new slide
  
            // Add event listener to dynamically added controls
            const playButton = swiperSlide.querySelector('.playButton');
            const pauseButton = swiperSlide.querySelector('.pauseButton');
            const stopButton = swiperSlide.querySelector('.stopButton');
            const readMoreButton = swiperSlide.querySelector('.readMoreButton');
  
            playButton.addEventListener('click', () => {
              if (!isSpeaking) {
                const textToSpeak = extractTextToSpeak(text);
                speakText(textToSpeak);
                isSpeaking = true;
              } else {
                resumeSpeech();
              }
            });
  
            pauseButton.addEventListener('click', () => {
              pauseSpeech();
            });
  
            stopButton.addEventListener('click', () => {
              stopSpeech();
            });
  
            readMoreButton.addEventListener('click', () => {
              populateModal(text);
            });
          })
          .catch(error => {
            console.error('Error fetching text file:', error);
          });
      });
    }
  
    // Function to speak text
    function speakText(text) {
      currentUtterance = new SpeechSynthesisUtterance(text);
      // Set options here
      currentUtterance.lang = 'en-US'; // Language
      currentUtterance.volume = 1; // Volume (0 to 1)
      currentUtterance.rate = 1; // Speed (0.1 to 10)
      currentUtterance.pitch = 1; // Pitch (0 to 2)
      speechSynthesis.speak(currentUtterance);
    }
  
    // Function to pause speech
    function pauseSpeech() {
      if (currentUtterance) {
        speechSynthesis.pause();
      }
    }
  
    // Function to resume speech
    function resumeSpeech() {
      if (currentUtterance) {
        speechSynthesis.resume();
      }
    }
  
    // Function to stop speech
    function stopSpeech() {
      if (currentUtterance) {
        speechSynthesis.cancel();
        isSpeaking = false;
      }
    }
  
    // Function to extract text to speak between <p class="speak"> tags
    function extractTextToSpeak(text) {
      const startIndex = text.indexOf('<p class="speak">');
      const endIndex = text.indexOf('</p>');
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        return text.substring(startIndex + 18, endIndex); // +18 to exclude '<p class="speak">' from the result
      } else {
        return ''; // If tags not found, return empty string
      }
    }
  
    // Function to populate modal with text content
    function populateModal(text) {
      const modalBody = document.getElementById('textContentModalBody');
      modalBody.innerHTML = text;
      const textContentModal = new bootstrap.Modal(document.getElementById('textContentModal'));
      textContentModal.show();
    }
  });
  
  
  // Function to show the overlay
  function showOverlay() {
    const overlay = document.querySelector('.overlay');
    overlay.style.display = 'block';
  }
  
  // Function to hide the overlay
  function hideOverlay() {
    const overlay = document.querySelector('.overlay');
    overlay.style.display = 'none';
  }
  
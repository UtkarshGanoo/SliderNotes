document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = '/os/os.txt'; // Adjust the URL as per your API endpoint
    let isShuffling = true; // Initially shuffling is enabled
    let isSpeaking = false;
    let currentUtterance;
    let mySwiper;
  
    // Fetch images and render
    fetchImages(apiUrl);
  
    function fetchImages(apiUrl) {
        let imageUrls = [];
        let textUrls = [];
  
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                data.files.forEach(file => {
                    const fileUrl = `/os/ostxt/${file}`;
                    const extension = file.split('.').pop().toLowerCase();
  
                    if (extension === 'txt') {
                        textUrls.push(fileUrl);
                    } else {
                        imageUrls.push(fileUrl);
                    }
                });
  
                // Concatenate textUrls and imageUrls arrays
                const allUrls = textUrls.concat(imageUrls);
                // Shuffle the concatenated array
                shuffle(allUrls);
                // Render images
                renderImages(allUrls);
            })
            .catch(error => {
                console.error('Error fetching images:', error);
            });
    }
  
    function renderImages(urls) {
        mySwiper = new Swiper(".mySwiper", {
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
            on: {
                slideChange: function() {
                    stopSpeech();
                }
            }
        });
    
        urls.forEach(url => {
            const extension = url.split('.').pop().toLowerCase();
    
            const swiperSlide = document.createElement('div');
            swiperSlide.classList.add('swiper-slide');
    
            if (extension === 'txt') {
                fetch(url)
                    .then(response => response.text())
                    .then(text => {
                        const maxLength = 700; // Maximum length of truncated text
                        let truncatedText = text.substring(0, maxLength);
                        const imageTagIndex = truncatedText.indexOf('<img');
    
                        if (imageTagIndex !== -1) {
                            // Truncate only the text before the image tag
                            truncatedText = truncatedText.substring(0, imageTagIndex);
                        }
    
                        const textContent = `<div class="text-content">${truncatedText}<div class="controls"><button class="playButton">Play</button><button class="pauseButton">Pause</button><button class="stopButton">Stop</button><button class="readMoreButton">Read More</button></div></div>`;
                        swiperSlide.innerHTML = `<div class="swiper-zoom-container">${textContent}</div>`;
    
                        if (imageTagIndex !== -1) {
                            // Extract and render the image separately
                            const imageContainer = document.createElement('div');
                            imageContainer.innerHTML = text.substring(imageTagIndex); // Include the image tag and the rest of the text
                            swiperSlide.appendChild(imageContainer.firstChild); // Append the image to the swiper slide
                        }
    
                        document.querySelector('.swiper-wrapper').appendChild(swiperSlide);
                        mySwiper.update(); // Update Swiper after adding a new slide
    
                        // Add event listeners...
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
            } else {
                swiperSlide.innerHTML = `<div class="swiper-zoom-container"><img src="${url}" alt="Image"></div>`;
                document.querySelector('.swiper-wrapper').appendChild(swiperSlide);
                mySwiper.update(); // Update Swiper after adding a new slide
            }
        });    
    
    }
  
    // Function to shuffle array
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
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
  
//     // Function to pause speech
//     function pauseSpeech() {
//         if (currentUtterance) {
//             speechSynthesis.pause();
//         }
//     }
  
//     // Function to resume speech
//     // function resumeSpeech() {
//     //     if (currentUtterance) {
//     //         speechSynthesis.resume();
//     //     }
//     // }
//   function resumeSpeech() {
//     if (currentUtterance) {
//         // Restart speech from the paused position
//         currentUtterance.onend = function() {
//             currentUtterance = new SpeechSynthesisUtterance(currentUtterance.text.substring(currentUtterance.position));
//             currentUtterance.lang = 'en-US';
//             currentUtterance.volume = 1;
//             currentUtterance.rate = 1;
//             currentUtterance.pitch = 1;
//             speechSynthesis.speak(currentUtterance);
//         };

//         speechSynthesis.resume();
//     }
// }
    // Function to pause speech
function pauseSpeech() {
    if (currentUtterance) {
        speechSynthesis.pause();
    }
}

// Function to resume speech
function resumeSpeech() {
    if (currentUtterance) {
        // Store the current position before stopping speech
        const currentPosition = currentUtterance.position;
        stopSpeech(); // Stop the current speech

        // Create a new utterance starting from the last position
        const textToSpeak = currentUtterance.text.substring(currentPosition);
        speakText(textToSpeak);
        isSpeaking = true;
    }
}
    // Function to stop speech
    function stopSpeech() {
        if (currentUtterance) {
            speechSynthesis.cancel();
            isSpeaking = false;
        }
    }
  
    // Function to extract text to speak between <p=speak> tags
    function extractTextToSpeak(text) {
        const startIndex = text.indexOf('<p class="speak">');
        const endIndex = text.indexOf('</p>');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            return text.substring(startIndex + 18, endIndex); // +18 to exclude '<p class="speak">' from the result
        } else {
            return ''; // If tags not found, return empty string
        }
    }
  
     // Add event listener to prevent right-click in modal
     const modalContent = document.querySelector('.modal-content');
     modalContent.addEventListener('contextmenu', function(event) {
         event.preventDefault(); // Prevent the default context menu behavior
     });
  
    // Function to populate modal with text content
    function populateModal(text) {
        const modalBody = document.getElementById('textContentModalBody');
        modalBody.innerHTML = text;
        const textContentModal = new bootstrap.Modal(document.getElementById('textContentModal'));
        textContentModal.show();
    }
  
    // Toggle shuffle on/off
    const shuffleToggleButton = document.getElementById('shuffleToggle');
    shuffleToggleButton.addEventListener('click', () => {
        isShuffling = !isShuffling; // Toggle shuffle state
        shuffleToggleButton.textContent = isShuffling ? 'Shuffle: On' : 'Shuffle: Off';
        // Fetch images and render again
        fetchImages(apiUrl);
    });
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
  

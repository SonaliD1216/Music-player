
const selectSection = document.querySelector(".section-browse");
const nowPlayingSection = document.getElementById("now-playing");
const playListSection = document.querySelector(".section-playlist");
const openPlayList = document.querySelector(".playlist-icon");
const playList = document.getElementById("playlist");
const trackTitle = document.querySelector(".track-title");
const artist = document.querySelector(".artist");
const songLength = document.querySelector(".length");
const timePlayed = document.querySelector(".time-played");
const progressBarElement = document.querySelector(".progress");
const volumeSlider = document.getElementById("volume-slider");
const playPauseButton = document.getElementById("play-pause");
const nextButton = document.querySelector(".next");
const prevButton = document.querySelector(".prev");
const playPauseIcon = document.querySelector(".fas.fa-play");
const volumeButton = document.querySelector(".volume");
const selectDirectory = document.getElementById("select-files");
const changeDirectory = document.getElementById("change-directory");

let audioList = [];
let songTitleList = [];
let currentTrackIndex = 0;
let currentTime = 0;
const trackList = [
  "audio/Parkhana -parkhana.htm",
  "audio/Gajalu - Gajalu track.htm",
  "audio/Gulabi -gulabi.htm ",
  "audio/Risaune Bhaye -risaune bhaye.htm ",
];

selectDirectory.addEventListener("click", scanFolder);

changeDirectory.addEventListener("click", () => {
  playListSection.style.display = "none";
  selectSection.style.display = "flex";
  nowPlayingSection.style.display = "none";
});

openPlayList.addEventListener("click", () => {
  playListSection.style.display = "block";
  selectSection.style.display = "none";
  nowPlayingSection.style.display = "none";
});

async function scanFolder() {
  try {
    const dirHandle = await window.showDirectoryPicker();
    const entries = await dirHandle.values();

    const audioFiles = [];

    for await (const entry of entries) {
      if (entry.name.endsWith(".mp3") || entry.name.endsWith(".wav") || entry.name.endsWith(".m4a")) {
        audioFiles.push(entry);
      }
    }

    displayAudioInfo(audioFiles);
    playListSection.style.display = "block";
    selectSection.style.display = "none";
  } catch (error) {
    console.error("Error scanning folder:", error);
    // Handle errors gracefully, informing the user about issues
  }
}

async function displayAudioInfo(audioFiles) {
  for (const file of audioFiles) {
    try {
      const fileHandle = await file.getFile();
      const fileReader = new FileReader();

      fileReader.addEventListener("load", () => {
        const audioBlob = fileReader.result;
        const audio = new Audio(audioBlob);

        audioList.push(audio);
        songTitleList.push(file.name);

        const audioElement = document.createElement("li");
        audioElement.textContent = file.name; // Set file name as text
        audioElement.addEventListener("click", () => {
          selectedAudio = audio; // Store selected audio object
          stopAllAudio();
          playTrack(audioList.indexOf(selectedAudio)); // Get index from audioList
          playPauseIcon.classList.replace("fa-play", "fa-pause");
          console.log("Now playing: " + file.name);
          playListSection.style.display = "none";
          selectSection.style.display = "none";
          nowPlayingSection.style.display = "flex";
        });
        playList.appendChild(audioElement);

      });

      fileReader.readAsDataURL(fileHandle);
    } catch (error) {
      console.error("Error processing audio file:", error);
    }
  }

  // Play button click listener
  playPauseButton.addEventListener("click", () => {
    if (selectedAudio.paused) {
      // Audio is paused, so play it
      selectedAudio.play();
      // Update UI to reflect playing state (e.g., change icon to pause)
      playPauseIcon.classList.replace("fa-play", "fa-pause");
    } else {
      // Audio is playing, so pause it
      selectedAudio.pause();
      // Update UI to reflect paused state (e.g., change icon to play)
      playPauseIcon.classList.replace("fa-pause", "fa-play");
    }
  });

  nextButton.addEventListener("click", handleNext);
  prevButton.addEventListener("click", handlePrev);

  volumeButton.addEventListener("click", ()=>{
    // Toggle visibility based on current state:
    if (volumeSlider.style.display === "none") {
      volumeSlider.style.display = "block";
    } else {
      volumeSlider.style.display = "none";
    }
  });

  // Adjust the volume
  volumeSlider.addEventListener("input", () => {
    selectedAudio.volume = volumeSlider.value;
  });

  function handleNext() {
    currentTrackIndex++;
    if (currentTrackIndex >= audioList.length) {
      currentTrackIndex = 0; // Loop to the beginning
    }
      playTrack(currentTrackIndex);
  }

  function handlePrev() {
    currentTrackIndex--;
    if (currentTrackIndex < 0) {
      currentTrackIndex = audioList.length - 1; // Loop to the end
    }
    playTrack(currentTrackIndex);
  }

  function playTrack(index) {
    if (selectedAudio) {
      selectedAudio.currentTime = 0; // Reset playhead to beginning
      selectedAudio.pause(); // Stop current audio playback
    }

    const audio = audioList[index];
    selectedAudio = audio; // Update selected audio reference
    selectedAudio.play(); // Play the track
    // Update UI elements (play/pause icon, track title, etc.)
    let length = convertTime(selectedAudio.duration);
    let songTitle = songTitleList[index];
    let songArtist = selectedAudio.artist;
    trackTitle.innerHTML = songTitle ? songTitle : "Track " + (index + 1);
    artist.innerHTML = songArtist ? songArtist : "unknown artist";
    songLength.innerHTML = length ? length : "0:00";

    setInterval(() => {
      currentTime = selectedAudio.currentTime;
      updateProgressBarPercentage(); // Call function to update progress bar
      timePlayed.innerHTML = convertTime(currentTime);
    }, 1000);
  }

  function stopAllAudio() {
    for (const audio of audioList) {
        audio.pause();
    }
  }

  function updateProgressBarPercentage() {
    const progressPercentage = (currentTime / selectedAudio.duration) * 100;

    // Update the progress bar element's style based on the percentage
    progressBarElement.style.width = `${progressPercentage}%`;

    // Play the next song when progress reaches 100%
    if (progressPercentage === 100){
      handleNext();
    }
  }
}

function convertTime(time) {
  let mins = Math.floor(time / 60);
  if (mins < 10) {
    mins = "0" + mins;
  }
  let secs = Math.floor(time % 60);
  if (secs < 10) {
    secs = "0" + secs;
  }
  return mins + ":" + secs;
}

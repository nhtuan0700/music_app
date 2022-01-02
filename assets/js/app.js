/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / Pause / Seek
 * 4. CD rotate
 * 5. Next / Prev
 * 6. Random
 * 7. Next / Repeate when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click 
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelector.bind(document);
const APP_STORAGE_KEY = "APP_MUSIC";

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const currentTime = $('.current-time');
const progress = $('.progress');
const volume = $('#volume');
const playlist = $('.playlist');

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  volume: 1,
  songPlayed: [],
  config: JSON.parse(localStorage.getItem(APP_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(this.config));
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom  || this.isRandom;
    this.isRepeat = this.config.isRepeat || this.isRandom;
    this.volume = this.config.volume || this.volume;
  },
  renderConfig: function () {
    repeatBtn.classList.toggle('active', this.isRepeat);
    randomBtn.classList.toggle('active', this.isRandom);
  },
  renderVolume: function () {
    volume.value = this.volume * 100;
    audio.volume = this.volume;
    this.setProgressColor(volume);
    if (screen.width < 1400) {
      volume.parentElement.style.display = 'none';
    }
  },
  songs: [
    {
      id: 1,
      name: 'On the ground',
      singer: 'Rose',
      path: './assets/music/song1.mp3',
      image: './assets/img/song1.jpg',
    },
    {
      id: 2,
      name: 'Shape of you',
      singer: 'Ed Sheeran',
      path: './assets/music/song2.mp3',
      image: './assets/img/song2.jpg',
    },
    {
      id: 3,
      name: 'We don\'t talk any more',
      singer: 'Charlie Purth & Selena Gomez',
      path: './assets/music/song3.mp3',
      image: './assets/img/song3.jpg',
    },
    {
      id: 4,
      name: 'Girl like you',
      singer: 'Maroon 5',
      path: './assets/music/song4.mp3',
      image: './assets/img/song4.jpg',
    },
    {
      id: 5,
      name: 'See you agian',
      singer: 'Charlie Purth',
      path: './assets/music/song5.mp3',
      image: './assets/img/song5.jpg',
    }
  ],
  defindProperty: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex];
      }
    })
  },
  setTitleTab: function () {
    var link = $("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.querySelector('head').appendChild(link);
    }
    link.href = this.currentSong.image;
    document.title = `${this.currentSong.name} | ${this.currentSong.singer}`;
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;
    const cdThumbAnimate = cdThumb.animate({
      transform: 'rotate(360deg)'
    }, {
      duration: 10000,
      iterations: Infinity
    })
    cdThumbAnimate.pause();

    document.onscroll = function (e) {
      const newWidth = cdWidth - document.documentElement.scrollTop;
      cd.style.width = newWidth < 0 ? 0 : newWidth + 'px';
      cd.style.opacity = newWidth / cdWidth;
    }

    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }

    audio.onplay = function () {
      player.classList.add('playing');
      _this.isPlaying = true;
      cdThumbAnimate.play();
    }

    audio.onpause = function () {
      player.classList.remove('playing');
      _this.isPlaying = false;
      cdThumbAnimate.pause();
    }

    audio.ontimeupdate = function () {
      if (audio.duration) {
        progress.value = Math.floor(audio.currentTime / audio.duration * 100);
        currentTime.textContent = _this.getSongCurrentTime(audio.currentTime);
        _this.setProgressColor(progress);
      }
    }

    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    }

    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    }

    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.render();
      _this.scrollToActiveSong();
    }

    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      randomBtn.classList.toggle('active', _this.isRandom);
      _this.setConfig("isRandom", _this.isRandom);
    }

    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      repeatBtn.classList.toggle('active', _this.isRepeat);
      _this.setConfig("isRepeat", _this.isRepeat);
    }

    progress.oninput = function () {
      const seekTime = this.value / 100 * audio.duration;
      audio.currentTime = seekTime;
    }

    playlist.onclick = function (e) {
      if (e.target.closest('.song .option')) {
        console.log(1);
        return;
      }
      let songNode = e.target.closest('.song:not(.active)');
      if (songNode) {
        _this.currentIndex = Number(songNode.dataset.index);
        _this.loadCurrentSong();
        _this.render();
        audio.play();
      }
    }
    document.onkeydown = function (e) {
      if (e.which == 32) {
        e.preventDefault();
        playBtn.click();
      }
      if (e.which == 39) {
        e.preventDefault();
        audio.currentTime += 5;
      }
      if (e.which == 37) {
        e.preventDefault();
        audio.currentTime -= 5;
      }
    }

    volume.oninput = function () {
      const volumeValue = this.value / 100;
      audio.volume = volumeValue;
      _this.setProgressColor(this)
      _this.setConfig('volume', volumeValue);
    }
  },
  render: function () {
    var htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${this.currentIndex === index ? 'active' : ''}" data-index=${index}>
          <div class="thumb" style="background-image: url('${song.image}')">
          </div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
      `
    })
    playlist.innerHTML = htmls.join('');
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      let songActive = $('.song.active');
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        // Get vị trí tại area
        block: songActive.getBoundingClientRect().top <= 200 ? 'end' : 'nearest'
      })
    }, 300)
  },
  setProgressColor: function (elm) {
    var valPercent = (elm.value - parseInt(elm.min)) / (parseInt(elm.max) - parseInt(elm.min));
    elm.style = 'background-image: -webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(' + valPercent + ', #272727),' +
      'color-stop(' + valPercent + ', #d3d3d3));'
  },
  saveSongPlayed: function () {
    if (!this.songPlayed.includes(this.currentIndex)) {
      this.songPlayed.push(this.currentIndex);
    }
    if (this.songPlayed.length == this.songs.length) {
      this.songPlayed.length = 0;
    }
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = this.currentSong.path;
    this.saveSongPlayed();
    this.setTitleTab();
  },
  getSongCurrentTime: function (totalSecond) {
    let minutes = String(Math.floor(totalSecond / 60));
    let seconds = String(Math.floor(totalSecond % 60));
    return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex > this.songs.length - 1) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (this.currentIndex === newIndex || this.songPlayed.includes(newIndex));
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    // LoadConfig vào app
    this.loadConfig();
    // render config từ app
    this.renderConfig();
    // Định nghĩa thuộc tính cho object
    this.defindProperty();

    // Lắng nghe / Xử lý các sự kiện
    this.handleEvents();

    // Load bài đầu tiên khi bắt đầu chạy
    this.loadCurrentSong();

    // Render playlist
    this.render();

    // load volume từ storage và kiểm tra kích thước màn hình 
    this.renderVolume();
  }
}
app.start();
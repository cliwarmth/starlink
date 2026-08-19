// ---------- 测试数据库 ----------
const gameDatabase = [
  { title: "空洞骑士",gameTitleEn:"ori", year: 2017, url: "#", image: "https://picsum.photos/seed/hk/48/48" },
  { title: "丝之歌",gameTitleEn:"ori", year: 2024, url: "#", image: "https://picsum.photos/seed/silk/48/48" },
  { title: "奥日与黑暗森林",gameTitleEn:"ori", year: 2015, url: "#", image: "https://picsum.photos/seed/ori/48/48" },
  { title: "茶杯头",gameTitleEn:"cuphead", year: 2017, url: "#", image: "https://picsum.photos/seed/cup/48/48" },
  { title: "只狼",gameTitleEn:"wolf", year: 2019, url: "#", image: "https://picsum.photos/seed/sekiro/48/48" },
  { title: "黑暗之魂",gameTitleEn:"ori", year: 2011, url: "#", image: "https://picsum.photos/seed/darksouls/48/48" }
];

// ---------- 搜索功能 ----------
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchWrapper = document.querySelector('.search-wrapper');

searchBtn.addEventListener('click', () => {
  searchInput.classList.toggle('active');
  if (searchInput.classList.contains('active')) {
    searchInput.focus();
    handleSearchInput();
  } else {
    searchResults.classList.remove('active');
  }
});

searchInput.addEventListener('input', handleSearchInput);

searchResults.addEventListener('click', (e) => {
  const item = e.target.closest('.search-result-item');
  if (item) {
    const url = item.dataset.url;
    alert(`跳转到：${url}`);
    searchInput.value = item.querySelector('.search-result-text strong').textContent;
    searchResults.classList.remove('active');
    searchInput.classList.remove('active');
  }
});

function handleSearchInput() {
  const keyword = searchInput.value.trim().toLowerCase();
  if (!keyword) {
    searchResults.classList.remove('active');
    searchResults.innerHTML = '';
    return;
  }
  const matches = gameData.filter(game => {
  const titleMatch = game.gameTitle.toLowerCase().includes(keyword);
  const enMatch = game.gameTitleEn && game.gameTitleEn.toLowerCase().includes(keyword);
  return titleMatch || enMatch;
  });
  if (matches.length > 0) {
    searchResults.innerHTML = matches.map(game => `
      <div class="search-result-item" data-url="${game.url}">
        <img class="search-result-img" src="${game.image}" alt="${game.title}">
        <div class="search-result-text">
          <strong>${game.title}</strong>
          ${game.gameTitleEn ? `<span style="font-size: 0.9em;"> ${game.gameTitleEn}</span>` : ''}
          <span class="search-result-year">(${game.year})</span>
        </div>
      </div>
    `).join('');
    searchResults.classList.add('active');
  } else {
    searchResults.innerHTML = '<div class="search-result-item" style="cursor:default; opacity:0.6;">未找到匹配游戏</div>';
    searchResults.classList.add('active');
  }
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrapper')) {
    searchResults.classList.remove('active');
    searchInput.classList.remove('active');
  }
});

// ---------- 主题切换（深色 / 浅色） ----------
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');
const body = document.body;
const htmlElement = document.documentElement;

function applyTheme(isLight) {
  body.classList.toggle('light-mode', isLight);
  htmlElement.classList.toggle('light-mode', isLight);
  htmlElement.style.backgroundColor = isLight ? '#f2f2f7' : '#0f0f14';
  themeIcon.className = isLight ? 'fas fa-toggle-off fa-fw' : 'fas fa-toggle-on fa-fw';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme === 'light');

themeToggle.addEventListener('click', () => {
  const isLight = !body.classList.contains('light-mode');
  applyTheme(isLight);
});

// ---------- 导航栏滚动透明度 ----------
const navbar = document.querySelector('.navbar');
const scrollThreshold = 30;

function updateNavbarOpacity() {
  if (window.scrollY > scrollThreshold) {
    navbar.classList.add('nav-scrolled');
  } else {
    navbar.classList.remove('nav-scrolled');
  }
}

updateNavbarOpacity();
window.addEventListener('scroll', updateNavbarOpacity);

// ---------- sticky 海报动态 top ----------
const posterSection = document.querySelector('.poster-section');

function setStickyTop() {
  const navHeight = navbar.offsetHeight;
  const mainContentTop = parseFloat(getComputedStyle(document.querySelector('.main-content')).marginTop);
  const topValue = navHeight + mainContentTop;
  posterSection.style.top = topValue + 'px';
}

setStickyTop();
window.addEventListener('resize', setStickyTop);

// ---------- 跨标签页主题实时同步 ----------
window.addEventListener('storage', (e) => {
  if (e.key === 'theme') {
    const isLight = e.newValue === 'light';
    applyTheme(isLight);
  }
});
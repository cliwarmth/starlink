// ---------- 测试数据库 ----------
let gameData = null;
fetch("/starlink/gaming/atlas.json")
  .then(res => res.json())
  .then(data => {
    gameData = data;
  });

// ========== 新增：设置返回按钮，携带滚动位置参数 ==========
document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const scrollY = params.get('scrollY');
  const from = params.get('from');

  const backBtn = document.querySelector('.back-btn');
  if (!backBtn) return;

  if (scrollY) {
    // 如果 URL 中有 scrollY，则返回 index 页并带上该参数
    backBtn.href = `/starlink/index.html?from=game&scrollY=${scrollY}`;
  } else if (from === 'game') {
    // 即使没有 scrollY，也确保返回 index 页（可选）
    backBtn.href = `/starlink/index.html?from=game`;
  }
});

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
  const matches = gameData.filter(game => game.gameTitle.toLowerCase().includes(keyword));
  if (matches.length > 0) {
    searchResults.innerHTML = matches.map(game => `
      <div class="search-result-item" data-url="${game.linkUrl}">
        <img class="search-result-img" src="${game.imgUrl}" alt="${game.gameTitle}">
        <div class="search-result-text">
          <strong>${game.gameTitle}</strong>
          <span class="search-result-year">(${game.gameYear})</span>
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
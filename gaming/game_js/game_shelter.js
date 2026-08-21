// ========== 禁用浏览器自动滚动恢复 ==========
history.scrollRestoration = 'manual';

// ========== 检测是否为刷新加载 ==========
const isPageRefresh = (window.performance.navigation.type === 1) ||
                      (window.performance.getEntriesByType('navigation')[0]?.type === 'reload');

// ========== 检测 URL 参数 from=game，用于判断是否从游戏详情页返回 ==========
const urlParams = new URLSearchParams(window.location.search);
const isFromGame = urlParams.get('from') === 'game';

// ========== 页面离开前保存当前滚动位置和当前页码 ==========
window.addEventListener('beforeunload', function() {
  sessionStorage.setItem('scrollPos', window.scrollY.toString());
  // 从页码按钮的 active 状态读取当前页码，若不存在则默认为1
  const activePageBtn = document.querySelector('.page-number.active');
  const currentPage = activePageBtn ? activePageBtn.textContent : '1';
  sessionStorage.setItem('currentPage', currentPage);
});

let gameData = null;
fetch("/starlink/gaming/atlas.json")
  .then(res => res.json())
  .then(data => {
    gameData = data;
    gamelistShow();
  });

function gamelistShow() {
  // ========== 计数更新（直接执行） ==========
  document.getElementById('totalnum').textContent = `Numbers ${gameData.length}`;

  // ========== 分页与渲染 ==========
  const pageSize = 16;
  // 页码恢复条件：刷新时或从游戏详情页返回时
  let currentPage = 1;
  if (isPageRefresh || isFromGame) {
    const savedPage = sessionStorage.getItem('currentPage');
    if (savedPage) {
      currentPage = parseInt(savedPage, 10);
    }
  }

  const totalLinks = gameData.length;
  const totalPages = Math.ceil(totalLinks / pageSize);

  function scrollToMainContentTop() {
    const mainContent = document.querySelector('#main_content');
    const rect = mainContent.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dynamicOffset = viewportHeight * 0.16;
    const scrollTarget = window.scrollY + rect.top - dynamicOffset;
    window.scrollTo(0, scrollTarget);
  }

  function getSortedGameData() {
    const sortedData = JSON.parse(JSON.stringify(gameData));
    sortedData.sort((a, b) => (b.addedAT || 0) - (a.addedAT || 0));
    return sortedData;
  }

  function renderPageNumbers() {
    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = '';
    const total = totalPages;

    if (total <= 10) {
      for (let i = 1; i <= total; i++) {
        const pageBtn = document.createElement('span');
        pageBtn.textContent = i;
        pageBtn.className = 'page-number';
        if (i === currentPage) pageBtn.classList.add('active');
        pageBtn.addEventListener('click', () => {
          currentPage = i;
          renderPage(currentPage);
          scrollToMainContentTop();
        });
        pageNumbersContainer.appendChild(pageBtn);
      }
      return;
    }

    const left = Math.max(1, currentPage - 4);
    const right = Math.min(total, left + 8);

    const firstBtn = document.createElement('span');
    firstBtn.textContent = 1;
    firstBtn.className = 'page-number';
    if (currentPage === 1) firstBtn.classList.add('active');
    firstBtn.addEventListener('click', () => {
      currentPage = 1;
      renderPage(1);
      scrollToMainContentTop();
    });
    pageNumbersContainer.appendChild(firstBtn);

    if (left > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'page-ellipsis';
      pageNumbersContainer.appendChild(ellipsis);
    }

    for (let i = left; i <= right; i++) {
      if (i === 1 || i === total) continue;
      const pageBtn = document.createElement('span');
      pageBtn.textContent = i;
      pageBtn.className = 'page-number';
      if (i === currentPage) pageBtn.classList.add('active');
      pageBtn.addEventListener('click', () => {
        currentPage = i;
        renderPage(currentPage);
        scrollToMainContentTop();
      });
      pageNumbersContainer.appendChild(pageBtn);
    }

    if (right < total - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'page-ellipsis';
      pageNumbersContainer.appendChild(ellipsis);
    }

    const lastBtn = document.createElement('span');
    lastBtn.textContent = total;
    lastBtn.className = 'page-number';
    if (currentPage === total) lastBtn.classList.add('active');
    lastBtn.addEventListener('click', () => {
      currentPage = total;
      renderPage(total);
      scrollToMainContentTop();
    });
    pageNumbersContainer.appendChild(lastBtn);
  }

  function renderPage(pageNum) {
    const gameList = document.getElementById('game-list');
    gameList.innerHTML = '';
    const start = (pageNum - 1) * pageSize;
    const end = Math.min(pageNum * pageSize, totalLinks);
    const sortedData = getSortedGameData();

    for (let i = start; i < end; i++) {
      const game = sortedData[i];
      const gameItem = document.createElement('div');
      gameItem.className = 'game-link';
      gameItem.innerHTML = `
        <a href="${game.linkUrl}" class="game-home-link">
          <img src="${game.imgUrl}" alt="${game.gameTitle}" class="game-shelter-display">
          <div id="abgame">
            <p>${game.gameTitle}</p>
          </div>
        </a>
      `;
      gameList.appendChild(gameItem);
    }

    document.getElementById('prevPage').disabled = (pageNum === 1);
    document.getElementById('nextPage').disabled = (pageNum === totalPages);
    renderPageNumbers();
  }

  document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPage(currentPage);
      scrollToMainContentTop();
    }
  });

  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
      scrollToMainContentTop();
    }
  });

  if (totalPages > 1) document.getElementById('pagination').style.display = 'flex';

  // 使用恢复的 currentPage 进行渲染，而不是固定为 1
  renderPage(currentPage);

  // ========== 搜索相关代码 ==========
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchWrapper = document.querySelector('.search-wrapper');

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
      const enAbMatch = game.gameTitleEnAB && game.gameTitleEnAB.toLowerCase().includes(keyword);
      return titleMatch || enMatch || enAbMatch;
    });
    if (matches.length > 0) {
      searchResults.innerHTML = matches.map(game => `
        <div class="search-result-item" data-url="${game.linkUrl}">
          <img class="search-result-img" src="${game.imgUrl}" alt="${game.gameTitle}">
          <div class="search-result-text">
            <strong>${game.gameTitle}</strong>
            ${game.gameTitleEnAB ? `<span style="font-size: 0.9em;"> ${game.gameTitleEnAB}</span>` : ''}
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

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      searchResults.classList.remove('active');
      searchInput.classList.remove('active');
    }
  });

  // ========== 滚动位置恢复（从游戏详情页返回时） ==========
  if (isPageRefresh || isFromGame) {
    const savedScrollPos = sessionStorage.getItem('scrollPos');
    if (savedScrollPos !== null) {
      const targetY = parseInt(savedScrollPos, 10);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, targetY);
          // 恢复后清除临时数据，避免影响后续正常浏览
          sessionStorage.removeItem('scrollPos');
          sessionStorage.removeItem('currentPage');
        });
      });
    }
  }
}

// ========== 以下与 gameData 无关，保持原样 ==========
const navbar = document.querySelector('.navbar');
const goup = document.getElementById('go_up');
const scrollThreshold = 300;

window.addEventListener('scroll', function () {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  if (scrollTop > 30) navbar.classList.add('nav-scrolled');
  else navbar.classList.remove('nav-scrolled');
  if (scrollTop >= scrollThreshold) goup.classList.add('show');
  else goup.classList.remove('show');
});

goup.addEventListener('click', function () {
  const step = 50, interval = 6;
  let currentScrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollTimer = setInterval(function () {
    currentScrollTop -= step;
    if (currentScrollTop <= 0) {
      currentScrollTop = 0;
      clearInterval(scrollTimer);
    }
    window.scrollTo(0, currentScrollTop);
  }, interval);
});

const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');
const body = document.body;

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  body.classList.add('light-mode');
  themeIcon.className = 'fas fa-toggle-off fa-fw';
} else {
  body.classList.remove('light-mode');
  themeIcon.className = 'fas fa-toggle-on fa-fw';
}

themeToggle.addEventListener('click', () => {
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    themeIcon.className = 'fas fa-toggle-on fa-fw';
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.add('light-mode');
    themeIcon.className = 'fas fa-toggle-off fa-fw';
    localStorage.setItem('theme', 'light');
  }
});
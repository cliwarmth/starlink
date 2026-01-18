const nav = document.getElementById('nav');
window.addEventListener('scroll', function() {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } 
  else {
    nav.classList.remove('scrolled');
  }
}
);
const goup = document.getElementById('go_up');
const scrollThreshold = 300;
window.onscroll = function() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  if (scrollTop >= scrollThreshold) {
    goup.classList.add('show');
  } else {
    goup.classList.remove('show');
  }
};
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    goup.style.transition = 'all 0.5s ease';
  }, 1100);
});
goup.addEventListener('click', function() {
    const step = 50;
    const interval = 6;
    let currentScrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollTimer = setInterval(function() {
      currentScrollTop -= step;
      if (currentScrollTop <= 0) {
        currentScrollTop = 0;
        clearInterval(scrollTimer);
      }
      window.scrollTo(0, currentScrollTop);
    }, interval);
  });
 
let linkData = null;
fetch("/starlink/reading/library.json")
  .then(res => res.json())
  .then(data => {
    linkData = data;
  });

document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('search-input');
  const btn = document.getElementById('search-btn');
  const resultContainer = document.getElementById('result-container');
  const searchIcon = document.getElementById('search_button');
  const searchModal = document.getElementById('search-modal');
  const modalMask = document.querySelector('.modal-mask');
  const closeBtn = document.getElementById('close-btn');
  searchIcon.onclick = function() {
    searchModal.style.display = 'block';
    setTimeout(() => {
      searchModal.classList.add('active');
    }, 10);
    document.getElementById('search-input').focus();
  };
  function closeSearchModal() {
    searchModal.classList.remove('active');
    setTimeout(() => {
      searchModal.style.display = 'none';
      document.getElementById('search-input').value = '';
    }, 300);
  }
  closeBtn.addEventListener('click', function() {
    closeSearchModal();
    input.value = ''; 
    resultContainer.innerHTML = ''; 
    resultContainer.style.display = 'none';
  });
  modalMask.addEventListener('click', function() {
    closeSearchModal();
    input.value = ''; 
    resultContainer.innerHTML = ''; 
    resultContainer.style.display = 'none';
  });
  function debounce(fn, delay = 300) {
    let timer = null;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, arguments);
      }, delay);
    };
  }
  function doSearch(){
    const keyword = input.value.trim().toLowerCase();
    resultContainer.innerHTML = '';
    let matchResult = [];
    linkData.forEach(book => {
      const title = book.bookTitle.toLowerCase();
      const author = book.bookAuthor.toLowerCase();
      if (title.includes(keyword) || author.includes(keyword)) {
        matchResult.push({
          title: book.bookTitle,
          author: book.bookAuthor,
          searchUrl: book.searchUrl,
          code: book.code,
          linkUrl: book.linkUrl
        });
    }});
    const matchResultsorted = matchResult.sort((a, b) => {
          return b.code.localeCompare(a.code);
        });
    if (matchResultsorted.length > 0) {
      let resultHtml = `<div class="book-result-list">`;
      matchResultsorted.forEach((item) => {
      resultHtml += `<div class="book-result-item">
      <a href="${item.linkUrl}" class="grid-link" target="_blank">
        <img src="${item.searchUrl}" alt="封面" class="book-item-img" >
        <div id="bookabinfo">
          <p style='margin: 0;font-weight: bold;'>
            <span>${item.title}</span>
          </p>
          <p style='margin: 4px 0 0 0;'>
            <span>${item.author}</span>
          </p>
        </div>
      </div></a>`;
    });
      resultContainer.innerHTML = resultHtml;
    } else {
      resultContainer.innerHTML = `<span style='color: #ef4444;'>没有找到包含「${keyword}」的内容！</span>`;
    }
    };
  function handleAutoSearch() {
    const keyword = input.value.trim().toLowerCase();
    resultContainer.innerHTML = '';
    resultContainer.style.padding = '10px 10px';
    resultContainer.style.margin = '16px auto';
    if (!keyword) {
      resultContainer.style.display = 'none';
      return;
    }
    resultContainer.style.display = 'block';
    doSearch();
  }
  function handleManualSearch() {
    const keyword = input.value.trim().toLowerCase();
    resultContainer.innerHTML = '';
    resultContainer.style.padding = '10px 10px';
    resultContainer.style.margin = '16px auto';
    resultContainer.style.display = 'block';
    if (!keyword) {
      resultContainer.innerHTML = "<span style='color: #ef4444;'>请先输入书名或作者！</span>";
      resultContainer.style.padding = '0';
      resultContainer.style.margin = '0 auto';
      return;
    }
    doSearch();
  }
  input.oninput = debounce(handleAutoSearch, 300);
  btn.onclick = handleManualSearch;
  input.onkeydown = function(e) {
    if (e.key === 'Enter') {
      handleManualSearch();
    }
  };
  
});

function booklistShow(){
function updateBgSubText() {
  const bgSubText = document.querySelector('#totalnum');
  const totalCount = linkData.length;
  bgSubText.textContent = `Numbers ${totalCount}`;
}
window.addEventListener('DOMContentLoaded', () => {
  updateBgSubText();
});
const pageSize = 12;
let currentPage = 1;
const totalLinks = linkData.length;
const totalPages = Math.ceil(totalLinks / pageSize);
function renderPageNumbers() {
  const pageNumbersContainer = document.getElementById('pageNumbers');
  pageNumbersContainer.innerHTML = '';
  const maxVisiblePages = 9;
  let startPage = 1;
  let endPage = totalPages;
  if (totalPages > maxVisiblePages) {
    const halfVisible = Math.floor(maxVisiblePages / 2);
    if (currentPage <= halfVisible + 1) {
      endPage = maxVisiblePages;
    } 
    else if (currentPage >= totalPages - halfVisible) {
      startPage = totalPages - maxVisiblePages + 1;
    } 
    else {
      startPage = currentPage - halfVisible;
      endPage = currentPage + halfVisible;
    }
  }
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('span');
    pageBtn.textContent = i;
    pageBtn.className = 'page-number';
    if (i === currentPage) {
      pageBtn.classList.add('active');
    }
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      renderPage(currentPage);
      scrollToMainContentTop();
    });
    pageNumbersContainer.appendChild(pageBtn);
  }
  if (startPage > 1) {
    const ellipsisStart = document.createElement('span');
    ellipsisStart.textContent = '...';
    ellipsisStart.className = 'page-ellipsis';
    pageNumbersContainer.insertBefore(ellipsisStart, pageNumbersContainer.firstChild);
    const firstPageBtn = document.createElement('span');
    firstPageBtn.textContent = 1;
    firstPageBtn.className = 'page-number';
    firstPageBtn.addEventListener('click', () => {
      currentPage = 1;
      renderPage(currentPage);
      scrollToMainContentTop();
    });
    pageNumbersContainer.insertBefore(firstPageBtn, ellipsisStart);
  }
  if (endPage < totalPages) {
    const ellipsisEnd = document.createElement('span');
    ellipsisEnd.textContent = '...';
    ellipsisEnd.className = 'page-ellipsis';
    pageNumbersContainer.appendChild(ellipsisEnd);
    const lastPageBtn = document.createElement('span');
    lastPageBtn.textContent = totalPages;
    lastPageBtn.className = 'page-number';
    lastPageBtn.addEventListener('click', () => {
      currentPage = totalPages;
      renderPage(currentPage);
      scrollToMainContentTop();
    });
    pageNumbersContainer.appendChild(lastPageBtn);
  }
}
function scrollToMainContentTop() {
  const mainContent = document.querySelector('#main_content'); 
  const rect = mainContent.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const dynamicOffset = viewportHeight * 0.16;
  const scrollTarget = window.scrollY + rect.top - dynamicOffset;
  window.scrollTo(0, scrollTarget);
}
function adjustTextSizeOnWrap() {
  const textWraps = document.querySelectorAll('.book-link #abbook');
  textWraps.forEach(wrap => {
    const textElements = wrap.querySelectorAll('p');
    textElements.forEach(el => {
      const fontSize = parseFloat(getComputedStyle(el).fontSize);
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || fontSize * 1.2;
      const singleLineHeight = lineHeight;
      const actualHeight = el.offsetHeight;
      if (actualHeight > singleLineHeight + 2) {
        el.style.fontSize = `${fontSize - 2}px`;
      } else {
        el.style.fontSize = '';
      }
    });
  });
}
function getSortedLinkData() {
  const sortedData = JSON.parse(JSON.stringify(linkData));
  sortedData.sort((a, b) => {
    return b.code.localeCompare(a.code, undefined, { numeric: true, sensitivity: 'base' });
  });
  return sortedData;
}
function renderPage(pageNum) {
  const linkList = document.querySelector('.link-list');
  linkList.innerHTML = '';
  const start = (pageNum - 1) * pageSize;
  const end = Math.min(pageNum * pageSize - 1, totalLinks - 1);
  const sortedLinkData = getSortedLinkData();
  for (let i = start; i <= end; i++) {
    const link = sortedLinkData[i];
    const linkItem = document.createElement('div');
    linkItem.className = 'book-link';
    linkItem.innerHTML = `<a href="${link.linkUrl}" class="bookhome-link">
      <img src="${link.imgUrl}" alt="封面" class="book-shelter-display" >
      <div id="abbook">
        <p style='margin: 0;font-weight: bold;'>
          <span>${link.bookTitle}</span>
        </p>
        <p style='margin: 4px 0 0 0;'>
          <span>${link.bookAuthor}</span>
        </p>
        <p style='margin: 4px 0 0 0;'>
          <span>${link.code}</span>
        </p>
      </div>
      </div></a>`;
    linkList.appendChild(linkItem);
  }
  document.getElementById('prevPage').disabled = (pageNum === 1);
  document.getElementById('nextPage').disabled = (pageNum === totalPages);
  renderPageNumbers();
  requestAnimationFrame(() => {
    calcMaxCount(); 
    linkList.style.visibility = 'visible';
    adjustTextSizeOnWrap();
  });
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
if (totalPages > 1) {
  document.getElementById('pagination').style.display = 'block';
}
renderPage(1);
const BOOK_LINK_WIDTH = 200;
const GAP_MIN = 10;
const GAP_MAX = 60;
const CONTAINER_SELECTOR = ".link-list";
function calcMaxCount() {
  const container = document.querySelector(CONTAINER_SELECTOR);
  const containerStyle = getComputedStyle(container);
  const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
  const paddingRight = parseFloat(containerStyle.paddingRight) || 0;
  const containerWidth = container.clientWidth - paddingLeft - paddingRight;
  let maxCount = Math.floor((containerWidth + GAP_MIN) / (BOOK_LINK_WIDTH + GAP_MIN));
  maxCount = Math.max(maxCount, 1); 
  let actualGap;
  if (maxCount === 1) {
    actualGap = GAP_MIN;
    container.style.gap = `0 ${actualGap}px`;
  } else {
    actualGap = (containerWidth - maxCount * BOOK_LINK_WIDTH) / (maxCount - 1);
    actualGap = Math.min(actualGap, GAP_MAX); 
    actualGap = Math.max(actualGap, GAP_MIN);
  }
  container.style.paddingLeft = "0";
  container.style.paddingRight = "0";
  const totalContentWidth = maxCount * BOOK_LINK_WIDTH + (maxCount - 1) * actualGap;
  const sidePadding = Math.max((containerWidth - totalContentWidth) / 2, 0);
  container.style.paddingLeft = `${sidePadding}px`;
  container.style.paddingRight = `${sidePadding}px`;
  container.style.gap = `${actualGap}px`;
  document.querySelectorAll(".book-link").forEach(item => {
    item.style.width = `${BOOK_LINK_WIDTH}px`;
  });
}
function debounceCalcMaxCount() {
  clearTimeout(resizeDebounceTimer);
  resizeDebounceTimer = setTimeout(calcMaxCount, DEBOUNCE_DELAY);
}
window.onload = calcMaxCount;

window.addEventListener("resize", calcMaxCount);
}




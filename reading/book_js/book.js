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
const scrollThreshold = 100;
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

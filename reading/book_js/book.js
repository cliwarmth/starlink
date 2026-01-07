
/* 导航栏滚动转换模式 */
const nav = document.getElementById('nav');
// 监听页面滚动
window.addEventListener('scroll', function() {
// 当滚动距离超过50px时（可自定义这个值）
  if (window.scrollY > 50) {
    nav.classList.add('scrolled'); // 添加滚动后样式
  } 
  else {
    nav.classList.remove('scrolled'); // 移除，恢复初始样式
  }
}
);

/* 获取当前年份 */
const currentYear = new Date().getFullYear();
// 把年份插入到指定元素中
document.getElementById('currentyear').textContent = currentYear;


/* go_up滚动时出现动画 */
// 1. 获取按钮容器元素
const goup = document.getElementById('go_up');
// 2. 定义滚动阈值（滚动超过该距离才显示，可自定义：100/200/300px）
const scrollThreshold = 100;
// 3. 监听页面滚动事件
window.onscroll = function() {
  // 获取当前滚动垂直距离（兼容所有浏览器）
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  // 4. 阈值判断：滚动距离≥阈值则显示，否则隐藏
  if (scrollTop >= scrollThreshold) {
    goup.classList.add('show'); // 添加激活类，显示按钮
  } else {
    goup.classList.remove('show'); // 移除激活类，隐藏按钮
  }
};
/* 滚动修改出现动画时长 */
document.addEventListener('DOMContentLoaded', function() {
  // 页面加载完成后执行（此时刷新阶段已过，后续滚动用0.5秒动画）
  setTimeout(function() {
    goup.style.transition = 'all 0.5s ease';
  }, 1100);
  // 若你需要修改隐藏时的动画也生效，这一行即可全覆盖，无需额外配置
});
/* 滚动到顶部 */
goup.addEventListener('click', function() {
    // 1. 定义速度控制参数（关键：调整这两个值可改变滚动速度）
    const step = 50; // 每次滚动的步长（像素），值越大速度越快（推荐：10-50）
    const interval = 6; // 滚动间隔（毫秒），值越小越流畅（推荐：8-20）

    // 2. 获取当前滚动位置
    let currentScrollTop = window.scrollY || document.documentElement.scrollTop;

    // 3. 定时器实现自定义速度滚动
    const scrollTimer = setInterval(function() {
      // 每次向上滚动 step 个像素
      currentScrollTop -= step;
      // 边界判断：滚动到顶部后停止定时器
      if (currentScrollTop <= 0) {
        currentScrollTop = 0;
        clearInterval(scrollTimer); // 清除定时器，停止滚动
      }
      // 执行滚动
      window.scrollTo(0, currentScrollTop);
    }, interval);
  });









// const testData = [
//   { bookTitle: "CSS 弹性布局实战", bookAuthor: "张三", imgUrl: "./book_img/bc251023.jpg", linkUrl: "#"},  // 书名1 → 作者张三
//   { bookTitle: "Node.js 后端接口搭建", bookAuthor: "李四", imgUrl: "./book_img/bc251023.jpg", linkUrl: "#" }, // 书名2 → 作者李四
//   { bookTitle: "前端搜索功能优化", bookAuthor: "张三", imgUrl: "./book_img/bc251023.jpg", linkUrl: "#" },    // 书名3 → 作者张三
//   { bookTitle: "JavaScript 基础入门", bookAuthor: "王五", imgUrl: "./book_img/bc251023.jpg", linkUrl: "#" },   // 书名4 → 作者王五
//   { bookTitle: "CSS 弹性布局实战2", bookAuthor: "张三", imgUrl: "./book_img/bc251023.jpg", linkUrl: "#" },  // 书名1 → 作者张三
//   { bookTitle: "Node.js 后端接口搭建2", bookAuthor: "李四", imgUrl: "./book_img/bc251023.jpg", linkUrl: "#" }, // 书名2 → 作者李四
//   { bookTitle: "前端搜索功能优化2", bookAuthor: "张三", imgUrl: "./book_img/bc251023.jpg", linkUrl: "#" },    // 书名3 → 作者张三
//   { bookTitle: "JavaScript 基础入门2", bookAuthor: "王五", imgUrl: "./book_img/bc251023.jpg", linkUrl: "#" },  // 书名4 → 作者王五
//   { bookTitle: "CSS 弹性布局实战3", bookAuthor: "张三", imgUrl: "./book_img/bc251023.jpg", linkUrl: "#" },  // 书名1 → 作者张三
//   { bookTitle: "Node.js 后端接口搭建3", bookAuthor: "李四", imgUrl: "./book_img/bc251023.jpg", linkUrl: "#" }, // 书名2 → 作者李四
//   { bookTitle: "前端搜索功能优化3", bookAuthor: "张三", imgUrl: "./book_img/bc251023.jpg", linkUrl: "#" },    // 书名3 → 作者张三
//   { bookTitle: "JavaScript 基础入门3", bookAuthor: "王五", imgUrl: "./book_img/bc251023.jpg", linkUrl: "#"  }   // 书名4 → 作者王五
// ];
 
let testData = null; // 全局变量，初始值随便设，比如null
本地不能尝试，有网络协议限制
// 2. fetch读取数据并赋值给全局变量
fetch("/starlink/reading/search.json")
  .then(res => res.json())
  .then(data => {
    testData = data; // 把读取到的JSON数据，存到myJsonData里
  });



window.onload = function() {
  // 获取输入框和搜索按钮（一步获取，不复杂）
  const input = document.getElementById('search-input');
  const btn = document.getElementById('search-btn');
  const resultContainer = document.getElementById('result-container');
// 步骤3.1：获取所有需要的元素
const searchIcon = document.getElementById('search_button'); // 搜索图标
const searchModal = document.getElementById('search-modal'); // 弹窗总容器
const modalMask = document.querySelector('.modal-mask'); // 弹窗遮罩
const closeBtn = document.getElementById('close-btn'); // 关闭按钮


// 2. 显示弹窗（进入动画：仅这几行）
  searchIcon.onclick = function() {
    searchModal.style.display = 'block';
    setTimeout(() => {
      searchModal.classList.add('active');
    }, 10);
    document.getElementById('search-input').focus();
  };

  // 3. 隐藏弹窗（退出动画：仅这几行）
  function closeSearchModal() {
    searchModal.classList.remove('active');
    setTimeout(() => {
      searchModal.style.display = 'none';
      document.getElementById('search-input').value = '';
    }, 300);
  }


// // 步骤3.2：弹窗显示函数
// function showModal() {
//     searchModal.style.display = 'block'; // 显示弹窗（把display从none改为block）
//     // 显示弹窗后，自动聚焦到搜索框，方便用户直接输入（提升体验）
//     document.getElementById('search-input').focus();
// }

// // 步骤3.3：弹窗隐藏函数
// function hideModal() {
//     searchModal.style.display = 'none'; // 隐藏弹窗（恢复display:none）
//     // 隐藏弹窗后，清空搜索框内容（下次打开弹窗更干净）
//     document.getElementById('search-input').value = '';
// }

// 步骤3.4：绑定事件，控制弹窗显示/隐藏
// 事件1：点击搜索图标，显示弹窗
// searchIcon.addEventListener('click', function() {
//     showModal();
// });

// 事件2：点击关闭按钮，隐藏弹窗
closeBtn.addEventListener('click', function() {
    closeSearchModal();
    // 新增1：清空搜索输入框的内容
  input.value = ''; 
  // 新增2：清空结果容器的显示内容
  resultContainer.innerHTML = ''; 
  resultContainer.style.display = 'none';
});

// 事件3：点击遮罩层，隐藏弹窗
modalMask.addEventListener('click', function() {
   closeSearchModal();
    // 新增1：清空搜索输入框的内容
  input.value = ''; 
  // 新增2：清空结果容器的显示内容
  resultContainer.innerHTML = ''; 
  resultContainer.style.display = 'none';
});

// 4. 可选：防抖函数（避免快速打字时频繁触发搜索，延迟300ms执行）
  function debounce(fn, delay = 300) {
    let timer = null;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, arguments);
      }, delay);
    };
  }

  // 3. 给按钮绑定点击事件（核心：点击后执行匹配逻辑）
  function doSearch(){
    // 4. 获取输入框中输入的「要匹配的字/关键词」
    const keyword = input.value.trim().toLowerCase(); // 关键词转小写，不区分大小写匹配
    resultContainer.innerHTML = ''; // 清空上次搜索结果

    // 6. 核心匹配逻辑：遍历测试数据，找出包含关键词的内容
    let matchResult = []; // 用来存匹配到的内容
    testData.forEach(book => {
      const title = book.bookTitle.toLowerCase();
      const author = book.bookAuthor.toLowerCase();
      const originalTitle = book.bookTitle;
      const originalAuthor = book.bookAuthor;
      // 判断：当前数据是否包含要匹配的关键词（不区分大小写，更友好）
      if (title.includes(keyword) || author.includes(keyword)) {
        matchResult.push({
          title: originalTitle,
          author: originalAuthor,
          imgUrl: book.imgUrl // 同步获取图片地址
        });
    }});

    // 7. 显示匹配结果（用alert弹窗，最直观，不用渲染到页面）
    if (matchResult.length > 0) {
      // let resultHtml = `<span style='color: #1f2937; font-weight: bold;'>共找到 ${matchResult.length} 条匹配结果：</span>`;
      // resultHtml += `<div class="book-result-list">`;
      let resultHtml = `<div class="book-result-list">`;
      matchResult.forEach((item, index) => {
      // 核心：添加 <img> 标签，使用 book-item-img 样式，新增容错处理（图片加载失败显示默认图）
      resultHtml += `<div class="book-result-item"> <!-- 使用 flex 布局，图片和文字横向排列 -->
      <a href="${item.linkUrl}" class="grid-link" target="_blank">
        <img src="${item.imgUrl}" alt="${item.title} 封面" class="book-item-img" > <!-- 加载失败显示默认图 -->
        <div> <!-- 文字容器，包裹书名和作者 -->
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
      // 无结果提示（原有代码不变）
      resultContainer.innerHTML = `<span style='color: #ef4444;'>没有找到包含「${keyword}」的内容！</span>`;
    }
  };
function handleAutoSearch() {
    const keyword = input.value.trim().toLowerCase();
    resultContainer.innerHTML = '';
    // resultContainer.style.border = '2px solid #e5e7eb';
    resultContainer.style.padding = '10px 10px';
    resultContainer.style.margin = '16px auto';

    // 无关键词：直接清空结果并隐藏result-container，不显示提示
    if (!keyword) {
      resultContainer.style.display = 'none';
      return;
    }

    // 有关键词：显示result-container + 执行公共搜索逻辑
    resultContainer.style.display = 'block';
    doSearch();
  }
function handleManualSearch() {
    const keyword = input.value.trim().toLowerCase();
    resultContainer.innerHTML = '';
    // resultContainer.style.border = '2px solid #e5e7eb';
    resultContainer.style.padding = '10px 10px';
    resultContainer.style.margin = '16px auto';

    // 先显示result-container
    resultContainer.style.display = 'block';

    // 无关键词：显示提示（仅手动触发时执行此逻辑）
    if (!keyword) {
      resultContainer.innerHTML = "<span style='color: #ef4444;'>请先输入书名或作者！</span>";
      // resultContainer.style.border = 'none';
      resultContainer.style.padding = '0';
      resultContainer.style.margin = '0 auto';
      return;
    }

    // 有关键词：执行公共搜索逻辑
    doSearch();
  }
// 若不需要防抖，直接写 input.oninput = handleSearch;
  input.oninput = debounce(handleAutoSearch, 300);

  // 7. 原有搜索按钮点击事件（保留，兼容手动点击习惯）
  btn.onclick = handleManualSearch;

  // 8. 原有回车键触发（保留，兼容键盘操作习惯）
  input.onkeydown = function(e) {
    if (e.key === 'Enter') {
      handleManualSearch();
    }
  };



};
document.addEventListener('DOMContentLoaded', function() {
  // 初始化所有 Fancybox 分组，强制开启缩略图
  Fancybox.bind("[data-fancybox]", {
    // 显式开启缩略图（核心配置）
    thumbnails: {
      showOnStart: true, // 打开预览时默认显示缩略图
      toggle: true, // 显示“切换缩略图”按钮
      thumbCompress: false // 避免缩略图压缩异常
    },
    // 其他保留配置（如之前的隐藏过滤逻辑）
    clickOutside: "close",
    animationEffect: "fade"
  });

});



// Carousel
const groupSlides = document.querySelector(".group_slides");
let cardWidth = 400;
let activeIndex = 3;

// 卡片点击事件
function cardAddClick() {
    const cards = document.querySelectorAll(".carousel_card");
    cards.forEach((card, index) => {
        card.onclick = (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            handleCardClick(index);
        };
    });
}

function handleCardClick(index) {
    // 如果点击的不是中间的卡片，先关闭当前中间卡片的书，再移动到新卡片
    if (activeIndex !== index) {
        const previousIndex = activeIndex;
        activeIndex = index;
        closeActiveCardBook(previousIndex);
        updateCarousel();
    } else {
        // 如果已经是中间的卡片，打开/关闭当前中间卡片的书
        toggleActiveCardBook();
    }
}

function toSlide(index) {
    activeIndex = index;
    updateCarousel();
}

function updateCarousel() {
    groupSlides.style.transform = `translateX(calc(60vw - ${activeIndex * cardWidth + cardWidth / 2}px))`;
    const cards = document.querySelectorAll(".carousel_card");
    const titles = document.querySelectorAll(".carousel_title");
    cards.forEach((card, index) => {
        const isActive = activeIndex === index;
        const rotateY = (activeIndex - index) * 60;
        const scale = isActive ? 1 : 0.8;
        card.style.transform = `rotateY(${rotateY}deg) scale(${scale})`;
    });
    titles.forEach((title, index) => {
        const isActive = activeIndex === index;
        title.style.filter = isActive ? "blur(0)" : "blur(10px)";
        title.style.opacity = isActive ? 1 : 0.5;
    });
}



// 3D Book
const carouselItems = document.querySelectorAll(".carousel_item");

function getCardContainer(index) {
    const item = carouselItems[index];
    return item ? item.querySelector(".group_book_3d") : null;
}

function getCardItems(index) {
    const item = carouselItems[index];
    return item ? item.querySelectorAll(".group_book_3d_item") : [];
}

function updateContainerState(index) {
    const container = getCardContainer(index);
    const items = getCardItems(index);
    if (!container || items.length === 0) return;
    // 排除最后一项（例如封底），只判断真实页面是否有打开状态
    const pages = Array.from(items).slice(0, -1);
    const anyOpen = pages.some((item) => item.classList.contains("is_open"));
    if (anyOpen) {
        container.classList.add("book_open");
        // 给整个 carousel_item 也添加 open 类，用于 CSS 调整宽度
        const carouselItem = carouselItems[index];
        if (carouselItem) {
            carouselItem.classList.add("book_open");
        }
    } else {
        container.classList.remove("book_open");
        const carouselItem = carouselItems[index];
        if (carouselItem) {
            carouselItem.classList.remove("book_open");
        }
    }
}

function closeActiveCardBook(index = activeIndex) {
    const items = getCardItems(index);
    // 关闭时只清除真实页面的打开状态，保留最后一项（封底）不受影响
    Array.from(items).slice(0, -1).forEach((item) => item.classList.remove("is_open"));
    updateContainerState(index);
}

function openNextPage(index = activeIndex) {
    const items = getCardItems(index);
    // 逐页打开时不包含最后一项
    const pages = Array.from(items).slice(0, -1);
    const nextPage = pages.find((item) => !item.classList.contains("is_open"));
    if (nextPage) {
        nextPage.classList.add("is_open");
        updateContainerState(index);
    }
}


function toggleActiveCardBook() {
    const items = getCardItems(activeIndex);
    // 排除最后一项，判断真实页面是否都已打开
    const pages = Array.from(items).slice(0, -1);
    const allOpen = pages.length > 0 && pages.every((item) => item.classList.contains("is_open"));
    if (allOpen) {
        closeActiveCardBook();
    } else {
        openNextPage(activeIndex);
    }
}

// 点击其他地方只关闭当前中间卡片的打开状态
document.addEventListener("click", () => {
    closeActiveCardBook();
});

// 初始化卡片点击事件
cardAddClick();
updateCarousel();
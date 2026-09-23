function nextPage(i){
    const from = document.getElementById("Section"+i);
    const to = document.getElementById("Section"+(i+1));

    const text1 = document.getElementById("bgText"+i);
    const text2 = document.getElementById("bgText"+(i+1));

    from.style.transition = "all 1s cubic-bezier(.31,.01,.66,-0.59)";
    to.style.transition = "all 1s cubic-bezier(.33,1.53,.69,.99)";
    from.style.transform = "translateX(-100%) rotate(-90deg)";
    from.style.filter = "blur(50px)";
    setTimeout(() => {
        text1.style.transform = "translateX(-100%)";
    }, 500);
    setTimeout(() => {
        from.style.display = "none";
        to.style.display = "flex";
        text2.style.transform = "translateX(0)";
    }, 1500);
    setTimeout(() => {
        to.style.transform = "translateX(0%) rotate(0deg)";
        to.style.filter = "blur(0)";
    }, 2000);
}

function prevPage(i){
    const from = document.getElementById("Section"+(i+1));
    const to = document.getElementById("Section"+i);

    const text1 = document.getElementById("bgText"+(i+1));
    const text2 = document.getElementById("bgText"+i);

    from.style.transition = "all 1s cubic-bezier(.31,.01,.66,-0.59)";
    to.style.transition = "all 1s cubic-bezier(.33,1.53,.69,.99)";
    from.style.transform = "translateX(100%) rotate(90deg)";
    from.style.filter = "blur(50px)";
    setTimeout(() => {
        text1.style.transform = "translateX(100%)";
    }, 500);
    setTimeout(() => {
        from.style.display = "none";
        to.style.display = "flex";
        text2.style.transform = "translateX(0)";
    }, 1500);
    setTimeout(() => {
        to.style.transform = "translateX(0%) rotate(0deg)";
        to.style.filter = "blur(0)";
    }, 2000);
}

const TOTAL_CHAPTERS = 5;

// 安全 DOM 元素代理，防止存取已刪除之 6~18 章節元素時引發 null 錯誤
const _rawGetElementById = document.getElementById.bind(document);
const _dummyElement = new Proxy(document.createElement("div"), {
    get(target, prop) {
        if (prop === 'style') {
            return new Proxy({}, {
                get: () => '',
                set: () => true
            });
        }
        if (prop === 'classList') {
            return {
                add: () => {},
                remove: () => {},
                contains: () => false,
                toggle: () => {}
            };
        }
        if (prop === 'children') {
            return [_dummyElement, _dummyElement];
        }
        if (typeof target[prop] === 'function') {
            return target[prop].bind(target);
        }
        return target[prop] !== undefined ? target[prop] : (() => {});
    },
    set() {
        return true;
    }
});

document.getElementById = function(id) {
    const el = _rawGetElementById(id);
    return el || _dummyElement;
};

const menuScorller = document.getElementById("menuScroller");
const readmoreBtns = document.getElementsByClassName("readmore");

let imgNum = [1, 1, 1, 1, 1];

document.addEventListener("DOMContentLoaded", () => {
    for(let i = 0; i < TOTAL_CHAPTERS; i++){
        const menuScrollerItem = document.createElement("div");
        menuScrollerItem.classList.add("menuScrollerItem");
        menuScorller.appendChild(menuScrollerItem);
        if (readmoreBtns[i]) {
            readmoreBtns[i].onclick = () => {readmore(i+1)};
        }
    }

    for(let i = 0; i < TOTAL_CHAPTERS; i++){
        const ch = document.getElementById("ch"+(i+1));
        if(i >= 0 && i <= 3){
            ch.classList.remove("focusCh", "unfocusCh");
            ch.classList.add("focusCh");
        }
        else{
            ch.classList.remove("focusCh", "unfocusCh");
            ch.classList.add("unfocusCh");
        }

        // 章節 hover 預先抓取 content 快取，實現無痕極速載入
        const chNum = i + 1;
        const chGroup = document.getElementById("ch_g_" + chNum);
        const readmoreBox = document.getElementById("readmore" + chNum);
        const nextBtn = document.getElementById("ch_next" + chNum);
        const triggerPrefetch = () => prefetchChapterContent(chNum);

        if (chGroup) {
            chGroup.addEventListener("mouseenter", triggerPrefetch, { passive: true });
            chGroup.addEventListener("touchstart", triggerPrefetch, { passive: true });
        }
        if (ch) {
            ch.addEventListener("mouseenter", triggerPrefetch, { passive: true });
        }
        if (readmoreBox) {
            readmoreBox.addEventListener("mouseenter", triggerPrefetch, { passive: true });
        }
        if (nextBtn) {
            nextBtn.addEventListener("mouseenter", () => prefetchChapterContent(chNum + 1), { passive: true });
        }
    }
});

const chContainer = document.getElementById("chContainer");

menuScorller.addEventListener("scroll", () => {
    let scrollRatio = menuScorller.scrollTop / (menuScorller.scrollHeight || 1);
    let vx = -scrollRatio * 400 * TOTAL_CHAPTERS;
    let vx2 = scrollRatio * 1500;
    let index = Math.round(scrollRatio * TOTAL_CHAPTERS);
    
    chContainer.style.transform = `translateX(${vx}px)`;
    scrollBar.style.marginLeft = vx2 + "px";

    for(let i = 0; i < TOTAL_CHAPTERS; i++){
        const ch = document.getElementById("ch"+(i+1));
        if(!ch) continue;
        if(i >= index && i <= index + 3){
            ch.classList.remove("focusCh", "unfocusCh");
            ch.classList.add("focusCh");
        }
        else{
            ch.classList.remove("focusCh", "unfocusCh");
            ch.classList.add("unfocusCh");
        }
    }
});

const scrollBar = document.getElementById("scrollBar");
const scrollBarBG = document.getElementById("scrollBarBG");

let isDragging = false;
let startX = 0;
let startScrollLeft = 0;

scrollBar.addEventListener("mousedown", (e) => {
    if(!isOpen){
        e.preventDefault();
        isDragging = true;
        startX = e.clientX;
        startScrollLeft = menuScorller.scrollTop;
        scrollBar.style.cursor = "grabbing";
    }
});

document.addEventListener("mousemove", (e) => {
    if(!isDragging || isOpen) return;
    
    e.preventDefault();
    const deltaX = e.clientX - startX;
    const scrollRatio = deltaX / 1500;
    menuScorller.scrollTop = startScrollLeft + (scrollRatio * menuScorller.scrollHeight);
});

document.addEventListener("mouseup", () => {
    if(isDragging){
        isDragging = false;
        scrollBar.style.cursor = "grab";
    }
});

scrollBarBG.addEventListener("click", (e) => {
    if(!isOpen && e.target === scrollBarBG){
        const rect = scrollBarBG.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const targetThumbLeft = Math.max(0, Math.min(300, clickX - 600));
        const maxScroll = menuScorller.scrollHeight - menuScorller.clientHeight;
        menuScorller.scrollTop = (targetThumbLeft / 300) * maxScroll;
    }
});

let isOpen = false;
let imgLoopTimer;
let tempN = 0;
let imgH;
let tempI;
let isSwitching = false;

chContainer.addEventListener("wheel", (e) => {
    if(!isOpen){
        e.preventDefault();
        menuScorller.scrollTop += e.deltaY*(1080/400);
    }
}, { passive: false });


const contentCache = new Map();
const prefetchingSet = new Set();

async function prefetchChapterContent(i) {
    if (contentCache.has(i) || prefetchingSet.has(i)) return;
    const cached = sessionStorage.getItem(`cached_content_${i}`);
    if (cached) {
        contentCache.set(i, cached);
        return;
    }
    prefetchingSet.add(i);
    try {
        const res = await fetch(`/get-content/${i}`);
        if (res.ok) {
            const html = await res.text();
            contentCache.set(i, html);
            sessionStorage.setItem(`cached_content_${i}`, html);
        }
    } catch (err) {
        console.log(`預取章節 ${i} 內容失敗:`, err);
    } finally {
        prefetchingSet.delete(i);
    }
}

function applyCachedChapterTitles() {
    const cached = sessionStorage.getItem('cached_chapters') || localStorage.getItem('cached_chapters');
    if (cached) {
        try {
            const chapters = JSON.parse(cached);
            for (let i = 1; i <= TOTAL_CHAPTERS; i++) {
                const chData = chapters.find(c => c.chapter_number === i);
                if (chData) {
                    setChapterSubtitle(i, chData.title || `Chapter ${i}`);
                }
            }
        } catch (e) {}
    }
}

function setChapterSubtitle(i, titleText) {
    const subEl = document.getElementById("ch" + i + "_subtitle");
    if (!subEl) return;
    subEl.innerHTML = `<span class="ch_subtitle_text">${titleText}</span>`;
    requestAnimationFrame(() => {
        checkSubtitleOverflow(subEl);
    });
}

function checkSubtitleOverflow(subEl) {
    if (!subEl) return;
    const textSpan = subEl.querySelector(".ch_subtitle_text");
    if (!textSpan) return;

    // Reset overflow properties to measure true text size
    subEl.classList.remove("is-overflowing");
    subEl.style.removeProperty("--scroll-dist");
    subEl.style.removeProperty("--scroll-dur");
    subEl.style.removeProperty("--mask-fade");

    // Force layout update so textSpan dimensions reflect any font/width changes
    void textSpan.offsetWidth;

    const containerWidth = subEl.clientWidth || (subEl.style.width ? parseInt(subEl.style.width) : 200);
    const textWidth = textSpan.scrollWidth;

    if (textWidth > containerWidth + 4) {
        const diff = textWidth - containerWidth;
        const dur = Math.max(5, Math.min(20, diff / 25)); // smooth reading speed
        const fade = containerWidth > 400 ? 36 : 20;
        subEl.style.setProperty("--mask-fade", fade + "px");
        subEl.style.setProperty("--scroll-dist", (diff + fade) + "px");
        subEl.style.setProperty("--scroll-dur", dur + "s");
        subEl.classList.add("is-overflowing");
    } else {
        subEl.classList.remove("is-overflowing");
    }
}

function refreshAllSubtitleOverflow() {
    for (let i = 1; i <= TOTAL_CHAPTERS; i++) {
        const subEl = document.getElementById("ch" + i + "_subtitle");
        if (subEl) checkSubtitleOverflow(subEl);
    }
}

async function syncChapterTitles() {
    try {
        const response = await fetch('/api/chapters');
        if (response.ok) {
            const chapters = await response.json();
            for (let i = 1; i <= TOTAL_CHAPTERS; i++) {
                const subEl = document.getElementById("ch" + i + "_subtitle");
                const chCard = document.getElementById("ch" + i);
                const readmoreBtn = document.getElementById("readmore" + i);
                const chData = chapters.find(c => c.chapter_number === i);

                if (chData) {
                    setChapterSubtitle(i, chData.title || `Chapter ${i}`);
                    if (chCard) {
                        chCard.style.opacity = "";
                        chCard.style.filter = "";
                    }
                    if (readmoreBtn) {
                        const span = readmoreBtn.querySelector("span");
                        if (span) span.innerText = "READ MORE";
                    }
                } else {
                    // Chapter is deleted in database
                    setChapterSubtitle(i, "已刪除");
                    if (chCard) {
                        chCard.style.opacity = "0.45";
                        chCard.style.filter = "grayscale(80%)";
                    }
                    if (readmoreBtn) {
                        const span = readmoreBtn.querySelector("span");
                        if (span) span.innerText = "已刪除";
                    }
                }
            }
        }
    } catch (err) {
        console.log('同步章節標題失敗:', err);
    }
}
applyCachedChapterTitles();
syncChapterTitles();

if (document.fonts) {
    document.fonts.ready.then(() => {
        refreshAllSubtitleOverflow();
    });
}
window.addEventListener("resize", refreshAllSubtitleOverflow);

async function loadContent(content, i) {
    // 優先讀取記憶體快取或 sessionStorage，實現 0ms 無痕瞬間載入
    const cached = contentCache.get(i) || sessionStorage.getItem('cached_content_' + i);
    if (cached) {
        content.innerHTML = cached;
        contentCache.set(i, cached);
        return;
    }

    try {
        const response = await fetch('/get-content/' + i);
        const text = await response.text();
        contentCache.set(i, text);
        sessionStorage.setItem('cached_content_' + i, text);
        content.innerHTML = text;
    } catch (error) {
        console.error('讀取文件失敗:', error);
        content.innerHTML = '<p>無法載入內容，請使用node.js啟動server.js</p>';
    }
}


function readmore(i) {
    let index = Math.round(menuScorller.scrollTop/menuScorller.scrollHeight*TOTAL_CHAPTERS);
    let diff = index - i;
    if (diff < -4) {
        index = i - 4;
        diff = -4;
        menuScorller.scrollTo(0, (index / TOTAL_CHAPTERS) * menuScorller.scrollHeight);
    } else if (diff > -1) {
        index = i - 1;
        diff = -1;
        menuScorller.scrollTo(0, (index / TOTAL_CHAPTERS) * menuScorller.scrollHeight);
    }
    const scrollBarBG = document.getElementById("scrollBarBG");
    const backBtn = document.getElementById("backBtn");
    const menuContainer = document.getElementById("menuContainer");
    let ch1, ch2, ch3, ch4, ch5, bg, title, subtitle, icon, closeBtn, slide1, slide2, nextBtn, content, fullscreenBtn, fullscreenImagesG, fullscreenImagesContainer;
    tempI = i;
    isOpen = true;

    bg = document.getElementById("ch"+i+"_bg");
    title = document.getElementById("ch"+i+"_title");
    subtitle = document.getElementById("ch"+i+"_subtitle");
    subtitle.classList.remove("is-overflowing");
    icon = document.getElementById("ch"+i+"_icon");
    closeBtn = document.getElementById("close"+i);
    slide1 = document.getElementById("ch"+i+"_slide_1");
    slide2 = document.getElementById("ch"+i+"_slide_2");
    content = document.getElementById("ch_content");
    fullscreenBtn = document.getElementById("ch_fullscreenBtn");
    fullscreenImagesContainer = document.getElementById("fullscreenImagesContainer");
    fullscreenImagesG = document.getElementsByClassName("fullscreenImagesG");
    loadContent(content,i);

    if(i < TOTAL_CHAPTERS){
        nextBtn = document.getElementById("ch_next"+i);
        nextBtn.style.transitionDuration = "1s";
    }

    bg.style.transitionDuration = "1.5s";
    title.style.transitionDuration = "1.5s";
    subtitle.style.transitionDuration = "1.5s";
    icon.style.transitionDuration = "1.5s";
    closeBtn.style.transitionDuration = "1.5s";
    backBtn.style.transitionDuration = "1.5s";
    fullscreenImagesG[0].style.transitionDuration = "0s";
    fullscreenImagesG[1].style.transitionDuration = "0s";

    backBtn.style.scale = 0;
    scrollBarBG.style.transform = "translateY(400px)";

    menuScorller.style.pointerEvents = "none";
    

    switch (diff){
        case -1:
            if(i + 4 <= TOTAL_CHAPTERS){
                ch5 = document.getElementById("ch"+(i+4));
                ch5.style.transform = "translateY(1080px)";
                ch5.style.opacity = 0;
                ch5.style.filter = "blur(30px)";
            }
            ch1 = document.getElementById("ch"+i);
            ch2 = document.getElementById("ch"+(i+1));
            ch3 = document.getElementById("ch"+(i+2));
            ch4 = document.getElementById("ch"+(i+3));
            
            ch2.style.transitionDuration = "1.5s";
            ch3.style.transitionDuration = "1.5s";
            ch4.style.transitionDuration = "1.5s";
            
            setTimeout(() => {
                ch2.style.transform = "translateY(1080px)";
                ch2.style.opacity = 0;
                ch2.style.filter = "blur(30px)";

                ch1.classList.remove("chapters");
                ch1.classList.add("chaptersOpen");
                
                bg.style.width = "2000px";
                bg.style.height = "2000px";
                bg.style.marginLeft = "1800px";
                bg.style.marginTop = "1200px";
                bg.style.borderRadius = "160px";

                title.style.fontSize = "100px";
                title.style.marginLeft = "1600px";
                title.style.marginTop = "-600px";
                title.style.scale = "1 0";
                title.style.filter = "blur(30px)";
                title.style.opacity = 0;

                subtitle.style.fontSize = "80px";
                subtitle.style.marginLeft = "2200px";
                subtitle.style.marginTop = "-500px";
                subtitle.style.width = "800px";

                icon.style.width = "600px";
                icon.style.maxHeight = "800px";
                icon.style.borderRadius = "60px";
                icon.style.marginLeft = "600px";
                icon.style.marginTop = "300px";

                


                fullscreenImagesG[0].style.width = icon.style.width;
                fullscreenImagesG[1].style.width = icon.style.width;

                closeBtn.style.display = "block";
                slide1.style.display = "block";
                slide2.style.display = "block";
                nextBtn.style.display = "block";
                content.style.display = "block";
                fullscreenBtn.style.display = "flex";
                

            }, 500);
            setTimeout(() => {
                ch3.style.transform = "translateY(1080px)";
                ch3.style.opacity = 0;
                ch3.style.filter = "blur(30px)";
            }, 600);
            setTimeout(() => {
                ch4.style.transform = "translateY(1080px)";
                ch4.style.opacity = 0;
                ch4.style.filter = "blur(30px)";
            }, 700);
            setTimeout(() => {
                closeBtn.style.marginLeft = "3000px";
                closeBtn.style.opacity = 1;
                closeBtn.style.filter = "blur(0)";
                closeBtn.onclick = () => {closeCh(i)};
            }, 1000);
            setTimeout(() => {
                menuContainer.style.maskMode = "unset";
                nextBtn.style.marginTop = "800px";
                nextBtn.style.opacity = 1;
                nextBtn.style.filter = "blur(0)";
                nextBtn.onclick = () => {nextBtnCh(i)};
            }, 1200);

            setTimeout(() => {
                slide2.style.marginTop = "460px";
                slide2.style.opacity = 0.3;
                slide2.style.filter = "blur(0)";
            }, 1400);
            setTimeout(() => {
                slide1.style.marginTop = "-100px";
                slide1.style.opacity = 1;
                slide1.style.filter = "blur(0)";
                closeBtn.style.transitionDuration = "0.2s";
                if(i < TOTAL_CHAPTERS){
                    nextBtn.style.transitionDuration = "0.2s";
                }
                content.style.opacity = 1;
                content.style.filter = "blur(0)";
                fullscreenImagesG[0].children[0].src = `../img/work/${i}-1.png`;
                fullscreenImagesG[1].children[0].src = `../img/work/${i}-1.png`;
            }, 1600);
            setTimeout(() => {
                fullscreenBtn.style.opacity = 1;
                fullscreenBtn.style.filter = "blur(0)";
                fullscreenImagesContainer.style.display = "flex";
                
                fullscreenImagesG[0].style.zIndex = imgNum[i-1]+7;
                fullscreenImagesG[1].style.zIndex = imgNum[i-1]+8;
                imgH = icon.children[0].offsetHeight;
                fullscreenImagesG[0].style.height = imgH + "px";
                checkSubtitleOverflow(subtitle);
                fullscreenImagesG[1].style.height = imgH + "px";
                icon.style.opacity = 0;
                tempN = 0;
                // imgLoopTimer disabled (single photo per chapter)
            }, 2000);
            break;
        case -2:
            if(i + 3 <= TOTAL_CHAPTERS){
                ch5 = document.getElementById("ch"+(i+3));
                ch5.style.transform = "translateY(1080px)";
                ch5.style.opacity = 0;
                ch5.style.filter = "blur(30px)";
            }
            ch1 = document.getElementById("ch"+(i-1));
            ch2 = document.getElementById("ch"+i);
            ch3 = document.getElementById("ch"+(i+1));
            ch4 = document.getElementById("ch"+(i+2));

            ch1.style.transitionDuration = "1.5s";
            ch2.style.transitionDuration = "1.5s";
            ch3.style.transitionDuration = "1.5s";
            ch4.style.transitionDuration = "1.5s";
            setTimeout(() => {
                ch1.style.transform = "translateY(1080px)";
                ch1.style.opacity = 0;
                ch1.style.filter = "blur(30px)";
                ch3.style.transform = "translateY(1080px)";
                ch3.style.opacity = 0;
                ch3.style.filter = "blur(30px)";

                ch2.classList.remove("chapters");
                ch2.classList.add("chaptersOpen");
                ch2.style.transform = "translateX(-400px)";
                
                bg.style.width = "2000px";
                bg.style.height = "2000px";
                bg.style.marginLeft = "1800px";
                bg.style.marginTop = "1200px";
                bg.style.borderRadius = "160px";

                title.style.fontSize = "100px";
                title.style.marginLeft = "1600px";
                title.style.marginTop = "-600px";
                title.style.scale = "1 0";
                title.style.filter = "blur(30px)";
                title.style.opacity = 0;

                subtitle.style.fontSize = "80px";
                subtitle.style.marginLeft = "2200px";
                subtitle.style.marginTop = "-500px";
                subtitle.style.width = "800px";

                icon.style.width = "600px";
                icon.style.maxHeight = "800px";
                icon.style.borderRadius = "60px";
                icon.style.marginLeft = "600px";
                icon.style.marginTop = "300px";

                fullscreenImagesG[0].style.transitionDuration = 0;
                fullscreenImagesG[1].style.transitionDuration = 0;

                fullscreenImagesG[0].style.width = icon.style.width;
                fullscreenImagesG[1].style.width = icon.style.width;


                closeBtn.style.display = "block";
                slide1.style.display = "block";
                slide2.style.display = "block";
                nextBtn.style.display = "block";
                content.style.display = "block";
                fullscreenBtn.style.display = "flex";
            }, 500);
            setTimeout(() => {
                ch4.style.transform = "translateY(1080px)";
                ch4.style.opacity = 0;
                ch4.style.filter = "blur(30px)";
                
            }, 600);
            setTimeout(() => {
                closeBtn.style.marginLeft = "3000px";
                closeBtn.style.opacity = 1;
                closeBtn.style.filter = "blur(0)";
                closeBtn.onclick = () => {closeCh(i)};
            }, 1000);
            setTimeout(() => {
                menuContainer.style.maskMode = "unset";
                nextBtn.style.marginTop = "800px";
                nextBtn.style.opacity = 1;
                nextBtn.style.filter = "blur(0)";
                nextBtn.onclick = () => {nextBtnCh(i)};
            }, 1200);

            setTimeout(() => {
                slide2.style.marginTop = "460px";
                slide2.style.opacity = 0.3;
                slide2.style.filter = "blur(0)";
            }, 1400);
            setTimeout(() => {
                slide1.style.marginTop = "-100px";
                slide1.style.opacity = 1;
                slide1.style.filter = "blur(0)";
                closeBtn.style.transitionDuration = "0.2s";
                if(i < TOTAL_CHAPTERS){
                    nextBtn.style.transitionDuration = "0.2s";
                }
                content.style.opacity = 1;
                content.style.filter = "blur(0)";
                
                fullscreenImagesG[0].children[0].src = `../img/work/${i}-1.png`;
                fullscreenImagesG[1].children[0].src = `../img/work/${i}-1.png`;
            }, 1600);
            setTimeout(() => {
                fullscreenBtn.style.opacity = 1;
                fullscreenBtn.style.filter = "blur(0)";
                fullscreenImagesContainer.style.display = "flex";
                fullscreenImagesG[0].style.zIndex = imgNum[i-1]+7;
                fullscreenImagesG[1].style.zIndex = imgNum[i-1]+8;
                imgH = icon.children[0].offsetHeight;
                fullscreenImagesG[0].style.height = imgH + "px";
                checkSubtitleOverflow(subtitle);
                fullscreenImagesG[1].style.height = imgH + "px";
                icon.style.opacity = 0;
                tempN = 0;
                // imgLoopTimer disabled (single photo per chapter)
            }, 2000);
            
            break;
        case -3:
            if(i + 2 <= TOTAL_CHAPTERS){
                ch5 = document.getElementById("ch"+(i+2));
                ch5.style.transform = "translateY(1080px)";
                ch5.style.opacity = 0;
                ch5.style.filter = "blur(30px)";
            }
            ch1 = document.getElementById("ch"+(i-2));
            ch2 = document.getElementById("ch"+(i-1));
            ch3 = document.getElementById("ch"+i);
            ch4 = document.getElementById("ch"+(i+1));
            
            ch1.style.transitionDuration = "1.5s";
            ch2.style.transitionDuration = "1.5s";
            ch3.style.transitionDuration = "1.5s";
            ch4.style.transitionDuration = "1.5s";
            setTimeout(() => {
                ch2.style.transform = "translateY(1080px)";
                ch2.style.opacity = 0;
                ch2.style.filter = "blur(30px)";
                ch4.style.transform = "translateY(1080px)";
                ch4.style.opacity = 0;
                ch4.style.filter = "blur(30px)";

                ch3.classList.remove("chapters");
                ch3.classList.add("chaptersOpen");
                ch3.style.transform = "translateX(-800px)";
                
                bg.style.width = "2000px";
                bg.style.height = "2000px";
                bg.style.marginLeft = "1800px";
                bg.style.marginTop = "1200px";
                bg.style.borderRadius = "160px";

                title.style.fontSize = "100px";
                title.style.marginLeft = "1600px";
                title.style.marginTop = "-600px";
                title.style.scale = "1 0";
                title.style.filter = "blur(30px)";
                title.style.opacity = 0;

                subtitle.style.fontSize = "80px";
                subtitle.style.marginLeft = "2200px";
                subtitle.style.marginTop = "-500px";
                subtitle.style.width = "800px";

                icon.style.width = "600px";
                icon.style.maxHeight = "800px";
                icon.style.borderRadius = "60px";
                icon.style.marginLeft = "600px";
                icon.style.marginTop = "300px";

                fullscreenImagesG[0].style.transitionDuration = 0;
                fullscreenImagesG[1].style.transitionDuration = 0;

                fullscreenImagesG[0].style.width = icon.style.width;
                fullscreenImagesG[1].style.width = icon.style.width;


                closeBtn.style.display = "block";
                slide1.style.display = "block";
                slide2.style.display = "block";
                nextBtn.style.display = "block";
                content.style.display = "block";
                fullscreenBtn.style.display = "flex";
                

            }, 500);
            setTimeout(() => {
                ch1.style.transform = "translateY(1080px)";
                ch1.style.opacity = 0;
                ch1.style.filter = "blur(30px)";
            }, 600);
            setTimeout(() => {
                closeBtn.style.marginLeft = "3000px";
                closeBtn.style.opacity = 1;
                closeBtn.style.filter = "blur(0)";
                closeBtn.onclick = () => {closeCh(i)};
                menuContainer.style.maskMode = "unset";
            }, 1000);
            setTimeout(() => {
                nextBtn.style.marginTop = "800px";
                nextBtn.style.opacity = 1;
                nextBtn.style.filter = "blur(0)";
                nextBtn.onclick = () => {nextBtnCh(i)};
            }, 1200);

            setTimeout(() => {
                slide2.style.marginTop = "460px";
                slide2.style.opacity = 0.3;
                slide2.style.filter = "blur(0)";
            }, 1400);
            setTimeout(() => {
                slide1.style.marginTop = "-100px";
                slide1.style.opacity = 1;
                slide1.style.filter = "blur(0)";
                closeBtn.style.transitionDuration = "0.2s";
                if(i < TOTAL_CHAPTERS){
                    nextBtn.style.transitionDuration = "0.2s";
                }
                content.style.opacity = 1;
                content.style.filter = "blur(0)";
                fullscreenImagesG[0].children[0].src = `../img/work/${i}-1.png`;
                fullscreenImagesG[1].children[0].src = `../img/work/${i}-1.png`;
            }, 1600);
            setTimeout(() => {
                fullscreenBtn.style.opacity = 1;
                fullscreenBtn.style.filter = "blur(0)";
                fullscreenImagesContainer.style.display = "flex";
                fullscreenImagesG[0].style.zIndex = imgNum[i-1]+7;
                fullscreenImagesG[1].style.zIndex = imgNum[i-1]+8;
                imgH = icon.children[0].offsetHeight;
                fullscreenImagesG[0].style.height = imgH + "px";
                checkSubtitleOverflow(subtitle);
                fullscreenImagesG[1].style.height = imgH + "px";
                icon.style.opacity = 0;
                tempN = 0;
                // imgLoopTimer disabled (single photo per chapter)
            }, 2000);
            break;
        case -4:
            if(i + 1 <= TOTAL_CHAPTERS){
                ch5 = document.getElementById("ch"+(i+1));
                ch5.style.transform = "translateY(1080px)";
                ch5.style.opacity = 0;
                ch5.style.filter = "blur(30px)";
            }
            ch1 = document.getElementById("ch"+(i-3));
            ch2 = document.getElementById("ch"+(i-2));
            ch3 = document.getElementById("ch"+(i-1));
            ch4 = document.getElementById("ch"+i);
            ch1.style.transitionDuration = "1.5s";
            ch2.style.transitionDuration = "1.5s";
            ch3.style.transitionDuration = "1.5s";
            ch4.style.transitionDuration = "1.5s";
            
            setTimeout(() => {
                ch3.style.transform = "translateY(1080px)";
                ch3.style.opacity = 0;
                ch3.style.filter = "blur(30px)";

                ch4.classList.remove("chapters");
                ch4.classList.add("chaptersOpen");
                ch4.style.transform = "translateX(-1200px)";
                
                bg.style.width = "2000px";
                bg.style.height = "2000px";
                bg.style.marginLeft = "1800px";
                bg.style.marginTop = "1200px";
                bg.style.borderRadius = "160px";

                title.style.fontSize = "100px";
                title.style.marginLeft = "1600px";
                title.style.marginTop = "-600px";
                title.style.scale = "1 0";
                title.style.filter = "blur(30px)";
                title.style.opacity = 0;

                subtitle.style.fontSize = "80px";
                subtitle.style.marginLeft = "2200px";
                subtitle.style.marginTop = "-500px";
                subtitle.style.width = "800px";

                icon.style.width = "600px";
                icon.style.maxHeight = "800px";
                icon.style.borderRadius = "60px";
                icon.style.marginLeft = "600px";
                icon.style.marginTop = "300px";

                fullscreenImagesG[0].style.transitionDuration = 0;
                fullscreenImagesG[1].style.transitionDuration = 0;

                fullscreenImagesG[0].style.width = icon.style.width;
                fullscreenImagesG[1].style.width = icon.style.width;


                closeBtn.style.display = "block";
                slide1.style.display = "block";
                slide2.style.display = "block";
                if(i < TOTAL_CHAPTERS){
                    nextBtn.style.display = "block";
                }
                content.style.display = "block";
                fullscreenBtn.style.display = "flex";

            }, 500);
            setTimeout(() => {
                ch2.style.transform = "translateY(1080px)";
                ch2.style.opacity = 0;
                ch2.style.filter = "blur(30px)";
            }, 600);
            setTimeout(() => {
                ch1.style.transform = "translateY(1080px)";
                ch1.style.opacity = 0;
                ch1.style.filter = "blur(30px)";
                menuContainer.style.maskMode = "unset";
            }, 700);
            setTimeout(() => {
                closeBtn.style.marginLeft = "3000px";
                closeBtn.style.opacity = 1;
                closeBtn.style.filter = "blur(0)";
                closeBtn.onclick = () => {closeCh(i)};
            }, 1000);
            setTimeout(() => {
                if(i < TOTAL_CHAPTERS){
                    nextBtn.style.marginTop = "800px";
                    nextBtn.style.opacity = 1;
                    nextBtn.style.filter = "blur(0)";
                    nextBtn.onclick = () => {nextBtnCh(i)};
                }
            }, 1200);

            setTimeout(() => {
                slide2.style.marginTop = "460px";
                slide2.style.opacity = (i < TOTAL_CHAPTERS) ? 0.3 : 1;
                slide2.style.fontSize = (i < TOTAL_CHAPTERS)? "" : "";
                slide2.style.filter = "blur(0)";
            }, 1400);
            setTimeout(() => {
                slide1.style.marginTop = "-100px";
                slide1.style.opacity = (i < TOTAL_CHAPTERS) ? 1 : 0.3;
                slide1.style.filter = "blur(0)";
                closeBtn.style.transitionDuration = "0.2s";
                if(i < TOTAL_CHAPTERS){
                    nextBtn.style.transitionDuration = "0.2s";
                }
                content.style.opacity = 1;
                content.style.filter = "blur(0)";
                fullscreenImagesG[0].children[0].src = `../img/work/${i}-1.png`;
                fullscreenImagesG[1].children[0].src = `../img/work/${i}-1.png`;
            }, 1600);
            setTimeout(() => {
                fullscreenBtn.style.opacity = 1;
                fullscreenBtn.style.filter = "blur(0)";
                fullscreenImagesContainer.style.display = "flex";
                fullscreenImagesG[0].style.zIndex = imgNum[i-1]+7;
                fullscreenImagesG[1].style.zIndex = imgNum[i-1]+8;
                imgH = icon.children[0].offsetHeight;
                fullscreenImagesG[0].style.height = imgH + "px";
                checkSubtitleOverflow(subtitle);
                fullscreenImagesG[1].style.height = imgH + "px";
                icon.style.opacity = 0;
                tempN = 0;
                // imgLoopTimer disabled (single photo per chapter)
            }, 2000);
            break;
    }
}

function closeCh(i){
    let index = Math.round(menuScorller.scrollTop/menuScorller.scrollHeight*TOTAL_CHAPTERS);
    let diff = index - i;
    if (diff < -4) {
        index = i - 4;
        diff = -4;
        menuScorller.scrollTo(0, (index / TOTAL_CHAPTERS) * menuScorller.scrollHeight);
    } else if (diff > -1) {
        index = i - 1;
        diff = -1;
        menuScorller.scrollTo(0, (index / TOTAL_CHAPTERS) * menuScorller.scrollHeight);
    }
    const scrollBarBG = document.getElementById("scrollBarBG");
    const backBtn = document.getElementById("backBtn");
    const menuContainer = document.getElementById("menuContainer");
    let ch1, ch2, ch3, ch4, ch5, bg, title, subtitle, icon, closeBtn, slide1, slide2, nextBtn, content, fullscreenBtn, fullscreenImagesContainer;

    bg = document.getElementById("ch"+i+"_bg");
    title = document.getElementById("ch"+i+"_title");
    subtitle = document.getElementById("ch"+i+"_subtitle");
    subtitle.classList.remove("is-overflowing");
    icon = document.getElementById("ch"+i+"_icon");
    closeBtn = document.getElementById("close"+i);
    closeBtn.style.transitionDuration = "1.5s";
    slide1 = document.getElementById("ch"+i+"_slide_1");
    slide2 = document.getElementById("ch"+i+"_slide_2");
    icon.style.transitionDuration = "0s";
    icon.style.opacity = 1;
    clearInterval(imgLoopTimer);

    if(i < TOTAL_CHAPTERS){
        nextBtn = document.getElementById("ch_next"+i);
        nextBtn.style.transitionDuration = "1s";
    }
    content = document.getElementById("ch_content");
    fullscreenBtn = document.getElementById("ch_fullscreenBtn");
    fullscreenImagesContainer = document.getElementById("fullscreenImagesContainer");
    endingImgLoop(i);

    

    switch (diff){
        case -1:
            ch1 = document.getElementById("ch"+i);
            ch2 = document.getElementById("ch"+(i+1));
            ch3 = document.getElementById("ch"+(i+2));
            ch4 = document.getElementById("ch"+(i+3));
            ch1.style.transitionDuration = "1.5s";
            ch2.style.transitionDuration = "1.5s";
            ch3.style.transitionDuration = "1.5s";
            ch4.style.transitionDuration = "1.5s";
            
            
            
            setTimeout(() => {
                slide1.style.marginTop = "-300px";
                slide1.style.opacity = 0;
                slide1.style.filter = "blur(30px)";
                content.style.opacity = 0;
                content.style.filter = "blur(10px)";
                fullscreenBtn.style.opacity = 0;
                fullscreenBtn.style.filter = "blur(10px)";
                icon.style.transitionDuration = "1.5s";
            }, 500);

            setTimeout(() => {
                slide2.style.marginTop = "260px";
                slide2.style.opacity = 0;
                slide2.style.filter = "blur(30px)";
            }, 700);

            setTimeout(() => {
                nextBtn.style.marginTop = "600px";
                nextBtn.style.opacity = 0;
                nextBtn.style.filter = "blur(30px)";
                nextBtn.onclick = () => {};
            }, 900);

            setTimeout(() => {
                fullscreenImagesContainer.style.display = "none";
            }, 1000);

            setTimeout(() => {
                closeBtn.style.marginLeft = "3400px";
                closeBtn.style.opacity = 0;
                closeBtn.style.filter = "blur(30px)";
                closeBtn.onclick = () => {};
            }, 1100);

            setTimeout(() => {
                ch2.style.transform = "translateY(0px)";
                ch2.style.opacity = 1;
                ch2.style.filter = "blur(0px)";
            }, 1400);

            setTimeout(() => {
                ch3.style.transform = "translateY(0px)";
                ch3.style.opacity = 1;
                ch3.style.filter = "blur(0px)";
            }, 1500);

            setTimeout(() => {
                ch4.style.transform = "translateY(0px)";
                ch4.style.opacity = 1;
                ch4.style.filter = "blur(0px)";
                
                bg.style.width = "300px";
                bg.style.height = "300px";
                bg.style.marginLeft = "";
                bg.style.marginTop = "";
                bg.style.borderRadius = "50px";

                title.style.fontSize = "32px";
                title.style.marginLeft = "";
                title.style.marginTop = "";
                title.style.scale = "1";
                title.style.filter = "blur(0px)";
                title.style.opacity = 1;

                subtitle.style.fontSize = "18px";
                subtitle.style.marginLeft = "";
                subtitle.style.marginTop = "";
                subtitle.style.width = "200px";

                icon.style.width = "200px";
                icon.style.maxHeight = "200px";
                icon.style.borderRadius = "30px";
                icon.style.marginLeft = "";
                icon.style.marginTop = "";

            }, 1600);

            setTimeout(() => {
                ch1.classList.remove("chaptersOpen");
                ch1.classList.add("chapters");
                closeBtn.style.display = "none";
                slide1.style.display = "none";
                slide2.style.display = "none";
                nextBtn.style.display = "none";
                content.style.display = "none";
                fullscreenBtn.style.display = "none";
                if(i + 4 <= TOTAL_CHAPTERS){
                    ch5 = document.getElementById("ch"+(i+4));
                    ch5.style.transform = "translateY(0px)";
                    ch5.style.opacity = 1;
                    ch5.style.filter = "blur(0px)";
                }
                backBtn.style.scale = 1;
                scrollBarBG.style.transform = "translateY(0px)";
                bg.style.transitionDuration = "0.5s";
                title.style.transitionDuration = "0.5s";
                subtitle.style.transitionDuration = "0.5s";
                icon.style.transitionDuration = "0.5s";
                ch1.style.transitionDuration = "0.5s";
                ch2.style.transitionDuration = "0.5s";
                ch3.style.transitionDuration = "0.5s";
                ch4.style.transitionDuration = "0.5s";
                menuScorller.style.pointerEvents = "";
                menuContainer.style.maskMode = "luminance";
            }, 2100);
            setTimeout(() => {
                backBtn.style.transitionDuration = "0.2s";
                isOpen = false;
            checkSubtitleOverflow(subtitle);
            }, 3100);
            break;
        case -2:
            ch1 = document.getElementById("ch"+(i-1));
            ch2 = document.getElementById("ch"+i);
            ch3 = document.getElementById("ch"+(i+1));
            ch4 = document.getElementById("ch"+(i+2));
            ch1.style.transitionDuration = "1.5s";
            ch2.style.transitionDuration = "1.5s";
            ch3.style.transitionDuration = "1.5s";
            ch4.style.transitionDuration = "1.5s";
            setTimeout(() => {
                slide1.style.marginTop = "-300px";
                slide1.style.opacity = 0;
                slide1.style.filter = "blur(30px)";
                content.style.opacity = 0;
                content.style.filter = "blur(10px)";
                fullscreenBtn.style.opacity = 0;
                fullscreenBtn.style.filter = "blur(10px)";
                icon.style.transitionDuration = "1.5s";
            }, 500);

            setTimeout(() => {
                slide2.style.marginTop = "260px";
                slide2.style.opacity = 0;
                slide2.style.filter = "blur(30px)";
            }, 700);

            setTimeout(() => {
                nextBtn.style.marginTop = "600px";
                nextBtn.style.opacity = 0;
                nextBtn.style.filter = "blur(30px)";
                nextBtn.onclick = () => {};
            }, 900);

            setTimeout(() => {
                fullscreenImagesContainer.style.display = "none";
            }, 1000);

            setTimeout(() => {
                closeBtn.style.marginLeft = "3400px";
                closeBtn.style.opacity = 0;
                closeBtn.style.filter = "blur(30px)";
                closeBtn.onclick = () => {};
            }, 1100);

            setTimeout(() => {
                ch1.style.transform = "translateY(0px)";
                ch1.style.opacity = 1;
                ch1.style.filter = "blur(0px)";
                ch3.style.transform = "translateY(0px)";
                ch3.style.opacity = 1;
                ch3.style.filter = "blur(0px)";
                ch2.style.transform = "";
            }, 1500);
            
            setTimeout(() => {
                ch4.style.transform = "translateY(0px)";
                ch4.style.opacity = 1;
                ch4.style.filter = "blur(0px)";
                
                bg.style.width = "300px";
                bg.style.height = "300px";
                bg.style.marginLeft = "";
                bg.style.marginTop = "";
                bg.style.borderRadius = "50px";

                title.style.fontSize = "32px";
                title.style.marginLeft = "";
                title.style.marginTop = "";
                title.style.scale = "1";
                title.style.filter = "blur(0px)";
                title.style.opacity = 1;

                subtitle.style.fontSize = "18px";
                subtitle.style.marginLeft = "";
                subtitle.style.marginTop = "";
                subtitle.style.width = "200px";

                icon.style.width = "200px";
                icon.style.maxHeight = "200px";
                icon.style.borderRadius = "30px";
                icon.style.marginLeft = "";
                icon.style.marginTop = "";

                
            }, 1600);

            setTimeout(() => {
                ch2.classList.remove("chaptersOpen");
                ch2.classList.add("chapters");
                closeBtn.style.display = "none";
                slide1.style.display = "none";
                slide2.style.display = "none";
                nextBtn.style.display = "none";
                content.style.display = "none";
                fullscreenBtn.style.display = "none";
                if(i + 3 <= TOTAL_CHAPTERS){
                    ch5 = document.getElementById("ch"+(i+3));
                    ch5.style.transform = "translateY(0px)";
                    ch5.style.opacity = 1;
                    ch5.style.filter = "blur(0px)";
                }
                backBtn.style.scale = 1;
                scrollBarBG.style.transform = "translateY(0px)";
                bg.style.transitionDuration = "0.5s";
                title.style.transitionDuration = "0.5s";
                subtitle.style.transitionDuration = "0.5s";
                icon.style.transitionDuration = "0.5s";
                ch1.style.transitionDuration = "0.5s";
                ch2.style.transitionDuration = "0.5s";
                ch3.style.transitionDuration = "0.5s";
                ch4.style.transitionDuration = "0.5s";
                menuScorller.style.pointerEvents = "";
                menuContainer.style.maskMode = "luminance";
            }, 2100);
            setTimeout(() => {
                backBtn.style.transitionDuration = "0.2s";
                isOpen = false;
            }, 3100);
            break;
        case -3:
            ch1 = document.getElementById("ch"+(i-2));
            ch2 = document.getElementById("ch"+(i-1));
            ch3 = document.getElementById("ch"+i);
            ch4 = document.getElementById("ch"+(i+1));
            ch1.style.transitionDuration = "1.5s";
            ch2.style.transitionDuration = "1.5s";
            ch3.style.transitionDuration = "1.5s";
            ch4.style.transitionDuration = "1.5s";
            setTimeout(() => {
                slide1.style.marginTop = "-300px";
                slide1.style.opacity = 0;
                slide1.style.filter = "blur(30px)";
                content.style.opacity = 0;
                content.style.filter = "blur(10px)";
                fullscreenBtn.style.opacity = 0;
                fullscreenBtn.style.filter = "blur(10px)";
                icon.style.transitionDuration = "1.5s";
            }, 500);

            setTimeout(() => {
                slide2.style.marginTop = "260px";
                slide2.style.opacity = 0;
                slide2.style.filter = "blur(30px)";
            }, 700);

            setTimeout(() => {
                if(i < TOTAL_CHAPTERS){
                    nextBtn.style.marginTop = "600px";
                    nextBtn.style.opacity = 0;
                    nextBtn.style.filter = "blur(30px)";
                    nextBtn.onclick = () => {};
                }
            }, 900);
            setTimeout(() => {
                fullscreenImagesContainer.style.display = "none";
            }, 1000);

            setTimeout(() => {
                closeBtn.style.marginLeft = "3400px";
                closeBtn.style.opacity = 0;
                closeBtn.style.filter = "blur(30px)";
                closeBtn.onclick = () => {};
            }, 1100);

            setTimeout(() => {
                ch2.style.transform = "translateY(0px)";
                ch2.style.opacity = 1;
                ch2.style.filter = "blur(0px)";
                ch4.style.transform = "translateY(0px)";
                ch4.style.opacity = 1;
                ch4.style.filter = "blur(0px)";
                ch3.style.transform = "";
            }, 1500);
            
            setTimeout(() => {
                ch1.style.transform = "translateY(0px)";
                ch1.style.opacity = 1;
                ch1.style.filter = "blur(0px)";
                
                bg.style.width = "300px";
                bg.style.height = "300px";
                bg.style.marginLeft = "";
                bg.style.marginTop = "";
                bg.style.borderRadius = "50px";

                title.style.fontSize = "32px";
                title.style.marginLeft = "";
                title.style.marginTop = "";
                title.style.scale = "1";
                title.style.filter = "blur(0px)";
                title.style.opacity = 1;

                subtitle.style.fontSize = "18px";
                subtitle.style.marginLeft = "";
                subtitle.style.marginTop = "";
                subtitle.style.width = "200px";

                icon.style.width = "200px";
                icon.style.maxHeight = "200px";
                icon.style.borderRadius = "30px";
                icon.style.marginLeft = "";
                icon.style.marginTop = "";
            }, 1600);

            setTimeout(() => {
                ch3.classList.remove("chaptersOpen");
                ch3.classList.add("chapters");
                closeBtn.style.display = "none";
                slide1.style.display = "none";
                slide2.style.display = "none";
                nextBtn.style.display = "none";
                content.style.display = "none";
                fullscreenBtn.style.display = "none";
                
                if(i + 2 <= TOTAL_CHAPTERS){
                    ch5 = document.getElementById("ch"+(i+2));
                    ch5.style.transform = "translateY(0px)";
                    ch5.style.opacity = 1;
                    ch5.style.filter = "blur(0px)";
                }
                backBtn.style.scale = 1;
                scrollBarBG.style.transform = "translateY(0px)";
                bg.style.transitionDuration = "0.5s";
                title.style.transitionDuration = "0.5s";
                subtitle.style.transitionDuration = "0.5s";
                icon.style.transitionDuration = "0.5s";
                ch1.style.transitionDuration = "0.5s";
                ch2.style.transitionDuration = "0.5s";
                ch3.style.transitionDuration = "0.5s";
                ch4.style.transitionDuration = "0.5s";
                menuScorller.style.pointerEvents = "";
            }, 2100);
            setTimeout(() => {
                backBtn.style.transitionDuration = "0.2s";
                menuContainer.style.maskMode = "luminance";
                isOpen = false;
            }, 3100);
            break;
        case -4:
            ch1 = document.getElementById("ch"+(i-3));
            ch2 = document.getElementById("ch"+(i-2));
            ch3 = document.getElementById("ch"+(i-1));
            ch4 = document.getElementById("ch"+i);
            ch1.style.transitionDuration = "1.5s";
            ch2.style.transitionDuration = "1.5s";
            ch3.style.transitionDuration = "1.5s";
            ch4.style.transitionDuration = "1.5s";
            
            setTimeout(() => {
                slide1.style.marginTop = "-300px";
                slide1.style.opacity = 0;
                slide1.style.filter = "blur(30px)";
                content.style.opacity = 0;
                content.style.filter = "blur(10px)";
                fullscreenBtn.style.opacity = 0;
                fullscreenBtn.style.filter = "blur(10px)";
                icon.style.transitionDuration = "1.5s";
            }, 500);

            setTimeout(() => {
                slide2.style.marginTop = "260px";
                slide2.style.opacity = 0;
                slide2.style.filter = "blur(30px)";
            }, 700);

            setTimeout(() => {
                if(i < TOTAL_CHAPTERS){
                    nextBtn.style.marginTop = "600px";
                    nextBtn.style.opacity = 0;
                    nextBtn.style.filter = "blur(30px)";
                    nextBtn.onclick = () => {};
                }
            }, 900);

            setTimeout(() => {
                fullscreenImagesContainer.style.display = "none";
            }, 1000);

            setTimeout(() => {
                closeBtn.style.marginLeft = "3400px";
                closeBtn.style.opacity = 0;
                closeBtn.style.filter = "blur(30px)";
                closeBtn.onclick = () => {};
            }, 1100);

            setTimeout(() => {
                ch3.style.transform = "translateY(0px)";
                ch3.style.opacity = 1;
                ch3.style.filter = "blur(0px)";
            }, 1400);

            setTimeout(() => {
                ch2.style.transform = "translateY(0px)";
                ch2.style.opacity = 1;
                ch2.style.filter = "blur(0px)";
            }, 1500);

            setTimeout(() => {
                ch1.style.transform = "translateY(0px)";
                ch1.style.opacity = 1;
                ch1.style.filter = "blur(0px)";
                
                bg.style.width = "300px";
                bg.style.height = "300px";
                bg.style.marginLeft = "";
                bg.style.marginTop = "";
                bg.style.borderRadius = "50px";

                title.style.fontSize = "32px";
                title.style.marginLeft = "";
                title.style.marginTop = "";
                title.style.scale = "1";
                title.style.filter = "blur(0px)";
                title.style.opacity = 1;

                subtitle.style.fontSize = "18px";
                subtitle.style.marginLeft = "";
                subtitle.style.marginTop = "";
                subtitle.style.width = "200px";

                icon.style.width = "200px";
                icon.style.maxHeight = "200px";
                icon.style.borderRadius = "30px";
                icon.style.marginLeft = "";
                icon.style.marginTop = "";

                
                ch4.style.transform = "";
            }, 1600);

            setTimeout(() => {
                ch4.classList.remove("chaptersOpen");
                ch4.classList.add("chapters");
                closeBtn.style.display = "none";
                slide1.style.display = "none";
                slide2.style.display = "none";
                content.style.display = "none";
                fullscreenBtn.style.display = "none";
                if(i < TOTAL_CHAPTERS){
                    nextBtn.style.display = "none";
                }
                if(i + 1 <= TOTAL_CHAPTERS){
                    ch5 = document.getElementById("ch"+(i+1));
                    ch5.style.transform = "translateY(0px)";
                    ch5.style.opacity = 1;
                    ch5.style.filter = "blur(0px)";
                }
                backBtn.style.transitionDuration = "1.5s";

                backBtn.style.scale = 1;
                scrollBarBG.style.transform = "translateY(0px)";
                bg.style.transitionDuration = "0.5s";
                title.style.transitionDuration = "0.5s";
                subtitle.style.transitionDuration = "0.5s";
                icon.style.transitionDuration = "0.5s";
                ch1.style.transitionDuration = "0.5s";
                ch2.style.transitionDuration = "0.5s";
                ch3.style.transitionDuration = "0.5s";
                ch4.style.transitionDuration = "0.5s";
                menuScorller.style.pointerEvents = "";
            }, 2100);
            setTimeout(() => {
                menuContainer.style.maskMode = "luminance";
                backBtn.style.transitionDuration = "0.2s";
                isOpen = false;
            }, 3100);
            break;
    }
}

function nextBtnCh(i){
    let index = Math.round(menuScorller.scrollTop/menuScorller.scrollHeight*TOTAL_CHAPTERS);
    const chContainer = document.getElementById("chContainer");

    const scrollBarBG = document.getElementById("scrollBarBG");
    const backBtn = document.getElementById("backBtn");
    const menuContainer = document.getElementById("menuContainer");
    let ch1, ch2, ch3, ch4, bg, title, subtitle, icon, closeBtn, slide1, slide2, nextBtn, content, fullscreenBtn, fullscreenImagesContainer;
    let bg2, title2, subtitle2, icon2, closeBtn2, slide12, slide22, nextBtn2, fullscreenImagesG;

    bg = document.getElementById("ch"+i+"_bg");
    title = document.getElementById("ch"+i+"_title");
    subtitle = document.getElementById("ch"+i+"_subtitle");
    icon = document.getElementById("ch"+i+"_icon");
    closeBtn = document.getElementById("close"+i);
    closeBtn.style.transitionDuration = "1.5s";
    slide1 = document.getElementById("ch"+i+"_slide_1");
    slide2 = document.getElementById("ch"+i+"_slide_2");
    icon.style.transitionDuration = "0s";
    icon.style.opacity = 1;
    clearInterval(imgLoopTimer);

    bg.style.transitionDuration = "1.5s";
    title.style.transitionDuration = "1.5s";
    subtitle.style.transitionDuration = "1.5s";
    icon.style.transitionDuration = "0s";
    closeBtn.style.transitionDuration = "1.5s";
    backBtn.style.transitionDuration = "1.5s";
    

    bg2 = document.getElementById("ch"+(i+1)+"_bg");
    title2 = document.getElementById("ch"+(i+1)+"_title");
    subtitle2 = document.getElementById("ch"+(i+1)+"_subtitle");
    icon2 = document.getElementById("ch"+(i+1)+"_icon");
    closeBtn2 = document.getElementById("close"+(i+1));
    closeBtn2.style.transitionDuration = "1.5s";
    slide12 = document.getElementById("ch"+(i+1)+"_slide_1");
    slide22 = document.getElementById("ch"+(i+1)+"_slide_2");
    icon2.style.transitionDuration = "0s";
    icon2.style.opacity = 1;

    if(i < TOTAL_CHAPTERS){
        nextBtn = document.getElementById("ch_next"+i);
        nextBtn.style.transitionDuration = "1s";
    }
    if(i + 1 < TOTAL_CHAPTERS){
        nextBtn2 = document.getElementById("ch_next"+(i+1));
        nextBtn2.style.transitionDuration = "1s";
    }
    content = document.getElementById("ch_content");
    fullscreenBtn = document.getElementById("ch_fullscreenBtn");
    fullscreenImagesContainer = document.getElementById("fullscreenImagesContainer");
    endingImgLoop(i);
    content.style.transitionDuration = "1.5s";
    fullscreenBtn.style.transitionDuration = "1.5s";

    ch1 = document.getElementById("ch"+i);
    ch2 = document.getElementById("ch"+(i+1));
    if(index - i == -4){
        ch3 = document.getElementById("ch"+(i-3));
    }
    
    content.style.opacity = 0;
    content.style.filter = "blur(10px)";
    
    setTimeout(() => {
        slide1.style.opacity = 0;
        slide1.style.filter = "blur(30px)";
        slide2.style.opacity = 0;
        slide2.style.filter = "blur(30px)";
        fullscreenBtn.style.opacity = 0;
        fullscreenBtn.style.filter = "blur(10px)";
        icon.style.transitionDuration = "1.5s";
        nextBtn.style.opacity = 0;
        nextBtn.style.filter = "blur(30px)";
        nextBtn.onclick = () => {};
        closeBtn.style.opacity = 0;
        closeBtn.style.filter = "blur(30px)";
        closeBtn.onclick = () => {};
        ch1.style.transitionDuration = "1.5s";
        ch2.style.transitionDuration = "1.5s";
        
    }, 500);

    setTimeout(() => {
        if(index - i == -4){
            chContainer.style.transitionDuration = "1s";
            index++;
            menuScorller.scrollTo(0, ((index) / TOTAL_CHAPTERS) * menuScorller.scrollHeight);
        }
        fullscreenImagesContainer.style.display = "none";
        ch2.style.transform = "translateY(0px)";
        ch2.style.opacity = 1;
        ch2.style.filter = "blur(0px)";
        if(i + 2 <= TOTAL_CHAPTERS){
            ch4 = document.getElementById("ch"+(i+2));
            ch4.style.transform = "translateY(1080px)";
            ch4.style.opacity = 0;
            ch4.style.filter = "blur(30px)";
        }
    }, 700);

    setTimeout(() => {
        ch1.style.transform = "translateY(0px)";
        ch1.style.opacity = 1;
        ch1.style.filter = "blur(0px)";
        
        bg.style.width = "300px";
        bg.style.height = "300px";
        bg.style.marginLeft = "";
        bg.style.marginTop = "";
        bg.style.borderRadius = "50px";

        title.style.fontSize = "32px";
        title.style.marginLeft = "";
        title.style.marginTop = "";
        title.style.scale = "1";
        title.style.filter = "blur(0px)";
        title.style.opacity = 1;

        subtitle.style.fontSize = "18px";
        subtitle.style.marginLeft = "";
        subtitle.style.marginTop = "";
        subtitle.style.width = "200px";

        icon.style.width = "200px";
        icon.style.maxHeight = "200px";
        icon.style.borderRadius = "30px";
        icon.style.marginLeft = "";
        icon.style.marginTop = "";

    }, 800);

    setTimeout(() => {
        ch1.classList.remove("chaptersOpen");
        ch1.classList.add("chapters");
        
        tempI = i+1;
        isOpen = true;

        fullscreenImagesG = document.getElementsByClassName("fullscreenImagesG");
        loadContent(content,i+1);

        bg2.style.transitionDuration = "1.5s";
        title2.style.transitionDuration = "1.5s";
        subtitle2.style.transitionDuration = "1.5s";
        icon2.style.transitionDuration = "1.5s";
        closeBtn2.style.transitionDuration = "1.5s";
        backBtn.style.transitionDuration = "1.5s";
        fullscreenImagesG[0].style.transitionDuration = "0s";
        fullscreenImagesG[1].style.transitionDuration = "0s";

        backBtn.style.scale = 0;
        scrollBarBG.style.transform = "translateY(400px)";

        menuScorller.style.pointerEvents = "none";

        ch1.style.transform = "translateY(1080px)";
        ch1.style.opacity = 0;
        ch1.style.filter = "blur(30px)";

        ch2.classList.remove("chapters");
        ch2.classList.add("chaptersOpen");
        ch2.style.transform = `translate(${(index-(i+1)+1)*400}px)`;
        
        bg2.style.width = "2000px";
        bg2.style.height = "2000px";
        bg2.style.marginLeft = "1800px";
        bg2.style.marginTop = "1200px";
        bg2.style.borderRadius = "160px";

        title2.style.fontSize = "100px";
        title2.style.marginLeft = "1600px";
        title2.style.marginTop = "-600px";
        title2.style.scale = "1 0";
        title2.style.filter = "blur(30px)";
        title2.style.opacity = 0;

        subtitle2.style.fontSize = "80px";
        subtitle2.style.marginLeft = "2200px";
        subtitle2.style.marginTop = "-500px";
        subtitle2.style.width = "800px";
        setTimeout(() => { checkSubtitleOverflow(subtitle2); }, 1700);

        icon2.style.width = "600px";
        icon2.style.maxHeight = "800px";
        icon2.style.borderRadius = "60px";
        icon2.style.marginLeft = "600px";
        icon2.style.marginTop = "300px";

        


        fullscreenImagesG[0].style.width = icon2.style.width;
        fullscreenImagesG[1].style.width = icon2.style.width;

        closeBtn2.style.display = "block";
        slide12.style.display = "block";
        slide22.style.display = "block";
        if(nextBtn2 != null){
            nextBtn2.style.display = "block";
        }
        content.style.display = "block";
        fullscreenBtn.style.display = "flex";

    }, 900);

    setTimeout(() => {
        slide12.style.marginTop = "-100px";
        slide12.style.opacity = 1;
        slide12.style.filter = "blur(0)";
        closeBtn.style.transitionDuration = "0.2s";
        slide22.style.marginTop = "460px";
        slide22.style.opacity = 0.3;
        slide22.style.filter = "blur(0)";
        icon2.style.transitionDuration = "1.5s";
        if(nextBtn2 != null){
            nextBtn2.style.marginTop = "800px";
            nextBtn2.style.opacity = 1;
            nextBtn2.style.filter = "blur(0)";
            nextBtn2.onclick = () => {nextBtnCh(i+1)};
        }
        closeBtn2.style.marginLeft = "3000px";
        closeBtn2.style.opacity = 1;
        closeBtn2.style.filter = "blur(0)";
        closeBtn2.onclick = () => {closeCh(i+1)};
        fullscreenBtn.style.transitionDuration = "1.5s";
    }, 1000);

    setTimeout(() => {
        if(ch3 != null){
            ch3.style.transform = "translateY(0px)";
            ch3.style.opacity = 1;
            ch3.style.filter = "blur(0px)";
        }
        closeBtn2.style.transitionDuration = "0.2s";
        if(nextBtn2 != null){
            nextBtn2.style.transitionDuration = "0.2s";
        }
        fullscreenBtn.style.opacity = 1;
        fullscreenBtn.style.filter = "blur(0)";
        fullscreenImagesContainer.style.display = "flex";
        fullscreenImagesG[0].children[0].src = `../img/work/${i+1}-1.png`;
        fullscreenImagesG[1].children[0].src = `../img/work/${i+1}-1.png`;
        fullscreenImagesG[0].style.zIndex = imgNum[i]+7;
        fullscreenImagesG[1].style.zIndex = imgNum[i]+8;
        imgH = icon2.children[0].offsetHeight;
        fullscreenImagesG[0].style.height = imgH + "px";
                checkSubtitleOverflow(subtitle);
        fullscreenImagesG[1].style.height = imgH + "px";
        icon2.style.opacity = 0;
        tempN = 0;
        // imgLoopTimer disabled (single photo per chapter)
        chContainer.style.transitionDuration = "0.1s";
        bg.style.transitionDuration = "0.5s";
        title.style.transitionDuration = "0.5s";
        subtitle.style.transitionDuration = "0.5s";
        icon.style.transitionDuration = "0.5s";
        ch1.style.transitionDuration = "0.5s";
        menuScorller.style.pointerEvents = "none";
        content.style.opacity = 1;
        content.style.filter = "blur(0px)";
        ch1.style.transform = "translateY(1080px)";
        closeBtn.style.display = "none";
        slide1.style.display = "none";
        slide2.style.display = "none";
        nextBtn.style.display = "none";
        fullscreenBtn.style.transitionDuration = "0.2s";
    }, 2300);
}

const imgLoadingBG = document.getElementById("imgLoadingBG");


async function fullscreenImgLoop(i){
    // Single image per chapter - no loop needed
    return;
}

async function endingImgLoop(i){
    return;
}

const fullscrBG = document.getElementById("fullscrBG");
const bgText2 = document.getElementById("bgText2");



function fullscreenCh(){
    clearInterval(imgLoopTimer);
    fullscrBG.style.display = "block";
    const imgContainer = document.getElementById("fullscreenImagesContainer");
    imgContainer.style.margin = "50%";
    const imgG = document.getElementsByClassName("fullscreenImagesG");
    const closeBtn = document.getElementById("fullscrCloseBtn");
    const next = document.getElementById("fullscrNext");
    const prev = document.getElementById("fullscrPrev");
    const fullscrScrollBarBG = document.getElementById("fullscrScrollBarBG");
    const fullscrScrollBarContainer = document.getElementById("fullscrScrollBarContainer");
    const fullscrPageNum = document.getElementById("fullscrPageNum");

    imgG[0].style.transitionDuration = "1s";
    imgG[1].style.transitionDuration = "1s";

    closeBtn.style.display = "block";
    next.style.display = "block";
    prev.style.display = "block";
    fullscrScrollBarBG.style.display = "flex";
    fullscrScrollBarBG.addEventListener("mouseenter", () =>{showPageNum();});
    fullscrScrollBarBG.addEventListener("mouseleave", () =>{hidePageNum();});
    imgLoadingBG.style.width = 1080/imgH*600 + "px";
    imgLoadingBG.style.height = 1080 + "px";
    imgLoadingBG.style.borderRadius = "0px";
    imgLoadingBG.style.transform = "translate(-50%, -50%)";

    for(let i = 0; i < 2; i++){
        imgG[i].style.height = "1080px";
        imgG[i].style.width = 1080/imgH*600 + "px";
        imgG[i].style.borderRadius = "0";
        imgG[i].style.transform = "translateX(-50%)";
    }

    for(let j = 0; j < imgNum[tempI - 1]; j++){
        const scrollDot = document.createElement("div");
        scrollDot.classList.add("fullscrScrollDot");
        scrollDot.id = `fullscrScrollDot-${j+1}`;
        if( j == tempN){
            scrollDot.classList.add("fullscrScrollDotFocus");

        }
        fullscrScrollBarContainer.appendChild(scrollDot);
    }
    if(tempN > 2){
        fullscrScrollBarContainer.style.transform = `translateX(-${40*(tempN-2)}px)`;
    }
    fullscrPageNum.children[0].textContent = numberSwitch(tempN+1);
    fullscrPageNum.children[2].textContent = numberSwitch(imgNum[tempI - 1]);
    setTimeout(() => {
        closeBtn.style.opacity = 1;
        closeBtn.style.filter = "blur(0px)";
        next.style.opacity = 1;
        next.style.filter = "blur(0px)";
        prev.style.opacity = 1;
        prev.style.filter = "blur(0px)";
        fullscrScrollBarBG.style.opacity = 1;
        fullscrScrollBarBG.style.filter = "blur(0px)";
        fullscrBG.style.opacity = 1;
        fullscrBG.style.backdropFilter = "blur(30px)";
        chContainer.style.transitionDuration = "2s";
        bgText2.style.transitionDuration = "2s";
        chContainer.style.filter = "blur(30px)";
        bgText2.style.filter = "blur(30px)";
    }, 100);
}

function exitFullscr(){
    const imgContainer = document.getElementById("fullscreenImagesContainer");
    imgContainer.style.margin = "";
    const imgG = document.getElementsByClassName("fullscreenImagesG");
    for(let i = 0; i < 2; i++){
        imgG[i].style.height = imgH + "px";
        imgG[i].style.width = "600px";
        imgG[i].style.borderRadius = "60px";
        imgG[i].style.transform = "translateX(0%)";
    }

    const closeBtn = document.getElementById("fullscrCloseBtn");
    const next = document.getElementById("fullscrNext");
    const prev = document.getElementById("fullscrPrev");
    const fullscrScrollBarBG = document.getElementById("fullscrScrollBarBG");
    const fullscrScrollBarContainer = document.getElementById("fullscrScrollBarContainer");

    fullscrScrollBarContainer.innerHTML = "";

    closeBtn.style.opacity = 0;
    closeBtn.style.filter = "blur(30px)";
    next.style.opacity = 0;
    next.style.filter = "blur(30px)";
    prev.style.opacity = 0;
    prev.style.filter = "blur(30px)";
    fullscrScrollBarBG.style.opacity = 0;
    fullscrScrollBarBG.style.filter = "blur(30px)";
    fullscrScrollBarContainer.style.transform = `translateX(0px)`;
    imgLoadingBG.style.width = 0 + "px";
    hidePageNumInput();

    setTimeout(() => {
        fullscrBG.style.opacity = 0;
        fullscrBG.style.backdropFilter = "blur(0px)";
        chContainer.style.transitionDuration = "2s";
        bgText2.style.transitionDuration = "2s";
        chContainer.style.filter = "blur(0px)";
        bgText2.style.filter = "blur(0px)";
        
        // imgLoopTimer disabled (single photo per chapter)
    }, 100);
    setTimeout(() => {
        closeBtn.style.display = "none";
        next.style.display = "none";
        prev.style.display = "none";
        fullscrScrollBarBG.style.display = "none";
        fullscrBG.style.display = "none";
        chContainer.style.transitionDuration = "";
        bgText2.style.transitionDuration = "";
    }, 2100);
}

function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`圖片載入失敗: ${url}`));
        img.src = url;
    });
}

async function fullscrNextImg(){
    const imgG = document.getElementsByClassName("fullscreenImagesG");
    const scrollDot = document.getElementsByClassName("fullscrScrollDot");
    const fullscrScrollBarContainer = document.getElementById("fullscrScrollBarContainer");
    const fullscrPageNum = document.getElementById("fullscrPageNum");


    let Max = imgNum[tempI-1] - 1;

    const nextN = (tempN + 1) % (Max + 1);
    const nextImgUrl = `../img/work/${tempI}-${nextN + 1}.png`;

    const nextNextN = (tempN + 2) % (Max + 1);
    const nextNextImgUrl = `../img/work/${tempI}-${nextNextN + 1}.png`;

    if(!isSwitching){
        isSwitching = true;
        try{
            imgLoadingBG.style.display = "flex";
            imgG[1].children[0].src = nextNextImgUrl;
            await preloadImage(nextImgUrl);

            imgLoadingBG.style.display = "none";

            imgG[0].children[0].src = `../img/work/${tempI}-${(tempN)%(Max + 1) + 1}.png`;
            imgG[1].children[0].src = nextImgUrl;

            imgG[0].children[0].style.animation = "imagesLoop1 1s cubic-bezier(.4,0,.2,1)";
            imgG[1].children[0].style.animation = "imagesLoop2 1s cubic-bezier(.4,0,.2,1)";

            tempN = nextN;

            for(let i = 0; i < scrollDot.length; i++){
                if(i != tempN)
                scrollDot[i].classList.remove("fullscrScrollDotFocus");
            }
            if(tempN > 2){
                fullscrScrollBarContainer.style.transform = `translateX(-${40*(tempN-2)}px)`;
            }
            else{
                fullscrScrollBarContainer.style.transform = `translateX(0)`;
            }
            scrollDot[tempN].classList.add("fullscrScrollDotFocus");
            fullscrPageNum.children[0].textContent = numberSwitch(tempN+1);
            fullscrPageNum.children[2].textContent = numberSwitch(imgNum[tempI - 1]);

            await new Promise(resolve => {
                const targetElement = imgG[1].children[0]; 

                const handleAnimationEnd = () => {
                    targetElement.removeEventListener('animationend', handleAnimationEnd); 
                    resolve();
                };

                targetElement.addEventListener('animationend', handleAnimationEnd);
            });

            imgG[0].children[0].style.animation = "none";
            imgG[1].children[0].style.animation = "none";
            imgG[0].children[0].src = `../img/work/${tempI}-${(tempN)%(Max + 1) + 1}.png`;
            imgG[1].children[0].src = `../img/work/${tempI}-${(tempN+1)%(Max + 1) + 1}.png`;
            isSwitching = false;
        }
        catch (error){
            console.error(error.message);
            isSwitching = false;
        }
    }
}

async function fullscrPrevImg(){
    const imgG = document.getElementsByClassName("fullscreenImagesG");
    const scrollDot = document.getElementsByClassName("fullscrScrollDot");
    const fullscrScrollBarContainer = document.getElementById("fullscrScrollBarContainer");
    const fullscrPageNum = document.getElementById("fullscrPageNum");


    let Max = imgNum[tempI-1] - 1;

    const prevN = (tempN - 1 + (Max + 1)) % (Max + 1);
    const prevImgUrl = `../img/work/${tempI}-${prevN + 1}.png`;

    const currentN = tempN;
    const currentImgUrl = `../img/work/${tempI}-${currentN + 1}.png`;

    if(!isSwitching){
        isSwitching = true;

        try{
            imgLoadingBG.style.display = "flex";
            
            await preloadImage(prevImgUrl);
            imgG[0].children[0].src = prevImgUrl; 
            imgG[1].children[0].src = currentImgUrl; 

            imgLoadingBG.style.display = "none";
            
            imgG[0].children[0].style.animation = "imagesLoop3 1s cubic-bezier(.4,0,.2,1)";
            imgG[1].children[0].style.animation = "imagesLoop4 1s cubic-bezier(.4,0,.2,1)";
            
            tempN = prevN;

            for(let i = 0; i < scrollDot.length; i++){
                if(i != tempN)
                scrollDot[i].classList.remove("fullscrScrollDotFocus");
            }
            if(tempN > 2){
                fullscrScrollBarContainer.style.transform = `translateX(-${40*(tempN-2)}px)`;
            }
            else{
                fullscrScrollBarContainer.style.transform = `translateX(0)`;
            }
            scrollDot[tempN].classList.add("fullscrScrollDotFocus");
            fullscrPageNum.children[0].textContent = numberSwitch(tempN+1);
            fullscrPageNum.children[2].textContent = numberSwitch(imgNum[tempI - 1]);

            await new Promise(resolve => {
                const targetElement = imgG[0].children[0]; 
                const handleAnimationEnd = () => {
                    targetElement.removeEventListener('animationend', handleAnimationEnd); 
                    resolve();
                };
                targetElement.addEventListener('animationend', handleAnimationEnd);
            });
            
            imgG[0].children[0].style.animation = "none";
            imgG[1].children[0].style.animation = "none";
            isSwitching = false;
        }
        catch (error){
            console.error(error.message);
            isSwitching = false;
        }
    }
}

function numberSwitch(n){
    let newString = "";
    if(n < 10){
        newString = `0${n}`;
    }
    else{
        newString = `${n}`;
    }
    return newString;
}

function showPageNum(){
    if(!isTypingPageNum){
        const fullscrScrollBarContainer = document.getElementById("fullscrScrollBarContainer");
        const fullscrPageNum = document.getElementById("fullscrPageNum");
    
        fullscrScrollBarContainer.style.opacity = 0;
        fullscrScrollBarContainer.style.filter = "blur(15px)";
        fullscrPageNum.style.opacity = 1;
        fullscrPageNum.style.filter = "blur(0px)";
    }
}
const pageNumInput = document.getElementById("pageNumInput");
let isTypingPageNum;

function hidePageNum(){
    const fullscrScrollBarContainer = document.getElementById("fullscrScrollBarContainer");
    const fullscrPageNum = document.getElementById("fullscrPageNum");
    
    if(!isTypingPageNum){
        fullscrScrollBarContainer.style.opacity = 1;
        fullscrScrollBarContainer.style.filter = "blur(0px)";
        fullscrPageNum.style.opacity = 0;
        fullscrPageNum.style.filter = "blur(15px)";
        pageNumInput.style.opacity = 0;
        pageNumInput.style.filter = "blur(15px)";
        pageNumInput.removeAttribute("disabled");
    }
}

const fullscrScrollBarBG = document.getElementById("fullscrScrollBarBG");
let tempValue = tempN + 1;


function showPageNumInput(){
    const fullscrPageNum = document.getElementById("fullscrPageNum");
    fullscrPageNum.style.opacity = 0;
    fullscrPageNum.style.filter = "blur(15px)";
    pageNumInput.style.opacity = 1;
    pageNumInput.style.filter = "blur(0px)";
    fullscrScrollBarBG.classList.add("open");
    fullscrScrollBarBG.style.transform = "translateY(-740px) scale(1.5)";
    tempValue = tempN + 1;
}

function hidePageNumInput(){
    const fullscrPageNum = document.getElementById("fullscrPageNum");
    fullscrPageNum.style.opacity = 1;
    fullscrPageNum.style.filter = "blur(0px)";
    pageNumInput.style.opacity = 0;
    pageNumInput.style.filter = "blur(15px)";
    fullscrScrollBarBG.classList.remove("open");
    fullscrScrollBarBG.style.transform = "";
    closeKeyboard();
    isTypingPageNum = false;
    pageNumInput.setAttribute("disabled", false);
    hidePageNum();
}

function openKeyboard(){
    const keyboard = document.getElementById("pageNumKeyboard");
    keyboard.style.scale = "1 1";
    keyboard.style.transform = "translate(-50%, -200px)";
    keyboard.style.filter = "blur(0)";
    const keys = document.getElementsByClassName("key");
    for(let i = 0; i < keys.length; i++){
        keys[i].onmouseenter = (e) => {keyboardKeyHover(e, i)};
        keys[i].onmousemove = (e) => {keyboardKeyHover(e, i)};
        keys[i].onmouseleave = () => {keyboardKeyLeave(i)};
    }
}

function keyboardKeyHover(e, i){
    const keyLight = document.getElementsByClassName("keyLight");
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    keyLight[i].style.opacity = 0.5;
    keyLight[i].style.transform = `translate(${x}px, ${y}px)`;
}

function keyboardKeyLeave(i){
    const keyLight = document.getElementsByClassName("keyLight");
    keyLight[i].style.opacity = 0;

}


function typePageNum(e){
    const Max = imgNum[tempI -1];
    const Min = 1;

    if(e == "a"){
        tempValue = Math.floor(tempValue/10);
        if(tempValue > Max){
            tempValue = Max;
        }
        if(tempValue < Min){
            tempValue = Min;
        }
        pageNumInput.value = `${numberSwitch(tempValue)} / ${numberSwitch(Max)}`;
    }
    else if(e == "b"){
        if(tempValue > Max){
            tempValue = Max;
        }
        if(tempValue < Min){
            tempValue = Min;
        }
        pageNumInput.value = `${numberSwitch(tempValue)} / ${numberSwitch(Max)}`;
        fullscrSwitchTo(tempValue);
        hidePageNumInput();
    }
    else{
        if(tempValue == Min && e != 1 & e != 0){
            tempValue = (tempValue*0 + parseInt(e))%100;
        }
        else{
            tempValue = (tempValue*10 + parseInt(e))%100;
        }
        if(tempValue > Max){
            tempValue = Max;
        }
        if(tempValue < Min){
            tempValue = Min;
        }
        pageNumInput.value = `${numberSwitch(tempValue)} / ${numberSwitch(Max)}`;
    }
}

async function fullscrSwitchTo(targetIndex){
    const imgG = document.getElementsByClassName("fullscreenImagesG");
    const scrollDot = document.getElementsByClassName("fullscrScrollDot");
    const fullscrScrollBarContainer = document.getElementById("fullscrScrollBarContainer");
    const fullscrPageNum = document.getElementById("fullscrPageNum");

    const Max = imgNum[tempI - 1] - 1;
    const targetN = targetIndex - 1;

    if (targetN === tempN) {
        return;
    }
    if (!isSwitching) {
        isSwitching = true;

        try {
            imgLoadingBG.style.display = "flex";

            const targetImgUrl = `../img/work/${tempI}-${targetN + 1}.png`;
            const currentImgUrl = `../img/work/${tempI}-${tempN + 1}.png`;

            await preloadImage(targetImgUrl);

            imgLoadingBG.style.display = "none";

            const isForward = targetN > tempN;

            if (isForward) {
                imgG[0].children[0].src = currentImgUrl;
                imgG[1].children[0].src = targetImgUrl;

                imgG[0].children[0].style.animation = "imagesLoop1 1s cubic-bezier(.4,0,.2,1)";
                imgG[1].children[0].style.animation = "imagesLoop2 1s cubic-bezier(.4,0,.2,1)";
            } else {
                imgG[0].children[0].src = targetImgUrl;
                imgG[1].children[0].src = currentImgUrl;

                imgG[0].children[0].style.animation = "imagesLoop3 1s cubic-bezier(.4,0,.2,1)";
                imgG[1].children[0].style.animation = "imagesLoop4 1s cubic-bezier(.4,0,.2,1)";
            }

            tempN = targetN;

            for (let i = 0; i < scrollDot.length; i++) {
                if (i != tempN) {
                    scrollDot[i].classList.remove("fullscrScrollDotFocus");
                }
            }

            if (tempN > 2) {
                fullscrScrollBarContainer.style.transform = `translateX(-${40 * (tempN - 2)}px)`;
            } else {
                fullscrScrollBarContainer.style.transform = `translateX(0)`;
            }

            scrollDot[tempN].classList.add("fullscrScrollDotFocus");
            fullscrPageNum.children[0].textContent = numberSwitch(tempN + 1);
            fullscrPageNum.children[2].textContent = numberSwitch(imgNum[tempI - 1]);

            await new Promise(resolve => {
                const targetElement = isForward ? imgG[1].children[0] : imgG[0].children[0];

                const handleAnimationEnd = () => {
                    targetElement.removeEventListener('animationend', handleAnimationEnd);
                    resolve();
                };

                targetElement.addEventListener('animationend', handleAnimationEnd);
            });

            imgG[0].children[0].style.animation = "none";
            imgG[1].children[0].style.animation = "none";
            imgG[0].children[0].src = `../img/work/${tempI}-${tempN + 1}.png`;
            imgG[1].children[0].src = `../img/work/${tempI}-${(tempN + 1) % (Max + 1) + 1}.png`;

            isSwitching = false;
        } catch (error) {
            console.error(error.message);
            isSwitching = false;
        }
    }
}

function closeKeyboard(){
    const keyboard = document.getElementById("pageNumKeyboard");
    keyboard.style.scale = "0.5 3";
    keyboard.style.transform = "translate(-75%, 600px)";
    keyboard.style.filter = "blur(10px)";
}

fullscrScrollBarBG.addEventListener("click", () => {
    isTypingPageNum = true;
    showPageNumInput();
    openKeyboard();
    pageNumInput.setAttribute("disabled", true);
    pageNumInput.value = `${numberSwitch(tempN+1)} / ${numberSwitch(imgNum[tempI-1])}`;
});

pageNumInput.addEventListener("blur", () => {

});
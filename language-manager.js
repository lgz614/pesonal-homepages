// 语言管理器
class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('preferred-language') || 'zh';
        this.resources = window.LANGUAGE_RESOURCES || {};
        this.init();
    }

    // 初始化
    init() {
        document.documentElement.lang = this.currentLang;
        this.updateButtonText();
        this.updateStaticText();
    }

    // 切换语言
    toggleLanguage() {
        this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
        localStorage.setItem('preferred-language', this.currentLang);
        document.documentElement.lang = this.currentLang;

        this.updateButtonText();
        this.updateStaticText();
        this.updateDynamicText();
    }

    // 更新按钮文本
    updateButtonText() {
        const button = document.getElementById('language-toggle');
        if (button) {
            button.textContent = this.resources.button[this.currentLang];
            button.setAttribute('data-lang', this.currentLang);
        }
    }

    // 更新静态文本
    updateStaticText() {
        const elements = document.querySelectorAll('[data-lang-key]');
        elements.forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (this.resources.static[key]) {
                element.textContent = this.resources.static[key][this.currentLang];
            }
        });

        // 更新导航按钮文本
        this.updateNavButtons();
    }

    // 更新导航按钮
    updateNavButtons() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const navKeys = ['personal-info', 'papers', 'awards', 'projects', 'contact'];

        navButtons.forEach((button, index) => {
            if (navKeys[index] && this.resources.static[navKeys[index]]) {
                button.textContent = this.resources.static[navKeys[index]][this.currentLang];
            }
        });
    }

    // 更新动态内容文本
    updateDynamicText() {
        // 更新动态加载的内容标题
        const sectionTitles = document.querySelectorAll('.section-title');
        const titleKeys = ['personal-info', 'papers', 'awards', 'projects', 'contact'];

        sectionTitles.forEach((title, index) => {
            if (titleKeys[index] && this.resources.static[titleKeys[index]]) {
                title.textContent = this.resources.static[titleKeys[index]][this.currentLang];
            }
        });

        // 更新加载提示
        this.updateLoadingText();
    }

    // 更新加载提示文本
    updateLoadingText() {
        const loadingElements = {
            'personal-container': 'loading-personal',
            'publications-container': 'loading-publications',
            'awards-container': 'loading-awards',
            'projects-container': 'loading-projects',
            'contact-container': 'loading-contact'
        };

        Object.entries(loadingElements).forEach(([containerId, key]) => {
            const container = document.getElementById(containerId);
            if (container) {
                const loadingText = container.querySelector('p');
                if (loadingText && this.resources.static[key]) {
                    loadingText.textContent = this.resources.static[key][this.currentLang];
                }
            }
        });
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLang;
    }

    // 翻译动态内容
    translateDynamicContent(content, key) {
        if (this.resources.dynamic[key]) {
            return this.resources.dynamic[key][this.currentLang] || content;
        }
        return content;
    }
}

// 初始化语言管理器
let languageManager = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    languageManager = new LanguageManager();

    // 绑定语言切换按钮事件
    const languageButton = document.getElementById('language-toggle');
    if (languageButton) {
        languageButton.addEventListener('click', () => {
            languageManager.toggleLanguage();
        });
    }
});

// 全局辅助函数
function translateText(key, type = 'static') {
    if (!languageManager) return key;
    const resources = languageManager.resources[type] || {};
    return resources[key]?.[languageManager.getCurrentLanguage()] || key;
}
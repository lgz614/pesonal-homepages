// Awards API 处理模块
class AwardsAPI {
    constructor() {
        this.config = window.GITHUB_CONFIG || {
            owner: 'your-github-username',
            repo: 'your-repo-name',
            apiUrl: 'https://api.github.com/repos',
            label: 'publication'
        };
        this.awardsLabel = 'award';
        this.awardsContainer = null;
        this.loadingElement = null;
        this.errorElement = null;
    }

    // 初始化
    init() {
        this.awardsContainer = document.getElementById('awards-container');
        if (!this.awardsContainer) {
            console.error('Awards container not found');
            return;
        }

        this.loadingElement = this.createLoadingElement();
        this.errorElement = this.createErrorElement();

        // 检查配置
        if (!this.isConfigured()) {
            this.showError('GitHub configuration not set. Please update github-config.js');
            return;
        }

        // 加载获奖数据
        this.loadAwards();
    }

    // 检查是否已配置
    isConfigured() {
        return this.config.owner !== 'your-github-username' &&
               this.config.repo !== 'your-repo-name';
    }

    // 加载获奖数据
    async loadAwards() {
        this.showLoading();

        try {
            const apiUrl = `${this.config.apiUrl}/${this.config.owner}/${this.config.repo}/issues?labels=${this.awardsLabel}`;
            console.log('Fetching awards from:', apiUrl);

            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Personal-Homepage-Awards'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const issues = await response.json();
            console.log('Fetched awards:', issues);

            this.hideLoading();

            if (issues.length === 0) {
                this.showEmptyState();
            } else {
                this.renderAwards(issues);
            }

        } catch (error) {
            console.error('Error loading awards:', error);
            this.hideLoading();
            this.showError(`Failed to load awards: ${error.message}`);
        }
    }

    // 渲染获奖列表
    renderAwards(issues) {
        const awardsGrid = this.createAwardsGrid();

        issues.forEach(issue => {
            const awardItem = this.createAwardItem(issue);
            if (awardItem) {
                awardsGrid.appendChild(awardItem);
            }
        });

        // 清空容器并添加新内容
        this.awardsContainer.innerHTML = '';
        this.awardsContainer.appendChild(awardsGrid);
    }

    // 创建获奖项目
    createAwardItem(issue) {
        const item = document.createElement('div');
        item.className = 'award-item';

        // 提取获奖信息
        const awardData = this.extractAwardData(issue);

        if (!awardData.title) {
            console.warn('Award missing title, skipping:', issue);
            return null;
        }

        // 安全处理文本内容
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        // 创建获奖图标（根据奖项级别）
        const awardIcon = this.getAwardIcon(awardData.level);

        // 创建项目内容
        item.innerHTML = `
            <div class="award-icon">${awardIcon}</div>
            <div class="award-content">
                <div class="award-title">${escapeHtml(awardData.title)}</div>
                ${awardData.date ? `<div class="award-date">${escapeHtml(awardData.date)}</div>` : ''}
                ${awardData.organization ? `<div class="award-organization">${escapeHtml(awardData.organization)}</div>` : ''}
                ${awardData.description ? `<div class="award-description">${escapeHtml(awardData.description)}</div>` : ''}
            </div>
        `;

        return item;
    }

    // 从Issue中提取获奖信息
    extractAwardData(issue) {
        const data = {};

        // 标题
        data.title = issue.title || '';

        // 从正文中提取信息
        const body = issue.body || '';

        // 提取日期 (格式: Date: 2024-12-15)
        const dateMatch = body.match(/Date:\s*([^\n]+)/i);
        data.date = dateMatch ? dateMatch[1].trim() : null;

        // 提取颁发机构 (格式: Organization: 奖项名称)
        const organizationMatch = body.match(/Organization:\s*([^\n]+)/i);
        data.organization = organizationMatch ? organizationMatch[1].trim() : null;

        // 提取描述 (格式: Description: 获奖描述)
        const descriptionMatch = body.match(/Description:\s*([^\n]+)/i);
        data.description = descriptionMatch ? descriptionMatch[1].trim() : null;

        // 提取级别 (格式: Level: first, gold, second, silver等)
        const levelMatch = body.match(/Level:\s*([^\n]+)/i);
        data.level = levelMatch ? levelMatch[1].trim().toLowerCase() : null;

        return data;
    }

    // 根据级别获取获奖图标
    getAwardIcon(level) {
        const icons = {
            'first': '🏆',
            'gold': '🥇',
            'second': '🥈',
            'silver': '🥈',
            'third': '🥉',
            'bronze': '🥉',
            'special': '🎖️',
            'honor': '🎖️',
            'outstanding': '⭐',
            'excellent': '⭐',
            'merit': '🏅'
        };

        return icons[level] || '🏅';
    }

    // 创建加载元素
    createLoadingElement() {
        const loading = document.createElement('div');
        loading.className = 'awards-loading';
        loading.innerHTML = '<div class="loading-spinner"></div><p>Loading awards...</p>';
        return loading;
    }

    // 创建错误元素
    createErrorElement() {
        const error = document.createElement('div');
        error.className = 'awards-error';
        return error;
    }

    // 显示加载状态
    showLoading() {
        this.awardsContainer.innerHTML = '';
        this.awardsContainer.appendChild(this.loadingElement);
    }

    // 隐藏加载状态
    hideLoading() {
        if (this.loadingElement.parentNode) {
            this.loadingElement.parentNode.removeChild(this.loadingElement);
        }
    }

    // 显示错误
    showError(message) {
        this.errorElement.innerHTML = `<p class="error-message">${message}</p>`;
        this.awardsContainer.innerHTML = '';
        this.awardsContainer.appendChild(this.errorElement);
    }

    // 显示空状态
    showEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'awards-empty';
        emptyState.innerHTML = '<p>No awards found. Add issues with the "award" label to your GitHub repository.</p>';
        this.awardsContainer.innerHTML = '';
        this.awardsContainer.appendChild(emptyState);
    }

    // 创建获奖网格容器
    createAwardsGrid() {
        const grid = document.createElement('div');
        grid.className = 'awards-grid';
        return grid;
    }
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待 GITHUB_CONFIG 加载完成
    if (typeof window.GITHUB_CONFIG !== 'undefined') {
        const xxxAPI = new xxxAPI();
        xxxAPI.init();
    } else {
        console.error('GITHUB_CONFIG not loaded, please check github-config.js');
        // 显示错误信息在页面上
        const container = document.getElementById('xxx-container');
        if (container) {
            container.innerHTML = '<div class="error-message">GitHub configuration not set. Please check github-config.js</div>';
        }
    }
});


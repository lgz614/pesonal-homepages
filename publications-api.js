// Publications API 处理模块
class PublicationsAPI {
    constructor() {
        this.config = window.GITHUB_CONFIG || {
            owner: 'your-github-username',
            repo: 'your-repo-name',
            apiUrl: 'https://api.github.com/repos',
            label: 'publication'
        };
        this.loadingElement = null;
        this.errorElement = null;
        this.publicationsContainer = null;
    }

    // 初始化
    init() {
        this.publicationsContainer = document.getElementById('publications-container');
        if (!this.publicationsContainer) {
            console.error('Publications container not found');
            return;
        }

        this.loadingElement = this.createLoadingElement();
        this.errorElement = this.createErrorElement();

        // 检查配置
        if (!this.isConfigured()) {
            this.showError('GitHub configuration not set. Please update github-config.js with your GitHub username and repository name.');
            return;
        }

        // 加载论文数据
        this.loadPublications();
    }

    // 检查是否已配置
    isConfigured() {
        return this.config.owner !== 'your-github-username' &&
               this.config.repo !== 'your-repo-name';
    }

    // 加载论文数据
    async loadPublications() {
        this.showLoading();

        try {
            const apiUrl = `${this.config.apiUrl}/${this.config.owner}/${this.config.repo}/issues?labels=${this.config.label}`;
            console.log('Fetching from:', apiUrl);

            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Personal-Homepage-Publications'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const issues = await response.json();
            console.log('Fetched issues:', issues);

            this.hideLoading();

            if (issues.length === 0) {
                this.showEmptyState();
            } else {
                this.renderPublications(issues);
            }

        } catch (error) {
            console.error('Error loading publications:', error);
            this.hideLoading();
            this.showError(`Failed to load publications: ${error.message}. Please check your GitHub configuration.`);
        }
    }

    // 渲染论文列表
    renderPublications(issues) {
        const publicationsGrid = this.createPublicationsGrid();

        issues.forEach(issue => {
            const publicationCard = this.createPublicationCard(issue);
            if (publicationCard) {
                publicationsGrid.appendChild(publicationCard);
            }
        });

        // 清空容器并添加新内容
        this.publicationsContainer.innerHTML = '';
        this.publicationsContainer.appendChild(publicationsGrid);
    }

    // 创建论文卡片
    createPublicationCard(issue) {
        const card = document.createElement('div');
        card.className = 'publication-card';

        // 提取论文信息
        const publicationData = this.extractPublicationData(issue);

        if (!publicationData.title) {
            console.warn('Publication missing title, skipping:', issue);
            return null;
        }

        // 创建卡片内容
        card.innerHTML = `
            ${publicationData.image ? `<div class="publication-image"><img src="${publicationData.image}" alt="${publicationData.title}"></div>` : ''}
            <div class="publication-content">
                <h3 class="publication-title">${publicationData.title}</h3>
                ${publicationData.authors ? `<div class="publication-authors">${publicationData.authors}</div>` : ''}
                ${publicationData.venue ? `<div class="publication-venue">${publicationData.venue}</div>` : ''}
                ${publicationData.date ? `<div class="publication-date">${publicationData.date}</div>` : ''}
                <div class="publication-links">
                    ${publicationData.pdf ? `<a href="${publicationData.pdf}" class="publication-link" target="_blank">PDF</a>` : ''}
                    ${publicationData.code ? `<a href="${publicationData.code}" class="publication-link" target="_blank">Code</a>` : ''}
                    ${publicationData.project ? `<a href="${publicationData.project}" class="publication-link" target="_blank">Project</a>` : ''}
                    ${publicationData.arxiv ? `<a href="${publicationData.arxiv}" class="publication-link" target="_blank">arXiv</a>` : ''}
                    ${publicationData.doi ? `<a href="${publicationData.doi}" class="publication-link" target="_blank">DOI</a>` : ''}
                </div>
                ${publicationData.abstract ? `<div class="publication-abstract">${publicationData.abstract}</div>` : ''}
                ${publicationData.citations ? `<div class="publication-citations">Citations: ${publicationData.citations}</div>` : ''}
            </div>
        `;

        return card;
    }

    // 从Issue中提取论文信息
    extractPublicationData(issue) {
        const data = {};

        // 标题
        data.title = issue.title || '';

        // 从正文中提取信息
        const body = issue.body || '';

        // 提取作者 (格式: Authors: 张三, 李四)
        const authorsMatch = body.match(/Authors?:\s*([^\n]+)/i);
        data.authors = authorsMatch ? authorsMatch[1].trim() : null;

        // 提取会议/期刊 (格式: Venue: CVPR 2024)
        const venueMatch = body.match(/Venue:\s*([^\n]+)/i);
        data.venue = venueMatch ? venueMatch[1].trim() : null;

        // 提取日期 (格式: Date: 2024-12-15)
        const dateMatch = body.match(/Date:\s*([^\n]+)/i);
        data.date = dateMatch ? dateMatch[1].trim() : null;

        // 提取PDF链接 (格式: PDF: https://...)
        const pdfMatch = body.match(/PDF:\s*(https?:\/\/[^\s\n]+)/i);
        data.pdf = pdfMatch ? pdfMatch[1].trim() : null;

        // 提取代码链接 (格式: Code: https://...)
        const codeMatch = body.match(/Code:\s*(https?:\/\/[^\s\n]+)/i);
        data.code = codeMatch ? codeMatch[1].trim() : null;

        // 提取项目链接 (格式: Project: https://...)
        const projectMatch = body.match(/Project:\s*(https?:\/\/[^\s\n]+)/i);
        data.project = projectMatch ? projectMatch[1].trim() : null;

        // 提取arXiv链接 (格式: arXiv: https://...)
        const arxivMatch = body.match(/arXiv:\s*(https?:\/\/[^\s\n]+)/i);
        data.arxiv = arxivMatch ? arxivMatch[1].trim() : null;

        // 提取DOI (格式: DOI: 10.xxxx/xxxx)
        const doiMatch = body.match(/DOI:\s*([^\s\n]+)/i);
        data.doi = doiMatch ? doiMatch[1].trim() : null;

        // 提取引用数 (格式: Citations: 42)
        const citationsMatch = body.match(/Citations:\s*(\d+)/i);
        data.citations = citationsMatch ? parseInt(citationsMatch[1]) : null;

        // 提取摘要 (格式: Abstract: 这里是摘要内容)
        const abstractMatch = body.match(/Abstract:\s*([^\n]+)/i);
        data.abstract = abstractMatch ? abstractMatch[1].trim() : null;

        // 提取第一张图片
        const imageMatch = body.match(/!\[[^\]]*\]\(([^)]+)\)/);
        data.image = imageMatch ? imageMatch[1] : null;

        return data;
    }

    // 创建加载元素
    createLoadingElement() {
        const loading = document.createElement('div');
        loading.className = 'publications-loading';
        loading.innerHTML = '<div class="loading-spinner"></div><p>Loading publications...</p>';
        return loading;
    }

    // 创建错误元素
    createErrorElement() {
        const error = document.createElement('div');
        error.className = 'publications-error';
        return error;
    }

    // 显示加载状态
    showLoading() {
        this.publicationsContainer.innerHTML = '';
        this.publicationsContainer.appendChild(this.loadingElement);
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
        this.publicationsContainer.innerHTML = '';
        this.publicationsContainer.appendChild(this.errorElement);
    }

    // 显示空状态
    showEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'publications-empty';
        emptyState.innerHTML = '<p>No publications found. Add issues with the "publication" label to your GitHub repository.</p>';
        this.publicationsContainer.innerHTML = '';
        this.publicationsContainer.appendChild(emptyState);
    }

    // 创建论文网格容器
    createPublicationsGrid() {
        const grid = document.createElement('div');
        grid.className = 'publications-grid';
        return grid;
    }
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载GitHub配置
    const script = document.createElement('script');
    script.src = 'github-config.js';
    script.onload = () => {
        const publicationsAPI = new PublicationsAPI();
        publicationsAPI.init();
    };
    document.head.appendChild(script);
});
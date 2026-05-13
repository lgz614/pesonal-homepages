// Publications API 处理模块
class PublicationsAPI {
    constructor() {
        this.config = window.GITHUB_CONFIG || {
            owner: 'your-github-username',
            repo: 'your-repo-name',
            apiUrl: 'https://api.github.com/repos',
            labels: { publication: 'publication' }
        };
        this.publicationsLabel = this.config.labels.publication || 'publication';
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
            this.showError('GitHub configuration not set. Please update github-config.js');
            return;
        }

        // 加载论文数据
        this.loadPublications();
    }

    // 检查是否已配置
    isConfigured() {
        // 如果有全局配置检查函数，使用全局函数
        if (window.isGitHubConfigured) {
            return window.isGitHubConfigured();
        }
        // 否则使用本地配置检查
        return this.config.owner !== 'your-github-username' &&
               this.config.repo !== 'your-repo-name';
    }

    // 加载论文数据
    async loadPublications() {
        this.showLoading();

        try {
            const apiUrl = window.getApiUrl ? window.getApiUrl('publication') : `${this.config.apiUrl}/${this.config.owner}/${this.config.repo}/issues?labels=${this.publicationsLabel}`;
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

    // 创建论文内容
    createPublicationCard(issue) {
        // 提取论文信息
        const publicationData = this.extractPublicationData(issue);

        if (!publicationData.title) {
            console.warn('Publication missing title, skipping:', issue);
            return null;
        }

        // 安全处理文本内容，防止XSS
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        // 验证URL格式
        const isValidUrl = (url) => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        };

        // 过滤无效链接
        const validLinks = {};
        if (publicationData.pdf && isValidUrl(publicationData.pdf)) validLinks.pdf = publicationData.pdf;
        if (publicationData.code && isValidUrl(publicationData.code)) validLinks.code = publicationData.code;
        if (publicationData.project && isValidUrl(publicationData.project)) validLinks.project = publicationData.project;
        if (publicationData.arxiv && isValidUrl(publicationData.arxiv)) validLinks.arxiv = publicationData.arxiv;
        if (publicationData.doi && isValidUrl(publicationData.doi)) validLinks.doi = publicationData.doi;

        // 翻译链接文本
        const getLinkText = (key) => {
            const translations = {
                pdf: { zh: 'PDF', en: 'PDF' },
                code: { zh: '代码', en: 'Code' },
                project: { zh: '项目', en: 'Project' },
                arxiv: { zh: '预印本', en: 'arXiv' },
                doi: { zh: 'DOI', en: 'DOI' }
            };
            if (languageManager && translations[key]) {
                return translations[key][languageManager.getCurrentLanguage()] || key;
            }
            return key;
        };

        // 直接输出issue信息，不使用卡片形式
        const hasImage = publicationData.image && isValidUrl(publicationData.image);
        const content = document.createElement('div');
        content.className = 'paper-content';

        // 构建内容HTML
        let contentHTML = `
            <div class="paper-info">
                <h3 class="paper-title">${escapeHtml(publicationData.title)}</h3>
                ${publicationData.authors ? `<div class="paper-authors">${escapeHtml(publicationData.authors)}</div>` : ''}
                ${publicationData.venue ? `<div class="paper-venue">${escapeHtml(publicationData.venue)}</div>` : ''}
                ${publicationData.date ? `<div class="paper-date">${escapeHtml(publicationData.date)}</div>` : ''}
                ${Object.keys(validLinks).length > 0 ? `
                    <div class="paper-links">
                        ${validLinks.pdf ? `<a href="${validLinks.pdf}" class="paper-link" target="_blank" rel="noopener noreferrer">${getLinkText('pdf')}</a>` : ''}
                        ${validLinks.code ? `<a href="${validLinks.code}" class="paper-link" target="_blank" rel="noopener noreferrer">${getLinkText('code')}</a>` : ''}
                        ${validLinks.project ? `<a href="${validLinks.project}" class="paper-link" target="_blank" rel="noopener noreferrer">${getLinkText('project')}</a>` : ''}
                        ${validLinks.arxiv ? `<a href="${validLinks.arxiv}" class="paper-link" target="_blank" rel="noopener noreferrer">${getLinkText('arxiv')}</a>` : ''}
                        ${validLinks.doi ? `<a href="${validLinks.doi}" class="paper-link" target="_blank" rel="noopener noreferrer">${getLinkText('doi')}</a>` : ''}
                    </div>
                ` : ''}
                ${publicationData.abstract ? `<div class="paper-abstract">${escapeHtml(publicationData.abstract)}</div>` : ''}
                ${publicationData.citations ? `<div class="paper-citations">${translateText('citations', 'dynamic') || 'Citations'}: ${publicationData.citations}</div>` : ''}
            </div>
        `;

        // 图片在文字下方
        if (hasImage) {
            contentHTML += `<div class="paper-image"><img src="${publicationData.image}" alt="${escapeHtml(publicationData.title)}" onerror="this.style.display='none'"></div>`;
        }

        content.innerHTML = contentHTML;
        return content;
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

        // 提取第一张图片（支持多种格式）
        // 1. 优先匹配HTML格式的img标签
        const htmlMatch = body.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (htmlMatch) {
            data.image = htmlMatch[1];
        } else {
            // 2. 匹配Markdown格式的图片
            const markdownMatch = body.match(/!\[[^\]]*\]\(([^)]+)\)/);
            if (markdownMatch) {
                data.image = markdownMatch[1];
            } else {
                // 3. 匹配纯URL格式的图片
                const urlMatch = body.match(/(https?:\/\/[^\s\n]+)/);
                data.image = urlMatch ? urlMatch[1] : null;
            }
        }

        return data;
    }

    // 创建加载元素
    createLoadingElement() {
        const loading = document.createElement('div');
        loading.className = 'publications-loading';
        const loadingText = languageManager ? translateText('loading-publications') : 'Loading publications...';
        loading.innerHTML = `<div class="loading-spinner"></div><p>${loadingText}</p>`;
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
        const emptyText = languageManager ? translateText('empty-publications') : 'No publications found. Add issues with the "publication" label to your GitHub repository.';
        emptyState.innerHTML = `<p>${emptyText}</p>`;
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
    const publicationsAPI = new PublicationsAPI();
    publicationsAPI.init();
});

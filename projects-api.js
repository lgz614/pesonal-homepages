// Projects API 处理模块
class ProjectsAPI {
    constructor() {
        this.config = window.GITHUB_CONFIG || {
            owner: 'your-github-username',
            repo: 'your-repo-name',
            apiUrl: 'https://api.github.com/repos',
            labels: { project: 'project' }
        };
        this.projectsLabel = 'project';
        this.projectsContainer = null;
        this.loadingElement = null;
        this.errorElement = null;
    }

    // 初始化
    init() {
        this.projectsContainer = document.getElementById('projects-container');
        if (!this.projectsContainer) {
            console.error('Projects container not found');
            return;
        }

        this.loadingElement = this.createLoadingElement();
        this.errorElement = this.createErrorElement();

        // 检查配置
        if (!this.isConfigured()) {
            this.showError('GitHub configuration not set. Please update github-config.js');
            return;
        }

        // 加载项目数据
        this.loadProjects();
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

    // 加载项目数据
    async loadProjects() {
        this.showLoading();

        try {
            const apiUrl = window.getApiUrl ? window.getApiUrl('project') : `${this.config.apiUrl}/${this.config.owner}/${this.config.repo}/issues?labels=${this.projectsLabel}`;
            console.log('Fetching projects from:', apiUrl);

            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Personal-Homepage-Projects'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const issues = await response.json();
            console.log('Fetched projects:', issues);

            this.hideLoading();

            if (issues.length === 0) {
                this.showEmptyState();
            } else {
                this.renderProjects(issues);
            }

        } catch (error) {
            console.error('Error loading projects:', error);
            this.hideLoading();
            this.showError(`Failed to load projects: ${error.message}`);
        }
    }

    // 渲染项目列表
    renderProjects(issues) {
        const projectsGrid = this.createProjectsGrid();

        issues.forEach(issue => {
            const projectCard = this.createProjectCard(issue);
            if (projectCard) {
                projectsGrid.appendChild(projectCard);
            }
        });

        // 清空容器并添加新内容
        this.projectsContainer.innerHTML = '';
        this.projectsContainer.appendChild(projectsGrid);
    }

    // 创建项目卡片
    createProjectCard(issue) {
        const content = document.createElement('div');
        content.className = 'project-content';

        // 提取项目信息
        const projectData = this.extractProjectData(issue);

        if (!projectData.title) {
            console.warn('Project missing title, skipping:', issue);
            return null;
        }

        // 安全处理文本内容
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

        // 过滤有效链接
        const validLinks = {};
        if (projectData.demo && isValidUrl(projectData.demo)) validLinks.demo = projectData.demo;
        if (projectData.github && isValidUrl(projectData.github)) validLinks.github = projectData.github;

        // 设置卡片点击事件
        if (validLinks.demo) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                // 防止点击链接时触发卡片跳转
                if (e.target.tagName === 'A' || e.target.tagName === 'IMG') {
                    e.stopPropagation();
                    return;
                }
                window.open(validLinks.demo, '_blank', 'noopener,noreferrer');
            });
        }

        // 翻译链接文本
        const getLinkText = (key) => {
            const translations = {
                demo: { zh: '演示', en: 'Demo' },
                github: { zh: '代码仓库', en: 'GitHub' }
            };
            if (languageManager && translations[key]) {
                return translations[key][languageManager.getCurrentLanguage()] || key;
            }
            return key;
        };

        // 直接输出issue信息，不使用卡片形式
        const hasImage = projectData.image && isValidUrl(projectData.image);
        const content = document.createElement('div');
        content.className = 'project-content';

        // 构建内容HTML
        let contentHTML = `
            <div class="project-info">
                <h3 class="project-title">${escapeHtml(projectData.title)}</h3>
                ${projectData.description ? `<p class="project-description">${escapeHtml(projectData.description)}</p>` : ''}
                ${projectData.technologies ? `<div class="project-technologies">${escapeHtml(projectData.technologies)}</div>` : ''}
                <div class="project-links">
                    ${validLinks.demo ? `<a href="${validLinks.demo}" class="project-link" target="_blank" rel="noopener noreferrer">${getLinkText('demo')}</a>` : ''}
                    ${validLinks.github ? `<a href="${validLinks.github}" class="project-link" target="_blank" rel="noopener noreferrer">${getLinkText('github')}</a>` : ''}
                </div>
            </div>
        `;

        // 图片在文字下方
        if (hasImage) {
            contentHTML += `<div class="project-image"><img src="${projectData.image}" alt="${escapeHtml(projectData.title)}" onerror="this.style.display='none'"></div>`;
        }

        content.innerHTML = contentHTML;
        return content;
    }

    // 从Issue中提取项目信息
    extractProjectData(issue) {
        const data = {};

        // 标题
        data.title = issue.title || '';

        // 从正文中提取信息
        const body = issue.body || '';

        // 提取项目描述 (格式: Description: 这里是描述)
        const descriptionMatch = body.match(/Description:\s*([^\n]+)/i);
        data.description = descriptionMatch ? descriptionMatch[1].trim() : null;

        // 提取技术栈 (格式: Technologies: React, Node.js, MongoDB)
        const technologiesMatch = body.match(/Technologies?:\s*([^\n]+)/i);
        data.technologies = technologiesMatch ? technologiesMatch[1].trim() : null;

        // 提取演示链接 (格式: Demo: https://...)
        const demoMatch = body.match(/Demo:\s*(https?:\/\/[^\s\n]+)/i);
        data.demo = demoMatch ? demoMatch[1].trim() : null;

        // 提取GitHub链接 (格式: GitHub: https://...)
        const githubMatch = body.match(/GitHub:\s*(https?:\/\/[^\s\n]+)/i);
        data.github = githubMatch ? githubMatch[1].trim() : null;

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

    // 创建默认项目图片
    createDefaultProjectImage() {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
            <rect x="0" y="0" width="400" height="300" fill="#E3F2FD" stroke="#2196F3" stroke-width="3"/>
            <text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="24" fill="#2196F3">Project</text>
            <text x="200" y="180" text-anchor="middle" font-family="Arial" font-size="18" fill="#1976D2">Preview</text>
        </svg>`;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    // 创建加载元素
    createLoadingElement() {
        // 不再显示加载提示，直接返回空元素
        const loading = document.createElement('div');
        loading.className = 'projects-loading';
        loading.style.display = 'none';
        return loading;
    }

    // 创建错误元素
    createErrorElement() {
        const error = document.createElement('div');
        error.className = 'projects-error';
        return error;
    }

    // 显示加载状态
    showLoading() {
        this.projectsContainer.innerHTML = '';
        this.projectsContainer.appendChild(this.loadingElement);
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
        this.projectsContainer.innerHTML = '';
        this.projectsContainer.appendChild(this.errorElement);
    }

    // 显示空状态
    showEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'projects-empty';
        const emptyText = languageManager ? translateText('empty-projects') : 'No projects found. Add issues with the "project" label to your GitHub repository.';
        emptyState.innerHTML = `<p>${emptyText}</p>`;
        this.projectsContainer.innerHTML = '';
        this.projectsContainer.appendChild(emptyState);
    }

    // 创建项目网格容器
    createProjectsGrid() {
        const grid = document.createElement('div');
        grid.className = 'projects-grid';
        return grid;
    }
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const projectsAPI = new ProjectsAPI();
    projectsAPI.init();
});

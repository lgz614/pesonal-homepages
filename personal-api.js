// Personal Introduction API 处理模块
class PersonalAPI {
    constructor() {
        this.config = window.GITHUB_CONFIG || {
            owner: 'your-github-username',
            repo: 'your-repo-name',
            apiUrl: 'https://api.github.com/repos',
            label: 'publication'
        };
        this.personalLabel = 'personal';
        this.personalContainer = null;
        this.loadingElement = null;
        this.errorElement = null;
    }

    // 初始化
    init() {
        this.personalContainer = document.getElementById('personal-container');
        if (!this.personalContainer) {
            console.error('Personal container not found');
            return;
        }

        this.loadingElement = this.createLoadingElement();
        this.errorElement = this.createErrorElement();

        // 检查配置
        if (!this.isConfigured()) {
            this.showError('GitHub configuration not set. Please update github-config.js');
            return;
        }

        // 加载个人简介数据
        this.loadPersonalInfo();
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

    // 加载个人简介数据
    async loadPersonalInfo() {
        this.showLoading();

        try {
            const apiUrl = `${this.config.apiUrl}/${this.config.owner}/${this.config.repo}/issues?labels=${this.personalLabel}`;
            console.log('Fetching personal info from:', apiUrl);

            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Personal-Homepage-Personal'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const issues = await response.json();
            console.log('Fetched personal info:', issues);

            this.hideLoading();

            if (issues.length === 0) {
                this.showEmptyState();
            } else {
                // 只使用最新的个人简介
                const latestIssue = issues[0];
                this.renderPersonalInfo(latestIssue);
            }

        } catch (error) {
            console.error('Error loading personal info:', error);
            this.hideLoading();
            this.showError(`Failed to load personal info: ${error.message}`);
        }
    }

    // 渲染个人简介
    renderPersonalInfo(issue) {
        // 提取个人信息
        const personalData = this.extractPersonalData(issue);

        // 安全处理文本内容
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        // 处理换行符为HTML换行
        const formatText = (text) => {
            return escapeHtml(text).replace(/\n/g, '<br>');
        };

        // 翻译标题
        const getSectionTitle = (key) => {
            if (languageManager && languageManager.resources.dynamic[key]) {
                return languageManager.resources.dynamic[key][languageManager.getCurrentLanguage()] || key;
            }
            // 默认英文标题
            const defaultTitles = {
                'education': 'Education',
                'experience': 'Experience',
                'skills': 'Skills'
            };
            return defaultTitles[key] || key;
        };

        // 创建个人简介内容
        const personalContent = document.createElement('div');
        personalContent.className = 'personal-content';
        personalContent.innerHTML = `
            ${personalData.introduction ? `<div class="personal-introduction">${formatText(personalData.introduction)}</div>` : ''}
            ${personalData.education ? `<div class="personal-section">
                <h3>${getSectionTitle('education')}</h3>
                <div class="personal-education">${formatText(personalData.education)}</div>
            </div>` : ''}
            ${personalData.experience ? `<div class="personal-section">
                <h3>${getSectionTitle('experience')}</h3>
                <div class="personal-experience">${formatText(personalData.experience)}</div>
            </div>` : ''}
            ${personalData.skills ? `<div class="personal-section">
                <h3>${getSectionTitle('skills')}</h3>
                <div class="personal-skills">${formatText(personalData.skills)}</div>
            </div>` : ''}
        `;

        // 清空容器并添加新内容
        this.personalContainer.innerHTML = '';
        this.personalContainer.appendChild(personalContent);
    }

    // 从Issue中提取个人信息
    extractPersonalData(issue) {
        const data = {};

        // 从正文中提取信息
        const body = issue.body || '';

        // 提取个人简介 (格式: Introduction: 这里是个人简介，支持多行)
        const introductionMatch = body.match(/Introduction:\s*([\s\S]*?)(?=\n\s*\n|$)/i);
        data.introduction = introductionMatch ? introductionMatch[1].trim() : null;

        // 提取教育背景 (格式: Education: 教育信息)
        const educationMatch = body.match(/Education:\s*([^\n]+)/i);
        data.education = educationMatch ? educationMatch[1].trim() : null;

        // 提取工作经历 (格式: Experience: 工作经历)
        const experienceMatch = body.match(/Experience:\s*([^\n]+)/i);
        data.experience = experienceMatch ? experienceMatch[1].trim() : null;

        // 提取技能 (格式: Skills: 技能列表)
        const skillsMatch = body.match(/Skills?:\s*([^\n]+)/i);
        data.skills = skillsMatch ? skillsMatch[1].trim() : null;

        return data;
    }

    // 创建加载元素
    createLoadingElement() {
        const loading = document.createElement('div');
        loading.className = 'personal-loading';
        const loadingText = languageManager ? translateText('loading-personal') : 'Loading personal info...';
        loading.innerHTML = `<div class="loading-spinner"></div><p>${loadingText}</p>`;
        return loading;
    }

    // 创建错误元素
    createErrorElement() {
        const error = document.createElement('div');
        error.className = 'personal-error';
        return error;
    }

    // 显示加载状态
    showLoading() {
        this.personalContainer.innerHTML = '';
        this.personalContainer.appendChild(this.loadingElement);
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
        this.personalContainer.innerHTML = '';
        this.personalContainer.appendChild(this.errorElement);
    }

    // 显示空状态
    showEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'personal-empty';
        emptyState.innerHTML = '<p>No personal information found. Add an issue with the "personal" label to your GitHub repository.</p>';
        this.personalContainer.innerHTML = '';
        this.personalContainer.appendChild(emptyState);
    }
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const personalAPI = new PersonalAPI();
    personalAPI.init();
});

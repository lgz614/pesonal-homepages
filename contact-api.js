// Contact Information API 处理模块
class ContactAPI {
    constructor() {
        this.config = window.GITHUB_CONFIG || {
            owner: 'your-github-username',
            repo: 'your-repo-name',
            apiUrl: 'https://api.github.com/repos',
            label: 'publication'
        };
        this.contactLabel = 'contact';
        this.contactContainer = null;
        this.loadingElement = null;
        this.errorElement = null;
    }

    // 初始化
    init() {
        this.contactContainer = document.getElementById('contact-container');
        if (!this.contactContainer) {
            console.error('Contact container not found');
            return;
        }

        this.loadingElement = this.createLoadingElement();
        this.errorElement = this.createErrorElement();

        // 检查配置
        if (!this.isConfigured()) {
            this.showError('GitHub configuration not set. Please update github-config.js');
            return;
        }

        // 加载联系信息数据
        this.loadContactInfo();
    }

    // 检查是否已配置
    isConfigured() {
        return this.config.owner !== 'your-github-username' &&
               this.config.repo !== 'your-repo-name';
    }

    // 加载联系信息数据
    async loadContactInfo() {
        this.showLoading();

        try {
            const apiUrl = `${this.config.apiUrl}/${this.config.owner}/${this.config.repo}/issues?labels=${this.contactLabel}`;
            console.log('Fetching contact info from:', apiUrl);

            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Personal-Homepage-Contact'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const issues = await response.json();
            console.log('Fetched contact info:', issues);

            this.hideLoading();

            if (issues.length === 0) {
                this.showEmptyState();
            } else {
                // 只使用最新的联系信息
                const latestIssue = issues[0];
                this.renderContactInfo(latestIssue);
            }

        } catch (error) {
            console.error('Error loading contact info:', error);
            this.hideLoading();
            this.showError(`Failed to load contact info: ${error.message}`);
        }
    }

    // 渲染联系信息
    renderContactInfo(issue) {
        // 提取联系信息
        const contactData = this.extractContactData(issue);

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
        if (contactData.email && isValidUrl('mailto:' + contactData.email)) validLinks.email = contactData.email;
        if (contactData.phone && isValidUrl('tel:' + contactData.phone)) validLinks.phone = contactData.phone;
        if (contactData.github && isValidUrl(contactData.github)) validLinks.github = contactData.github;
        if (contactData.linkedin && isValidUrl(contactData.linkedin)) validLinks.linkedin = contactData.linkedin;
        if (contactData.twitter && isValidUrl(contactData.twitter)) validLinks.twitter = contactData.twitter;
        if (contactData.website && isValidUrl(contactData.website)) validLinks.website = contactData.website;
        if (contactData.wechat) validLinks.wechat = contactData.wechat;
        if (contactData.qq) validLinks.qq = contactData.qq;

        // 创建联系信息内容
        const contactContent = document.createElement('div');
        contactContent.className = 'contact-content';
        contactContent.innerHTML = `
            <div class="contact-grid">
                ${validLinks.email ? `<div class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <span class="contact-text">Email: ${escapeHtml(validLinks.email)}</span>
                </div>` : ''}
                ${validLinks.phone ? `<div class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    <span class="contact-text">Phone: ${escapeHtml(validLinks.phone)}</span>
                </div>` : ''}
                ${validLinks.wechat ? `<div class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span class="contact-text">WeChat: ${escapeHtml(validLinks.wechat)}</span>
                </div>` : ''}
                ${validLinks.qq ? `<div class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                    <span class="contact-text">QQ: ${escapeHtml(validLinks.qq)}</span>
                </div>` : ''}
                ${validLinks.github ? `<div class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span class="contact-text">GitHub: ${escapeHtml(validLinks.github)}</span>
                </div>` : ''}
                ${validLinks.linkedin ? `<div class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    <span class="contact-text">LinkedIn: ${escapeHtml(validLinks.linkedin)}</span>
                </div>` : ''}
                ${validLinks.twitter ? `<div class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span class="contact-text">Twitter: ${escapeHtml(validLinks.twitter)}</span>
                </div>` : ''}
                ${validLinks.website ? `<div class="contact-item">
                    <svg class="contact-icon" viewBox="0 0 24 24">
                        <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0 2c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm-2 6h4v2h-4v-2zm0-3h4v2h-4v-2z"/>
                    </svg>
                    <span class="contact-text">Website: ${escapeHtml(validLinks.website)}</span>
                </div>` : ''}
            </div>
        `;

        // 清空容器并添加新内容
        this.contactContainer.innerHTML = '';
        this.contactContainer.appendChild(contactContent);
    }

    // 从Issue中提取联系信息
    extractContactData(issue) {
        const data = {};

        // 从正文中提取信息
        const body = issue.body || '';

        // 提取邮箱 (格式: Email: example@email.com)
        const emailMatch = body.match(/Email:\s*([^\n]+)/i);
        data.email = emailMatch ? emailMatch[1].trim() : null;

        // 提取电话 (格式: Phone: +86 1234567890)
        const phoneMatch = body.match(/Phone:\s*([^\n]+)/i);
        data.phone = phoneMatch ? phoneMatch[1].trim() : null;

        // 提取微信 (格式: WeChat: wechat_id)
        const wechatMatch = body.match(/WeChat:\s*([^\n]+)/i);
        data.wechat = wechatMatch ? wechatMatch[1].trim() : null;

        // 提取QQ (格式: QQ: 123456789)
        const qqMatch = body.match(/QQ:\s*([^\n]+)/i);
        data.qq = qqMatch ? qqMatch[1].trim() : null;

        // 提取GitHub (格式: GitHub: https://github.com/username)
        const githubMatch = body.match(/GitHub:\s*(https?:\/\/[^\s\n]+)/i);
        data.github = githubMatch ? githubMatch[1].trim() : null;

        // 提取LinkedIn (格式: LinkedIn: https://linkedin.com/in/username)
        const linkedinMatch = body.match(/LinkedIn:\s*(https?:\/\/[^\s\n]+)/i);
        data.linkedin = linkedinMatch ? linkedinMatch[1].trim() : null;

        // 提取Twitter (格式: Twitter: https://twitter.com/username)
        const twitterMatch = body.match(/Twitter:\s*(https?:\/\/[^\s\n]+)/i);
        data.twitter = twitterMatch ? twitterMatch[1].trim() : null;

        // 提取个人网站 (格式: Website: https://example.com)
        const websiteMatch = body.match(/Website:\s*(https?:\/\/[^\s\n]+)/i);
        data.website = websiteMatch ? websiteMatch[1].trim() : null;

        return data;
    }

    // 创建加载元素
    createLoadingElement() {
        const loading = document.createElement('div');
        loading.className = 'contact-loading';
        loading.innerHTML = '<div class="loading-spinner"></div><p>Loading contact info...</p>';
        return loading;
    }

    // 创建错误元素
    createErrorElement() {
        const error = document.createElement('div');
        error.className = 'contact-error';
        return error;
    }

    // 显示加载状态
    showLoading() {
        this.contactContainer.innerHTML = '';
        this.contactContainer.appendChild(this.loadingElement);
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
        this.contactContainer.innerHTML = '';
        this.contactContainer.appendChild(this.errorElement);
    }

    // 显示空状态
    showEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'contact-empty';
        emptyState.innerHTML = '<p>No contact information found. Add an issue with the "contact" label to your GitHub repository.</p>';
        this.contactContainer.innerHTML = '';
        this.contactContainer.appendChild(emptyState);
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

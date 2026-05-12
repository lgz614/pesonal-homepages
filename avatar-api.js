// Avatar API 处理模块
class AvatarAPI {
    constructor() {
        this.config = window.GITHUB_CONFIG || {
            owner: 'your-github-username',
            repo: 'your-repo-name',
            apiUrl: 'https://api.github.com/repos',
            label: 'publication'
        };
        this.avatarLabel = 'avatar';
        this.avatarCacheKey = 'github_avatar_url';
        this.cacheExpiryKey = 'github_avatar_cache_expiry';
        this.cacheDuration = 24 * 60 * 60 * 1000; // 24小时缓存
    }

    // 初始化头像
    async initAvatar() {
        const avatarContainer = document.getElementById('avatar-container');
        if (!avatarContainer) {
            console.error('Avatar container not found');
            return;
        }

        // 尝试从缓存获取头像
        const cachedAvatar = this.getCachedAvatar();
        if (cachedAvatar) {
            this.setAvatar(cachedAvatar);
            return;
        }

        // 如果没有缓存，从GitHub加载
        try {
            const avatarUrl = await this.loadAvatarFromGitHub();
            if (avatarUrl) {
                this.setAvatar(avatarUrl);
                this.cacheAvatar(avatarUrl);
            } else {
                this.setDefaultAvatar();
            }
        } catch (error) {
            console.error('Error loading avatar:', error);
            this.setDefaultAvatar();
        }
    }

    // 从缓存获取头像
    getCachedAvatar() {
        const cachedUrl = localStorage.getItem(this.avatarCacheKey);
        const expiryTime = localStorage.getItem(this.cacheExpiryKey);

        if (cachedUrl && expiryTime) {
            if (Date.now() < parseInt(expiryTime)) {
                console.log('Using cached avatar');
                return cachedUrl;
            } else {
                // 缓存过期，清除
                localStorage.removeItem(this.avatarCacheKey);
                localStorage.removeItem(this.cacheExpiryKey);
            }
        }

        return null;
    }

    // 缓存头像
    cacheAvatar(url) {
        localStorage.setItem(this.avatarCacheKey, url);
        localStorage.setItem(this.cacheExpiryKey, (Date.now() + this.cacheDuration).toString());
        console.log('Avatar cached');
    }

    // 从GitHub加载头像
    async loadAvatarFromGitHub() {
        try {
            const apiUrl = `${this.config.apiUrl}/${this.config.owner}/${this.config.repo}/issues?labels=${this.avatarLabel}`;
            console.log('Fetching avatar from:', apiUrl);

            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Personal-Homepage-Avatar'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const issues = await response.json();
            console.log('Avatar issues:', issues);

            if (issues.length === 0) {
                console.log('No avatar issue found');
                return null;
            }

            // 提取头像URL
            const latestIssue = issues[0]; // 获取最新的issue
            const avatarUrl = this.extractAvatarUrl(latestIssue.body);

            return avatarUrl;

        } catch (error) {
            console.error('Error fetching avatar from GitHub:', error);
            throw error;
        }
    }

    // 从Issue正文中提取头像URL
    extractAvatarUrl(body) {
        // 匹配Markdown图片格式 ![alt](url)
        const imageMatch = body.match(/!\[[^\]]*\]\(([^)]+)\)/);
        if (imageMatch) {
            return imageMatch[1];
        }

        // 匹配纯URL
        const urlMatch = body.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
            return urlMatch[1];
        }

        return null;
    }

    // 设置头像
    setAvatar(url) {
        const avatarElement = document.getElementById('avatar-image');
        if (avatarElement) {
            avatarElement.src = url;
            avatarElement.style.display = 'block';
            console.log('Avatar set:', url);
        }
    }

    // 设置默认头像
    setDefaultAvatar() {
        const avatarElement = document.getElementById('avatar-image');
        if (avatarElement) {
            // 创建一个默认的占位头像（使用SVG）
            const defaultAvatar = this.createDefaultAvatar();
            avatarElement.src = defaultAvatar;
            avatarElement.style.display = 'block';
            console.log('Default avatar set');
        }
    }

    // 创建默认占位头像（SVG格式）
    createDefaultAvatar() {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150">
            <circle cx="75" cy="75" r="75" fill="#E3F2FD" stroke="#2196F3" stroke-width="3"/>
            <circle cx="75" cy="55" r="25" fill="#2196F3"/>
            <path d="M50,100 C50,75 100,75 100,100" fill="none" stroke="#2196F3" stroke-width="3" stroke-linecap="round"/>
        </svg>`;

        const encodedSvg = `data:image/svg+xml;base64,${btoa(svg)}`;
        return encodedSvg;
    }

    // 清除缓存（用于调试）
    clearCache() {
        localStorage.removeItem(this.avatarCacheKey);
        localStorage.removeItem(this.cacheExpiryKey);
        console.log('Avatar cache cleared');
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

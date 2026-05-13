// GitHub配置
const GITHUB_CONFIG = {
    owner: 'lgz614', // 替换为你的GitHub用户名
    repo: 'personal-homepages',         // 替换为你的仓库名
    apiUrl: 'https://api.github.com/repos',
    labels: {
        publication: 'publication',
        project: 'project',
        award: 'award',
        personal: 'personal',
        contact: 'contact',
        avatar: 'avatar'
    }
};

// 获取指定标签的完整API URL
function getApiUrl(label) {
    const labelValue = GITHUB_CONFIG.labels[label] || label;
    return `${GITHUB_CONFIG.apiUrl}/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues?labels=${labelValue}`;
}

// 获取完整的API URL (兼容旧版本)
function getPublicationsApiUrl() {
    return getApiUrl('publication');
}

// 检查是否已配置GitHub信息
function isGitHubConfigured() {
    return GITHUB_CONFIG.owner !== 'your-github-username' &&
           GITHUB_CONFIG.repo !== 'your-repo-name';
}

// 暴露配置到全局
window.GITHUB_CONFIG = GITHUB_CONFIG;
window.getApiUrl = getApiUrl;
window.isGitHubConfigured = isGitHubConfigured;

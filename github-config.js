// GitHub配置
const GITHUB_CONFIG = {
    owner: 'lgz614', // 替换为你的GitHub用户名
    repo: 'pesonal-homepages',         // 替换为你的仓库名
    apiUrl: 'https://api.github.com/repos',
    label: 'publication'
};

// 获取完整的API URL
function getPublicationsApiUrl() {
    return `${GITHUB_CONFIG.apiUrl}/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues?labels=${GITHUB_CONFIG.label}`;
}

// 检查是否已配置GitHub信息
function isGitHubConfigured() {
    return GITHUB_CONFIG.owner !== 'your-github-username' &&
           GITHUB_CONFIG.repo !== 'your-repo-name';
}

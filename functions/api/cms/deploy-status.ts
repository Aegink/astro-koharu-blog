import { checkAuth, cloudflareConfig, type Env, json, listRecentCommits, repo } from '../../_lib/online-cms';

type CloudflareDeployment = {
  id: string;
  url?: string;
  aliases?: string[];
  environment?: string;
  created_on?: string;
  modified_on?: string;
  latest_stage?: { name?: string; status?: string; started_on?: string; ended_on?: string };
  deployment_trigger?: { metadata?: { branch?: string; commit_hash?: string; commit_message?: string } };
};

async function fetchCloudflareDeployments(env: Env) {
  const config = cloudflareConfig(env);
  const missingVariables = [
    !config.accountId && 'CLOUDFLARE_ACCOUNT_ID',
    !config.apiToken && 'CLOUDFLARE_API_TOKEN',
    !config.projectName && 'CLOUDFLARE_PAGES_PROJECT_NAME',
  ].filter(Boolean) as string[];

  if (missingVariables.length > 0) {
    return {
      configured: false,
      projectName: config.projectName,
      missingVariables,
      message: `未配置 Cloudflare API 读取权限，缺少：${missingVariables.join('、')}。当前仅显示 GitHub 最新提交。`,
      deployments: [],
    };
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.accountId)}/pages/projects/${encodeURIComponent(config.projectName)}/deployments?per_page=5`,
    {
      headers: {
        authorization: `Bearer ${config.apiToken}`,
        accept: 'application/json',
      },
    },
  );
  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    errors?: Array<{ message?: string }>;
    result?: CloudflareDeployment[];
  };
  if (!response.ok || data.success === false) {
    const message =
      data.errors
        ?.map((item) => item.message)
        .filter(Boolean)
        .join('；') || `Cloudflare API ${response.status}`;
    return { configured: true, projectName: config.projectName, missingVariables: [], message, deployments: [] };
  }

  return {
    configured: true,
    projectName: config.projectName,
    message: '',
    missingVariables: [],
    deployments: (data.result || []).map((deployment) => ({
      id: deployment.id,
      url: deployment.url,
      aliases: deployment.aliases || [],
      environment: deployment.environment || '',
      status: deployment.latest_stage?.status || '',
      stage: deployment.latest_stage?.name || '',
      createdOn: deployment.created_on || '',
      modifiedOn: deployment.modified_on || '',
      commitHash: deployment.deployment_trigger?.metadata?.commit_hash || '',
      commitMessage: deployment.deployment_trigger?.metadata?.commit_message || '',
      branch: deployment.deployment_trigger?.metadata?.branch || '',
    })),
  };
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;

    const repoInfo = repo(context.env);
    const commits = await listRecentCommits(context.env, 5);
    const cloudflare = await fetchCloudflareDeployments(context.env);

    return json({
      repo: repoInfo,
      latestCommit: commits[0]
        ? {
            sha: commits[0].sha,
            shortSha: commits[0].sha.slice(0, 7),
            message: commits[0].commit.message,
            url: commits[0].html_url,
            author: commits[0].commit.author?.name || commits[0].commit.committer?.name || '',
            date: commits[0].commit.author?.date || commits[0].commit.committer?.date || '',
          }
        : null,
      commits: commits.map((commit) => ({
        sha: commit.sha,
        shortSha: commit.sha.slice(0, 7),
        message: commit.commit.message,
        url: commit.html_url,
        author: commit.commit.author?.name || commit.commit.committer?.name || '',
        date: commit.commit.author?.date || commit.commit.committer?.date || '',
      })),
      cloudflare,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : '发布状态读取失败' }, 500);
  }
}

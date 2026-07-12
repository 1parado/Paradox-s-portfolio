import type { AppItem } from '@/lib/types';

export const AGNES_CHAT_ENDPOINT = 'https://apihub.agnes-ai.com/v1/chat/completions';
export const AGNES_CHAT_MODEL = 'agnes-2.0-flash';

const AGNES_API_KEYS = [
  'sk-GReMPdJ3BKPET2LRQBDTp2NIZsEoOtNHs9bYfDdaeLrihded',
  'sk-4e9yFxd4FKK0HbMzi1DFAhNwOsztCKDDuj72O2p0zvZ19cJZ',
];

export type AgentToolName =
  | 'open_app'
  | 'search_apps'
  | 'open_spotlight'
  | 'open_finder'
  | 'show_windows'
  | 'minimize_active_window'
  | 'close_active_window'
  | 'show_desktop';

export type AgentAction = {
  name: AgentToolName;
  arguments: Record<string, string>;
};

export type AgentChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type AgentRequest = {
  messages: AgentChatMessage[];
  apps: AppItem[];
  activeWindowTitle?: string;
  signal?: AbortSignal;
};

type AgnesMessage = {
  content?: string | null;
  tool_calls?: Array<{
    function?: {
      name?: string;
      arguments?: string;
    };
  }>;
};

const toolNames = new Set<AgentToolName>([
  'open_app',
  'search_apps',
  'open_spotlight',
  'open_finder',
  'show_windows',
  'minimize_active_window',
  'close_active_window',
  'show_desktop',
]);

function shuffledKeys() {
  const keys = [...AGNES_API_KEYS];
  for (let index = keys.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [keys[index], keys[target]] = [keys[target], keys[index]];
  }
  return keys;
}

function appCatalog(apps: AppItem[]) {
  return apps.map((app) => ({
    id: app.id,
    title: app.title,
    description: app.description,
    techStack: app.techStack ?? [],
    kind: app.type,
  }));
}

function systemPrompt(apps: AppItem[], activeWindowTitle?: string) {
  return [
    '你是 Paradox Agent，一个嵌入个人作品集桌面的中文助手。',
    '你的主要任务是理解用户意图，并使用提供的工具操作桌面。',
    '只能调用工具列表中的非敏感操作。绝不能声称已经执行未调用的操作。',
    '禁止删除、移动、编辑、上传、修改设置、切换编辑模式、输入密码或绕过密码。',
    '打开受密码保护的应用时，桌面会继续显示原有密码验证。',
    '当用户只是聊天或询问作品内容时，可以直接简洁回答。',
    `当前活动窗口：${activeWindowTitle || '无'}。`,
    `可用应用：${JSON.stringify(appCatalog(apps))}`,
  ].join('\n');
}

function tools(apps: AppItem[]) {
  const appIds = apps.map((app) => app.id);
  return [
    {
      type: 'function',
      function: {
        name: 'open_app',
        description: '打开桌面、Dock 或文件夹中的指定应用。',
        parameters: {
          type: 'object',
          properties: { app_id: { type: 'string', enum: appIds } },
          required: ['app_id'],
          additionalProperties: false,
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'search_apps',
        description: '使用 Spotlight 搜索应用、文件夹、描述或技术栈。',
        parameters: {
          type: 'object',
          properties: { query: { type: 'string' } },
          required: ['query'],
          additionalProperties: false,
        },
      },
    },
    ...[
      ['open_spotlight', '打开 Spotlight 搜索。'],
      ['open_finder', '打开 Finder。'],
      ['show_windows', '打开 Mission Control，显示所有窗口。'],
      ['minimize_active_window', '最小化当前活动窗口。'],
      ['close_active_window', '关闭当前活动窗口。'],
      ['show_desktop', '关闭或收起覆盖层并返回桌面。'],
    ].map(([name, description]) => ({
      type: 'function',
      function: {
        name,
        description,
        parameters: { type: 'object', properties: {}, additionalProperties: false },
      },
    })),
  ];
}

function parseArguments(value?: string): Record<string, string> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    );
  } catch {
    return {};
  }
}

function parseToolCall(message: AgnesMessage): AgentAction | null {
  const toolCall = message.tool_calls?.[0]?.function;
  if (!toolCall?.name || !toolNames.has(toolCall.name as AgentToolName)) return null;
  return {
    name: toolCall.name as AgentToolName,
    arguments: parseArguments(toolCall.arguments),
  };
}

function parseJsonAction(content?: string | null): AgentAction | null {
  if (!content) return null;
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as { name?: string; arguments?: Record<string, unknown> };
    if (!parsed.name || !toolNames.has(parsed.name as AgentToolName)) return null;
    return {
      name: parsed.name as AgentToolName,
      arguments: Object.fromEntries(
        Object.entries(parsed.arguments ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
      ),
    };
  } catch {
    return null;
  }
}

async function postAgnes(body: Record<string, unknown>, signal?: AbortSignal) {
  let lastError: Error | null = null;
  for (const apiKey of shuffledKeys()) {
    try {
      const response = await fetch(AGNES_CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        signal,
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Agnes HTTP ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ''}`);
      }
      return await response.json() as { choices?: Array<{ message?: AgnesMessage }>; error?: { message?: string } };
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error instanceof Error ? error : new Error('Agnes 请求失败');
    }
  }
  throw lastError ?? new Error('Agnes 请求失败');
}

export async function requestAgnesAgent({ messages, apps, activeWindowTitle, signal }: AgentRequest) {
  const baseMessages = [
    { role: 'system', content: systemPrompt(apps, activeWindowTitle) },
    ...messages.slice(-10),
  ];
  const body = {
    model: AGNES_CHAT_MODEL,
    messages: baseMessages,
    tools: tools(apps),
    tool_choice: 'auto',
    temperature: 0.1,
    max_tokens: 500,
    stream: false,
  };

  let data;
  try {
    data = await postAgnes(body, signal);
  } catch (error) {
    if (signal?.aborted) throw error;
    data = await postAgnes({
      ...body,
      tools: undefined,
      tool_choice: undefined,
      messages: [
        ...baseMessages,
        {
          role: 'system',
          content: '如需操作桌面，只返回 JSON：{"name":"工具名","arguments":{}}。否则直接回答。',
        },
      ],
    }, signal);
  }

  if (data.error?.message) throw new Error(data.error.message);
  const message = data.choices?.[0]?.message ?? {};
  return {
    action: parseToolCall(message) ?? parseJsonAction(message.content),
    content: message.content?.trim() ?? '',
  };
}

export function resolveLocalAgentAction(input: string, apps: AppItem[]): AgentAction | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;
  if (/spotlight|聚焦搜索/.test(normalized)) return { name: 'open_spotlight', arguments: {} };
  if (/finder|访达/.test(normalized)) return { name: 'open_finder', arguments: {} };
  if (/所有窗口|任务视图|mission control/.test(normalized)) return { name: 'show_windows', arguments: {} };
  if (/最小化/.test(normalized)) return { name: 'minimize_active_window', arguments: {} };
  if (/关闭.*窗口|关掉.*窗口/.test(normalized)) return { name: 'close_active_window', arguments: {} };
  if (/返回桌面|显示桌面/.test(normalized)) return { name: 'show_desktop', arguments: {} };

  const app = [...apps]
    .sort((a, b) => b.title.length - a.title.length)
    .find((candidate) => normalized.includes(candidate.title.toLowerCase()));
  if (app && /打开|启动|进入|看看|查看/.test(normalized)) {
    return { name: 'open_app', arguments: { app_id: app.id } };
  }

  const searchMatch = input.match(/(?:搜索|查找|找一下|帮我找)\s*(.+)/i);
  if (searchMatch?.[1]?.trim()) {
    return { name: 'search_apps', arguments: { query: searchMatch[1].trim() } };
  }
  return null;
}

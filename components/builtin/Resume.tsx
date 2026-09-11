'use client';

import type { ReactNode } from 'react';

type EduEntry = {
  degree: string;
  period: string;
  school: string;
  major: string;
  gpa: string;
};

type WorkEntry = {
  company: string;
  period: string;
  role: string;
  stack: string;
  points: string[];
};

type ProjectEntry = {
  name: string;
  period?: string;
  url?: string;
  desc: string;
  stack: string;
  points: string[];
};

type OpenSourceEntry = {
  repo: string;
  url: string;
  stars: string;
  role: string;
  points: string[];
};

const education: EduEntry[] = [
  { degree: '硕士', period: '2024 - 2027', school: '郑州大学（211）', major: '网络与信息安全', gpa: '4.03 / 4.3' },
  { degree: '本科', period: '2020 - 2024', school: '河南城建学院（一本）', major: '数据科学与大数据技术', gpa: '3.3 / 4.0' },
];

const englishLevel = 'CET-6';
const awards = '2024 年国家学业奖学金、2025 年国家学业奖学金、软件著作权 1 项';

const internships: WorkEntry[] = [
  {
    company: '上海七牛信息技术有限公司',
    period: '2026.07 - 2026.09',
    role: '产品架构实习生',
    stack: 'Spring Boot、PostgreSQL、Spring Mail、Qiniu Java SDK、Codex',
    points: [
      '负责 AI 英语口语陪练产品后端开发，实现用户与权益体系，基于邮箱 OTP 验证码完成注册/登录认证，搭建用户权益中心及后台管理模块。',
      '实现自定义场景口语练习：基于 LLM 实现场景生成、阶段练习状态机，接入科大讯飞 Suntone API 语音评测，完成自定义场景资源持久化等完整业务链路闭环。',
      '实现 LLM 适配层与模型后台管理，基于厂商/模型/协议数据模型完成数据库驱动配置，后台管理支持模型启用/停用与密钥管理。',
    ],
  },
  {
    company: '杭州代塔供应链管理有限公司',
    period: '2026.01 - 2026.05',
    role: 'OMS组 - 后端开发实习生',
    stack: 'Spring Cloud Alibaba、MySQL、Dubbo、Redis、Nacos、OpenClaw',
    points: [
      '为优化小二端用户绑定 WMS 仓库流程，在用户中心添加 WMS 权限管理功能，实现用户->仓库->角色->权限的统一管理，支持内部 WMS 与外部 WMS 仓库统一绑定，运维配置效率提升 60%+。',
      '为提升运营人员的查询效率，新增快捷查询方案保存组件，实现查询条件持久化；通过生成列 + 唯一索引优化，保证用户默认查询方案唯一、方案名称不重复。',
      '基于 OpenClaw 构建企业内部 Agent，包括日志排查、周报生成、数据诊断等 Agent；设计和封装可复用 Skills，实现流程自动化闭环。',
      '负责用户中心与达能数据回流项目的问题排查，协助定位接口调用异常；维护 Nacos 多环境配置，排查阿里云效流水线部署异常及海豚调度器任务异常。',
    ],
  },
  {
    company: '河南首云信息科技有限公司',
    period: '2025.09 - 2025.12',
    role: '软件系统部 - 后端开发实习生',
    stack: 'Spring Boot、MySQL、MyBatis、SpringDoc、RuoYi、WebSocket、OSS',
    points: [
      '负责督事督办系统与一事一评议系统的后端开发，实现任务下发、多轮填报、审核、考核、归档完整业务闭环。',
      '实现前端可视化看板、阿里云 OSS 文件上传，基于 EasyExcel 实现数据与日志导出等功能。',
      '负责 MySQL 表结构设计、前后端联调、功能测试及问题排查，完成业务流程验证，系统已稳定上线。',
    ],
  },
];

const projects: ProjectEntry[] = [
  {
    name: 'LongCat Agent',
    url: 'https://github.com/1parado/LongCat-agent',
    desc: '基于 Go 的轻量 Coding Agent，支持工具调用、MCP、Skills、Memory 管理、IM 平台接入。',
    stack: 'Go、MCP、WebSocket、OAuth 2.0、SQLite',
    points: [
      '实现多模型、多协议供应商管理，支持模型热切换、配置持久化；基于 goroutine + channel 实现 SSE 流式输出。',
      '实现会话管理、提示词缓存、自动上下文压缩、多轮工具调用、Plan / Execute 模式切换。',
      '实现 MCP 动态注册 + Skills 管理；基于 gh CLI 授权实现开源 Skills 一键安装、解析与 SQLite 缓存持久化保存。',
      '基于 WebSocket 长连接 + OAuth 2.0 设备授权实现一键扫码授权飞书平台，实现远程调用。',
      '设计 Agent 双层记忆：工作区记忆与长期记忆；支持 GitHub 仓库一键同步，实现跨设备迁移。',
    ],
  },
  {
    name: '智旅云',
    period: '2025.10 - 2026.05',
    url: 'https://github.com/1parado/Travel_microservice_backend',
    desc: '基于 SpringCloud 微服务架构集成酒店、机票、用车等核心业务，AI 助手提供智能服务支撑，覆盖高并发预订、订单交易与支付流程。',
    stack: 'SpringCloud、Redis、RocketMQ、Elasticsearch、MyBatis-Plus、Nacos、OpenAI-compatible 中转网关',
    points: [
      '基于 SpringCloud Gateway 与 JWT 构建统一网关入口，实现请求路由、登录校验、统一访问控制。',
      '将单体系统拆分为多个微服务，结合 Nacos 实现服务注册与发现，并通过 SpringCloud LoadBalancer 完成服务间负载均衡，设计资源查询、库存校验、订单创建、支付及状态流转的完整预订链路，支持拼团、短链接邀请用户等。',
      '引入 Redis 应对热门资源高频查询，结合 Redisson 分布式锁保障并发预订下的库存安全，防止超卖。',
      '构建 OpenAI 兼容协议的中转服务，打造集智能客服、个性化旅游咨询、订单辅助查询于一体的平台智能化助手。',
      '通过 JMeter 对创建订单、登录、团购及 ES 搜索链路进行压测，订单创建链路完成 10 万级请求验证，整体成功率 99.92%，吞吐量约 256 req/s，P95 响应时间约 996ms。',
    ],
  },
  {
    name: 'ZZU 智慧校园',
    period: '2025.07 - 2025.09',
    url: 'https://github.com/1parado/quick_lession_zzu',
    desc: '面向高校选课场景的高并发、智能化选课系统，集成权限管理、限时抢课、AI 选课助手、学生论坛等模块，注重安全性、可靠性和系统性能优化。',
    stack: 'SpringBoot、JWT、SpringAI、MyBatis、MySQL、Redis、RocketMQ',
    points: [
      '登录模块：实现基于 Spring AOP + 自定义注解的动态 RBAC 权限框架，支持多角色访问控制；集成 JWT 无状态认证机制，通过 Redis 黑名单实现 Token 动态吊销。',
      '限时抢课模块：通过 MD5 + UUID 动态路径加密技术隐藏秒杀接口，防止提前请求与重复访问；使用令牌桶限流算法实现网关限流；利用 Redis + Lua 脚本实现库存预减与防重复下单的原子操作，解决超卖与数据不一致问题；使用 RocketMQ 事务消息实现下单与库存扣减的异步解耦，保证最终一致性。',
      'AI 选课助手：基于本地 Ollama + Spring AI 实现关键词路由自动分派，实现个性化推荐课程；基于滑动窗口上下文机制实现 AI 助手对话历史记忆功能；结合 Tool Calling 技术构建 ReAct 模式智能选课代理，实现业务工具即插即用，自然语言到 API 参数的自动绑定，完成查询课程、执行抢课等核心业务流程。',
    ],
  },
];

const openSource: OpenSourceEntry[] = [
  {
    repo: 'alibaba/open-code-review',
    url: 'https://github.com/alibaba/open-code-review',
    stars: '21K',
    role: 'Contributors',
    points: [
      '#122 新增 --model 参数和第三方供应商模型列表管理，支持单次指定评审模型，提升模型切换与调试灵活性。',
      '#162 优化 LLM Test 连通性诊断流程，修复空响应异常处理与错误反馈，提升 CLI 工具可用性。',
    ],
  },
  {
    repo: 'RongleCat/grok-app',
    url: 'https://github.com/RongleCat/grok-app',
    stars: '1.1K',
    role: 'Contributors',
    points: [
      '#129 新增 /history 命令，实现历史提示词下拉菜单选择以及快速召回，提升输入和上下文管理效率。',
      '#180 新增消息树节点功能，将对话消息组织为树形层级结构，方便用户进行消息回溯。',
    ],
  },
];

const skills: string[] = [
  'Java 基础：熟练 Java 基础，熟悉常用集合、面向对象三大特性、反射、线程进程、垃圾回收等。',
  '数据库：熟练 SQL 语句的使用，熟悉事务四大特性、事务隔离级别、MVCC、慢查询分析等。',
  'AI：熟练使用 Claude Code、Codex、Cursor 等 AI 工具，可封装业务 Skills；熟悉 Agent 核心机制。',
  '综合素养：拥有较强的抗压能力和好奇心，具备开源精神，乐于学习和探索新技术。',
];

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 text-xs font-bold text-white">{index}</span>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="relative pl-4 text-sm leading-relaxed text-white/75">
      <span className="absolute left-0 top-2.5 h-1.5 w-1.5 rounded-full bg-sky-300/70" />
      {children}
    </li>
  );
}

function Tag({ label }: { label: string }) {
  return <span className="rounded-md bg-white/8 px-2 py-0.5 text-[11px] text-white/65">{label}</span>;
}

export function Resume() {
  return (
    <div className="h-full overflow-y-auto rounded-[2rem] bg-[#0b0b0f] p-5 text-white sm:p-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 border-b border-white/10 pb-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/70">Resume</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">李家乐 · 简历</h1>
          <p className="mt-2 text-sm text-white/55">网络与信息安全 / 后端开发 · SpringCloud 微服务与 AI 工程实践</p>
        </header>

        {/* 教育 */}
        <section className="mb-9">
          <SectionTitle index="01" title="教育经历" />
          <div className="grid gap-3">
            {education.map((edu) => (
              <div key={edu.degree} className="rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-base font-semibold text-white">{edu.degree}</span>
                  <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[11px] text-sky-200">{edu.period}</span>
                  <span className="ml-auto text-sm text-white/70">{edu.school}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/65">
                  <span>专业：{edu.major}</span>
                  <span className="text-white/25">·</span>
                  <span>GPA：{edu.gpa}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-white/4 p-4 text-sm text-white/70 sm:grid-cols-2">
            <div><span className="text-white/45">英语水平：</span>{englishLevel}</div>
            <div><span className="text-white/45">获奖经历：</span>{awards}</div>
          </div>
        </section>

        {/* 实习 */}
        <section className="mb-9">
          <SectionTitle index="02" title="实习经历" />
          <div className="grid gap-4">
            {internships.map((work) => (
              <div key={work.company} className="rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-base font-semibold text-white">{work.company}</h3>
                  <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[11px] text-sky-200">{work.period}</span>
                  <span className="ml-auto text-sm text-white/65">{work.role}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {work.stack.split('、').map((s) => <Tag key={s} label={s} />)}
                </div>
                <ul className="mt-3 grid gap-2">
                  {work.points.map((p, i) => <Bullet key={i}>{p}</Bullet>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 项目 */}
        <section className="mb-9">
          <SectionTitle index="03" title="项目经验" />
          <div className="grid gap-4">
            {projects.map((proj) => (
              <div key={proj.name} className="rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-base font-semibold text-white">{proj.name}</h3>
                  {proj.period ? (
                    <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[11px] text-sky-200">{proj.period}</span>
                  ) : null}
                  {proj.url ? (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto text-xs text-sky-300 transition hover:text-sky-200 hover:underline"
                    >
                      {proj.url.replace(/^https?:\/\//, '')} ↗
                    </a>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{proj.desc}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {proj.stack.split('、').map((s) => <Tag key={s} label={s} />)}
                </div>
                <ul className="mt-3 grid gap-2">
                  {proj.points.map((p, i) => <Bullet key={i}>{p}</Bullet>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 开源贡献 */}
        <section className="mb-9">
          <SectionTitle index="04" title="开源贡献" />
          <div className="grid gap-4">
            {openSource.map((os) => (
              <div key={os.repo} className="rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-base font-semibold text-white">
                    <a href={os.url} target="_blank" rel="noreferrer" className="transition hover:text-sky-300 hover:underline">
                      {os.repo} ↗
                    </a>
                  </h3>
                  <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-200">★ {os.stars}</span>
                  <span className="ml-auto text-sm text-white/65">{os.role}</span>
                </div>
                <ul className="mt-3 grid gap-2">
                  {os.points.map((p, i) => <Bullet key={i}>{p}</Bullet>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 技能 */}
        <section className="mb-4">
          <SectionTitle index="05" title="专业技能" />
          <ul className="grid gap-2.5">
            {skills.map((s, i) => (
              <li key={i} className="rounded-2xl border border-white/10 bg-white/4 p-3 text-sm leading-relaxed text-white/75">
                <span className="mr-2 font-semibold text-sky-300/80">{i + 1}.</span>{s}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

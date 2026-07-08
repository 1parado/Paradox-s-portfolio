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
  period: string;
  url?: string;
  desc: string;
  stack: string;
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
    company: '杭州代塔供应链',
    period: '2026.01 - 2026.05',
    role: '后端开发实习生 · 数仓 + 业务中台',
    stack: 'SpringBoot、MySQL、Dubbo、Redis、OCR、Codex、OpenClaw、阿里云效',
    points: [
      '负责用户中心 WMS 权限管理模块后端开发，围绕用户列表、仓库绑定、角色绑定、权限查看、操作日志导出等功能进行接口设计、前后端联调，并接入数据中台 Doris 仓库数据，支持菜鸟、京东、星辰 WMS 等外部仓库在用户中心统一管理。',
      '负责 OCR 文档识别与提取系统开发，基于 OCR + LLM 实现文档文本识别、业务类型判断和结构化字段抽取，并通过 Master-Worker + Redis 队列构建批量任务调度与实时进度推送能力。',
      '基于 OpenClaw 搭建企业内部 AI Agent 应用，落地企微通知 Agent、需求状态变更 Agent、日志排查 Agent 等场景，实现自然语言理解、工具调用、业务系统操作和结果回推的自动化闭环。',
      '参与线上问题排查与服务稳定性保障，协助定位接口异常、慢 SQL、日志报错、环境配置和发布流水线问题，使用 Nacos、云效流水线、日志平台等工具完成配置调整、问题复现和多环境验证。',
    ],
  },
  {
    company: '河南首云信息科技有限公司',
    period: '2025.09 - 2025.12',
    role: '后端开发实习生',
    stack: 'SpringBoot、MySQL、Redis、SpringDoc、若依框架',
    points: [
      '负责企业级督事督办项目的 PC 端及 APP 端的后端研发，负责数据库设计、任务下发、填报、多级考核审核、任务归档等核心业务模块的设计与实现。',
      '根据 UI 原型分析业务需求，设计数据库表结构，严格遵守 RESTful 规范编写接口、文档以及测试用例，与前端团队完成前后端联调和功能测试，项目已成功上线，实现了从任务下发到任务考核的全流程自动化。',
    ],
  },
];

const projects: ProjectEntry[] = [
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

const skills: string[] = [
  '熟练掌握 SpringBoot、MyBatis 等主流开源框架，理解 IOC、AOP 实现原理、Bean 生命周期及常用设计模式；熟练使用常用注解并具备良好的工程化开发能力。',
  '熟悉 MySQL 基本用法及数据库设计，掌握索引、事务、MVCC 等核心机制，具备慢查询分析与 SQL 调优意识。',
  '熟练使用 IDEA、ClaudeCode、Codex、Trae 等开发工具，熟练使用 Git 进行版本管理，熟悉 Apifox、Postman 等接口测试工具，熟练使用 Navicat 进行数据库管理与调试。',
  '关注 AI 领域前沿技术，熟悉 LLM 基础原理（API、Skills、Prompt、Memory），使用过 OpenClaw、Hermes 等 Agent，能够借助 AI 工具提升代码开发、调试与工程效率；具备良好的团队沟通与协作能力，拥有较强的抗压能力和自学能力，具备开源精神，乐于学习和探索新技术，能够快速适应新业务与技术栈。',
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
                  <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[11px] text-sky-200">{proj.period}</span>
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

        {/* 技能 */}
        <section className="mb-4">
          <SectionTitle index="04" title="专业技能" />
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

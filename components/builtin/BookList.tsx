'use client';

import { useMemo, useState } from 'react';

// 读过的书，共 78 本。
const books: string[] = [
  '十年非梦', '大义觉迷录', '无产阶级..', '命运', '温故1942', '万历十五年', '活着', '风流悟',
  '鬼望坡', '国画', '凶画', '一只特立独行的猪', '我的父亲邓小平 上卷', '新青年', '玻璃房',
  '局外人', '1367', '毛泽东文稿言论集', '共产主义运动中的左派幼稚病', '超新星纪元', '看见',
  '儒林外史（第九回）', '收束', '有话好好说作品选集', '邓小平自述', '马克思列宁主义哲学原理',
  '存在主义心理治疗', '动物农场', '呻吟语', '李娃传',
  '阳具森林', '张居正大传', '当下的力量', '智商税：如何避免信息焦虑时代…', '双相情感障碍',
  '四十自述', '曾国藩传', '套中人', '房思琪的初恋乐园', '酒国', '十八岁出门远行', '我胆小如鼠',
  '组织部来了一个年轻人', '银河系漫游指南', '丑陋的中国人', '一个规矩女孩的回忆',
  '山河袈裟', '二十四史-史记', '中县干部', '小丑', '盲人国', '光绪慈禧罪己诏', '《轮台诏》',
  '竹林中(短篇)', '县乡的孩子们', '理想国译丛', '诫外甥书', '燕山夜话', '与妻书',
  '中国官僚政治研究', '推背图（金注）', '地下室手记',
  '雪国', '变形记', '卡拉马佐夫兄弟', '且听风吟', 'The Lottery', '单向度的人', '平面国',
  '1984与世纪记忆（书评）', '1984', '国文趣味', '了凡四训（白话文版）', '差不多先生传',
  '少年中国说，人生目的何在', '人类精神进步史表纲要', '中国通史之政治史', '清宫二年记',
];

const totalBooks = books.length;

export function BookList() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return books;
    return books.filter((title) => title.toLowerCase().includes(keyword));
  }, [query]);

  return (
    <div className="h-full overflow-y-auto rounded-[2rem] bg-[#0b0b0f] p-5 text-white sm:p-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 border-b border-white/10 pb-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/70">Book List</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">书单</h1>
          <p className="mt-2 text-sm text-white/55">读过的书 · {totalBooks} 本</p>
        </header>

        <div className="mb-4">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索书名…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-sky-400/50 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-white/45">没有匹配的书</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            {/* 表头 */}
            <div className="grid grid-cols-[3rem_1fr] border-b border-white/10 bg-white/5 text-xs font-medium uppercase tracking-wider text-white/45">
              <div className="px-3 py-2.5">#</div>
              <div className="px-3 py-2.5">书名</div>
            </div>

            {filtered.map((title, index) => (
              <div
                key={title}
                className="grid grid-cols-[3rem_1fr] items-center border-b border-white/5 text-sm transition hover:bg-white/5"
              >
                <div className="px-3 py-2.5 font-mono text-xs text-white/40">{index + 1}</div>
                <div className="px-3 py-2.5 text-white/85">{title}</div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-center text-xs text-white/35">
          共 {filtered.length} 本{query ? ' · 已筛选' : ''}
        </p>
      </div>
    </div>
  );
}

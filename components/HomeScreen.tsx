'use client';

import { useEffect, useState } from 'react';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { AppGrid } from '@/components/AppGrid';
import { Dock } from '@/components/Dock';
import { StatusBar } from '@/components/StatusBar';
import type { AppItem, HomePage } from '@/lib/types';

type Props = {
  pages: HomePage[];
  dock: AppItem[];
  editing: boolean;
  onOpen: (app: AppItem) => void;
  onLongPress: (app: AppItem, pageId?: string) => void;
  onReorder: (pageId: string, items: HomePage['items']) => void;
  onMoveItem: (fromPageId: string, toPageId: string, itemId: string, targetIndex: number) => void;
};

function PageDrop({ pageId, children }: { pageId: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: `page:${pageId}` });
  return (
    <div ref={setNodeRef} className="h-full min-w-full shrink-0">
      {children}
    </div>
  );
}

function PageDot({
  page,
  active,
  editing,
  dragging,
  onClick,
}: {
  page: HomePage;
  active: boolean;
  editing: boolean;
  dragging: boolean;
  onClick: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `page-dot:${page.id}`, disabled: !editing || !dragging });

  return (
    <button
      ref={setNodeRef}
      type="button"
      aria-label={`切换到${page.title}`}
      className={[
        'h-2.5 rounded-full transition-all',
        active ? 'w-6 bg-white' : 'w-2.5 bg-white/40',
        isOver ? 'scale-125 bg-teal-200' : '',
      ].join(' ')}
      onClick={onClick}
    />
  );
}

export function HomeScreen({ pages, dock, editing, onOpen, onLongPress, onReorder, onMoveItem }: Props) {
  const [pageIndex, setPageIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pageCount = pages.length;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: editing ? 120 : 0, tolerance: 6 } }));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setPageIndex((value) => Math.min(value + 1, pageCount - 1));
      if (event.key === 'ArrowLeft') setPageIndex((value) => Math.max(value - 1, 0));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pageCount]);

  useEffect(() => {
    setPageIndex((value) => Math.min(value, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  const findPageForItem = (itemId: string) => pages.find((page) => page.items.some((item) => item.id === itemId));

  const onDragStart = (_event: DragStartEvent) => {
    setDragging(true);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const fromPage = findPageForItem(activeId);
    if (!fromPage) return;

    if (overId.startsWith('page-dot:') || overId.startsWith('page:')) {
      const toPageId = overId.split(':')[1];
      if (toPageId && toPageId !== fromPage.id) {
        const targetPage = pages.find((page) => page.id === toPageId);
        onMoveItem(fromPage.id, toPageId, activeId, targetPage?.items.length ?? 0);
        setPageIndex(Math.max(0, pages.findIndex((page) => page.id === toPageId)));
      }
      return;
    }

    const toPage = findPageForItem(overId);
    if (!toPage) return;

    const oldIndex = fromPage.items.findIndex((item) => item.id === activeId);
    const newIndex = toPage.items.findIndex((item) => item.id === overId);
    if (oldIndex < 0 || newIndex < 0) return;

    if (fromPage.id === toPage.id) {
      onReorder(fromPage.id, arrayMove(fromPage.items, oldIndex, newIndex));
      return;
    }

    onMoveItem(fromPage.id, toPage.id, activeId, newIndex);
  };

  const onDragCancel = () => setDragging(false);

  return (
    <DndContext id="home-screen-dnd" sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
      <div className="relative flex h-full flex-col overflow-hidden">
        <StatusBar editing={editing} />

        <div className="mt-2 min-h-0 flex-1 overflow-hidden">
          <motion.div
            className="flex h-full w-full"
            animate={{ x: `${-pageIndex * 100}%` }}
            drag={editing ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) setPageIndex((value) => Math.min(value + 1, pageCount - 1));
              if (info.offset.x > 80) setPageIndex((value) => Math.max(value - 1, 0));
            }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
          >
            {pages.map((page) => (
              <PageDrop key={page.id} pageId={page.id}>
                <AppGrid page={page} editing={editing} onOpen={onOpen} onLongPress={(app) => onLongPress(app, page.id)} />
              </PageDrop>
            ))}
          </motion.div>
        </div>

        <div className="mb-3 mt-1 flex items-center justify-center gap-2">
          {pages.map((page, index) => (
            <PageDot
              key={page.id}
              page={page}
              active={pageIndex === index}
              editing={editing}
              dragging={dragging}
              onClick={() => setPageIndex(index)}
            />
          ))}
        </div>

        <div className="px-3 pb-4">
          <Dock apps={dock} editing={editing} onOpen={onOpen} onLongPress={(app) => onLongPress(app)} />
        </div>
      </div>
    </DndContext>
  );
}

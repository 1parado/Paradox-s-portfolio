'use client';

import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppIcon } from '@/components/AppIcon';
import type { AppItem, HomePage } from '@/lib/types';

type Props = {
  page: HomePage;
  editing: boolean;
  onOpen: (app: AppItem) => void;
  onLongPress: (app: AppItem) => void;
};

function SortableAppIcon({ app, editing, onOpen, onLongPress }: { app: AppItem; editing: boolean; onOpen: (app: AppItem) => void; onLongPress: (app: AppItem) => void; }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: app.id, disabled: !editing });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...(editing ? listeners : {})}>
      <AppIcon app={app} editing={editing} onOpen={onOpen} onLongPress={onLongPress} />
    </div>
  );
}

export function AppGrid({ page, editing, onOpen, onLongPress }: Props) {
  return (
    <SortableContext items={page.items.map((item) => item.id)} strategy={rectSortingStrategy}>
      <div className="grid grid-cols-4 gap-x-3 gap-y-5 px-4 py-6">
        {page.items.map((app) => (
          <SortableAppIcon key={app.id} app={app as AppItem} editing={editing} onOpen={onOpen} onLongPress={onLongPress} />
        ))}
      </div>
    </SortableContext>
  );
}

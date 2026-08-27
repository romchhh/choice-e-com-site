"use client";

import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import type { CompositionItem } from "@/lib/productComposition";
import { emptyCompositionItem } from "@/lib/productComposition";

type Props = {
  items: CompositionItem[];
  onChange: (items: CompositionItem[]) => void;
};

export default function CompositionItemsEditor({ items, onChange }: Props) {
  const update = (index: number, patch: Partial<CompositionItem>) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...items, emptyCompositionItem()]);
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    const tmp = copy[index];
    copy[index] = copy[next];
    copy[next] = tmp;
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label className="mb-0">СКЛАД ТА АКТИВНІ КОМПОНЕНТИ</Label>
          <p className="mt-1 text-xs text-gray-500">
            Кожен рядок — окремий інгредієнт із назвою та описом (як у картці
            товару на вітрині).
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-lg border border-[#3D1A00]/20 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-[#3D1A00] hover:bg-[#FFF9F0]"
        >
          + Додати
        </button>
      </div>

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-sm text-gray-500">
          Поки немає компонентів. Додайте перший інгредієнт або залиште поле
          порожнім.
        </p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 sm:p-4 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Компонент {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-white disabled:opacity-30"
                  aria-label="Вгору"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-white disabled:opacity-30"
                  aria-label="Вниз"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-white"
                >
                  Видалити
                </button>
              </div>
            </div>
            <div>
              <Label>Назва компонента</Label>
              <Input
                value={item.name}
                onChange={(e) => update(index, { name: e.target.value })}
                placeholder="Напр. Пророщені зерна пшениці"
              />
            </div>
            <div>
              <Label>Опис / дія</Label>
              <TextArea
                value={item.description}
                onChange={(v) => update(index, { description: v })}
                rows={3}
                placeholder="Коротко, що дає цей компонент"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

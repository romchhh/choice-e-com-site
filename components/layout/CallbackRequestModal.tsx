"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { siteContact } from "@/lib/siteContact";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CallbackRequestModal({ open, onClose }: Props) {
  const { dict } = useLocale();
  const t = dict.callback;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useBodyScrollLock(open);

  if (!open) return null;

  const reset = () => {
    setName("");
    setPhone("");
    setComment("");
    setError(null);
    setDone(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError(t.errorRequired);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "callback",
          name: name.trim(),
          phone: phone.trim(),
          message: comment.trim() || t.defaultMessage,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || t.errorSend);
        return;
      }
      setDone(true);
    } catch {
      setError(t.errorSend);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="callback-modal-title"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#FFF9F0] p-5 shadow-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="callback-modal-title"
              className="font-['Montserrat'] text-lg font-semibold text-[#3D1A00]"
            >
              {t.title}
            </h2>
            <p className="mt-1 font-['Montserrat'] text-sm text-[#3D1A00]/70">
              {t.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-[#3D1A00]/60 transition-opacity hover:opacity-100"
            aria-label={t.close}
          >
            ✕
          </button>
        </div>

        {done ? (
          <div className="space-y-4">
            <p className="font-['Montserrat'] text-sm text-[#3D1A00]">{t.success}</p>
            <a
              href={`tel:${siteContact.phoneTel}`}
              className="inline-flex font-['Montserrat'] text-sm font-semibold text-[#3D1A00] underline"
            >
              {siteContact.phoneDisplay}
            </a>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-11 w-full items-center justify-center rounded-full bg-[#D7D799] font-['Montserrat'] text-sm font-semibold text-[#3D1A00] transition-colors hover:bg-[#cfd48a]"
            >
              {t.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block font-['Montserrat'] text-xs font-semibold uppercase tracking-wide text-[#3D1A00]/70">
                {t.name}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-full border border-[#3D1A00]/20 bg-white px-4 font-['Montserrat'] text-sm text-[#3D1A00] outline-none focus:border-[#3D1A00]"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="mb-1 block font-['Montserrat'] text-xs font-semibold uppercase tracking-wide text-[#3D1A00]/70">
                {t.phone}
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 w-full rounded-full border border-[#3D1A00]/20 bg-white px-4 font-['Montserrat'] text-sm text-[#3D1A00] outline-none focus:border-[#3D1A00]"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+380…"
              />
            </div>
            <div>
              <label className="mb-1 block font-['Montserrat'] text-xs font-semibold uppercase tracking-wide text-[#3D1A00]/70">
                {t.comment}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-[#3D1A00]/20 bg-white px-4 py-2.5 font-['Montserrat'] text-sm text-[#3D1A00] outline-none focus:border-[#3D1A00]"
                placeholder={t.commentPlaceholder}
              />
            </div>
            {error && (
              <p className="font-['Montserrat'] text-sm text-red-700">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-full bg-[#3D1A00] font-['Montserrat'] text-sm font-semibold text-[#FFF9F0] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? dict.common.loading : t.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

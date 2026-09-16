"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

type MediaDialogProps = {
  open: boolean;
  titleId: string;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  children: ReactNode;
};

export function MediaDialog({ open, titleId, onClose, onPrevious, onNext, children }: MediaDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const previousRef = useRef(onPrevious);
  const nextRef = useRef(onNext);
  closeRef.current = onClose;
  previousRef.current = onPrevious;
  nextRef.current = onNext;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = () => panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    requestAnimationFrame(() => focusable()?.[0]?.focus());

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeRef.current();
      if (event.key === "ArrowLeft") previousRef.current?.();
      if (event.key === "ArrowRight") nextRef.current?.();
      if (event.key !== "Tab") return;
      const elements = focusable();
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = bodyOverflow;
      previous?.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="dialog-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
          <motion.div
            ref={panelRef}
            className="media-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <button className="dialog-close" type="button" onClick={onClose} aria-label="Close dialog">
              <X aria-hidden="true" />
            </button>
            {onPrevious && (
              <button className="dialog-arrow dialog-arrow-left" type="button" onClick={onPrevious} aria-label="Previous image">
                <ChevronLeft aria-hidden="true" />
              </button>
            )}
            {onNext && (
              <button className="dialog-arrow dialog-arrow-right" type="button" onClick={onNext} aria-label="Next image">
                <ChevronRight aria-hidden="true" />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

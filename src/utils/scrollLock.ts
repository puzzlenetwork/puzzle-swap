// Simple shared body scroll lock with reference counting.
// Ensures that if multiple overlays/modals request a lock simultaneously,
// the body scroll is only restored after the final one is closed.
let lockCount = 0;

export function lockBodyScroll() {
  if (typeof document === "undefined") return;
  if (lockCount === 0) {
    // Store the original overflow so we could extend logic later if needed.
    document.body.dataset.prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Optionally avoid layout shift due to scrollbar disappearance.
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      document.body.dataset.addedBodyPaddingRight = "true";
    }
  }
  lockCount += 1;
}

export function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  if (lockCount === 0) return; // nothing to unlock
  lockCount -= 1;
  if (lockCount === 0) {
    document.body.style.overflow = document.body.dataset.prevOverflow || "";
    delete document.body.dataset.prevOverflow;
    if (document.body.dataset.addedBodyPaddingRight) {
      document.body.style.paddingRight = "";
      delete document.body.dataset.addedBodyPaddingRight;
    }
  }
}

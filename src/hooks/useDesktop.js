
export function isIconDroppedOnTarget(dragRef, targetRef) {
  if (!dragRef.current || !targetRef.current) return false;
  const dragRect = dragRef.current.getBoundingClientRect();
  const targetRect = targetRef.current.getBoundingClientRect();
  const dragCenter = {
    x: dragRect.left + dragRect.width / 2,
    y: dragRect.top + dragRect.height / 2,
  };
  return (
    dragCenter.x > targetRect.left &&
    dragCenter.x < targetRect.right &&
    dragCenter.y > targetRect.top &&
    dragCenter.y < targetRect.bottom
  );
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(val, max));
}

export function getDesktopBounds(binRef) {
  const desktopWidth = window.innerWidth;
  const desktopHeight = window.innerHeight;
  const binWidth = binRef.current?.offsetWidth || 64;
  const binHeight = binRef.current?.offsetHeight || 64;
  const taskbar = document.querySelector('.windows-taskbar');
  const taskbarHeight = taskbar ? taskbar.offsetHeight : 40;
  return {
    desktopWidth,
    desktopHeight,
    binWidth,
    binHeight,
    taskbarHeight,
  };
}

export function getClampedBinPosition(e, dragOffset, binRef, margin = 10) {
  const {
    desktopWidth,
    desktopHeight,
    binWidth,
    binHeight,
    taskbarHeight,
  } = getDesktopBounds(binRef);
  let x = e.clientX - dragOffset.current.x;
  let y = e.clientY - dragOffset.current.y;
  x = clamp(x, margin, desktopWidth - binWidth - margin);
  y = clamp(y, margin, desktopHeight - taskbarHeight - binHeight - margin);
  return { x, y };
}
 
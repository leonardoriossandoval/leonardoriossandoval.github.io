/* Start the shared in-view watcher once every module has registered */
(() => {
  const { check } = window.LR;
  addEventListener('scroll', check, { passive: true });
  addEventListener('resize', check);
  check();
})();

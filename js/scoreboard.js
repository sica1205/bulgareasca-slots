const Scoreboard = (() => {
  const STORAGE_KEY = 'bulgareasca_scores';
  const MAX_ENTRIES = 10;

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function save(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function submit(name, score) {
    if (!name || score < 0) return false;
    const entries = load();
    entries.push({ name: String(name).slice(0, 20), score, date: Date.now() });
    entries.sort((a, b) => b.score - a.score);
    const trimmed = entries.slice(0, MAX_ENTRIES);
    save(trimmed);
    return true;
  }

  function getAll() {
    return load();
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { submit, getAll, clear };
})();

export default Scoreboard;

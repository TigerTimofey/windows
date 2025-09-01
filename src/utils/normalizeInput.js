export function normalizeForm(form) {
  const normalized = { ...form };
  Object.keys(normalized).forEach(key => {
    const value = normalized[key];
    if (typeof value === 'string' && value.includes('-')) {
      const parts = value.split('-').map(p => parseInt(p.trim(), 10)).filter(n => !isNaN(n));
      if (parts.length === 2) {
        normalized[key] = Math.round((parts[0] + parts[1]) / 2).toString();
      }
    }
  });
  return normalized;
}

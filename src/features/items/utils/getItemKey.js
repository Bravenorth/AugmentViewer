const getItemKey = (item) => {
  if (!item) return null;
  const identifier = item.id ?? item.key ?? item.name ?? null;
  if (identifier === null || identifier === undefined) return null;
  return String(identifier);
};

export default getItemKey;

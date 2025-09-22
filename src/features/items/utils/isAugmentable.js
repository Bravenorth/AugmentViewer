export default function isAugmentable(item) {
  const craft = item?.craft;
  if (!craft) return false;

  const hasScrapping = craft.scrapping && Object.keys(craft.scrapping).length > 0;
  const hasAugmenting = craft.augmenting && Object.keys(craft.augmenting).length > 0;

  return hasScrapping || hasAugmenting;
}


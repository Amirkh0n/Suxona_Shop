import { categoryApi } from '../api/endpoints';

// /categories is paginated and gives no "all at once" option. Fetching only
// page 1 (as the old catalog page did) silently drops any category — parent
// or child — that happens to live on page 2+, which is exactly why child
// categories were never showing up. The category list is small and mostly
// static, so walking every page once is cheap and gives a complete tree.
export async function fetchAllCategories() {
  let page = 1;
  let all = [];
  for (let i = 0; i < 50; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const { data } = await categoryApi.list(page);
    all = all.concat(data?.results || []);
    if (!data?.next) break;
    page += 1;
  }
  return all;
}

// Category.parent is just an id (or null) — there's no nested `children`
// array from the API, so the tree has to be assembled client-side from the
// flat list.
export function buildCategoryTree(categories) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const childrenByParent = new Map();
  categories.forEach((c) => {
    const key = c.parent ?? null;
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(c);
  });

  const getChildren = (id) => childrenByParent.get(id) || [];
  const hasChildren = (id) => getChildren(id).length > 0;

  // This category's id plus every id below it — used to ask the products
  // endpoint (which only filters by one exact category id) for "this
  // category and everything under it" via several parallel requests.
  const descendantIds = (id) => {
    const out = [id];
    getChildren(id).forEach((child) => out.push(...descendantIds(child.id)));
    return out;
  };

  return {
    byId,
    roots: childrenByParent.get(null) || [],
    getChildren,
    hasChildren,
    descendantIds,
  };
}

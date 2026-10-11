import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllCategories, buildCategoryTree } from '../../utils/categoryTree';
import { resolveImageUrl } from '../../utils/media';
import { RowSkeleton } from '../../components/Skeleton';
import { ChevronRightIcon, GridIcon } from '../../components/Icons';

// The catalog tab is a pure category browser: pick a category (and
// optionally drill into its sub-categories) to land on the product list for
// it. It intentionally shows no products itself — that's /mahsulotlar's job.
export default function Catalog() {
  const navigate = useNavigate();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    fetchAllCategories()
      .then((categories) => { if (!cancelled) setTree(buildCategoryTree(categories)); })
      .catch(() => { if (!cancelled) setTree(buildCategoryTree([])); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openCategory = (cat) => {
    const ids = tree.hasChildren(cat.id) ? tree.descendantIds(cat.id) : [cat.id];
    const query = tree.hasChildren(cat.id) ? `categories=${ids.join(',')}` : `category=${cat.id}`;
    navigate(`/mahsulotlar?${query}`, { state: { categoryName: cat.name } });
  };

  return (
    <div className="container page">
      <h1>Katalog</h1>

      <button type="button" className="card category-tree-row category-tree-all" onClick={() => navigate('/mahsulotlar')}>
        <span className="category-tree-icon category-tree-icon-all"><GridIcon width={20} height={20} /></span>
        <span className="category-tree-name">Barcha mahsulotlar</span>
      </button>

      {loading ? (
        <div style={{ marginTop: 'var(--sp-3)' }}><RowSkeleton count={6} /></div>
      ) : tree.roots.length === 0 ? (
        <div className="empty-state card"><h3>Hozircha kategoriyalar yo'q</h3></div>
      ) : (
        <div className="category-tree">
          {tree.roots.map((cat) => (
            <CategoryNode
              key={cat.id}
              category={cat}
              depth={0}
              tree={tree}
              expanded={expanded}
              onToggle={toggleExpanded}
              onOpen={openCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryNode({ category, depth, tree, expanded, onToggle, onOpen }) {
  const children = tree.getChildren(category.id);
  const isOpen = expanded.has(category.id);

  return (
    <div className="category-tree-branch">
      <div className="card category-tree-row" style={{ paddingLeft: `calc(var(--sp-4) + ${depth * 20}px)` }}>
        <button type="button" className="category-tree-name-btn" onClick={() => onOpen(category)}>
          <span className="category-tree-icon">
            {category.icon ? <img src={resolveImageUrl(category.icon)} alt="" /> : <GridIcon width={18} height={18} />}
          </span>
          <span className="category-tree-name">{category.name}</span>
        </button>
        {children.length > 0 && (
          <button
            type="button"
            className={`category-tree-chevron${isOpen ? ' open' : ''}`}
            onClick={() => onToggle(category.id)}
            aria-label={isOpen ? "Yopish" : "Pastki kategoriyalarni ko'rsatish"}
            aria-expanded={isOpen}
          >
            <ChevronRightIcon width={16} height={16} />
          </button>
        )}
      </div>

      {isOpen && children.length > 0 && (
        <div className="category-tree-children">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              depth={depth + 1}
              tree={tree}
              expanded={expanded}
              onToggle={onToggle}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

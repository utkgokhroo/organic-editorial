import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { categories, products as localProducts } from "../data/products";
import { productApi } from "../services/api";
import { normalizeProduct as normalizeLocalProduct } from "../utils/productUtils";
import "../styles/Products.css";

// Pre-normalize local products once so fallback is fast
const normalizedLocalProducts = localProducts.map(normalizeLocalProduct);

const LIMIT = 12;

export default function Products() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCats, setSelectedCats] = useState(initialCategory ? initialCategory.split(",") : []);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(600);
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, limit: LIMIT });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const allCats = useMemo(() => categories.map((category) => category.name), []);
  const activeFilterCount = selectedCats.length + (inStockOnly ? 1 : 0) + (minRating ? 1 : 0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    productApi
      .list({
        page,
        limit: LIMIT,
        search,
        category: selectedCats,
        minPrice,
        maxPrice,
        minRating,
        inStock: inStockOnly ? true : "",
        sort,
      })
      .then((response) => {
        if (controller.signal.aborted) return;
        setProducts(response.data.products);
        setPagination(response.pagination || { page: 1, pages: 1, limit: LIMIT });
        setTotal(response.total || response.data.products.length);
      })
      .catch(() => {
        // ── API unavailable — filter/sort local data as fallback ──
        if (controller.signal.aborted) return;

        let filtered = [...normalizedLocalProducts];

        // Text search
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q) ||
              (p.tags || []).some((t) => t.toLowerCase().includes(q))
          );
        }

        // Category filter
        if (selectedCats.length > 0) {
          filtered = filtered.filter((p) => selectedCats.includes(p.category));
        }

        // Price range
        filtered = filtered.filter((p) => p.price >= minPrice && p.price <= maxPrice);

        // Rating filter
        if (minRating) {
          filtered = filtered.filter((p) => p.rating >= Number(minRating));
        }

        // In-stock filter
        if (inStockOnly) {
          filtered = filtered.filter((p) => p.inStock);
        }

        // Sort
        switch (sort) {
          case "price_asc":  filtered.sort((a, b) => a.price - b.price); break;
          case "price_desc": filtered.sort((a, b) => b.price - a.price); break;
          case "rating":     filtered.sort((a, b) => b.rating - a.rating); break;
          case "name_asc":   filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
          case "discount":   filtered.sort((a, b) => (b.originalPrice - b.price) - (a.originalPrice - a.price)); break;
          default:           break; // newest — keep data-file order
        }

        const total = filtered.length;
        const pages = Math.ceil(total / LIMIT) || 1;
        const start = (page - 1) * LIMIT;
        const paged = filtered.slice(start, start + LIMIT);

        setProducts(paged);
        setTotal(total);
        setPagination({
          page,
          pages,
          limit: LIMIT,
          hasNextPage: page < pages,
          hasPrevPage: page > 1,
        });
        // Don't set an error message — local fallback renders the UI fine
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [search, selectedCats, minPrice, maxPrice, minRating, sort, inStockOnly, page]);

  const resetPage = (fn) => {
    setPage(1);
    fn();
  };

  const toggleCat = (cat) => {
    resetPage(() => {
      setSelectedCats((prev) =>
        prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
      );
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCats([]);
    setMinPrice(0);
    setMaxPrice(600);
    setMinRating("");
    setInStockOnly(false);
    setSort("newest");
    setPage(1);
  };

  const pageNumbers = useMemo(() => {
    const pages = pagination.pages || 1;
    const start = Math.max(1, Math.min(page - 2, pages - 4));
    const count = Math.min(5, pages);
    return Array.from({ length: count }, (_, index) => start + index).filter((item) => item <= pages);
  }, [page, pagination.pages]);

  const FilterPanel = () => (
    <>
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="filter-clear" onClick={clearFilters}>Clear All</button>
      </div>

      <div className="filter-section">
        <div className="filter-section-title">Category</div>
        {allCats.map((cat) => (
          <label key={cat} className="filter-option">
            <input
              type="checkbox"
              checked={selectedCats.includes(cat)}
              onChange={() => toggleCat(cat)}
            />
            {cat}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <div className="filter-section-title">Price Range</div>
        <div className="price-input-row">
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) => resetPage(() => setMinPrice(Number(event.target.value)))}
            aria-label="Minimum price"
          />
          <input
            type="number"
            min={minPrice}
            value={maxPrice}
            onChange={(event) => resetPage(() => setMaxPrice(Number(event.target.value)))}
            aria-label="Maximum price"
          />
        </div>
        <div className="price-slider">
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={maxPrice}
            onChange={(event) => resetPage(() => setMaxPrice(Number(event.target.value)))}
          />
          <div className="price-range-display">
            <span>Rs. {minPrice}</span>
            <span>Up to Rs. {maxPrice}</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-section-title">Rating</div>
        {["", "4", "3", "2"].map((rating) => (
          <label key={rating || "all"} className="filter-option">
            <input
              type="radio"
              name="rating"
              checked={minRating === rating}
              onChange={() => resetPage(() => setMinRating(rating))}
            />
            {rating ? `${rating}+ stars` : "All ratings"}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <div className="filter-section-title">Availability</div>
        <label className="filter-option">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => resetPage(() => setInStockOnly(event.target.checked))}
          />
          In Stock Only
        </label>
      </div>
    </>
  );

  return (
    <div className="page-wrapper products-page">
      <div className="container">
        <div className="products-header">
          <div>
            <h1 className="section-title">All Products</h1>
            <p className="products-count">{loading ? "Loading products..." : `${total} products found`}</p>
          </div>
          <button className="mobile-filter-btn" onClick={() => setMobileFilterOpen(true)}>
            Filters {activeFilterCount ? `(${activeFilterCount})` : ""}
          </button>
        </div>

        {activeFilterCount > 0 && (
          <div className="filter-tags">
            {selectedCats.map((cat) => (
              <span key={cat} className="filter-tag">
                {cat}
                <button onClick={() => toggleCat(cat)}>x</button>
              </span>
            ))}
            {minRating && (
              <span className="filter-tag">
                {minRating}+ stars
                <button onClick={() => resetPage(() => setMinRating(""))}>x</button>
              </span>
            )}
            {inStockOnly && (
              <span className="filter-tag">
                In Stock
                <button onClick={() => resetPage(() => setInStockOnly(false))}>x</button>
              </span>
            )}
          </div>
        )}

        <div className="products-layout">
          <aside className="filter-sidebar">
            <FilterPanel />
          </aside>

          <div className="products-right">
            <div className="products-toolbar">
              <div className="search-bar-full">
                <span className="s-icon" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(event) => resetPage(() => setSearch(event.target.value))}
                />
              </div>
              <select className="sort-select" value={sort} onChange={(event) => resetPage(() => setSort(event.target.value))}>
                <option value="newest">Newest</option>
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Best Discount</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>

            {error && <div className="alert-error">{error}</div>}

            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="icon">Search</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term.</p>
                <button className="btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="products-results">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button disabled={!pagination.hasPrevPage} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                      Previous
                    </button>
                    {pageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        className={pageNumber === page ? "active" : ""}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button disabled={!pagination.hasNextPage} onClick={() => setPage((prev) => prev + 1)}>
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={`mobile-filter-overlay${mobileFilterOpen ? " open" : ""}`}
        onClick={() => setMobileFilterOpen(false)}
      >
        <div className="mobile-filter-panel" onClick={(event) => event.stopPropagation()}>
          <FilterPanel />
          <div style={{ padding: "16px 20px" }}>
            <button className="btn-primary" style={{ width: "100%" }} onClick={() => setMobileFilterOpen(false)}>
              Show Results
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
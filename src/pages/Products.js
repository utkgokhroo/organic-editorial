import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { products, categories } from "../data/products";
import "../styles/Products.css";

export default function Products() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCats, setSelectedCats] = useState(
    searchParams.get("category") ? [searchParams.get("category")] : []
  );
  const [maxPrice, setMaxPrice] = useState(500);
  const [sort, setSort] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const allCats = [...new Set(products.map((p) => p.category))];

  const toggleCat = (cat) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (selectedCats.length > 0) {
      list = list.filter((p) => selectedCats.includes(p.category));
    }
    list = list.filter((p) => p.price <= maxPrice);
    if (inStockOnly) list = list.filter((p) => p.inStock);

    switch (sort) {
      case "price_asc": list.sort((a, b) => a.price - b.price); break;
      case "price_desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "discount": list.sort((a, b) => (b.originalPrice - b.price) - (a.originalPrice - a.price)); break;
      default: break;
    }
    return list;
  }, [search, selectedCats, maxPrice, sort, inStockOnly]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCats([]);
    setMaxPrice(500);
    setInStockOnly(false);
    setSort("featured");
  };

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
        <div className="filter-section-title">Max Price</div>
        <div className="price-slider">
          <input
            type="range"
            min={10}
            max={500}
            step={10}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
          <div className="price-range-display">
            <span>₹10</span>
            <span>Up to ₹{maxPrice}</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-section-title">Availability</div>
        <label className="filter-option">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
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
            <p className="products-count">{filtered.length} products found</p>
          </div>
          <button className="mobile-filter-btn" onClick={() => setMobileFilterOpen(true)}>
            🔧 Filters {(selectedCats.length > 0 || inStockOnly) ? `(${selectedCats.length + (inStockOnly ? 1 : 0)})` : ""}
          </button>
        </div>

        {/* Active filter tags */}
        {(selectedCats.length > 0 || inStockOnly) && (
          <div className="filter-tags">
            {selectedCats.map((c) => (
              <span key={c} className="filter-tag">
                {c}
                <button onClick={() => toggleCat(c)}>×</button>
              </span>
            ))}
            {inStockOnly && (
              <span className="filter-tag">
                In Stock
                <button onClick={() => setInStockOnly(false)}>×</button>
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
                <span className="s-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Best Discount</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term</p>
                <button className="btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="products-results">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      <div
        className={`mobile-filter-overlay${mobileFilterOpen ? " open" : ""}`}
        onClick={() => setMobileFilterOpen(false)}
      >
        <div className="mobile-filter-panel" onClick={(e) => e.stopPropagation()}>
          <FilterPanel />
          <div style={{ padding: "16px 20px" }}>
            <button
              className="btn-primary"
              style={{ width: "100%" }}
              onClick={() => setMobileFilterOpen(false)}
            >
              Show {filtered.length} Results
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

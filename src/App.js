import "./styles.css";

import { useEffect, useState } from "react";

const LIMIT = 8;

export default function App() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = Math.ceil(total / LIMIT);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const skip = (currentPage - 1) * LIMIT;

        const response = await fetch(
          `https://dummyjson.com/products?limit=${LIMIT}&skip=${skip}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        setProducts(data.products);
        setTotal(data.total);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, [currentPage]);

  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <main className="container">
      <h1>Product Store</h1>
      <p className="subtitle">
        Browse products using pagination
      </p>

      {loading && <p className="message">Loading products...</p>}

      {error && (
        <div className="error">
          {error}
          <button onClick={() => goToPage(currentPage)}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="count">
            Total products: {total}
          </p>

          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <img
                  src={product.thumbnail}
                  alt={product.title}
                />

                <div className="product-info">
                  <h3>{product.title}</h3>
                  <p className="price">${product.price}</p>
                  <p>⭐ {product.rating}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                className={
                  currentPage === page ? "active" : ""
                }
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </button>
          </div>

          <p className="page-info">
            Page {currentPage} of {totalPages}
          </p>
        </>
      )}
    </main>
  );
}
  

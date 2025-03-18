import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchTerm = searchParams.get("q")?.toLowerCase() || "";

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError("");

      try {
        const itemsRef = collection(db, "items");
        const querySnapshot = await getDocs(itemsRef);

        const allItems: any[] = [];
        querySnapshot.forEach((doc) => {
          allItems.push({ id: doc.id, ...doc.data() });
        });

        const filteredResults = allItems.filter((item) => {
          const productName = item.productName?.toLowerCase() || "";
          const description = item.description?.toLowerCase() || "";
          const category = item.category?.toLowerCase() || "";

          return (
            productName.includes(searchTerm) ||
            description.includes(searchTerm) ||
            category.includes(searchTerm)
          );
        });

        setResults(filteredResults);
      } catch (err: any) {
        setError("Failed to fetch search results.");
        console.error(err);
      }

      setLoading(false);
    };

    if (searchTerm.trim()) {
      fetchResults();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [searchTerm]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">
        Search Results for: <strong>"{searchTerm}"</strong>
      </h2>

      {loading && (
        <div className="d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status" />
          <span className="ms-2">Loading...</span>
        </div>
      )}

      {error && <p className="text-danger text-center">{error}</p>}

      {!loading && !error && results.length === 0 && (
        <div className="text-center">
          <p>
            No items found matching "<strong>{searchTerm}</strong>".
          </p>
        </div>
      )}

      <div className="row">
        {results.map((item) => (
          <div key={item.id} className="col-md-4 col-sm-6 mb-4">
            <div className="card h-100 shadow-sm">
              <img
                src={item.imageUrl}
                className="card-img-top"
                alt={item.productName}
                style={{ objectFit: "cover", height: "200px" }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{item.productName}</h5>
                <p className="card-text flex-grow-1">{item.description}</p>
                <p className="text-primary fw-bold">₱{item.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

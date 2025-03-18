import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

interface Item {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q")?.toLowerCase() || "";

  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        navigate(-1); // No search query, go back
        return;
      }

      setLoading(true);
      try {
        const q = query(
          collection(db, "items"),
          where("keywords", "array-contains", searchQuery)
        );

        const querySnapshot = await getDocs(q);
        const items: Item[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[];

        setResults(items);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, navigate]);

  return (
    <div className="container mt-4">
      {searchQuery ? (
        <>
          <h2 className="text-center">
            Search Results for "
            <span className="text-primary">{searchQuery}</span>"
          </h2>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status" />
              <p>Loading...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="row">
              {results.map((item) => (
                <div key={item.id} className="col-md-4 col-sm-6 mb-4">
                  <div className="card h-100 shadow-sm">
                    <img
                      src={
                        item.imageUrl ||
                        "https://via.placeholder.com/300x200.png?text=No+Image"
                      }
                      className="card-img-top"
                      alt={item.name}
                      style={{ objectFit: "cover", height: "200px" }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text flex-grow-1">
                        {item.description}
                      </p>
                      {/* Add more details here if needed */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p>
                No results found for "<strong>{searchQuery}</strong>".
              </p>
              <button
                className="btn btn-secondary mt-3"
                onClick={() => navigate("/")}
              >
                Back to Home
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default SearchResultsPage;

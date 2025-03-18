import "bootstrap/dist/css/bootstrap.min.css";
import logo from "/src/assets/Valma.png";

export default function Header() {
  return (
    <div className="container-fluid bg-white border-bottom shadow-sm">
      <div className="container mt-2 p-2 ">
        <div className="row align-items-center">
          <div className="col-auto">
            <img
              src={logo}
              alt="Valmarket Logo"
              style={{ height: "50px", objectFit: "contain" }}
            />
          </div>

          <div className="col">
            <h4 className="mb-0 text-danger fw-bold">VALMARKET</h4>
            <p className="small text-muted mb-0">
              Valmerica City School of Mathematics and Science Market
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

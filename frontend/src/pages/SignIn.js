import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Adăugat useNavigate
import "./SignIn.css";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Hook pentru navigare

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: email, 
        parola: password
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Eroare la autentificare");
        return res.json();
      })
      .then((data) => {
        setMessage("Autentificare reușită!");
        
        // Presupunem că backend-ul returnează un obiect cu userid
        if (data.user_id) {
          // Redirecționează către pagina de profil
          navigate(`/profile/${data.user_id}`);
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage(err.message || "Autentificare eșuată");
      })
      .finally(() => setIsLoading(false));
  };

  // Restul codului rămâne la fel...
  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2 className="signin-title">Autentificare</h2>
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Introdu adresa de email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Parolă</label>
            <input
              id="password"
              type="password"
              placeholder="Introdu parola"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Se încarcă...' : 'Autentificare'}
          </button>

          <div className="forgot-password">
            <Link to="/reset-password">Ai uitat parola?</Link>
          </div>
        </form>
        
        {message && (
          <div className={`message ${message.includes("eșuată") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        <div className="register-link">
          Nu ai cont? <Link to="/register">Înregistrează-te</Link>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
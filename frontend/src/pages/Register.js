import { useState } from "react";
import "./SignIn.css"; // Using the same style as SignIn

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage("Parolele nu coincid!");
      return;
    }

    setIsLoading(true);
    setMessage("");

    fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Eroare la înregistrare");
        return res.json();
      })
      .then((data) => setMessage(data.message || "Înregistrare reușită!"))
      .catch((err) => {
        console.error(err);
        setMessage(err.message || "Înregistrare eșuată");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2 className="signin-title">Înregistrare</h2>
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <label htmlFor="name">Nume complet</label>
            <input
              id="name"
              type="text"
              placeholder="Introdu numele tău"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmă parola</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Reintrodu parola"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Se încarcă...' : 'Înregistrează-te'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${message.includes("eșuată") || message.includes("nu coincid") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        <div className="login-link">
          Ai deja cont? <a href="/signin">Autentifică-te</a>
        </div>
      </div>
    </div>
  );
}

export default Register;
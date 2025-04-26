import { useState } from "react";
import "./SignIn.css"; // Reusing the same CSS as SignIn

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setNewPassword("");

    try {
      const response = await fetch("http://127.0.0.1:8000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Eroare la resetarea parolei");
      }

      const data = await response.json();
      setMessage(data.message || "Parolă resetată cu succes!");
      setNewPassword(data.new_password); // Note the underscore to match Python convention
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Resetare parolă eșuată");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2 className="signin-title">Resetare Parolă</h2>
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
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Se procesează...' : 'Resetează parola'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        {newPassword && (
          <div className="password-result">
            <h4>Parola ta nouă:</h4>
            <div className="new-password">
              {newPassword}
              <button 
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(newPassword);
                  alert('Parolă copiată în clipboard!');
                }}
              >
                Copiază
              </button>
            </div>
            <p className="password-warning">
              Te rugăm să schimbi această parolă după autentificare!
            </p>
          </div>
        )}

        <div className="login-link">
          Îți amintești parola? <a href="/signin">Autentifică-te</a>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
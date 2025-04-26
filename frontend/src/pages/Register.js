import { useState } from "react";
import "./SignIn.css"; // Using the same style as SignIn

function Register() {
  const [nume, setNume] = useState("");
  const [prenume, setPrenume] = useState("");
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [confirmParola, setConfirmParola] = useState("");
  const [dataNasterii, setDataNasterii] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (parola !== confirmParola) {
      setMessage("Parolele nu coincid!");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const userData = {
      nume,
      prenume,
      email,
      parola,
      data_nasterii: dataNasterii,
      bio
    };
    
    fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
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
            <label htmlFor="nume">Nume</label>
            <input
              id="nume"
              type="text"
              placeholder="Introdu numele de familie"
              value={nume}
              onChange={(e) => setNume(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="prenume">Prenume</label>
            <input
              id="prenume"
              type="text"
              placeholder="Introdu prenumele"
              value={prenume}
              onChange={(e) => setPrenume(e.target.value)}
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
            <label htmlFor="parola">Parolă</label>
            <input
              id="parola"
              type="password"
              placeholder="Introdu parola"
              value={parola}
              onChange={(e) => setParola(e.target.value)}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmParola">Confirmă parola</label>
            <input
              id="confirmParola"
              type="password"
              placeholder="Reintrodu parola"
              value={confirmParola}
              onChange={(e) => setConfirmParola(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dataNasterii">Data nașterii</label>
            <input
              id="dataNasterii"
              type="date"
              value={dataNasterii}
              onChange={(e) => setDataNasterii(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              placeholder="Scrie câteva lucruri despre tine..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="3"
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
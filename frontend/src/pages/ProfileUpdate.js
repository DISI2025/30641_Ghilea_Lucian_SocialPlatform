import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProfileUpdate.css";

function EditProfile() {
  const { userId} = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    nume: "",
    prenume: "",
    data_nasterii: "",
    bio: ""
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!userId) {
      setMessage("ID utilizator lipsă");
      setIsLoadingData(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8000/profile/${userId}`);
        
        if (!response.ok) throw new Error("Nu s-au putut încărca datele profilului");
        const data = await response.json();
        
        setProfile({
          nume: data.nume || "",
          prenume: data.prenume || "",
          data_nasterii: data.data_nasterii?.split('T')[0] || "",
          bio: data.bio || ""
        });
      } catch (err) {
        setMessage(err.message);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      setMessage("Eroare: ID utilizator lipsă");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`http://localhost:8000/profile/${userId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Actualizarea profilului a eșuat");
      }
      
      setMessage("Profil actualizat cu succes!");
      setTimeout(() => navigate(`/profile/${userId}`), 1500);
    } catch (err) {
      console.error("Eroare actualizare:", err);
      setMessage(err.message || "Eroare la actualizarea profilului");
    } finally {
      setIsLoading(false);
    }     
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Ești sigur că vrei să ștergi contul? Această acțiune este permanentă!")) {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/delete-own-account/${userId}`, {
          method: "DELETE",
          headers: {
          "Content-Type": "application/json",  
        },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Ștergerea contului a eșuat");
        }

        navigate('/');
      } catch (err) {
        setMessage(err.message || "Eroare la ștergerea contului");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoadingData) {
    return (
      <div className="profile-update-container">
        <div className="profile-update-card">
          <h2>Se încarcă datele profilului...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-update-container">
      <div className="profile-update-card">
        <h2 className="profile-update-title">Editare Profil</h2>
        
        <form onSubmit={handleSubmit} className="profile-update-form">
          <div className="form-group">
            <label htmlFor="nume">Nume</label>
            <input
              id="nume"
              name="nume"
              type="text"
              placeholder="Introduceți numele"
              value={profile.nume}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="prenume">Prenume</label>
            <input
              id="prenume"
              name="prenume"
              type="text"
              placeholder="Introduceți prenumele"
              value={profile.prenume}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="data_nasterii">Data nașterii</label>
            <input
              id="data_nasterii"
              name="data_nasterii"
              type="date"
              value={profile.data_nasterii}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">Biografie</label>
            <textarea
              id="bio"
              name="bio"
              placeholder="Spuneți-ne despre dumneavoastră"
              value={profile.bio}
              onChange={handleChange}
              rows="4"
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Se actualizează...' : 'Actualizează Profilul'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${message.includes("Eroare") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        <div className="profile-actions">
          <button onClick={() => navigate(-1)} className="back-btn">Înapoi la Profil</button>
          
          <button 
            onClick={handleDeleteAccount}
            className="delete-account-btn"
            disabled={isLoading}
          >
            Șterge Contul
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error("Fetch error:", err);
        setMessage("Error fetching data");
      });
  }, []);

  return <h1>{message}</h1>;
}

export default App;

import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="bg-red-500 text-white p-20">
        Welcome to Community Discussion Platform
      </div>
    </>
  );
}

export default App;

import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://100.64.233.45:5000", {
  transports: ["websocket"],
});

function App() {
  const [status, setStatus] = useState("");
  const [height, setHeight] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number | string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    socket.on("response", (data) => {
      console.log("Received response:", data);
      if (data.action?.action === "MOVE_TO_HEIGHT") {
        setStatus(
          `Action: ${data.action.action}, Result: Moving to height ${data.action.height}`
        );
      } else {
        setStatus(`Action: ${data.action}, Result: ${data.result}`);
      }
      if (data.height) {
        setHeight(data.height);
      }
    });

    socket.on("height_update", (data) => {
      console.log("Received height_update:", data);
      setHeight(data.height);
    });

    return () => {
      socket.off("response");
      socket.off("height_update");
    };
  }, []);

  const sendControlCommand = (command: string, heightValue?: number) => {
    if (command === "MOVE_TO_HEIGHT" && heightValue !== undefined) {
      socket.emit("control", { action: command, height: heightValue });
    } else {
      socket.emit("control", command);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numberValue = Number(value);
    if (!isNaN(numberValue) && numberValue >= 25.5 && numberValue <= 51.0) {
      setTargetHeight(numberValue);
      setError("");
    } else {
      setTargetHeight(value);
      setError("Please enter a number between 25.5 and 51.0.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sit-Stand Desk Controller</h1>
        <button onClick={() => sendControlCommand("UP")}>Move Up</button>
        <button onClick={() => sendControlCommand("DOWN")}>Move Down</button>
        <button onClick={() => sendControlCommand("STOP")}>Stop</button>
        <button onClick={() => sendControlCommand("GET_HEIGHT")}>
          Get Height
        </button>
        <div>
          <input
            type="text"
            value={targetHeight}
            onChange={handleHeightChange}
            placeholder="Enter target height (inch)"
          />
          <button
            onClick={() =>
              typeof targetHeight === "number" &&
              sendControlCommand("MOVE_TO_HEIGHT", targetHeight)
            }
          >
            Move to Height
          </button>
          {error && <p className="error">{error}</p>}
        </div>
        <div className="status">
          <p>{status}</p>
          <p>Current Height: {height} inch</p>
        </div>
      </header>
    </div>
  );
}

export default App;

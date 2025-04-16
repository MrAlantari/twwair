import { useState, useEffect } from "react";
import { io } from "socket.io-client";


const socket = io("http://localhost:3000");

type SensorData = {
    temperature: number;
    humidity: number;
    pressure: number;
    timestamp: string;
};

function App() {
   const [message, setMessage] = useState("");
   const [messages, setMessages] = useState<any[]>([]);
   const [testingData, setTestingData] = useState<any[]>([]);
   const [postData, setData] = useState<SensorData[]>([]);



   useEffect(() => {
        socket.on("message", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        socket.on("sensor-testing-data", data => {
            setTestingData((prev) => {
                const newData = [...prev, data];
                console.log(newData);
                return newData;
            });
          
        });

        socket.on('sensor-data', (newData: SensorData) => {
            setData(prev => {
                const data = [...prev, newData];
                console.log(data);
                return data;
            });
        })

        return () => {
            socket.off("message");
            socket.off("sensor-testing-data");
            socket.off("sensor-data");
        };
   }, []);


   const sendMessage = () => {
       if (message) {
           socket.emit("message", message);
           setMessage("");
       }
   };
  
   return (
       <div style={{ padding: "20px", textAlign: "center" }}>
           <h2>WebSocket TWwAIR test App</h2>
           <div>
               {messages.map((msg, index) => (
                   <p key={index}>💬 {msg}</p>
               ))}
           </div>
           <input
               type="text"
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder="Wpisz wiadomość..."
           />
           <button onClick={sendMessage}>Wyślij</button>

           <div>
               <h3>Dane z czujników:</h3>
                {postData.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {postData.map((data, index) => (
                        <li key={index} style={{ margin: "10px 0", padding: "10px", borderRadius: "5px" }}>
                                {index + 1}. {" "} | {" "}
                                {new Date(data.timestamp || Date.now()).toLocaleTimeString()} | {" "}
                                {data.temperature}°C | {" "}
                                {data.humidity}% | {" "}
                                {data.pressure}hPa
                            </li>
                        ))}
                        </ul>
                ) : (
                    <p>Brak danych z czujników...</p>
                )}
           </div>
       </div>
   );
}


export default App;

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    axios
        .get("https://clima-backend-xi.vercel.app/api/dados") // 🔁 Altere para seu domínio real
        .then((res) => {
          // Converte tipos e formata timestamp
          const convertidos = res.data.map((item) => ({
            ...item,
            temp: parseFloat(item.temp),
            umidade: parseFloat(item.umidade),
            light: parseFloat(item.light),
            timestamp: new Date(item.timestamp).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setDados(convertidos);
        })
        .catch((err) => console.error(err));
  }, []);

  return (
      <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
        <h2 style={{ textAlign: "center" }}>📊 Dados do ESP32</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temp" stroke="#ff7300" name="Temperatura (°C)" />
            <Line type="monotone" dataKey="umidade" stroke="#007aff" name="Umidade (%)" />
            <Line type="monotone" dataKey="light" stroke="#00c49f" name="Luz" />
          </LineChart>
        </ResponsiveContainer>
      </div>
  );
}

export default App;

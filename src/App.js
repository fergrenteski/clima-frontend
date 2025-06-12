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
  const [contador, setContador] = useState(20); // contador regressivo

  // Função para buscar dados da API
  const fetchDados = () => {
    axios
        .get("https://clima-backend-xi.vercel.app/api/dados")
        .then((res) => {
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
              second: "2-digit",
            }),
          }));
          setDados(convertidos);
        })
        .catch((err) => console.error(err));
  };

  // Chamada inicial + agendamento do fetch e contador
  useEffect(() => {
    fetchDados(); // primeira chamada

    const fetchInterval = setInterval(() => {
      fetchDados();
      setContador(20);
    }, 20000);

    const countdownInterval = setInterval(() => {
      setContador((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  return (
      <div style={{ padding: "1rem", fontFamily: "sans-serif", position: "relative" }}>
        <h2 style={{ textAlign: "center" }}>📊 Dados do ESP32</h2>

        {/* Contador regressivo no canto superior direito */}
        <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#eee",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
        >
          ⏳ Atualiza em: {contador}s
        </div>

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

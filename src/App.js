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
    const [contador, setContador] = useState(20);
    const [intervaloMinutos, setIntervaloMinutos] = useState(10);

    useEffect(() => {
        const fetchDados = () => {
            axios
                .get(`https://clima-backend-xi.vercel.app/api/dados?minutos=${intervaloMinutos}`)
                .then((res) => {
                    const convertidos = res.data.map((item) => {
                        const ts = new Date(item.timestamp);
                        return {
                            ...item,
                            timestampOriginal: item.timestamp,
                            timestamp: ts.toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            }),
                            temp: parseFloat(item.temp),
                            umidade: parseFloat(item.umidade),
                            light: parseFloat(item.light),
                        };
                    });

                    convertidos.sort(
                        (a, b) => new Date(a.timestampOriginal) - new Date(b.timestampOriginal)
                    );

                    setDados(convertidos);
                })
                .catch((err) => console.error(err));
        };

        fetchDados();
        setContador(20);

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
    }, [intervaloMinutos]);

    const ultimo = dados[dados.length - 1];

    const getStatus = (valor, min, max) => {
        if (valor >= min && valor <= max) return "ideal";
        if (valor < min) return "baixo";
        return "alto";
    };

    const getCor = (status) => {
        switch (status) {
            case "ideal":
                return "#00c853"; // verde
            case "baixo":
                return "#ffa000"; // laranja
            case "alto":
                return "#d32f2f"; // vermelho
            default:
                return "#ccc";
        }
    };

    const media = (campo) =>
        dados.length
            ? (dados.reduce((acc, item) => acc + item[campo], 0) / dados.length).toFixed(1)
            : "--";

    return (
        <div style={{ padding: "1rem", fontFamily: "sans-serif", position: "relative" }}>
            <h2 style={{ textAlign: "center" }}>📊 Dados do ESP32</h2>

            {/* Contador regressivo */}
            <div
                style={{
                    position: "absolute",
                    top: 10,
                    opacity: 0.5,
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

            {/* Indicadores de conforto */}
            {ultimo && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "1rem",
                        marginBottom: "1rem",
                        flexWrap: "wrap",
                    }}
                >
                    {[
                        {
                            label: "🌡️ Temperatura",
                            valor: ultimo.temp,
                            unidade: "°C",
                            status: getStatus(ultimo.temp, 18, 22),
                        },
                        {
                            label: "💧 Umidade",
                            valor: ultimo.umidade,
                            unidade: "%",
                            status: getStatus(ultimo.umidade, 40, 60),
                        },
                        {
                            label: "💡 Luminosidade",
                            valor: ultimo.light,
                            unidade: "lux",
                            status: getStatus(ultimo.light, 300, 600),
                        },
                    ].map((indicador) => (
                        <div
                            key={indicador.label}
                            style={{
                                background: getCor(indicador.status),
                                color: "#fff",
                                padding: "1rem",
                                borderRadius: "8px",
                                minWidth: "150px",
                                textAlign: "center",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                                fontWeight: "bold",
                            }}
                        >
                            <div>{indicador.label}</div>
                            <div style={{ fontSize: "1.5rem" }}>
                                {indicador.valor} {indicador.unidade}
                            </div>
                            <div style={{ fontSize: "0.9rem" }}>
                                {indicador.status === "ideal"
                                    ? "✅ Ideal"
                                    : indicador.status === "baixo"
                                        ? "⚠️ Baixo"
                                        : "⚠️ Alto"}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Botões de seleção de intervalo */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                }}
            >
                {[5, 10, 30].map((min) => (
                    <button
                        key={min}
                        onClick={() => setIntervaloMinutos(min)}
                        style={{
                            margin: "0 0.5rem",
                            padding: "0.5rem 1rem",
                            background: intervaloMinutos === min ? "#007aff" : "#eee",
                            color: intervaloMinutos === min ? "#fff" : "#000",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        Últimos {min} min
                    </button>
                ))}
            </div>

            {/* Gráfico */}
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

            {/* Médias dos dados */}
            {dados.length > 0 && (
                <div
                    style={{
                        marginTop: "1rem",
                        display: "flex",
                        justifyContent: "center",
                        gap: "1rem",
                        flexWrap: "wrap",
                        fontWeight: "bold",
                    }}
                >
                    <div
                        style={{
                            background: "#fafafa",
                            border: "1px solid #ddd",
                            padding: "1rem",
                            borderRadius: "8px",
                            minWidth: "160px",
                            textAlign: "center",
                        }}
                    >
                        📈 Média Temperatura: {media("temp")} °C
                    </div>
                    <div
                        style={{
                            background: "#fafafa",
                            border: "1px solid #ddd",
                            padding: "1rem",
                            borderRadius: "8px",
                            minWidth: "160px",
                            textAlign: "center",
                        }}
                    >
                        💧 Média Umidade: {media("umidade")} %
                    </div>
                    <div
                        style={{
                            background: "#fafafa",
                            border: "1px solid #ddd",
                            padding: "1rem",
                            borderRadius: "8px",
                            minWidth: "160px",
                            textAlign: "center",
                        }}
                    >
                        💡 Média Luminosidade: {media("light")} lux
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;

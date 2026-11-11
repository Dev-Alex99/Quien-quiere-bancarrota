# 💰 ¿QUIÉN QUIERE QUEDAR EN BANCARROTA?
> *Concurso de Alta Tensión en Vivo con MiniMax M3.1 Flash*

---

## 📺 Descripción General

**¿Quién Quiere Quedar en Bancarrota?** es un juego multijugador para navegador (de **1 a 4 jugadores**), inspirado en el formato legendario de *¿Quién quiere ser millonario?*, pero transformado en una batalla psicológica de decisiones rápidas, traición entre amigos y comodines vivos con IA.

### ⚡ Cero Escritura de Texto: 100% Selección y Decisión
Diseñado para partidas rápidas de **8 a 10 minutos** donde todo se juega con botones gigantes táctiles:
* Seleccionar opciones `[A]`, `[B]`, `[C]`, `[D]`.
* **«Última Palabra»** (Lock-in) para sellar tu respuesta.
* **«Plantarse con el Pozo»** para retirarte antes de que caiga el hacha.
* Comodines de 1 solo clic.

---

## 🏆 La Escalera del Millón (10 Niveles)

| Nivel | Pozo en Juego | Estado |
| :---: | :---: | :--- |
| **10** | **$1.000.000** | 👑 **EL GRAN BOTE DEL MILLÓN** |
| 9 | $750.000 | Zona de Alta Tensión |
| **8** | **$500.000** | 🛡️ **PISO SEGURO 2 (Garantizado al superarlo)** |
| 7 | $250.000 | Zona de Riesgo |
| 6 | $100.000 | Escalada de Peligro |
| 5 | $50.000 | Foco de Suspenso |
| **4** | **$25.000** | 🛡️ **PISO SEGURO 1 (Primer Salvavidas)** |
| 3 | $10.000 | Inicio del Concurso |
| 2 | $5.000 | Primeras Preguntas |
| 1 | $1.000 | Entrada al Set |

* Si fallas una pregunta, **caes al último piso seguro alcanzado** ($0, $25.000 o $500.000).
* Si decides **Plantarte**, conservas el dinero acumulado de tu nivel actual y pasas a ser espectador.

---

## 🧠 Los 4 Comodines Vivos con MiniMax M3.1 Flash

1. 🕵️ **Llamada al Cuñado Conspiranoico:**  
   MiniMax M3.1 genera un audio/mensaje con total seguridad y convicción. Tiene un **75% de certeza histórica y un 25% de alucinación paranoica**. ¿Te fías de él?
2. ✂️ **El 50:50 Psicológico:**  
   La IA no descarta opciones al azar: borra la más obvia y deja la correcta junto a **la trampa mental más seductora** para hacerte dudar.
3. 👥 **La Audiencia Sintética:**  
   MiniMax simula en 1 segundo la votación de 100 perfiles de público con gráfico de barras porcentual.
4. 🐍 **La Copia Ciega (Exclusivo Multijugador):**  
   Te acoplas a ciegas a la respuesta que elija otro compañero de la sala. Si acierta, subes con él; si se equivoca, ¡ambos caen al piso seguro!

---

## ⏱️ Tolerancia a Latencia (+400ms Ping)

El juego está diseñado para redes móviles y conexiones de alta latencia:
- Cada decisión viaja en un paquete de menos de 100 bytes (`{ choice: 'B' }`).
- La sincronización de reloj con el servidor (`ping:sync`) garantiza que los cronómetros sean milimétricos sin saltos.
- La tensión surge de la pausa dramática y los latidos del corazón, donde el ping es 100% invisible.

---

## 🚀 Puesta en Marcha

### 1. Iniciar en Modo Desarrollo
Desde la raíz del proyecto:
```bash
npm run dev
```
* **Frontend:** [http://localhost:5174](http://localhost:5174)
* **Backend:** [http://localhost:3002](http://localhost:3002)

### 2. Compilar y Ejecutar en Producción
```bash
npm run build
npm start
```
El servidor servirá la aplicación completa en [http://localhost:3002](http://localhost:3002).

---

## 📁 Estructura del Código

```
quien-quiere-bancarrota/
├── server/
│   ├── src/
│   │   ├── ai/
│   │   │   ├── minimax.ts         # Inferencia MiniMax M3.1 (Preguntas, Cuñado, Host)
│   │   │   └── mockQuestions.ts   # Banco de preguntas de alta fidelidad y fallback
│   │   ├── game/
│   │   │   ├── GameRoom.ts        # Máquina de estados de la escalera y comodines
│   │   │   └── RoomManager.ts     # Salas de estudio con código de 4 letras
│   │   ├── config.ts              # Configuración y variables de entorno
│   │   ├── types.ts               # Tipos compartidos
│   │   └── index.ts               # Servidor Express + Socket.io (Puerto 3002)
├── client/
│   ├── src/
│   │   ├── audio/
│   │   │   └── sfx.ts             # Web Audio API (Latidos cardíacos, focos, fanfarria, buzzer)
│   │   ├── components/
│   │   │   ├── StudioHeader.tsx       # Cabecera de estudio, audio y código
│   │   │   ├── MoneyLadder.tsx        # Escalera lateral vertical con pisos seguros
│   │   │   ├── LobbyView.tsx          # Entrada de concursantes y selección de avatar
│   │   │   ├── QuestionView.tsx       # Escenario principal con opciones hexagonales y comodines
│   │   │   ├── DramaPauseView.tsx     # Pausa dramática y comentarios del Conductor IA
│   │   │   ├── VerdictRevealView.tsx  # Revelación esmeralda y liquidación
│   │   │   ├── PodiumView.tsx         # Campeón del pozo y confeti
│   │   │   └── TutorialModal.tsx      # Manual interactivo de concursantes
│   │   ├── index.css              # Iluminación de estudio, botones hexagonales y scanlines
│   │   ├── socket.ts              # Sincronización de latencia
│   │   └── App.tsx                # Orquestador del concurso
├── .env.example
├── .env
└── package.json
```

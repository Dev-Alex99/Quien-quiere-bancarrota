import { config } from '../config.js';
import { TriviaQuestion, OptionLetter, MONEY_LADDER } from '../types.js';
import { MOCK_QUESTIONS, MOCK_HOST_ROASTS } from './mockQuestions.js';

interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT_QUESTION = `Eres el guionista principal del concurso de televisión "¿Quién Quiere Quedar en Bancarrota?".
Tu especialidad es redactar preguntas de opción múltiple (A, B, C, D) de ALTA TENSIÓN sobre hechos reales, insólitos, bizarros o históricos de la humanidad que parecen mentiras inventadas.
Una de las 4 opciones debe ser 100% REAL (pero sonar increíble), y las otras 3 deben ser trampas psicológicas plausibles y divertidas.

Debes responder ÚNICAMENTE con un JSON válido (sin backticks de markdown ni texto extra) con esta estructura:
{
  "category": "Nombre corto de la categoría",
  "question": "Texto de la pregunta...",
  "options": {
    "A": "Opción A",
    "B": "Opción B",
    "C": "Opción C",
    "D": "Opción D"
  },
  "correctAnswer": "A",
  "explanation": "Explicación histórica o científica de 1 a 2 líneas de por qué es la correcta.",
  "cunadoAdvice": "Consejo cómico en 1 o 2 oraciones en tono de cuñado sabelotodo.",
  "audiencePoll": { "A": 65, "B": 15, "C": 12, "D": 8 },
  "fiftyFiftyOptions": ["B", "D"]
}`;

const SYSTEM_PROMPT_HOST = `Eres el mítico Conductor de televisión de "¿Quién Quiere Quedar en Bancarrota?". Eres sarcástico, elegante, disfrutas el suspense, te deleitas con las dudas de los concursantes y comentas sus decisiones con ironía fina antes de desvelar la respuesta.
Responde en 1 o 2 oraciones tajantes y directas en español. Sin comillas ni encabezados.`;

async function callMiniMax(messages: MiniMaxMessage[], temperature = 0.8): Promise<string> {
  const url = `${config.minimax.baseUrl}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.minimax.apiKey}`,
    },
    body: JSON.stringify({
      model: config.minimax.model,
      messages,
      temperature,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MiniMax API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('MiniMax response missing message content');
  }

  return cleanJsonMarkdown(content);
}

function cleanJsonMarkdown(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

export async function generateQuestion(level: number): Promise<TriviaQuestion> {
  const ladderIndex = Math.min(Math.max(0, level - 1), MONEY_LADDER.length - 1);
  const tier = MONEY_LADDER[ladderIndex];

  if (!config.minimax.apiKey) {
    const mock = MOCK_QUESTIONS[ladderIndex] || MOCK_QUESTIONS[0];
    return { ...mock, level, prizeAmount: tier.amount };
  }

  try {
    console.log(`[MiniMax M3.1] Generating dynamic Question for Level ${level} (${tier.formatted})...`);
    const prompt = `Genera una pregunta para el Nivel ${level} de 10 (premio: ${tier.formatted}). ${
      level <= 3 ? 'Dificultad accesible y divertida.' : level <= 7 ? 'Dificultad media con trampa ingeniosa.' : 'Dificultad máxima de infarto con hecho histórico oscurísimo.'
    }`;

    const responseJson = await callMiniMax([
      { role: 'system', content: SYSTEM_PROMPT_QUESTION },
      { role: 'user', content: prompt }
    ], 0.85);

    const parsed = JSON.parse(responseJson) as Partial<TriviaQuestion>;

    const validLetters: OptionLetter[] = ['A', 'B', 'C', 'D'];
    const correct = validLetters.includes(parsed.correctAnswer as any) ? (parsed.correctAnswer as OptionLetter) : 'A';

    // Ensure 50:50 contains two wrong options
    const wrongLetters = validLetters.filter(l => l !== correct);
    const fiftyFifty: OptionLetter[] = (parsed.fiftyFiftyOptions && parsed.fiftyFiftyOptions.length === 2)
      ? parsed.fiftyFiftyOptions
      : [wrongLetters[0], wrongLetters[1]];

    return {
      id: `dyn_q_${level}_${Date.now()}`,
      level,
      prizeAmount: tier.amount,
      category: parsed.category || 'Curiosidades del Mundo',
      question: parsed.question || '¿Cuál de estos sucesos ocurrió realmente?',
      options: {
        A: parsed.options?.A || 'Opción A',
        B: parsed.options?.B || 'Opción B',
        C: parsed.options?.C || 'Opción C',
        D: parsed.options?.D || 'Opción D',
      },
      correctAnswer: correct,
      explanation: parsed.explanation || 'Dato comprobado en los anales históricos.',
      cunadoAdvice: parsed.cunadoAdvice || '¡Metele fichas a la respuesta que más confianza te dé!',
      audiencePoll: parsed.audiencePoll || { A: 45, B: 25, C: 18, D: 12 },
      fiftyFiftyOptions: fiftyFifty,
    };
  } catch (err) {
    console.warn('[MiniMax M3.1] Question generation fallback to mock:', err);
    const mock = MOCK_QUESTIONS[ladderIndex] || MOCK_QUESTIONS[0];
    return { ...mock, level, prizeAmount: tier.amount };
  }
}

export async function generateHostCommentary(
  question: TriviaQuestion,
  playerDecisions: Array<{ playerName: string; choice: OptionLetter | null; isLockedIn: boolean; hasWalkedAway: boolean }>
): Promise<string> {
  if (!config.minimax.apiKey) {
    const list = MOCK_HOST_ROASTS;
    return list[Math.floor(Math.random() * list.length)];
  }

  try {
    const userPrompt = `Pregunta nivel ${question.level} (${question.prizeAmount} dólares): "${question.question}".
Decisiones de los concursantes:
${playerDecisions.map(p => `- ${p.playerName}: ${p.hasWalkedAway ? 'SE RETIRÓ CON EL DINERO' : p.choice ? `Eligió opción [${p.choice}] (${p.isLockedIn ? 'ÚLTIMA PALABRA BLOQUEADA' : 'Dudando'})` : 'No marcó nada'}`).join('\n')}

Haz un comentario televisivo de suspense y mordacidad sobre estas decisiones antes de revelar la verdad.`;

    const commentary = await callMiniMax([
      { role: 'system', content: SYSTEM_PROMPT_HOST },
      { role: 'user', content: userPrompt }
    ], 0.8);

    return commentary.trim();
  } catch (err) {
    const list = MOCK_HOST_ROASTS;
    return list[Math.floor(Math.random() * list.length)];
  }
}

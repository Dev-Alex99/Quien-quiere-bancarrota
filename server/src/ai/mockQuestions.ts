import { TriviaQuestion, OptionLetter, MONEY_LADDER } from '../types.js';

export const MOCK_QUESTIONS: TriviaQuestion[] = [
  {
    id: 'q_1',
    level: 1,
    prizeAmount: MONEY_LADDER[0].amount,
    category: 'Guerra & Zoología Insólita',
    question: 'En 1932, el ejército de Australia desplegó ametralladoras pesadas en una guerra militar oficial contra una plaga de animales... y perdió estrepitosamente. ¿De qué animal se trataba?',
    options: {
      A: 'Canguros gigantes boxeadores',
      B: 'Emús salvajes',
      C: 'Koalas territoriales',
      D: 'Wombats acorazados'
    },
    correctAnswer: 'B',
    explanation: 'La famosa "Gran Guerra del Emú". Las aves esquivaban las ráfagas con tácticas de guerrilla y los soldados gastaron miles de proyectiles con resultados humillantes.',
    cunadoAdvice: '¡Esto es fija! Mi primo vivió en Sídney y me contó que los emús tienen blindaje de plumas. Votale a la B sin dudar, es la de los emús.',
    audiencePoll: { A: 12, B: 71, C: 11, D: 6 },
    fiftyFiftyOptions: ['A', 'D']
  },
  {
    id: 'q_2',
    level: 2,
    prizeAmount: MONEY_LADDER[1].amount,
    category: 'Burocracia de Ultratumba',
    question: 'En 1974, la momia del faraón egipcio Ramsés II debió ser trasladada en avión a París para un tratamiento contra hongos. Para poder ingresar a Francia legalmente, ¿qué le exigieron tramitar?',
    options: {
      A: 'Un pasaporte oficial con la profesión "Rey (fallecido)"',
      B: 'Un ataúd ignífugo con cinturón de seguridad triple',
      C: 'Un visado de turista diplomático de corta estancia',
      D: 'Un billete de primera clase con menú sin gluten'
    },
    correctAnswer: 'A',
    explanation: 'La ley francesa exigía que cualquier persona que entrase al país portara pasaporte válido, vivo o muerto. Ramsés II obtuvo su pasaporte oficial expedido por el gobierno egipcio.',
    cunadoAdvice: 'Mirá, los franceses con el papeleo son bravísimos. Es la A, le hicieron sacar el pasaporte como Rey fallecido, lo vi en History Channel un domingo a las 3 AM.',
    audiencePoll: { A: 68, B: 15, C: 12, D: 5 },
    fiftyFiftyOptions: ['B', 'D']
  },
  {
    id: 'q_3',
    level: 3,
    prizeAmount: MONEY_LADDER[2].amount,
    category: 'Derecho Matrimonial Bizarro',
    question: 'En el siglo XIX en Inglaterra, existía la infame costumbre popular de "venta de esposas" para disolver matrimonios sin pagar el divorcio. ¿Por qué precio se remató una esposa en 1832?',
    options: {
      A: 'Por 5 chelines y una pinta de cerveza',
      B: 'Por tres gallinas ponedoras y una carretilla',
      C: 'Por dos libras de tabaco picado',
      D: 'Por un reloj de bolsillo averiado'
    },
    correctAnswer: 'A',
    explanation: 'Era una práctica folclórica no oficial: el marido llevaba a la mujer con una soga al mercado de ganado y se solía cerrar el trato por unas pocas monedas y cerveza para los parroquianos.',
    cunadoAdvice: '¡Eran re borrachos en esa época! Seguro metieron cerveza en el canje. Me suena fuerte la A, metele a los chelines y la pinta.',
    audiencePoll: { A: 59, B: 21, C: 13, D: 7 },
    fiftyFiftyOptions: ['C', 'D']
  },
  {
    id: 'q_4',
    level: 4,
    prizeAmount: MONEY_LADDER[3].amount,
    category: 'Espionaje & Guerra Fría (PISO SEGURO)',
    question: 'En la década de 1960, la CIA gastó más de 20 millones de dólares en el ultrasecreto proyecto "Acoustic Kitty". ¿Cuál era su disparatado objetivo?',
    options: {
      A: 'Entrenar gatos espías implantándoles micrófonos y antenas en el cuerpo',
      B: 'Emitir maullidos ultrasónicos para saturar radares de submarinos soviéticos',
      C: 'Crear una raza de gatos hipnóticos para regalar a embajadores extranjeros',
      D: 'Desplegar felinos en paracaídas sobre silos nucleares de Moscú'
    },
    correctAnswer: 'A',
    explanation: 'Le insertaron un micrófono en el canal auditivo y una antena en la cola. En su primera prueba en la calle para espiar un banco de parque, el gato fue atropellado por un taxi.',
    cunadoAdvice: 'A la CIA le sobra la guita y se la gastan en boludeces. Le metieron micrófonos a un gato posta. Marcá la A con los ojos cerrados.',
    audiencePoll: { A: 76, B: 12, C: 8, D: 4 },
    fiftyFiftyOptions: ['B', 'D']
  },
  {
    id: 'q_5',
    level: 5,
    prizeAmount: MONEY_LADDER[4].amount,
    category: 'Catástrofes Líquidas',
    question: 'En 1814 ocurrió la famosa "Inundación de Cerveza de Londres", cuando reventó un tanque fermentador vertiendo 1.4 millones de litros. ¿Qué hicieron muchos ciudadanos ante la marea de alcohol?',
    options: {
      A: 'Salieron con jarras, cacerolas y ollas a recoger y beber cerveza en la calle',
      B: 'Exigieron que los bomberos reemplazaran el agua de las mangueras por whisky',
      C: 'Organizaron una huelga portuaria exigiendo pan para acompañar la marea',
      D: 'El Rey prohibió la malta en todo el Imperio Británico por tres años'
    },
    correctAnswer: 'A',
    explanation: 'La ola de cerveza derribó muros y causó víctimas fatales, pero cientos de personas se abalanzaron a los charcos con todo tipo de recipientes domésticos para consumir el brebaje.',
    cunadoAdvice: 'Si ves una ola de cerveza en tu cuadra, ¿vos qué hacés? Salís con la olla a chupar gratis. Es la A, de cajón.',
    audiencePoll: { A: 64, B: 14, C: 15, D: 7 },
    fiftyFiftyOptions: ['B', 'D']
  },
  {
    id: 'q_6',
    level: 6,
    prizeAmount: MONEY_LADDER[5].amount,
    category: 'Hazañas Deportivas Inexplicables',
    question: 'En 1923, en Belmont Park (Nueva York), el jinete Frank Hayes ganó una prestigiosa carrera de caballos profesional a pesar de un hecho escalofriante: ¿cuál?',
    options: {
      A: 'Sufrió un infarto fulminante en plena carrera y cruzó la meta muerto sobre el caballo',
      B: 'El caballo corrió los dos kilómetros completamente dormido por somníferos',
      C: 'Compitió con una pierna ortopédica rellena de plomo para simular peso',
      D: 'Montó al animal de espaldas porque había apostado contra sí mismo'
    },
    correctAnswer: 'A',
    explanation: 'Frank Hayes murió a mitad del recorrido pero su cuerpo se mantuvo en la silla. El caballo "Sweet Kiss" cruzó primero la meta, convirtiéndolo en el único jinete muerto en ganar una carrera oficial.',
    cunadoAdvice: '¡Esta es macabra mal! Me acuerdo de haberlo leído en una revista de misterios. El tipo se murió arriba del bicho y el caballo ganó solo. Clavale la A.',
    audiencePoll: { A: 72, B: 11, C: 10, D: 7 },
    fiftyFiftyOptions: ['C', 'D']
  },
  {
    id: 'q_7',
    level: 7,
    prizeAmount: MONEY_LADDER[6].amount,
    category: 'Filosofía & Fin de la Existencia',
    question: 'El filósofo estoico Crisipo de Solos (siglo III a.C.) murió de una manera documentada por los historiadores clásicos que hoy califica como insólita. ¿Cómo murió?',
    options: {
      A: 'De un ataque de risa incontrolable al ver a un burro borracho intentar comer higos',
      B: 'Le cayó una tortuga en la calva arrojada por un águila desde el cielo',
      C: 'Se atragantó con una aceituna mientras insultaba a un sofista rival',
      D: 'Por beber veneno de víbora para comprobar la teoría del destino'
    },
    correctAnswer: 'A',
    explanation: 'Crisipo vio al burro bebiendo vino y bromeó: "¡Ahora dale higos para que baje el vino!", y el ataque de risa que le provocó su propio chiste le causó asfixia mortal.',
    cunadoAdvice: 'Ojo acá, lo de la tortuga le pasó a Esquilo el dramaturgo, no al filósofo. Este se tentó con el burro mamado. Es la A, no pises el palito.',
    audiencePoll: { A: 58, B: 29, C: 8, D: 5 },
    fiftyFiftyOptions: ['C', 'D']
  },
  {
    id: 'q_8',
    level: 8,
    prizeAmount: MONEY_LADDER[7].amount,
    category: 'Olimpismo Picaresco (PISO SEGURO)',
    question: 'En los Juegos Olímpicos de 1904 en San Luis, el maratonista Fred Lorz fue recibido en la meta como campeón olímpico y ovacionado por la hija del presidente, hasta que confesó su fraude. ¿Qué hizo?',
    options: {
      A: 'Recorrió 17 kilómetros del trayecto a bordo del automóvil de su entrenador',
      B: 'Contrató a un hermano gemelo para que corriera la mitad difícil del circuito',
      C: 'Ató su bicicleta a la carreta del aguatero municipal con una cuerda invisible',
      D: 'Tomó un atajo en tranvía pagando con una moneda de níquel falso'
    },
    correctAnswer: 'A',
    explanation: 'Le dieron calambres en el kilómetro 14, se subió al coche de su manager a descansar y saludó al público por la ventanilla. Cuando el auto se descompuso, volvió a trotar hasta la meta como si nada.',
    cunadoAdvice: '¡Los maratones de antes eran tierra de nadie! Este tipo se tomó un auto y después se bajó a festejar. Clavá la A y asegurate los 500 mil palos.',
    audiencePoll: { A: 67, B: 18, C: 9, D: 6 },
    fiftyFiftyOptions: ['B', 'D']
  },
  {
    id: 'q_9',
    level: 9,
    prizeAmount: MONEY_LADDER[8].amount,
    category: 'Ingeniería Aeroespacial & Chapuzas',
    question: 'En 1999, la sonda espacial Mars Climate Orbiter de la NASA se desintegró al entrar en la atmósfera marciana perdiendo 125 millones de dólares. ¿Cuál fue el motivo de la falla?',
    options: {
      A: 'Un equipo calculó en libras y pulgadas (sistema imperial) y el otro en newtons y metros',
      B: 'Un cable de alimentación fue roído por ratones en la base de lanzamiento de Cabo Cañaveral',
      C: 'Un programador usó una coma en lugar de un punto en una línea de código FORTRAN',
      D: 'La lente del sensor solar venía con la tapa plástica de fábrica puesta'
    },
    correctAnswer: 'A',
    explanation: 'Lockheed Martin usó libras-fuerza y el Laboratorio de Propulsión de la NASA asumió que eran Newtons métricos. La nave se acercó demasiado bajo a Marte y se quemó.',
    cunadoAdvice: '¡Los yankees con las pulgadas y las libras hacen cualquier desastre! No se pusieron de acuerdo con los centímetros. Metele a la A de una.',
    audiencePoll: { A: 81, B: 9, C: 6, D: 4 },
    fiftyFiftyOptions: ['B', 'D']
  },
  {
    id: 'q_10',
    level: 10,
    prizeAmount: MONEY_LADDER[9].amount,
    category: 'El Fin del Mundo Evitado (EL MILLÓN)',
    question: 'En 1983, el teniente soviético Stanislav Petrov evitó la Tercera Guerra Mundial cuando las computadoras alertaron de 5 misiles nucleares de EE.UU. en vuelo. ¿Por qué decidió catalogarlo como falsa alarma?',
    options: {
      A: 'Razonó que un ataque nuclear real no empezaría con solo 5 misiles sino con cientos',
      B: 'El teléfono rojo con el Kremlin tenía la línea cortada por falta de pago',
      C: 'El botón de lanzamiento de los misiles soviéticos estaba trabado con óxido',
      D: 'El radar se descalibró por una bandada masiva de gansos siberianos'
    },
    correctAnswer: 'A',
    explanation: 'Petrov sabía que un ataque preventivo de EE.UU. sería masivo para aniquilar la capacidad soviética, no con 5 misiles. Resultó ser el reflejo del sol en las nubes altas sobre Dakota del Norte.',
    cunadoAdvice: 'Hermano, estás en la pregunta del millón. Petrov pensó con la cabeza: si te van a borrar del mapa, no te tiran 5 petardos, te tiran 500. Es la A. ¡Vamos por el millón carajo!',
    audiencePoll: { A: 78, B: 11, C: 7, D: 4 },
    fiftyFiftyOptions: ['B', 'C']
  }
];

export const MOCK_HOST_ROASTS = [
  'Veo que alguien confirmó con la velocidad de quien no tiene nada que perder... o nada en la cabeza.',
  'La tensión se corta con un tramontina oxidado. Dos jugadores eligieron caminos completamente opuestos.',
  'Uno de ustedes acaba de firmar su sentencia de quiebra financiera. Qué espectáculo tan bello.',
  'El silencio en el estudio es sepulcral. El que dudó hasta el segundo 1 acaba de tener un microinfarto.',
  'Admiro la audacia de tirarse a la pileta sin saber si hay agua o ácido muriático.'
];

export const CELO_SEPOLIA = {
  chainId: '0xaa044c', // 11142220
  chainName: 'Celo Sepolia',
  rpcUrls: ['https://forno.celo-sepolia.celo-testnet.org'],
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  blockExplorerUrls: ['https://celo-sepolia.blockscout.com'],
}

export const LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'First words & sounds', xpMultiplier: 1 },
  { id: 'intermediate', label: 'Intermediate', description: 'Convo confidence', xpMultiplier: 1.25 },
  { id: 'advanced', label: 'Advanced', description: 'Fluent flex & nuance', xpMultiplier: 1.5 },
]

export const LANGUAGES = [
  { id: 'spanish', label: 'Español', title: 'Spanish', vibe: 'Daily sun vibes' },
  { id: 'kiswahili', label: 'Kiswahili', title: 'Kiswahili', vibe: 'East African flow' },
  { id: 'french', label: 'Français', title: 'French', vibe: 'Parisian flair' },
  { id: 'german', label: 'Deutsch', title: 'German', vibe: 'Precision mode' },
]

export const LANGUAGE_LOCALES = {
  spanish: 'es-ES',
  kiswahili: 'sw-KE',
  french: 'fr-FR',
  german: 'de-DE',
}

const buildQuestions = (items) =>
  items.map((entry, index) => ({
    ...entry,
    id: entry.id ?? `q-${index}`,
    voice: entry.voice ?? entry.prompt,
  }))

const remixQuestions = (source, suffix, count = source.length) =>
  source.slice(0, count).map((entry, index) => ({
    ...entry,
    id: `${entry.id ?? `q-${index}`}-${suffix}-${index}`,
  }))

const spanishBeginner = buildQuestions([
  {
    prompt: 'How do you say "Good morning" in Spanish?',
    options: ['Buenas noches', 'Buenos días', 'Hola', 'Adiós'],
    answer: 'Buenos días',
    tip: 'Buenos = good, días = days.',
    voice: 'Buenos días',
  },
  {
    prompt: 'Translate: "My name is Ana."',
    options: ['Me llamo Ana', 'Yo gusto Ana', 'Tengo Ana', 'Soy Ana nombre'],
    answer: 'Me llamo Ana',
    tip: '"Me llamo" literally means "I call myself."',
    voice: 'Me llamo Ana',
  },
  {
    prompt: 'Pick the word for "friend".',
    options: ['Comida', 'Amigo', 'Casa', 'Agua'],
    answer: 'Amigo',
    tip: 'Amigo/amiga = friend.',
  },
  {
    prompt: 'Translate "Thank you."',
    options: ['Por favor', 'Gracias', 'Salud', 'Perdón'],
    answer: 'Gracias',
    tip: 'Easy gratitude win.',
  },
  {
    prompt: 'Select the word for "please".',
    options: ['Hasta luego', 'Por favor', 'Buenos días', 'Noche'],
    answer: 'Por favor',
    tip: 'Use it to keep the vibes kind.',
  },
  {
    prompt: 'How do you ask "Where is the bathroom?"',
    options: ['¿Dónde está el baño?', '¿Qué hora es?', '¿Dónde vives?', '¿Dónde está la playa?'],
    answer: '¿Dónde está el baño?',
    tip: 'Essential traveler phrase.',
  },
  {
    prompt: 'What does "Buenas noches" mean?',
    options: ['Good afternoon', 'Good night', 'Hello again', 'See you later'],
    answer: 'Good night',
    tip: 'Used after sunset.',
  },
  {
    prompt: 'Pick the word for "water".',
    options: ['Fuego', 'Agua', 'Pan', 'Libro'],
    answer: 'Agua',
    tip: 'Order it everywhere.',
  },
  {
    prompt: 'Translate: "See you later."',
    options: ['Hasta luego', 'Nos vemos hoy', 'Adiós ahora', 'Nos vamos tarde'],
    answer: 'Hasta luego',
    tip: 'Common casual farewell.',
  },
  {
    prompt: 'What color is "rojo"?',
    options: ['Blue', 'Green', 'Red', 'Yellow'],
    answer: 'Red',
    tip: 'Think of red roses.',
  },
])

const spanishIntermediate = buildQuestions([
  {
    prompt: 'Translate: "I am learning Spanish."',
    options: ['Soy aprender español', 'Estoy aprendiendo español', 'Estoy aprende español', 'Aprendo soy español'],
    answer: 'Estoy aprendiendo español',
    tip: 'Use gerund "aprendiendo" to show action.',
  },
  {
    prompt: 'Pick the verb for "to travel".',
    options: ['Correr', 'Viajar', 'Comer', 'Llorar'],
    answer: 'Viajar',
    tip: 'Viaje = trip.',
  },
  {
    prompt: 'Translate: "We are going to the market."',
    options: ['Vamos al mercado', 'Vamos a mercado', 'Vamos el mercado', 'Fuimos al mercado'],
    answer: 'Vamos al mercado',
    tip: 'Al = a + el.',
  },
  {
    prompt: 'Choose the phrase for "Do you need help?"',
    options: ['¿Quieres ayuda?', '¿Necesitas ayuda?', '¿Ayuda necesitas?', '¿Tú ayudas?'],
    answer: '¿Necesitas ayuda?',
    tip: 'Use present tense question form.',
  },
  {
    prompt: 'Select the correct article for "mesa".',
    options: ['El mesa', 'La mesa', 'Los mesa', 'Un mesa'],
    answer: 'La mesa',
    tip: 'Mesa is feminine.',
  },
  {
    prompt: 'Translate: "They live near the beach."',
    options: [
      'Viven cerca de la playa',
      'Viven cerca la playa',
      'Viven en cerca playa',
      'Viven al playa',
    ],
    answer: 'Viven cerca de la playa',
    tip: 'Use "de la" for location detail.',
  },
  {
    prompt: 'Pick the sentence for "I prefer to pay with cash."',
    options: [
      'Prefiero pagar en efectivo',
      'Prefiero pagar tarjeta',
      'Prefiero efectivo pagar',
      'Prefiero pagar con banco',
    ],
    answer: 'Prefiero pagar en efectivo',
    tip: '"En efectivo" = with cash.',
  },
  {
    prompt: 'Choose the adverb for "quickly".',
    options: ['Rápido', 'Rápidamente', 'Rápidas', 'Rapidito'],
    answer: 'Rápidamente',
    tip: 'Adverbs often end in -mente.',
  },
  {
    prompt: 'Complete the phrase: "Nos vemos ___."',
    options: ['ayer', 'mañana', 'ayeres', 'noche'],
    answer: 'mañana',
    tip: '"See you tomorrow."',
  },
  {
    prompt: 'Translate: "I am ready."',
    options: ['Estoy lista/listo', 'Soy listo', 'Estoy preparado', 'Soy preparado'],
    answer: 'Estoy lista/listo',
    tip: 'Use estar + adjective for state.',
  },
])

const spanishSenior = buildQuestions([
  {
    prompt: 'Translate: "If I had time, I would travel to Bogotá."',
    options: [
      'Si tuviera tiempo, viajaría a Bogotá',
      'Si tengo tiempo, viajo a Bogotá',
      'Si tenía tiempo, viajé a Bogotá',
      'Si tendría tiempo, viajaré a Bogotá',
    ],
    answer: 'Si tuviera tiempo, viajaría a Bogotá',
    tip: 'Use imperfect subjunctive + conditional.',
  },
  {
    prompt: 'Complete: "Es importante que tú ___ temprano."',
    options: ['llegas', 'llegues', 'llegaras', 'llegarás'],
    answer: 'llegues',
    tip: 'Triggering subjunctive.',
  },
  {
    prompt: 'Pick the correct passive voice: "The tickets were sold."',
    options: [
      'Los boletos fueron vendidos',
      'Los boletos estaban vendido',
      'Los boletos eran vendieron',
      'Los boletos son vendidos',
    ],
    answer: 'Los boletos fueron vendidos',
    tip: 'Preterite passive.',
  },
  {
    prompt: 'Choose the best translation: "She has been working here for two years."',
    options: [
      'Ella lleva dos años trabajando aquí',
      'Ella es trabajando por dos años',
      'Ella ha trabajar dos años aquí',
      'Ella tiene dos años trabajo aquí',
    ],
    answer: 'Ella lleva dos años trabajando aquí',
    tip: 'Use llevar + gerund.',
  },
  {
    prompt: 'Select the expression for "no matter what happens".',
    options: ['Pase lo que pase', 'Haga que haga', 'Suceda que sucede', 'Sea que sea'],
    answer: 'Pase lo que pase',
    tip: 'Classic subjunctive phrase.',
  },
  {
    prompt: 'Translate: "Had I known, I would have called you."',
    options: [
      'De haberlo sabido, te habría llamado',
      'Si lo supe, te llamé',
      'Si lo sabía, te llamaría',
      'De saberlo, te llamo',
    ],
    answer: 'De haberlo sabido, te habría llamado',
    tip: 'Perfect conditional combo.',
  },
  {
    prompt: 'Pick the best equivalent for "even though it seems easy".',
    options: [
      'Aunque parezca fácil',
      'Aunque parece fácil',
      'Aunque parecería fácil',
      'Aunque pareciera fácil',
    ],
    answer: 'Aunque parezca fácil',
    tip: 'Subjunctive after aunque + unknown outcome.',
  },
  {
    prompt: 'Translate: "They would have finished earlier if you had helped."',
    options: [
      'Habrían terminado antes si hubieras ayudado',
      'Terminarían antes si ayudaste',
      'Han terminado antes si ayudaras',
      'Hubieran terminado antes si ayudabas',
    ],
    answer: 'Habrían terminado antes si hubieras ayudado',
  },
  {
    prompt: 'Pick the accurate meaning of "aprovechar".',
    options: ['To take advantage of', 'To apologize', 'To delay', 'To confuse'],
    answer: 'To take advantage of',
    tip: 'Use it for seizing opportunities.',
  },
  {
    prompt: 'Select the translation: "They speak as if they had already decided."',
    options: [
      'Hablan como si ya hubieran decidido',
      'Hablan como si ya deciden',
      'Hablan como ya decidieron',
      'Hablan como si ya decidirían',
    ],
    answer: 'Hablan como si ya hubieran decidido',
  },
])

const kiswahiliBeginner = buildQuestions([
  {
    prompt: 'How do you greet someone politely?',
    options: ['Karibu', 'Habari', 'Tafadhali', 'Ndiyo'],
    answer: 'Habari',
    tip: '"Habari?" means "How are you?"',
  },
  {
    prompt: 'Select the word for “please”.',
    options: ['Tafadhali', 'Asante', 'Samahani', 'Ndiyo'],
    answer: 'Tafadhali',
    tip: 'Asante = thanks, Tafadhali = please.',
  },
  {
    prompt: '“Karibu” translates to…',
    options: ['Welcome', 'Friend', 'Goodbye', 'Food'],
    answer: 'Welcome',
    tip: 'Used when hosting or serving.',
  },
  {
    prompt: 'Pick the word for “thank you”.',
    options: ['Samahani', 'Asante', 'Hapana', 'Basi'],
    answer: 'Asante',
    tip: 'Common gratitude word.',
  },
  {
    prompt: 'Translate: "Yes".',
    options: ['Ndiyo', 'Hapana', 'Sawa', 'Njoo'],
    answer: 'Ndiyo',
    tip: 'Opposite of hapana.',
  },
  {
    prompt: 'How do you say "friend"?',
    options: ['Rafiki', 'Chakula', 'Gari', 'Nchi'],
    answer: 'Rafiki',
    tip: 'Think Lion King.',
  },
  {
    prompt: 'Choose the word for "water".',
    options: ['Maji', 'Moto', 'Chakula', 'Ndizi'],
    answer: 'Maji',
    tip: 'Maji ya kunywa = drinking water.',
  },
  {
    prompt: 'Translate: "See you later."',
    options: ['Tutaonana baadaye', 'Tuonane sasa', 'Kwisha kuona', 'Hatuoni tena'],
    answer: 'Tutaonana baadaye',
  },
  {
    prompt: 'Pick the expression for "excuse me".',
    options: ['Tafadhali', 'Samahani', 'Safari', 'Pole'],
    answer: 'Samahani',
    tip: 'Use to get attention.',
  },
  {
    prompt: 'What does "pole" convey?',
    options: ['Congratulations', 'Sorry', 'Welcome', 'Let’s go'],
    answer: 'Sorry',
    tip: 'Comfort expression.',
  },
])

const kiswahiliIntermediate = buildQuestions([
  {
    prompt: 'Translate: "Ninasoma Kiswahili."',
    options: ['I am studying Kiswahili', 'I read in Kiswahili', 'I spoke Kiswahili', 'I will study Kiswahili'],
    answer: 'I am studying Kiswahili',
  },
  {
    prompt: 'Pick the word for "to travel".',
    options: ['Kusafiri', 'Kukimbia', 'Kucheza', 'Kukata'],
    answer: 'Kusafiri',
  },
  {
    prompt: 'Choose the phrase: "We need help."',
    options: ['Tunasaidia', 'Tunahitaji msaada', 'Tunataka kusaidia', 'Tunasaidika'],
    answer: 'Tunahitaji msaada',
  },
  {
    prompt: 'Translate: "They live near the city."',
    options: [
      'Wanaishi karibu na jiji',
      'Wanaishi mbali na jiji',
      'Waliishi karibu jiji',
      'Wanaishi katika jiji',
    ],
    answer: 'Wanaishi karibu na jiji',
  },
  {
    prompt: 'Pick the word for "healthy/peace".',
    options: ['Salama', 'Mchanga', 'Haraka', 'Mtamu'],
    answer: 'Salama',
  },
  {
    prompt: 'Translate: "Do you understand?"',
    options: ['Unaelewa?', 'Unaelekea?', 'Unaendesha?', 'Unaenda?'],
    answer: 'Unaelewa?',
  },
  {
    prompt: 'Complete: "Asante kwa ___."',
    options: ['kusikia', 'kusaidia', 'kuenda', 'kutazama'],
    answer: 'kusaidia',
    tip: 'Thanks for helping.',
  },
  {
    prompt: 'Pick the correct word for "road".',
    options: ['Barabara', 'Mlima', 'Bahari', 'Meza'],
    answer: 'Barabara',
  },
  {
    prompt: 'Translate: "Let us meet tomorrow."',
    options: ['Tuonane kesho', 'Tutazamana kesho', 'Tuonane leo', 'Tuonana jana'],
    answer: 'Tuonane kesho',
  },
  {
    prompt: 'What does "Furahiya chakula" mean?',
    options: ['Save the food', 'Enjoy the meal', 'Cook the food', 'Buy the meal'],
    answer: 'Enjoy the meal',
  },
])

const kiswahiliSenior = buildQuestions([
  {
    prompt: 'Translate: "Hata kama mvua itanyesha, tutasafiri."',
    options: [
      'Even if it rains, we will travel',
      'If it rained, we traveled',
      'Unless it rains, we travel',
      'Because it rains, we travel',
    ],
    answer: 'Even if it rains, we will travel',
  },
  {
    prompt: 'Pick the best equivalent for "kuboresha".',
    options: ['To improve', 'To erase', 'To remember', 'To shout'],
    answer: 'To improve',
  },
  {
    prompt: 'Choose the phrase: "They would have arrived earlier."',
    options: [
      'Wangekuwa wamefika mapema',
      'Wamefika mapema',
      'Walifika mapema',
      'Watakuwa wanafika mapema',
    ],
    answer: 'Wangekuwa wamefika mapema',
  },
  {
    prompt: 'Translate: "Ningejua habari, ningejiandaa vizuri."',
    options: [
      'If I knew the news, I would prepare well',
      'I knew the news so I prepare well',
      'I will know the news and prepare well',
      'Knowing the news prepares me well',
    ],
    answer: 'If I knew the news, I would prepare well',
  },
  {
    prompt: 'Pick the term closest to "ushirikiano".',
    options: ['Cooperation', 'Delay', 'Danger', 'Silence'],
    answer: 'Cooperation',
  },
  {
    prompt: 'Translate: "Wanajifanya hawajui."',
    options: [
      'They pretend they do not know',
      'They promise they will know',
      'They refuse to learn',
      'They hope to know',
    ],
    answer: 'They pretend they do not know',
  },
  {
    prompt: 'Choose the best continuation: "Iwapo ungeleta mawazo mapya..."',
    options: [
      'tungebuni suluhisho',
      'tunabuni suluhisho',
      'tutabuni suluhisho',
      'tulibuni suluhisho',
    ],
    answer: 'tungebuni suluhisho',
  },
  {
    prompt: 'Pick the meaning of "kwa kifupi".',
    options: ['In short', 'In detail', 'In time', 'In fear'],
    answer: 'In short',
  },
  {
    prompt: 'Translate: "Wacha tujadili baada ya kikao."',
    options: [
      'Let us discuss after the meeting',
      'We discuss before the meeting',
      'We discussed during the meeting',
      'We will not discuss after the meeting',
    ],
    answer: 'Let us discuss after the meeting',
  },
  {
    prompt: 'Pick the advanced verb meaning "to empower".',
    options: ['Kuwezesha', 'Kutengeneza', 'Kuchunguza', 'Kuficha'],
    answer: 'Kuwezesha',
  },
])

const frenchBeginner = buildQuestions([
  {
    prompt: 'How do you say "Hello" in French?',
    options: ['Bonjour', 'Bonsoir', 'Salut', 'Merci'],
    answer: 'Bonjour',
    tip: 'Standard daytime greeting.',
  },
  {
    prompt: 'Translate: "Thank you".',
    options: ['Merci', 'Pardon', 'S’il vous plaît', 'Excusez-moi'],
    answer: 'Merci',
  },
  {
    prompt: 'Pick the phrase for "Good evening".',
    options: ['Bonne soirée', 'Bon après-midi', 'Bon midi', 'Bon voyage'],
    answer: 'Bonne soirée',
  },
  {
    prompt: 'Select the word for "Yes".',
    options: ['Non', 'Peut-être', 'Oui', 'Jamais'],
    answer: 'Oui',
  },
  {
    prompt: 'Translate: "See you tomorrow."',
    options: ['À demain', 'À bientôt', 'À ce soir', 'À plus tard'],
    answer: 'À demain',
  },
  {
    prompt: 'Choose the word for "bread".',
    options: ['Fromage', 'Pain', 'Soupe', 'Lait'],
    answer: 'Pain',
  },
  {
    prompt: 'Pick the phrase for "My name is Léa."',
    options: ['Je t’appelle Léa', 'Je suis Léa', 'Je m’appelle Léa', 'Je parle Léa'],
    answer: 'Je m’appelle Léa',
  },
  {
    prompt: 'Translate: "Where is the metro?"',
    options: [
      'Où est le métro ?',
      'Comment est le métro ?',
      'Quand est le métro ?',
      'Qui est le métro ?',
    ],
    answer: 'Où est le métro ?',
  },
  {
    prompt: 'Pick the correct article for "école".',
    options: ['Le école', 'La école', "L'école", 'Un école'],
    answer: "L'école",
  },
  {
    prompt: 'What does "eau" mean?',
    options: ['Air', 'Water', 'Fire', 'Salt'],
    answer: 'Water',
  },
])

const frenchIntermediate = buildQuestions([
  {
    prompt: 'Translate: "I would like a coffee, please."',
    options: [
      'Je voudrais un café, s’il vous plaît',
      'Je prendra un café, s’il vous plaît',
      'Je veux café, merci',
      'Je aimerais café',
    ],
    answer: 'Je voudrais un café, s’il vous plaît',
  },
  {
    prompt: 'Choose the verb for "to improve".',
    options: ['Améliorer', 'Arriver', 'Ajouter', 'Arrêter'],
    answer: 'Améliorer',
  },
  {
    prompt: 'Translate: "We are looking for the museum."',
    options: [
      'Nous cherchons le musée',
      'Nous cherchons au musée',
      'Nous cherche le musée',
      'Nous cherchons un musée?',
    ],
    answer: 'Nous cherchons le musée',
  },
  {
    prompt: 'Pick the sentence meaning "Do you have any questions?"',
    options: [
      'Avez-vous des questions ?',
      'Vous avez question ?',
      'Est-ce que tu as question ?',
      'Vous avez des question ?',
    ],
    answer: 'Avez-vous des questions ?',
  },
  {
    prompt: 'Select the phrase: "I have been living here for two years."',
    options: [
      'Je vis ici depuis deux ans',
      'Je vis ici pour deux ans',
      'Je vivrai ici deux ans',
      "Je vis ici il y a deux ans",
    ],
    answer: 'Je vis ici depuis deux ans',
  },
  {
    prompt: 'Translate: "She is getting ready."',
    options: [
      'Elle se prépare',
      'Elle prépare',
      'Elle est prêt',
      'Elle se préparer',
    ],
    answer: 'Elle se prépare',
  },
  {
    prompt: 'Pick the best equivalent of "soutenir".',
    options: ['To support', 'To whisper', 'To drive', 'To suspect'],
    answer: 'To support',
  },
  {
    prompt: 'Complete the idiom: "Il pleut ___."',
    options: ['des chats et des chiens', 'des cordes', 'beaucoup', 'sans arrêt'],
    answer: 'des cordes',
    tip: 'French idiom for heavy rain.',
  },
  {
    prompt: 'Choose the polite request: "Could you repeat?"',
    options: [
      'Pourriez-vous répéter ?',
      'Pouvez répéter ?',
      'Répètes-tu ?',
      'Tu peux répéter ?',
    ],
    answer: 'Pourriez-vous répéter ?',
  },
  {
    prompt: 'Translate: "We will meet at the station."',
    options: [
      'Nous nous retrouverons à la gare',
      'Nous rencontrons la gare',
      'On se retrouve de la gare',
      'Nous nous sommes retrouvés à la gare',
    ],
    answer: 'Nous nous retrouverons à la gare',
  },
])

const frenchSenior = buildQuestions([
  {
    prompt: 'Translate: "If I had known, I would have told you."',
    options: [
      'Si j’avais su, je te l’aurais dit',
      'Si je savais, je te disais',
      'Si je sais, je te dirai',
      'Si j’aurais su, je t’aurai dit',
    ],
    answer: 'Si j’avais su, je te l’aurais dit',
  },
  {
    prompt: 'Pick the correct subjunctive: "Il faut que tu ___."',
    options: ['fasses', 'fais', 'fera', 'ferais'],
    answer: 'fasses',
  },
  {
    prompt: 'Select the translation: "They are used to working at night."',
    options: [
      'Ils ont l’habitude de travailler la nuit',
      'Ils habitent travailler la nuit',
      'Ils se travaillent la nuit',
      'Ils avaient l’habitude de travailler la nuit',
    ],
    answer: 'Ils ont l’habitude de travailler la nuit',
  },
  {
    prompt: 'Choose the phrase meaning "no matter what happens".',
    options: ['Quoi qu’il arrive', 'Quand il arrive', 'Qui arrive', 'Parce qu’il arrive'],
    answer: 'Quoi qu’il arrive',
  },
  {
    prompt: 'Translate: "She speaks as if nothing happened."',
    options: [
      'Elle parle comme si rien ne s’était passé',
      'Elle parle comme rien est arrivé',
      'Elle a parlé comme rien ne se passe',
      'Elle parlera comme si rien n’est arrivé',
    ],
    answer: 'Elle parle comme si rien ne s’était passé',
  },
  {
    prompt: 'Pick the best equivalent of "aboutir".',
    options: ['To succeed/lead to', 'To destroy', 'To confuse', 'To delay'],
    answer: 'To succeed/lead to',
  },
  {
    prompt: 'Translate: "Even if it seems difficult, we must try."',
    options: [
      'Même si cela paraît difficile, nous devons essayer',
      'Même si cela paraît difficile, nous essayons',
      'Comme cela semble difficile, nous essayons',
      'Quand cela semble difficile, nous essayerons',
    ],
    answer: 'Même si cela paraît difficile, nous devons essayer',
  },
  {
    prompt: 'Choose the expression for "as soon as you arrive".',
    options: [
      'Dès que tu arrives',
      'Après que tu arrives',
      'Tandis que tu arrives',
      'Lorsque tu arriverais',
    ],
    answer: 'Dès que tu arrives',
  },
  {
    prompt: 'Translate: "They would have finished earlier without that delay."',
    options: [
      'Ils auraient terminé plus tôt sans ce retard',
      'Ils terminaient plus tôt sans ce retard',
      'Ils termineront plus tôt sans ce retard',
      'Ils avaient terminé plus tôt sans ce retard',
    ],
    answer: 'Ils auraient terminé plus tôt sans ce retard',
  },
  {
    prompt: 'Pick the nuance for "mettre en valeur".',
    options: ['To highlight', 'To store', 'To erase', 'To slow down'],
    answer: 'To highlight',
  },
])

const germanBeginner = buildQuestions([
  {
    prompt: 'How do you say "Good morning" in German?',
    options: ['Guten Morgen', 'Guten Abend', 'Hallo', 'Tschüss'],
    answer: 'Guten Morgen',
  },
  {
    prompt: 'Translate: "My name is Lea."',
    options: ['Ich heiße Lea', 'Ich bin Lea Name', 'Mein Name Lea', 'Ich Lea'],
    answer: 'Ich heiße Lea',
  },
  {
    prompt: 'Pick the word for "please / you are welcome".',
    options: ['Bitte', 'Danke', 'Hallo', 'Ja'],
    answer: 'Bitte',
  },
  {
    prompt: 'Select the word for "thank you".',
    options: ['Hallo', 'Danke', 'Bitte', 'Nein'],
    answer: 'Danke',
  },
  {
    prompt: 'Translate: "See you soon."',
    options: ['Bis bald', 'Bis nie', 'Bis danke', 'Bis Weg'],
    answer: 'Bis bald',
  },
  {
    prompt: 'Choose the word for "friend".',
    options: ['Freund', 'Brot', 'Haus', 'Katze'],
    answer: 'Freund',
  },
  {
    prompt: 'Pick the correct article for "Auto" (car).',
    options: ['Der Auto', 'Das Auto', 'Die Auto', 'Ein Auto'],
    answer: 'Das Auto',
  },
  {
    prompt: 'Translate: "Where is the train station?"',
    options: [
      'Wo ist der Bahnhof?',
      'Wer ist der Bahnhof?',
      'Wann ist der Bahnhof?',
      'Wo Bahn ist der Hof?',
    ],
    answer: 'Wo ist der Bahnhof?',
  },
  {
    prompt: 'Select the word for "water".',
    options: ['Milch', 'Kaffee', 'Wasser', 'Saft'],
    answer: 'Wasser',
  },
  {
    prompt: 'What does "tschüss" mean?',
    options: ['Hello', 'Goodbye', 'Please', 'Thanks'],
    answer: 'Goodbye',
  },
])

const germanIntermediate = buildQuestions([
  {
    prompt: 'Translate: "We are looking for the restaurant."',
    options: [
      'Wir suchen das Restaurant',
      'Wir suchen für Restaurant',
      'Wir gesucht das Restaurant',
      'Wir suchen Restaurant?',
    ],
    answer: 'Wir suchen das Restaurant',
  },
  {
    prompt: 'Pick the correct phrase: "Could you help me?"',
    options: [
      'Könnten Sie mir helfen?',
      'Kannst du mir hilfen?',
      'Könntest mir helfen?',
      'Helfen Sie mich?',
    ],
    answer: 'Könnten Sie mir helfen?',
  },
  {
    prompt: 'Translate: "I have lived here for three years."',
    options: [
      'Ich wohne seit drei Jahren hier',
      'Ich habe für drei Jahre hier gewohnt',
      'Ich wohne drei Jahre hier',
      'Ich wohnte seit drei Jahre hier',
    ],
    answer: 'Ich wohne seit drei Jahren hier',
  },
  {
    prompt: 'Choose the verb for "to improve".',
    options: ['Verbessern', 'Verschieben', 'Verlassen', 'Verkaufen'],
    answer: 'Verbessern',
  },
  {
    prompt: 'Pick the translation: "They need more time."',
    options: [
      'Sie brauchen mehr Zeit',
      'Sie brauchen viel Zeit mehr',
      'Sie brauchen Zeit mehr',
      'Sie brauchen mehr mal Zeit',
    ],
    answer: 'Sie brauchen mehr Zeit',
  },
  {
    prompt: 'Complete: "Ich freue mich ___ dich."',
    options: ['auf', 'in', 'unter', 'ohne'],
    answer: 'auf',
  },
  {
    prompt: 'Translate: "The meeting was postponed."',
    options: [
      'Das Treffen wurde verschoben',
      'Das Treffen war verspätet',
      'Treffen hat verschieben',
      'Das Treffen ist verschob',
    ],
    answer: 'Das Treffen wurde verschoben',
  },
  {
    prompt: 'Pick the correct word for "challenge".',
    options: ['Herausforderung', 'Entscheidung', 'Erinnerung', 'Bewerbung'],
    answer: 'Herausforderung',
  },
  {
    prompt: 'Translate: "Let us meet tomorrow evening."',
    options: [
      'Lass uns morgen Abend treffen',
      'Lasst uns morgen Abend trefft',
      'Lass uns morgen Abend getroffen',
      'Lass uns morgen Abend trifft',
    ],
    answer: 'Lass uns morgen Abend treffen',
  },
  {
    prompt: 'Pick the phrase meaning "I am on the way."',
    options: [
      'Ich bin unterwegs',
      'Ich bin unterweg',
      'Ich bin Weg',
      'Ich bin unterwegs sein',
    ],
    answer: 'Ich bin unterwegs',
  },
])

const germanSenior = buildQuestions([
  {
    prompt: 'Translate: "If I had known, I would have answered differently."',
    options: [
      'Wenn ich es gewusst hätte, hätte ich anders geantwortet',
      'Wenn ich weiß, antworte ich anders',
      'Wenn ich wusste, antworte anders',
      'Hätte ich gewusst, ich antworte anders',
    ],
    answer: 'Wenn ich es gewusst hätte, hätte ich anders geantwortet',
  },
  {
    prompt: 'Pick the Konjunktiv II: "Es wäre besser, wenn du ___."',
    options: ['kämmest', 'kommst', 'gekommen bist', 'gekommen würdest'],
    answer: 'kämmest',
    tip: 'Old-school but clear subjunctive.',
  },
  {
    prompt: 'Translate: "They act as if nothing had happened."',
    options: [
      'Sie tun so, als wäre nichts passiert',
      'Sie tun so, als passiert nichts',
      'Sie taten so, als wäre nichts passiert',
      'Sie tun, als nichts passierte',
    ],
    answer: 'Sie tun so, als wäre nichts passiert',
  },
  {
    prompt: 'Choose the best rendering of "regardless of the result".',
    options: [
      'Unabhängig vom Ergebnis',
      'Je nach Ergebnis',
      'Mit dem Ergebnis',
      'Trotz Ergebnis',
    ],
    answer: 'Unabhängig vom Ergebnis',
  },
  {
    prompt: 'Translate: "Hätten wir mehr Zeit gehabt, hätten wir das Projekt erweitert."',
    options: [
      'If we had had more time, we would have expanded the project',
      'When we had more time, we expanded the project',
      'We have more time to expand the project',
      'We would have more time if the project expanded',
    ],
    answer: 'If we had had more time, we would have expanded the project',
  },
  {
    prompt: 'Pick the term closest to "nachhaltig".',
    options: ['Sustainable', 'Temporary', 'Expensive', 'Fragile'],
    answer: 'Sustainable',
  },
  {
    prompt: 'Translate: "Sie hätten teilnehmen können, wenn sie früher informiert worden wären."',
    options: [
      'They could have participated if they had been informed earlier',
      'They can participate if informed earlier',
      'They would participate when informed',
      'They participate because informed earlier',
    ],
    answer: 'They could have participated if they had been informed earlier',
  },
  {
    prompt: 'Choose the idiom meaning "face the music".',
    options: [
      'Sich der Wahrheit stellen',
      'Musik hören',
      'Die Richtung wechseln',
      'Die Laune verderben',
    ],
    answer: 'Sich der Wahrheit stellen',
  },
  {
    prompt: 'Pick the best equivalent of "ermöglichen".',
    options: ['To make possible', 'To forbid', 'To confuse', 'To replace'],
    answer: 'To make possible',
  },
  {
    prompt: 'Translate: "Wir bleiben dran, auch wenn es schwierig wirkt."',
    options: [
      'We keep at it even if it seems difficult',
      'We leave when it seems difficult',
      'We kept at it until it seemed difficult',
      'We will leave it when difficult',
    ],
    answer: 'We keep at it even if it seems difficult',
  },
])

const spanishBeginnerMini = remixQuestions(spanishBeginner, 'mini', 6)
const spanishBeginnerDeck = remixQuestions(spanishBeginner, 'deck', 9)
const spanishIntermediateMini = remixQuestions(spanishIntermediate, 'mini', 6)
const spanishIntermediateDeck = remixQuestions(spanishIntermediate, 'deck', 9)
const spanishAdvancedMini = remixQuestions(spanishSenior, 'mini', 6)
const spanishAdvancedDeck = remixQuestions(spanishSenior, 'deck', 9)

const kiswahiliBeginnerMini = remixQuestions(kiswahiliBeginner, 'mini', 6)
const kiswahiliBeginnerDeck = remixQuestions(kiswahiliBeginner, 'deck', 9)
const kiswahiliIntermediateMini = remixQuestions(kiswahiliIntermediate, 'mini', 6)
const kiswahiliIntermediateDeck = remixQuestions(kiswahiliIntermediate, 'deck', 9)
const kiswahiliAdvancedMini = remixQuestions(kiswahiliSenior, 'mini', 6)
const kiswahiliAdvancedDeck = remixQuestions(kiswahiliSenior, 'deck', 9)

const frenchBeginnerMini = remixQuestions(frenchBeginner, 'mini', 6)
const frenchBeginnerDeck = remixQuestions(frenchBeginner, 'deck', 9)
const frenchIntermediateMini = remixQuestions(frenchIntermediate, 'mini', 6)
const frenchIntermediateDeck = remixQuestions(frenchIntermediate, 'deck', 9)
const frenchAdvancedMini = remixQuestions(frenchSenior, 'mini', 6)
const frenchAdvancedDeck = remixQuestions(frenchSenior, 'deck', 9)

const germanBeginnerMini = remixQuestions(germanBeginner, 'mini', 6)
const germanBeginnerDeck = remixQuestions(germanBeginner, 'deck', 9)
const germanIntermediateMini = remixQuestions(germanIntermediate, 'mini', 6)
const germanIntermediateDeck = remixQuestions(germanIntermediate, 'deck', 9)
const LANGUAGE_POOLS = {
  spanish: {
    beginner: spanishBeginner,
    intermediate: spanishIntermediate,
    advanced: spanishSenior,
  },
  kiswahili: {
    beginner: kiswahiliBeginner,
    intermediate: kiswahiliIntermediate,
    advanced: kiswahiliSenior,
  },
  french: {
    beginner: frenchBeginner,
    intermediate: frenchIntermediate,
    advanced: frenchSenior,
  },
  german: {
    beginner: germanBeginner,
    intermediate: germanIntermediate,
    advanced: germanSenior,
  },
}

const LANGUAGE_META = {
  spanish: {
    prefixes: {
      beginner: 'Hola',
      intermediate: 'Mercado',
      advanced: 'Leyenda',
    },
    focuses: {
      beginner: 'Greetings & basics',
      intermediate: 'Travel convos',
      advanced: 'Nuance & speed',
    },
  },
  kiswahili: {
    prefixes: {
      beginner: 'Salamu',
      intermediate: 'Safari',
      advanced: 'Mjadala',
    },
    focuses: {
      beginner: 'Kind greetings',
      intermediate: 'Movement stories',
      advanced: 'Debate mastery',
    },
  },
  french: {
    prefixes: {
      beginner: 'Bonjour',
      intermediate: 'Café',
      advanced: 'Légende',
    },
    focuses: {
      beginner: 'Polite starts',
      intermediate: 'City chats',
      advanced: 'Fluent nuance',
    },
  },
  german: {
    prefixes: {
      beginner: 'Hallo',
      intermediate: 'Stadt',
      advanced: 'Legend',
    },
    focuses: {
      beginner: 'Travel intros',
      intermediate: 'Urban flow',
      advanced: 'Precision logic',
    },
  },
}

const LEVEL_VARIANTS = [
  { key: 'core', title: 'Core Run', focus: 'Fundamentals', rewardDelta: 0 },
  { key: 'drill', title: 'Drill Set', focus: 'Rapid reps', rewardDelta: 0.02 },
  { key: 'lab', title: 'Lab Loop', focus: 'Scenario lab', rewardDelta: 0.04 },
  { key: 'combo', title: 'Combo Flow', focus: 'Combo practice', rewardDelta: 0.06 },
  { key: 'sprint', title: 'Sprint Push', focus: 'Speed bursts', rewardDelta: 0.08 },
  { key: 'circuit', title: 'Circuit Quest', focus: 'Long-form run', rewardDelta: 0.1 },
  { key: 'pulse', title: 'Pulse Ride', focus: 'Rhythm drills', rewardDelta: 0.12 },
  { key: 'arena', title: 'Arena Dash', focus: 'Challenge arena', rewardDelta: 0.14 },
  { key: 'wave', title: 'Wave Loop', focus: 'Flow practice', rewardDelta: 0.16 },
  { key: 'spark', title: 'Spark Chain', focus: 'Memory sparks', rewardDelta: 0.18 },
  { key: 'forge', title: 'Forge Path', focus: 'Precision forge', rewardDelta: 0.2 },
  { key: 'vault', title: 'Vault Trial', focus: 'Vaulted prompts', rewardDelta: 0.22 },
  { key: 'quest', title: 'Quest Sprint', focus: 'Goal chase', rewardDelta: 0.24 },
  { key: 'rush', title: 'Rush Lane', focus: 'Audio rush', rewardDelta: 0.26 },
  { key: 'groove', title: 'Groove Set', focus: 'Pronunciation groove', rewardDelta: 0.28 },
  { key: 'flux', title: 'Flux Drill', focus: 'Shuffle drills', rewardDelta: 0.3 },
  { key: 'echo', title: 'Echo Loop', focus: 'Call & response', rewardDelta: 0.32 },
  { key: 'stack', title: 'Stack Lab', focus: 'Layered prompts', rewardDelta: 0.34 },
  { key: 'gauntlet', title: 'Gauntlet Run', focus: 'High-stakes run', rewardDelta: 0.36 },
  { key: 'legend', title: 'Legend Trial', focus: 'Perfect streak', rewardDelta: 0.38 },
]

const LEVEL_REWARD_BASE = {
  beginner: 0.45,
  intermediate: 0.75,
  advanced: 1.05,
}

const buildLanguageModules = (languageId) => {
  const languageMeta = LANGUAGE_META[languageId] ?? {}
  const languageLabel = LANGUAGES.find((entry) => entry.id === languageId)?.label ?? languageId
  const prefixes = languageMeta.prefixes ?? {}
  const focuses = languageMeta.focuses ?? {}

  return LEVELS.flatMap((level) => {
    const pool = LANGUAGE_POOLS[languageId]?.[level.id]
    if (!pool) return []
    const baseReward = LEVEL_REWARD_BASE[level.id] ?? 0.5
    const baseFocus = focuses[level.id] ?? `${languageLabel} mastery`
    const levelLabel = level.label ?? level.id

    return LEVEL_VARIANTS.map((variant, index) => {
      const rewardValue = baseReward + variant.rewardDelta
      const questionCount = Math.min(pool.length, Math.max(5, pool.length - (index % 3)))
      return {
        id: `${languageId}-${level.id}-${variant.key}`,
        title: `${prefixes[level.id] ?? languageLabel} ${variant.title}`,
        languageId,
        level: level.id,
        reward: `${rewardValue.toFixed(2)} CELO`,
        difficulty: levelLabel,
        focus: `${baseFocus} · ${variant.focus}`,
        questions: remixQuestions(pool, `${languageId}-${level.id}-${variant.key}`, questionCount),
      }
    })
  })
}

const MODULES = Object.keys(LANGUAGE_POOLS).flatMap((languageId) => buildLanguageModules(languageId))

const WEEKLY_QUESTS = [
  { id: 'quest-1', title: 'Complete 10 lessons', reward: 'Badge NFT', progress: 4, target: 10 },
{ id: 'quest-2', title: 'Earn 250 XP', reward: '0.2 CELO', progress: 180, target: 250 },
]

export const MODULES_DATA = MODULES
export const WEEKLY_QUESTS_DATA = WEEKLY_QUESTS

export const buildDefaultLeaderboards = () => {
  const sampleNames = ['Nova', 'Tambo', 'Aya', 'Kiza', 'Sol', 'Mira']
  return MODULES.reduce((acc, module, index) => {
    const base = module.level === 'advanced' ? 480 : module.level === 'intermediate' ? 320 : 220
    acc[module.id] = Array.from({ length: 4 }).map((_, idx) => ({
      name: sampleNames[(index + idx) % sampleNames.length],
      xp: base - idx * 35,
    }))
    return acc
  }, {})
}


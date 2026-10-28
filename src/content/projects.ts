/* Projectes del portfolio. Textos en català, castellà i anglès.
   status: "concept" | "prototype" | "playable". Quan un projecte avanci, canvia'n l'estat
   i substitueix el concept art per captures reals (conceptArt: false). */
import type { L } from "@/i18n";

export type Status = "concept" | "prototype" | "playable";

export interface Shot {
  src: string;
  alt: L;
  /** true = concept art generat amb IA; false = art o captura real del joc */
  conceptArt: boolean;
}

export interface Project {
  slug: string;
  title: string;
  tagline: L;
  status: Status;
  /** Imatge per a la galeria de la portada (16:9) */
  cover: Shot;
  gallery: Shot[];
  meta: { role: L; platform: L; tools: string; audience: L };
  problem: L;
  objectives: L[];
  scenario: L;
  /** Opcional: no tots els projectes tenen avaluació integrada */
  measure?: L;
  next: L;
  play?: { url: string; password?: string };
}

export const projects: Project[] = [
  {
    slug: "zona-segura",
    title: "Zona Segura",
    status: "concept",
    tagline: {
      ca: "Formació en prevenció de riscos laborals en RV, amb avaluació integrada i dades per al LMS.",
      es: "Formación en prevención de riesgos laborales en RV, con evaluación integrada y datos para el LMS.",
      en: "VR occupational safety training with built-in assessment and data for the LMS.",
    },
    cover: {
      src: "/img/projects/prl-cover.jpg",
      conceptArt: true,
      alt: {
        ca: "Magatzem lluminós amb riscos marcats en taronja: un carretó, una persona en una escala sense arnès i un vessament.",
        es: "Almacén luminoso con riesgos marcados en naranja: una carretilla, una persona en una escalera sin arnés y un derrame.",
        en: "Bright warehouse with hazards outlined in orange: a forklift, a person on a ladder without a harness and a spill.",
      },
    },
    gallery: [
      {
        src: "/img/projects/prl-hero.jpg",
        conceptArt: true,
        alt: {
          ca: "La mateixa escena vista des de les ulleres de RV, amb els riscos marcats dins del camp de visió.",
          es: "La misma escena vista desde las gafas de RV, con los riesgos marcados dentro del campo de visión.",
          en: "The same scene seen through the VR headset, with hazards marked in the field of view.",
        },
      },
      {
        src: "/img/projects/prl-debrief.jpg",
        conceptArt: true,
        alt: {
          ca: "Pantalla de debriefing amb el recorregut sobre el plànol, els riscos trobats i omesos i una puntuació.",
          es: "Pantalla de debriefing con el recorrido sobre el plano, los riesgos encontrados y omitidos y una puntuación.",
          en: "Debrief screen showing the route on a floor plan, hazards found and missed, and a score.",
        },
      },
    ],
    meta: {
      role: {
        ca: "Disseny instruccional, disseny de joc i programació en Unity",
        es: "Diseño instruccional, diseño de juego y programación en Unity",
        en: "Instructional design, game design and Unity programming",
      },
      platform: { ca: "Meta Quest 3", es: "Meta Quest 3", en: "Meta Quest 3" },
      tools: "Unity 6 · XR Interaction Toolkit · OpenXR · xAPI",
      audience: {
        ca: "Personal de magatzem i logística",
        es: "Personal de almacén y logística",
        en: "Warehouse and logistics staff",
      },
    },
    problem: {
      ca: "La formació en PRL sol ser teòrica i es valida amb un qüestionari. Allò que importa, detectar un risc real en un entorn real, gairebé no es practica ni es mesura.",
      es: "La formación en PRL suele ser teórica y se valida con un cuestionario. Lo que importa, detectar un riesgo real en un entorno real, casi no se practica ni se mide.",
      en: "Safety training is usually theoretical and signed off with a quiz. What matters, spotting a real hazard in a real place, is rarely practised or measured.",
    },
    objectives: [
      {
        ca: "Identificar els riscos principals d'un magatzem: circulació de carretons, treball en altura, vessaments i ús dels EPI.",
        es: "Identificar los riesgos principales de un almacén: circulación de carretillas, trabajo en altura, derrames y uso de los EPI.",
        en: "Identify the main warehouse hazards: forklift traffic, working at height, spills and PPE use.",
      },
      {
        ca: "Aplicar el procediment correcte davant de cada risc: senyalitzar, aturar l'activitat o avisar.",
        es: "Aplicar el procedimiento correcto ante cada riesgo: señalizar, detener la actividad o avisar.",
        en: "Apply the right procedure for each hazard: mark it, stop the activity or report it.",
      },
      {
        ca: "Prendre decisions amb pressió de temps sense posar ningú en perill.",
        es: "Tomar decisiones con presión de tiempo sin poner a nadie en peligro.",
        en: "Make decisions under time pressure without putting anyone at risk.",
      },
    ],
    scenario: {
      ca: "Una jornada en un magatzem logístic, amb Meta Quest 3. La persona recorre els passadissos, detecta i marca els riscos i tria com actuar. Cada partida combina els riscos de manera diferent perquè no es pugui memoritzar.",
      es: "Una jornada en un almacén logístico, con Meta Quest 3. La persona recorre los pasillos, detecta y marca los riesgos y elige cómo actuar. Cada partida combina los riesgos de forma distinta para que no se pueda memorizar.",
      en: "A working day in a logistics warehouse, on Meta Quest 3. Trainees walk the aisles, spot and tag hazards, and choose how to respond. Each run combines hazards differently so it can't be memorised.",
    },
    measure: {
      ca: "Cada acció genera una declaració xAPI (risc detectat, temps, decisió) cap a un LRS, i un resum SCORM arriba al LMS de l'empresa. En acabar, el debriefing mostra el recorregut, els riscos trobats i els que s'han passat per alt.",
      es: "Cada acción genera una declaración xAPI (riesgo detectado, tiempo, decisión) hacia un LRS, y un resumen SCORM llega al LMS de la empresa. Al terminar, el debriefing muestra el recorrido, los riesgos encontrados y los que se han pasado por alto.",
      en: "Every action emits an xAPI statement (hazard found, time, decision) to an LRS, and a SCORM summary reaches the company LMS. The debrief at the end shows the route taken, hazards found and hazards missed.",
    },
    next: {
      ca: "Fase de concepte: document de disseny i blockout de l'escenari amb Unity 6 i XR Interaction Toolkit. Proper pas: un prototip jugable d'un passadís amb tres riscos.",
      es: "Fase de concepto: documento de diseño y blockout del escenario con Unity 6 y XR Interaction Toolkit. Próximo paso: un prototipo jugable de un pasillo con tres riesgos.",
      en: "Concept stage: design document and scene blockout with Unity 6 and XR Interaction Toolkit. Next: a playable prototype of one aisle with three hazards.",
    },
  },
  {
    slug: "mallorca-1229",
    title: "Mallorca, 1229",
    status: "concept",
    tagline: {
      ca: "Joc breu de descoberta per entendre la Madina Mayurqa de 1229, pensat per a museus i centres educatius.",
      es: "Juego breve de descubrimiento para entender la Madina Mayurqa de 1229, pensado para museos y centros educativos.",
      en: "A short discovery game about Madina Mayurqa in 1229, designed for museums and schools.",
    },
    cover: {
      src: "/img/projects/mallorca1229-hero.jpg",
      conceptArt: true,
      alt: {
        ca: "La ciutat emmurallada de Madina Mayurqa a plena llum, amb l'alcàsser, el port i una flota que s'acosta per l'horitzó.",
        es: "La ciudad amurallada de Madina Mayurqa a plena luz, con el alcázar, el puerto y una flota que se acerca por el horizonte.",
        en: "The walled city of Madina Mayurqa in full daylight, with the alcázar, the harbour and a fleet approaching on the horizon.",
      },
    },
    gallery: [
      {
        src: "/img/projects/mallorca1229-descoberta.jpg",
        conceptArt: true,
        alt: {
          ca: "Un mercat de la medina amb un bol de ceràmica ressaltat i una fitxa de descoberta al costat.",
          es: "Un mercado de la medina con un cuenco de cerámica resaltado y una ficha de descubrimiento al lado.",
          en: "A medina market with a highlighted ceramic bowl and a discovery card beside it.",
        },
      },
    ],
    meta: {
      role: {
        ca: "Disseny del joc, guió i programació en Unity",
        es: "Diseño del juego, guion y programación en Unity",
        en: "Game design, script and Unity programming",
      },
      platform: { ca: "Navegador (WebGL)", es: "Navegador (WebGL)", en: "Browser (WebGL)" },
      tools: "Unity · WebGL · xAPI",
      audience: {
        ca: "Museus, centres educatius i institucions culturals",
        es: "Museos, centros educativos e instituciones culturales",
        en: "Museums, schools and cultural institutions",
      },
    },
    problem: {
      ca: "La conquesta de 1229 s'explica sovint amb dates i noms, però costa imaginar com era la ciutat que hi havia abans: els seus carrers, els oficis i la gent que hi vivia.",
      es: "La conquista de 1229 suele explicarse con fechas y nombres, pero cuesta imaginar cómo era la ciudad que había antes: sus calles, sus oficios y la gente que vivía en ella.",
      en: "The 1229 conquest is usually told through dates and names, yet it's hard to picture the city that stood there before: its streets, trades and people.",
    },
    objectives: [
      {
        ca: "Reconèixer els espais principals de la Madina Mayurqa: muralles, alcàsser, mercat i port.",
        es: "Reconocer los espacios principales de la Madina Mayurqa: murallas, alcázar, mercado y puerto.",
        en: "Recognise the key places of Madina Mayurqa: walls, alcázar, market and harbour.",
      },
      {
        ca: "Relacionar objectes i oficis amb la vida quotidiana de la ciutat andalusina.",
        es: "Relacionar objetos y oficios con la vida cotidiana de la ciudad andalusí.",
        en: "Connect objects and trades with everyday life in the Andalusi city.",
      },
      {
        ca: "Entendre el context de la conquesta des de més d'un punt de vista.",
        es: "Entender el contexto de la conquista desde más de un punto de vista.",
        en: "Understand the context of the conquest from more than one point of view.",
      },
    ],
    scenario: {
      ca: "Una exploració lliure i breu, d'uns 15 o 20 minuts, per la ciutat. La persona hi descobreix punts d'interès, examina objectes i en recull fitxes que s'afegeixen a una línia del temps. Aprofita el material visual i la recerca de la meva minisèrie sobre la conquesta. Es juga al navegador amb WebGL: només cal obrir un enllaç.",
      es: "Una exploración libre y breve, de unos 15 o 20 minutos, por la ciudad. La persona descubre puntos de interés, examina objetos y recoge fichas que se añaden a una línea del tiempo. Aprovecha el material visual y la investigación de mi miniserie sobre la conquista. Se juega en el navegador con WebGL: basta con abrir un enlace.",
      en: "A short, free exploration of the city, about 15 to 20 minutes long. Players find points of interest, examine objects and collect cards that build a timeline. It draws on the visuals and research from my mini-series about the conquest. It runs in the browser with WebGL: just open a link.",
    },
    measure: {
      ca: "Cada descoberta queda registrada: què s'ha trobat, en quin ordre i quant de temps s'hi ha dedicat. Un repte final demana situar els objectes trobats a la línia del temps, i el museu o el centre educatiu en veu els resultats agregats.",
      es: "Cada descubrimiento queda registrado: qué se ha encontrado, en qué orden y cuánto tiempo se le ha dedicado. Un reto final pide situar los objetos encontrados en la línea del tiempo, y el museo o el centro educativo ve los resultados agregados.",
      en: "Every discovery is logged: what was found, in which order and for how long. A final challenge asks players to place the objects on the timeline, and the museum or school sees aggregated results.",
    },
    next: {
      ca: "Fase de concepte, a partir del material de la minisèrie. Proper pas: un prototip WebGL d'un sol barri amb cinc punts de descoberta.",
      es: "Fase de concepto, a partir del material de la miniserie. Próximo paso: un prototipo WebGL de un solo barrio con cinco puntos de descubrimiento.",
      en: "Concept stage, building on the mini-series material. Next: a WebGL prototype of a single district with five discovery points.",
    },
  },
  {
    slug: "mayday",
    title: "Mayday",
    status: "concept",
    tagline: {
      ca: "Simulació multijugador d'emergències a bord: la tripulació aprèn a coordinar-se i a comunicar-se quan tot falla.",
      es: "Simulación multijugador de emergencias a bordo: la tripulación aprende a coordinarse y a comunicarse cuando todo falla.",
      en: "A multiplayer onboard-emergency simulation where the crew learns to coordinate and communicate when things go wrong.",
    },
    cover: {
      src: "/img/projects/nautica-hero.jpg",
      conceptArt: true,
      alt: {
        ca: "Un veler en un dia de vent i onades: el patró al timó, un tripulant a proa assenyalant una persona a l'aigua i un altre amb la ràdio VHF.",
        es: "Un velero en un día de viento y olas: el patrón al timón, un tripulante en proa señalando a una persona en el agua y otro con la radio VHF.",
        en: "A sailing yacht on a windy, choppy day: the skipper at the helm, one crew member at the bow pointing at a person in the water, another on the VHF radio.",
      },
    },
    gallery: [
      {
        src: "/img/projects/nautica-debrief.jpg",
        conceptArt: true,
        alt: {
          ca: "Pantalla de repetició amb la traça del vaixell sobre la carta i una línia de temps per a cada tripulant.",
          es: "Pantalla de repetición con la traza del barco sobre la carta y una línea de tiempo para cada tripulante.",
          en: "Replay screen with the yacht's track on the chart and a timeline for each crew member.",
        },
      },
    ],
    meta: {
      role: {
        ca: "Disseny de joc multijugador, disseny instruccional i programació en Unity",
        es: "Diseño de juego multijugador, diseño instruccional y programación en Unity",
        en: "Multiplayer game design, instructional design and Unity programming",
      },
      platform: { ca: "PC · Meta Quest 3 (multijugador)", es: "PC · Meta Quest 3 (multijugador)", en: "PC · Meta Quest 3 (multiplayer)" },
      tools: "Unity · Netcode for GameObjects · XR Interaction Toolkit · xAPI",
      audience: {
        ca: "Escoles de vela i alumnat de patró",
        es: "Escuelas de vela y alumnado de patrón",
        en: "Sailing schools and skipper-licence students",
      },
    },
    problem: {
      ca: "A les escoles de vela i a la titulació de patró, les emergències es practiquen poc i sovint per separat. Però en una emergència real el que falla primer és la coordinació: qui fa què, qui avisa i com.",
      es: "En las escuelas de vela y en la titulación de patrón, las emergencias se practican poco y a menudo por separado. Pero en una emergencia real lo primero que falla es la coordinación: quién hace qué, quién avisa y cómo.",
      en: "In sailing schools and skipper courses, emergencies are rarely practised, and usually in isolation. Yet in a real emergency coordination is what fails first: who does what, who calls for help, and how.",
    },
    objectives: [
      {
        ca: "Aplicar els procediments d'home a l'aigua, incendi i via d'aigua.",
        es: "Aplicar los procedimientos de hombre al agua, incendio y vía de agua.",
        en: "Apply the man-overboard, fire and flooding procedures.",
      },
      {
        ca: "Repartir rols i coordinar-se sota pressió: timó, vigia i ràdio.",
        es: "Repartir roles y coordinarse bajo presión: timón, vigía y radio.",
        en: "Split roles and coordinate under pressure: helm, lookout and radio.",
      },
      {
        ca: "Comunicar una emergència per VHF amb el protocol correcte: Mayday, posició i situació.",
        es: "Comunicar una emergencia por VHF con el protocolo correcto: Mayday, posición y situación.",
        en: "Report an emergency over VHF with the right protocol: Mayday, position and situation.",
      },
    ],
    scenario: {
      ca: "Tres alumnes comparteixen un veler, cada un amb un rol diferent (patró, proa i ràdio), en PC o amb Meta Quest 3. L'emergència arriba sense avís i ningú no la pot resoldre tot sol, perquè cada rol veu i controla una part diferent del vaixell.",
      es: "Tres alumnos comparten un velero, cada uno con un rol distinto (patrón, proa y radio), en PC o con Meta Quest 3. La emergencia llega sin aviso y nadie puede resolverla solo, porque cada rol ve y controla una parte distinta del barco.",
      en: "Three learners share a yacht, each in a different role (skipper, bow and radio), on PC or Meta Quest 3. The emergency strikes without warning and nobody can solve it alone, because each role sees and controls a different part of the boat.",
    },
    measure: {
      ca: "La repetició final mostra la traça del vaixell sobre la carta i una línia de temps per a cada tripulant, amb les crides de ràdio i les accions. S'hi avaluen el temps de resposta, la qualitat de la comunicació i si cada rol ha fet la seva part. Les dades s'exporten en xAPI.",
      es: "La repetición final muestra la traza del barco sobre la carta y una línea de tiempo para cada tripulante, con las llamadas de radio y las acciones. Se evalúan el tiempo de respuesta, la calidad de la comunicación y si cada rol ha hecho su parte. Los datos se exportan en xAPI.",
      en: "The final replay shows the yacht's track on the chart and a timeline per crew member, with radio calls and actions. It assesses response time, communication quality and whether each role did its part. Data is exported as xAPI.",
    },
    next: {
      ca: "Fase de concepte. Proper pas: un prototip multijugador de la maniobra d'home a l'aigua amb dos rols.",
      es: "Fase de concepto. Próximo paso: un prototipo multijugador de la maniobra de hombre al agua con dos roles.",
      en: "Concept stage. Next: a two-role multiplayer prototype of the man-overboard manoeuvre.",
    },
  },
  {
    slug: "foc-a-la-serra",
    title: "Foc a la Serra",
    status: "concept",
    tagline: {
      ca: "Simulació de presa de decisions davant d'un incendi forestal a la Serra de Tramuntana.",
      es: "Simulación de toma de decisiones ante un incendio forestal en la Serra de Tramuntana.",
      en: "A decision-making simulation for a wildfire in Mallorca's Serra de Tramuntana.",
    },
    cover: {
      src: "/img/projects/foc-hero.jpg",
      conceptArt: true,
      alt: {
        ca: "La Serra de Tramuntana de dia amb un front de foc a la carena, un poble a la vall i un membre d'emergències d'esquena.",
        es: "La Serra de Tramuntana de día con un frente de fuego en la cresta, un pueblo en el valle y un miembro de emergencias de espaldas.",
        en: "The Serra de Tramuntana by day with a fire front on the ridge, a village in the valley and a first responder seen from behind.",
      },
    },
    gallery: [
      {
        src: "/img/projects/foc-mapa.jpg",
        conceptArt: true,
        alt: {
          ca: "Mapa tàctic de la vall amb corbes de nivell, la propagació del foc en cel·les i dues rutes d'evacuació.",
          es: "Mapa táctico del valle con curvas de nivel, la propagación del fuego en celdas y dos rutas de evacuación.",
          en: "Tactical map of the valley with contour lines, cell-based fire spread and two evacuation routes.",
        },
      },
    ],
    meta: {
      role: {
        ca: "Disseny del sistema de simulació i programació en Unity",
        es: "Diseño del sistema de simulación y programación en Unity",
        en: "Simulation system design and Unity programming",
      },
      platform: { ca: "PC · Meta Quest 3", es: "PC · Meta Quest 3", en: "PC · Meta Quest 3" },
      tools: "Unity · Terrain · Simulació per cel·les · xAPI",
      audience: {
        ca: "Protecció civil, voluntariat i centres educatius",
        es: "Protección civil, voluntariado y centros educativos",
        en: "Civil protection, volunteers and schools",
      },
    },
    problem: {
      ca: "A Mallorca, els incendis forestals amenacen pobles envoltats de bosc. Els simulacres reals són escassos i no poden reproduir el vent, el fum ni la pressió del temps.",
      es: "En Mallorca, los incendios forestales amenazan pueblos rodeados de bosque. Los simulacros reales son escasos y no pueden reproducir el viento, el humo ni la presión del tiempo.",
      en: "In Mallorca, wildfires threaten villages surrounded by forest. Real drills are rare and can't reproduce wind, smoke or time pressure.",
    },
    objectives: [
      {
        ca: "Interpretar com el vent i el terreny fan avançar el foc.",
        es: "Interpretar cómo el viento y el terreno hacen avanzar el fuego.",
        en: "Read how wind and terrain drive the fire.",
      },
      {
        ca: "Triar una ruta d'evacuació segura i canviar-la quan la situació canvia.",
        es: "Elegir una ruta de evacuación segura y cambiarla cuando la situación cambia.",
        en: "Choose a safe evacuation route and change it when the situation changes.",
      },
      {
        ca: "Coordinar avisos i recursos seguint el protocol d'emergència.",
        es: "Coordinar avisos y recursos siguiendo el protocolo de emergencia.",
        en: "Coordinate alerts and resources following the emergency protocol.",
      },
    ],
    scenario: {
      ca: "Una vall inspirada en la Serra de Tramuntana. Un model de propagació per cel·les (vent, pendent i vegetació) fa avançar el foc en temps real. L'alumne alterna una vista tàctica del mapa amb una vista en primera persona sobre el terreny.",
      es: "Un valle inspirado en la Serra de Tramuntana. Un modelo de propagación por celdas (viento, pendiente y vegetación) hace avanzar el fuego en tiempo real. El alumno alterna una vista táctica del mapa con una vista en primera persona sobre el terreno.",
      en: "A valley inspired by the Serra de Tramuntana. A cell-based spread model (wind, slope and vegetation) advances the fire in real time. Learners switch between a tactical map and a first-person view on the ground.",
    },
    measure: {
      ca: "Cada decisió es registra amb el seu moment i l'estat del foc: temps d'evacuació, persones en risc i rutes tallades. El debriefing reprodueix la partida i la compara amb la resposta recomanada.",
      es: "Cada decisión se registra con su momento y el estado del fuego: tiempo de evacuación, personas en riesgo y rutas cortadas. El debriefing reproduce la partida y la compara con la respuesta recomendada.",
      en: "Every decision is logged with its timing and the fire state: evacuation time, people at risk and routes cut off. The debrief replays the session and compares it with the recommended response.",
    },
    next: {
      ca: "Fase de concepte. Primer pas: prototip del model de propagació en Unity amb dades reals del terreny (MDT) d'una vall de la Serra.",
      es: "Fase de concepto. Primer paso: prototipo del modelo de propagación en Unity con datos reales del terreno (MDT) de un valle de la Serra.",
      en: "Concept stage. First step: a Unity prototype of the spread model using real terrain data (DEM) from a valley in the Serra.",
    },
  },
];

export function getProject(slug: string | undefined) {
  return projects.find((p) => p.slug === slug);
}

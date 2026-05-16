export interface Recommendation {
  name: string;
  role: string;
  company: string;
  /** English translation, used by default */
  content: string;
  /** Original text (if different from English) */
  content_original?: string;
  /** ISO language code for original text, e.g., 'sv' */
  original_language?: string;
  date: string;
  linkedinUrl?: string;
  avatar?: string;
}

export const RECOMMENDATIONS: Recommendation[] = [
  {
    name: "Anton Tibblin",
    role: "Lecturer",
    company: "Malmö University",
    content:
      "I've had the pleasure of working closely with Arvid Berndtsson over the past two years at Malmö University, where he has contributed significantly as a teaching assistant and collaborator in several courses, including Introduction to Programming, Introduction to Web Development, and Web Services. During this time, Arvid has demonstrated outstanding dedication and professionalism. He has been actively involved in developing high-quality teaching materials, supporting students during labs and exercises, leading workshops, and grading assignments. His work has consistently been of the highest standard. Arvid shows genuine enthusiasm, thoughtfulness, and a collaborative spirit. He brings a solution-oriented mindset to every situation, and he approaches challenges with curiosity and confidence. Arvid is the kind of person who uplifts those around him—always ready to listen, offer support, and contribute with humility and care. His strong interpersonal skills, paired with his technical and pedagogical abilities, make him not only a valuable colleague but also a true pleasure to work with. I give Arvid my strongest recommendation and look forward to seeing where his talents will take him next.",
    date: "2025-07-23",
  },
  {
    name: "Hannah Lindbäck",
    role: "Software Engineer | Accessible Web Experiences",
    company: "",
    content:
      "Arvid and I have worked together on university projects and studied together at Malmö University. He is extremely knowledgeable, competent, and humble, always managing to solve the problems and challenges you encounter as a developer. Starting computer science with a blank canvas, I can’t overstate how much I have learned from Arvid, and still do. Always in a good mood and always with a new idea!",
    content_original:
      "Jag och Arvid har arbetat ihop i projekt på universitetet och studerat ihop på Malmö Universitet. Extremt kunnig, kompetent och ödmjuk individ som alltid lyckas lösa diverse problem och utmaningar man stöter på som utvecklare. Jag som började studera datavetenskap med en blank canvas kan inte understryka hur mycket jag lärt mig och fortfarande lär mig av Arvid. Alltid ett glatt humör och en ny idé på G! :)",
    original_language: "sv",
    date: "2024-08-03",
  },
  {
    name: "Johan Holmberg",
    role: "PhD Student",
    company: "Malmö universitet",
    content:
      "I have been Arvid’s teacher in four courses, and supervisor in one. These courses covered web development, systems modeling, and project management. In every course, Arvid ranked at the top of his year, by a wide margin. He is intelligent, enthusiastic, and ambitious. Importantly, he remains very humble despite his performance. This is most evident in his willingness to help classmates when needed, often in ways that reduced my workload as a teacher. His enthusiasm and ambition led early on to a spin‑off startup, which he founded with a classmate. As a teacher, that is rare and always fun to see; it was inspiring, and it clearly influenced other students. This brings me to another key quality he displays: leadership. When he leads projects, he does so by inspiring and supporting rather than pointing and demanding. Would I recommend Arvid as a colleague? Absolutely. Get him before someone else does!",
    content_original:
      "Jag har varit Arvids lärare i fyra kurser, av vilka jag var hans handledare i en. Kurserna har handlat om webbutveckling, systemmodellering och projektledarskap. I samtliga kurser har Arvid legat i toppen för sin årskurs, och det med råge. Arvid är intelligent, entusiastisk och ambitiös. Utöver det är han, och detta ser jag som en väldigt viktig egenskap för någon på hans nivå, väldigt ödmjuk inför det faktum att han ligger bättre till än sina kursare. Detta visar sig framförallt genom hans vilja att hjälpa sina kursare när det behövs, ofta på ett sätt som avlastat mitt jobb som lärare. Hans entusiasm och ambitioner ledde tidigt till en avknoppat startupbolag, vilket han startade tillsammans med en kursare. För mig som lärare är detta en sällsynt, men alltid rolig upplevelse. Framförallt är det inspirerande, och det är tydligt att hans kursare tagit intryck av detta. Detta för mig till ytterligare en viktig egenskap som Arvid uppvisar: hans ledaregenskap. När han driver projekt gör han det genom att inspirera och stötta, snarare än att peka och kräva. Skulle jag rekommendera Arvid som medarbetare? Absolut! Haffa fatt i honom innan någon annan gör det!",
    original_language: "sv",
    date: "2024-07-31",
  },
  {
    name: "Christina Hayward",
    role: "Owner",
    company: "Hayward Market & Design",
    content:
      "I can highly recommend Arvid. We worked together on a web project in Figma, among other things. Arvid approached every task with great dedication and attention to detail. Arvid is excellent to consult in a variety of contexts, and I believe his future will be exceptionally bright!",
    date: "2024-06-28",
  },
  {
    name: "Ines Suhonjic",
    role: "Information Architecture Student",
    company: "Malmö University",
    content:
      "Arvid is truly a gem. He is driven, knowledgeable, and incredibly humble. Working with him has been both rewarding and a lot of fun. He is highly skilled at what he does and has a fantastic ability to explain things in a simple and clear way. Strongly emphasized: I recommend him every day of the week!",
    content_original:
      "Arvid är verkligen ett guldkorn! Han är driven, kunnig och samtidigt otroligt ödmjuk. Att jobba tillsammans med honom har inte bara varit utvecklande utan också väldigt roligt. Han är otroligt kunnig på det han gör och har en fantastisk förmåga att förklara på ett enkelt och tydligt sätt. \nMed stark betoning: jag rekommenderar honom alla dagar i veckan! ",
    original_language: "sv",
    date: "2025-08-31",
  },
];

// Helper functions
export const getRecentRecommendations = (
  limit: number = 3,
): Recommendation[] => {
  return RECOMMENDATIONS.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  ).slice(0, limit);
};

export const getRecommendationsByCompany = (
  company: string,
): Recommendation[] => {
  return RECOMMENDATIONS.filter((rec) =>
    rec.company.toLowerCase().includes(company.toLowerCase()),
  );
};

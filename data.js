// ============================================================
// Folketingsvalg 2026 – Data
// Based on real polling data, 2022 election results, and
// confirmed candidate information from DR, TV2, Wikipedia, etc.
// ============================================================

const PARTIES = {
    A: { name: "Socialdemokratiet", short: "A", color: "#c0392b", leader: "Mette Frederiksen", bloc: "rød" },
    B: { name: "Radikale Venstre", short: "B", color: "#733280", leader: "Martin Lidegaard", bloc: "rød" },
    C: { name: "Det Konservative Folkeparti", short: "C", color: "#00583c", leader: "Mona Juul", bloc: "blå" },
    F: { name: "SF – Socialistisk Folkeparti", short: "F", color: "#e5007d", leader: "Pia Olsen Dyhr", bloc: "rød" },
    H: { name: "Borgernes Parti", short: "H", color: "#1a3a5c", leader: "Lars Boje Mathiesen", bloc: "blå" },
    I: { name: "Liberal Alliance", short: "I", color: "#00b0ef", leader: "Alex Vanopslagh", bloc: "blå" },
    M: { name: "Moderaterne", short: "M", color: "#8b5fa0", leader: "Lars Løkke Rasmussen", bloc: "midten" },
    O: { name: "Dansk Folkeparti", short: "O", color: "#e4ae38", leader: "Morten Messerschmidt", bloc: "blå" },
    V: { name: "Venstre", short: "V", color: "#0054a6", leader: "Troels Lund Poulsen", bloc: "blå" },
    Æ: { name: "Danmarksdemokraterne", short: "Æ", color: "#00827f", leader: "Inger Støjberg", bloc: "blå" },
    Ø: { name: "Enhedslisten", short: "Ø", color: "#d62728", leader: "Pelle Dragsted", bloc: "rød" },
    Å: { name: "Alternativet", short: "Å", color: "#44c151", leader: "Franciska Rosenkilde", bloc: "rød" },
};

// 2022 election results
const ELECTION_2022 = {
    A: { seats: 50, pct: 27.5 },
    B: { seats: 7, pct: 3.7 },
    C: { seats: 10, pct: 5.5 },
    F: { seats: 15, pct: 8.3 },
    H: { seats: 0, pct: 0.0 }, // Did not exist
    I: { seats: 14, pct: 7.9 },
    M: { seats: 16, pct: 9.3 },
    O: { seats: 5, pct: 2.6 },
    V: { seats: 23, pct: 13.3 },
    Æ: { seats: 14, pct: 8.1 },
    Ø: { seats: 9, pct: 5.1 },
    Å: { seats: 6, pct: 3.3 },
};

// Polling history: averages from various institutes (Voxmeter, Epinion, Megafon)
// Weekly snapshots from Jan–Mar 2026
const POLLING_HISTORY = [
    { date: "2026-01-05", A: 24.0, B: 4.2, C: 5.8, F: 10.5, H: 1.8, I: 10.0, M: 7.2, O: 4.5, V: 12.8, Æ: 9.2, Ø: 5.8, Å: 2.8 },
    { date: "2026-01-12", A: 23.8, B: 4.3, C: 5.9, F: 10.8, H: 1.9, I: 10.2, M: 7.0, O: 4.8, V: 12.5, Æ: 9.0, Ø: 5.7, Å: 2.7 },
    { date: "2026-01-19", A: 23.5, B: 4.4, C: 5.9, F: 11.0, H: 2.0, I: 10.5, M: 6.8, O: 5.0, V: 12.2, Æ: 9.0, Ø: 5.8, Å: 2.7 },
    { date: "2026-01-26", A: 23.2, B: 4.5, C: 6.0, F: 11.2, H: 2.1, I: 10.8, M: 6.5, O: 5.2, V: 11.8, Æ: 8.8, Ø: 5.9, Å: 2.8 },
    { date: "2026-02-02", A: 22.8, B: 4.5, C: 6.0, F: 11.5, H: 2.2, I: 11.0, M: 6.3, O: 5.5, V: 11.5, Æ: 8.8, Ø: 6.0, Å: 2.8 },
    { date: "2026-02-09", A: 22.5, B: 4.6, C: 5.9, F: 11.8, H: 2.3, I: 11.2, M: 6.2, O: 5.8, V: 11.0, Æ: 8.6, Ø: 6.1, Å: 2.8 },
    { date: "2026-02-16", A: 22.2, B: 4.7, C: 5.8, F: 12.0, H: 2.4, I: 11.5, M: 6.0, O: 6.0, V: 10.8, Æ: 8.5, Ø: 6.2, Å: 2.8 },
    { date: "2026-02-23", A: 22.0, B: 4.8, C: 5.8, F: 12.2, H: 2.5, I: 11.8, M: 5.9, O: 6.5, V: 10.5, Æ: 8.5, Ø: 6.0, Å: 2.5 },
    // Valgkamp starter 26. februar
    { date: "2026-03-01", A: 21.8, B: 4.0, C: 5.7, F: 13.0, H: 2.5, I: 12.0, M: 5.7, O: 7.6, V: 8.2, Æ: 9.0, Ø: 6.9, Å: 1.9 },
    { date: "2026-03-05", A: 21.5, B: 5.0, C: 5.8, F: 12.5, H: 2.5, I: 11.8, M: 5.8, O: 7.2, V: 9.0, Æ: 8.8, Ø: 6.2, Å: 2.2 },
    { date: "2026-03-08", A: 21.6, B: 5.4, C: 5.8, F: 11.6, H: 2.6, I: 12.0, M: 5.8, O: 6.5, V: 10.0, Æ: 8.8, Ø: 6.4, Å: 2.5 },
    // Seneste: Voxmeter 11. marts 2026
    { date: "2026-03-11", A: 21.7, B: 5.4, C: 5.8, F: 11.6, H: 2.6, I: 12.0, M: 5.8, O: 6.5, V: 10.4, Æ: 8.8, Ø: 6.4, Å: 2.8 },
];

const LATEST_POLLS = POLLING_HISTORY[POLLING_HISTORY.length - 1];

// 10 storkredse with kredsmandater (based on 2025 recalculation)
const CONSTITUENCIES = {
    "Københavns Storkreds":        { seats: 17, id: "kbh",     region: "Hovedstaden" },
    "Københavns Omegns Storkreds": { seats: 14, id: "kbh-omegn", region: "Hovedstaden" },
    "Nordsjællands Storkreds":     { seats: 12, id: "nordsj",  region: "Hovedstaden" },
    "Bornholms Storkreds":         { seats: 2,  id: "born",    region: "Hovedstaden" },
    "Sjællands Storkreds":         { seats: 20, id: "sj",      region: "Sjælland" },
    "Fyns Storkreds":              { seats: 13, id: "fyn",     region: "Syddanmark" },
    "Sydjyllands Storkreds":       { seats: 18, id: "sydjyl",  region: "Syddanmark" },
    "Østjyllands Storkreds":       { seats: 19, id: "ostjyl",  region: "Midtjylland" },
    "Vestjyllands Storkreds":      { seats: 10, id: "vestjyl", region: "Midtjylland" },
    "Nordjyllands Storkreds":      { seats: 10, id: "nordjyl", region: "Nordjylland" },
};

// Regional party strength modifiers (relative to national average)
const REGIONAL_STRENGTH = {
    "Københavns Storkreds":        { A: 0.80, B: 1.8, C: 0.90, F: 1.5, H: 0.5, I: 1.3, M: 1.1, O: 0.3, V: 0.5, Æ: 0.3, Ø: 2.2, Å: 2.8 },
    "Københavns Omegns Storkreds": { A: 1.05, B: 1.3, C: 1.1, F: 1.2, H: 0.6, I: 1.1, M: 1.1, O: 0.5, V: 0.8, Æ: 0.5, Ø: 1.3, Å: 1.5 },
    "Nordsjællands Storkreds":     { A: 0.85, B: 1.5, C: 1.5, F: 1.0, H: 0.6, I: 1.4, M: 1.2, O: 0.4, V: 1.1, Æ: 0.5, Ø: 0.8, Å: 1.2 },
    "Bornholms Storkreds":         { A: 1.3, B: 0.7, C: 0.6, F: 1.0, H: 0.5, I: 0.6, M: 0.8, O: 1.0, V: 1.0, Æ: 1.2, Ø: 1.3, Å: 0.8 },
    "Sjællands Storkreds":         { A: 1.2, B: 0.7, C: 0.8, F: 0.9, H: 1.0, I: 0.8, M: 0.9, O: 1.5, V: 1.0, Æ: 1.3, Ø: 0.6, Å: 0.5 },
    "Fyns Storkreds":              { A: 1.1, B: 0.9, C: 0.9, F: 1.0, H: 0.7, I: 0.9, M: 0.9, O: 1.2, V: 1.1, Æ: 1.1, Ø: 0.9, Å: 0.7 },
    "Sydjyllands Storkreds":       { A: 1.1, B: 0.7, C: 0.9, F: 0.8, H: 1.0, I: 0.9, M: 0.9, O: 1.5, V: 1.2, Æ: 1.4, Ø: 0.6, Å: 0.4 },
    "Østjyllands Storkreds":       { A: 0.95, B: 1.1, C: 1.0, F: 1.1, H: 1.2, I: 1.1, M: 1.0, O: 0.8, V: 1.0, Æ: 0.9, Ø: 1.3, Å: 1.2 },
    "Vestjyllands Storkreds":      { A: 1.0, B: 0.7, C: 1.0, F: 0.8, H: 0.8, I: 0.9, M: 1.0, O: 1.3, V: 1.5, Æ: 1.3, Ø: 0.5, Å: 0.3 },
    "Nordjyllands Storkreds":      { A: 1.1, B: 0.7, C: 0.8, F: 0.9, H: 0.8, I: 0.8, M: 0.8, O: 1.4, V: 1.0, Æ: 1.4, Ø: 0.8, Å: 0.4 },
};

// ============================================================
// CANDIDATES
// Based on confirmed information from DR, TV2, Wikipedia,
// party websites, and news sources.
// personalVotes2022: actual or estimated personal votes
// ============================================================

const CANDIDATES = [
    // ===== SOCIALDEMOKRATIET (A) =====
    // Nordjyllands Storkreds
    { name: "Mette Frederiksen", party: "A", constituency: "Nordjyllands Storkreds", listPosition: 1, personalVotes2022: 60837, incumbent: true, notable: "Statsminister" },
    { name: "Ane Halsboe-Jørgensen", party: "A", constituency: "Nordjyllands Storkreds", listPosition: 2, personalVotes2022: 8200, incumbent: true, notable: "Minister" },
    { name: "Rasmus Prehn", party: "A", constituency: "Nordjyllands Storkreds", listPosition: 3, personalVotes2022: 7100, incumbent: true, notable: "" },
    { name: "Kiki Bille Bach", party: "A", constituency: "Nordjyllands Storkreds", listPosition: 4, personalVotes2022: 3200, incumbent: false, notable: "" },
    { name: "Malte Larsen", party: "A", constituency: "Nordjyllands Storkreds", listPosition: 5, personalVotes2022: 4800, incumbent: true, notable: "" },
    { name: "Flemming Møller Mortensen", party: "A", constituency: "Nordjyllands Storkreds", listPosition: 6, personalVotes2022: 5500, incumbent: true, notable: "" },
    // Østjyllands Storkreds
    { name: "Nicolai Wammen", party: "A", constituency: "Østjyllands Storkreds", listPosition: 1, personalVotes2022: 18200, incumbent: true, notable: "Finansminister" },
    { name: "Anders Kronborg", party: "A", constituency: "Østjyllands Storkreds", listPosition: 2, personalVotes2022: 7800, incumbent: true, notable: "" },
    { name: "Mogens Jensen", party: "A", constituency: "Østjyllands Storkreds", listPosition: 3, personalVotes2022: 6800, incumbent: true, notable: "" },
    { name: "Per Husted", party: "A", constituency: "Østjyllands Storkreds", listPosition: 4, personalVotes2022: 3500, incumbent: false, notable: "" },
    // Vestjyllands Storkreds
    { name: "Daniel Toft Jakobsen", party: "A", constituency: "Vestjyllands Storkreds", listPosition: 1, personalVotes2022: 10100, incumbent: true, notable: "" },
    { name: "Christian Rabjerg Madsen", party: "A", constituency: "Vestjyllands Storkreds", listPosition: 2, personalVotes2022: 9500, incumbent: true, notable: "" },
    // Sydjyllands Storkreds
    { name: "Benny Engelbrecht", party: "A", constituency: "Sydjyllands Storkreds", listPosition: 1, personalVotes2022: 11200, incumbent: true, notable: "" },
    { name: "Jesper Petersen", party: "A", constituency: "Sydjyllands Storkreds", listPosition: 2, personalVotes2022: 10800, incumbent: true, notable: "" },
    { name: "Birgitte Vind", party: "A", constituency: "Sydjyllands Storkreds", listPosition: 3, personalVotes2022: 6700, incumbent: true, notable: "" },
    { name: "Kris Jensen Skriver", party: "A", constituency: "Sydjyllands Storkreds", listPosition: 4, personalVotes2022: 5200, incumbent: true, notable: "" },
    { name: "Maria Radoor", party: "A", constituency: "Sydjyllands Storkreds", listPosition: 5, personalVotes2022: 2100, incumbent: false, notable: "" },
    { name: "Kim Eskesen", party: "A", constituency: "Sydjyllands Storkreds", listPosition: 6, personalVotes2022: 1800, incumbent: false, notable: "" },
    // Fyns Storkreds
    { name: "Jens Joel", party: "A", constituency: "Fyns Storkreds", listPosition: 1, personalVotes2022: 10800, incumbent: true, notable: "" },
    { name: "Kasper Roug", party: "A", constituency: "Fyns Storkreds", listPosition: 2, personalVotes2022: 7400, incumbent: true, notable: "" },
    { name: "Thomas Skriver Jensen", party: "A", constituency: "Fyns Storkreds", listPosition: 3, personalVotes2022: 2200, incumbent: false, notable: "" },
    // Sjællands Storkreds
    { name: "Trine Bramsen", party: "A", constituency: "Sjællands Storkreds", listPosition: 1, personalVotes2022: 12100, incumbent: true, notable: "" },
    { name: "Mette Kierkgaard", party: "A", constituency: "Sjællands Storkreds", listPosition: 2, personalVotes2022: 6500, incumbent: true, notable: "" },
    { name: "Fie Hækkerup", party: "A", constituency: "Sjællands Storkreds", listPosition: 3, personalVotes2022: 5200, incumbent: false, notable: "" },
    { name: "Frederik Vad", party: "A", constituency: "Sjællands Storkreds", listPosition: 4, personalVotes2022: 4100, incumbent: true, notable: "" },
    // Nordsjællands Storkreds
    { name: "Rasmus Stoklund", party: "A", constituency: "Nordsjællands Storkreds", listPosition: 1, personalVotes2022: 8900, incumbent: true, notable: "" },
    { name: "Louise Mehnke", party: "A", constituency: "Nordsjællands Storkreds", listPosition: 2, personalVotes2022: 3800, incumbent: true, notable: "" },
    // Københavns Omegns Storkreds
    { name: "Mattias Tesfaye", party: "A", constituency: "Københavns Omegns Storkreds", listPosition: 1, personalVotes2022: 16500, incumbent: true, notable: "Minister" },
    { name: "Peter Hummelgaard", party: "A", constituency: "Københavns Omegns Storkreds", listPosition: 2, personalVotes2022: 9800, incumbent: true, notable: "Minister" },
    { name: "Lea Wermelin", party: "A", constituency: "Københavns Omegns Storkreds", listPosition: 3, personalVotes2022: 9100, incumbent: true, notable: "" },
    { name: "Sofie de Bretteville Olsen", party: "A", constituency: "Københavns Omegns Storkreds", listPosition: 4, personalVotes2022: 1500, incumbent: false, notable: "" },
    // Københavns Storkreds
    { name: "Magnus Heunicke", party: "A", constituency: "Københavns Storkreds", listPosition: 1, personalVotes2022: 14800, incumbent: true, notable: "" },
    { name: "Kaare Dybvad Bek", party: "A", constituency: "Københavns Storkreds", listPosition: 2, personalVotes2022: 11200, incumbent: true, notable: "Minister" },
    { name: "Astrid Krag", party: "A", constituency: "Københavns Storkreds", listPosition: 3, personalVotes2022: 10500, incumbent: true, notable: "" },
    { name: "Ida Auken", party: "A", constituency: "Københavns Storkreds", listPosition: 4, personalVotes2022: 8700, incumbent: true, notable: "" },
    // Bornholms Storkreds
    { name: "Morten Dahlin", party: "A", constituency: "Bornholms Storkreds", listPosition: 1, personalVotes2022: 4200, incumbent: false, notable: "" },

    // ===== RADIKALE VENSTRE (B) =====
    { name: "Martin Lidegaard", party: "B", constituency: "Københavns Storkreds", listPosition: 1, personalVotes2022: 15200, incumbent: true, notable: "Partiformand" },
    { name: "Samira Nawa", party: "B", constituency: "Københavns Storkreds", listPosition: 2, personalVotes2022: 7800, incumbent: true, notable: "" },
    { name: "Stinus Lindgreen", party: "B", constituency: "Københavns Storkreds", listPosition: 3, personalVotes2022: 4500, incumbent: true, notable: "" },
    { name: "Magnus Georg Jensen", party: "B", constituency: "Københavns Storkreds", listPosition: 4, personalVotes2022: 2800, incumbent: false, notable: "" },
    { name: "Zenia Stampe", party: "B", constituency: "Københavns Omegns Storkreds", listPosition: 1, personalVotes2022: 5500, incumbent: true, notable: "" },
    { name: "Christian Friis Bach", party: "B", constituency: "Nordsjællands Storkreds", listPosition: 1, personalVotes2022: 5200, incumbent: true, notable: "" },
    { name: "Lotte Rod", party: "B", constituency: "Østjyllands Storkreds", listPosition: 1, personalVotes2022: 4800, incumbent: true, notable: "" },
    { name: "Katrine Robsøe", party: "B", constituency: "Sjællands Storkreds", listPosition: 1, personalVotes2022: 3900, incumbent: true, notable: "" },
    { name: "Anne Sophie Callesen", party: "B", constituency: "Sydjyllands Storkreds", listPosition: 1, personalVotes2022: 3200, incumbent: true, notable: "" },
    { name: "Anastasia Milthers", party: "B", constituency: "Fyns Storkreds", listPosition: 1, personalVotes2022: 1200, incumbent: false, notable: "" },

    // ===== DET KONSERVATIVE FOLKEPARTI (C) =====
    { name: "Mona Juul", party: "C", constituency: "Østjyllands Storkreds", listPosition: 1, personalVotes2022: 8900, incumbent: true, notable: "Partiformand" },
    { name: "Rasmus Jarlov", party: "C", constituency: "Københavns Storkreds", listPosition: 1, personalVotes2022: 7600, incumbent: true, notable: "" },
    { name: "Mette Abildgaard", party: "C", constituency: "Københavns Storkreds", listPosition: 2, personalVotes2022: 5500, incumbent: true, notable: "" },
    { name: "Mai Mercado", party: "C", constituency: "Fyns Storkreds", listPosition: 1, personalVotes2022: 7200, incumbent: true, notable: "" },
    { name: "Marcus Knuth", party: "C", constituency: "Nordsjællands Storkreds", listPosition: 1, personalVotes2022: 6500, incumbent: true, notable: "" },
    { name: "Brigitte Klintskov Jerkel", party: "C", constituency: "Sjællands Storkreds", listPosition: 1, personalVotes2022: 5200, incumbent: true, notable: "" },
    { name: "Frederik Münster", party: "C", constituency: "Sydjyllands Storkreds", listPosition: 1, personalVotes2022: 4800, incumbent: true, notable: "" },
    { name: "Dan Arnløv", party: "C", constituency: "Sydjyllands Storkreds", listPosition: 2, personalVotes2022: 2500, incumbent: false, notable: "" },
    { name: "Per Larsen", party: "C", constituency: "Nordjyllands Storkreds", listPosition: 1, personalVotes2022: 4100, incumbent: true, notable: "" },
    { name: "Niels Flemming Hansen", party: "C", constituency: "Vestjyllands Storkreds", listPosition: 1, personalVotes2022: 6100, incumbent: true, notable: "" },
    { name: "Katarina Ammitzbøll", party: "C", constituency: "Østjyllands Storkreds", listPosition: 2, personalVotes2022: 3800, incumbent: false, notable: "" },
    { name: "Christina Foldager", party: "C", constituency: "Sydjyllands Storkreds", listPosition: 3, personalVotes2022: 1800, incumbent: false, notable: "" },
    { name: "Kristian Thomsen", party: "C", constituency: "Sydjyllands Storkreds", listPosition: 4, personalVotes2022: 900, incumbent: false, notable: "" },

    // ===== SF – SOCIALISTISK FOLKEPARTI (F) =====
    { name: "Pia Olsen Dyhr", party: "F", constituency: "Københavns Storkreds", listPosition: 1, personalVotes2022: 28500, incumbent: true, notable: "Partiformand" },
    { name: "Carl Valentin", party: "F", constituency: "Københavns Storkreds", listPosition: 2, personalVotes2022: 8200, incumbent: true, notable: "" },
    { name: "Sigurd Agersnap", party: "F", constituency: "Københavns Storkreds", listPosition: 3, personalVotes2022: 6100, incumbent: true, notable: "" },
    { name: "Halime Oguz", party: "F", constituency: "Københavns Storkreds", listPosition: 4, personalVotes2022: 4200, incumbent: true, notable: "" },
    { name: "Astrid Carøe", party: "F", constituency: "Københavns Omegns Storkreds", listPosition: 1, personalVotes2022: 7500, incumbent: true, notable: "" },
    { name: "Jacob Mark", party: "F", constituency: "Nordsjællands Storkreds", listPosition: 1, personalVotes2022: 7800, incumbent: true, notable: "" },
    { name: "Karina Lorentzen Dehnhardt", party: "F", constituency: "Sjællands Storkreds", listPosition: 1, personalVotes2022: 9800, incumbent: true, notable: "" },
    { name: "Charlotte Broman Mølbæk", party: "F", constituency: "Sjællands Storkreds", listPosition: 2, personalVotes2022: 5800, incumbent: true, notable: "" },
    { name: "Theresa Berg Andersen", party: "F", constituency: "Fyns Storkreds", listPosition: 1, personalVotes2022: 7100, incumbent: true, notable: "" },
    { name: "Karsten Hønge", party: "F", constituency: "Fyns Storkreds", listPosition: 2, personalVotes2022: 8900, incumbent: true, notable: "" },
    { name: "Marianne Bigum", party: "F", constituency: "Sydjyllands Storkreds", listPosition: 1, personalVotes2022: 5000, incumbent: true, notable: "" },
    { name: "Magnus Flensborg", party: "F", constituency: "Sydjyllands Storkreds", listPosition: 2, personalVotes2022: 1200, incumbent: false, notable: "" },
    { name: "Lisbeth Bech-Nielsen", party: "F", constituency: "Østjyllands Storkreds", listPosition: 1, personalVotes2022: 8500, incumbent: true, notable: "" },
    { name: "Sofie Lippert", party: "F", constituency: "Østjyllands Storkreds", listPosition: 2, personalVotes2022: 4800, incumbent: true, notable: "" },
    { name: "Torsten Gejl", party: "F", constituency: "Østjyllands Storkreds", listPosition: 3, personalVotes2022: 5100, incumbent: true, notable: "" },
    { name: "Signe Munk", party: "F", constituency: "Vestjyllands Storkreds", listPosition: 1, personalVotes2022: 5500, incumbent: true, notable: "" },
    { name: "Anne Valentina Berthelsen", party: "F", constituency: "Nordjyllands Storkreds", listPosition: 1, personalVotes2022: 5200, incumbent: true, notable: "" },
    { name: "Melina Andersen", party: "F", constituency: "Nordjyllands Storkreds", listPosition: 2, personalVotes2022: 2100, incumbent: false, notable: "" },
    { name: "Christina Lykke Eriksen", party: "F", constituency: "Nordjyllands Storkreds", listPosition: 3, personalVotes2022: 1500, incumbent: false, notable: "" },
    { name: "Nana Barnebjerg", party: "F", constituency: "Fyns Storkreds", listPosition: 3, personalVotes2022: 1100, incumbent: false, notable: "" },

    // ===== BORGERNES PARTI (H) =====
    { name: "Lars Boje Mathiesen", party: "H", constituency: "Østjyllands Storkreds", listPosition: 1, personalVotes2022: 12100, incumbent: true, notable: "Partiformand" },
    { name: "Jørn Dohrmann", party: "H", constituency: "Sydjyllands Storkreds", listPosition: 1, personalVotes2022: 4800, incumbent: false, notable: "Fhv. MEP" },
    { name: "Ib Poulsen", party: "H", constituency: "Nordjyllands Storkreds", listPosition: 1, personalVotes2022: 3200, incumbent: false, notable: "" },
    { name: "Karsten Byrgesen", party: "H", constituency: "Sydjyllands Storkreds", listPosition: 2, personalVotes2022: 1500, incumbent: false, notable: "" },
    { name: "Jan Køpke Christensen", party: "H", constituency: "Sydjyllands Storkreds", listPosition: 3, personalVotes2022: 1200, incumbent: false, notable: "" },
    { name: "Niels M. Christensen", party: "H", constituency: "Nordjyllands Storkreds", listPosition: 2, personalVotes2022: 800, incumbent: false, notable: "" },
    { name: "John Bjerg", party: "H", constituency: "Nordjyllands Storkreds", listPosition: 3, personalVotes2022: 600, incumbent: false, notable: "" },
    { name: "Nadja Natalie Isaksen", party: "H", constituency: "Sydjyllands Storkreds", listPosition: 4, personalVotes2022: 500, incumbent: false, notable: "" },
    { name: "Mette Thiesen", party: "H", constituency: "Københavns Omegns Storkreds", listPosition: 1, personalVotes2022: 4500, incumbent: false, notable: "" },
    { name: "Peter Seier Christensen", party: "H", constituency: "Østjyllands Storkreds", listPosition: 2, personalVotes2022: 2200, incumbent: false, notable: "" },

    // ===== LIBERAL ALLIANCE (I) =====
    { name: "Alex Vanopslagh", party: "I", constituency: "Østjyllands Storkreds", listPosition: 1, personalVotes2022: 32100, incumbent: true, notable: "Partiformand, statsministerkandidat" },
    { name: "Ole Birk Olesen", party: "I", constituency: "Københavns Omegns Storkreds", listPosition: 1, personalVotes2022: 11200, incumbent: true, notable: "" },
    { name: "Steffen Larsen", party: "I", constituency: "Sydjyllands Storkreds", listPosition: 1, personalVotes2022: 7800, incumbent: true, notable: "" },
    { name: "Helena Artmann Andresen", party: "I", constituency: "Østjyllands Storkreds", listPosition: 2, personalVotes2022: 6500, incumbent: true, notable: "" },
    { name: "Sólbjørg Jakobsen", party: "I", constituency: "Nordjyllands Storkreds", listPosition: 1, personalVotes2022: 5800, incumbent: true, notable: "" },
    { name: "Lars-Christian Brask", party: "I", constituency: "Nordsjællands Storkreds", listPosition: 1, personalVotes2022: 7200, incumbent: true, notable: "" },
    { name: "Katrine Daugaard", party: "I", constituency: "Fyns Storkreds", listPosition: 1, personalVotes2022: 5400, incumbent: true, notable: "" },
    { name: "Jens Meilvang", party: "I", constituency: "Vestjyllands Storkreds", listPosition: 1, personalVotes2022: 5100, incumbent: true, notable: "" },
    { name: "Hanna Freja Roager", party: "I", constituency: "Københavns Storkreds", listPosition: 1, personalVotes2022: 5200, incumbent: false, notable: "" },
    { name: "Alexander Ryle", party: "I", constituency: "Københavns Storkreds", listPosition: 2, personalVotes2022: 4500, incumbent: true, notable: "" },
    { name: "Louise Brown", party: "I", constituency: "Sjællands Storkreds", listPosition: 1, personalVotes2022: 3800, incumbent: false, notable: "" },
    { name: "HP Beck", party: "I", constituency: "Nordjyllands Storkreds", listPosition: 2, personalVotes2022: 2800, incumbent: false, notable: "" },
    { name: "Bo Ritterbusch", party: "I", constituency: "Nordjyllands Storkreds", listPosition: 3, personalVotes2022: 2200, incumbent: false, notable: "" },
    { name: "Malte Jäger", party: "I", constituency: "Fyns Storkreds", listPosition: 2, personalVotes2022: 1500, incumbent: false, notable: "" },
    { name: "Mads Dahl", party: "I", constituency: "Sydjyllands Storkreds", listPosition: 2, personalVotes2022: 3500, incumbent: false, notable: "" },

    // ===== MODERATERNE (M) =====
    { name: "Lars Løkke Rasmussen", party: "M", constituency: "Sjællands Storkreds", listPosition: 1, personalVotes2022: 52300, incumbent: true, notable: "Partiformand, fhv. statsminister" },
    { name: "Jakob Engel-Schmidt", party: "M", constituency: "Københavns Storkreds", listPosition: 1, personalVotes2022: 8200, incumbent: true, notable: "Minister" },
    { name: "Jon Stephensen", party: "M", constituency: "Københavns Storkreds", listPosition: 2, personalVotes2022: 6100, incumbent: true, notable: "" },
    { name: "Jeppe Søe", party: "M", constituency: "Nordsjællands Storkreds", listPosition: 1, personalVotes2022: 5100, incumbent: true, notable: "" },
    { name: "Mike Fonseca", party: "M", constituency: "Københavns Omegns Storkreds", listPosition: 1, personalVotes2022: 4800, incumbent: true, notable: "" },
    { name: "Monika Rubin", party: "M", constituency: "Østjyllands Storkreds", listPosition: 1, personalVotes2022: 5500, incumbent: true, notable: "" },
    { name: "Henrik Frandsen", party: "M", constituency: "Sydjyllands Storkreds", listPosition: 1, personalVotes2022: 4500, incumbent: true, notable: "Ældreminister" },
    { name: "Frida Bruun", party: "M", constituency: "Sydjyllands Storkreds", listPosition: 2, personalVotes2022: 2200, incumbent: false, notable: "" },
    { name: "Rosa Eriksen", party: "M", constituency: "Fyns Storkreds", listPosition: 1, personalVotes2022: 3500, incumbent: true, notable: "" },
    { name: "Nanna W. Gotfredsen", party: "M", constituency: "Sjællands Storkreds", listPosition: 2, personalVotes2022: 4200, incumbent: true, notable: "" },
    { name: "Ditte Randa", party: "M", constituency: "Nordjyllands Storkreds", listPosition: 1, personalVotes2022: 2800, incumbent: false, notable: "" },
    { name: "Line Randa", party: "M", constituency: "Nordjyllands Storkreds", listPosition: 2, personalVotes2022: 2100, incumbent: false, notable: "" },

    // ===== DANSK FOLKEPARTI (O) =====
    { name: "Morten Messerschmidt", party: "O", constituency: "Sjællands Storkreds", listPosition: 1, personalVotes2022: 18200, incumbent: true, notable: "Partiformand" },
    { name: "Pia Kjærsgaard", party: "O", constituency: "Københavns Omegns Storkreds", listPosition: 1, personalVotes2022: 8100, incumbent: true, notable: "Fhv. formand, stopper" },
    { name: "Alex Ahrendtsen", party: "O", constituency: "Fyns Storkreds", listPosition: 1, personalVotes2022: 5500, incumbent: true, notable: "" },
    { name: "Anders Vistisen", party: "O", constituency: "Nordjyllands Storkreds", listPosition: 1, personalVotes2022: 5200, incumbent: false, notable: "Fhv. MEP" },
    { name: "Nick Zimmermann", party: "O", constituency: "Nordjyllands Storkreds", listPosition: 2, personalVotes2022: 3800, incumbent: true, notable: "" },
    { name: "Peter Kofod", party: "O", constituency: "Sydjyllands Storkreds", listPosition: 1, personalVotes2022: 4500, incumbent: true, notable: "" },
    { name: "Mikkel Bjørn", party: "O", constituency: "Sydjyllands Storkreds", listPosition: 2, personalVotes2022: 3200, incumbent: true, notable: "" },
    { name: "Søren Espersen", party: "O", constituency: "Sjællands Storkreds", listPosition: 2, personalVotes2022: 3800, incumbent: false, notable: "" },
    { name: "René Christensen", party: "O", constituency: "Sjællands Storkreds", listPosition: 3, personalVotes2022: 3500, incumbent: false, notable: "" },
    { name: "Kim Edberg Andersen", party: "O", constituency: "Østjyllands Storkreds", listPosition: 1, personalVotes2022: 3100, incumbent: false, notable: "" },
    { name: "Tobias Weische", party: "O", constituency: "Fyns Storkreds", listPosition: 2, personalVotes2022: 1200, incumbent: false, notable: "" },
    { name: "Romeo Troelsgaard", party: "O", constituency: "Fyns Storkreds", listPosition: 3, personalVotes2022: 800, incumbent: false, notable: "" },

    // ===== VENSTRE (V) =====
    { name: "Troels Lund Poulsen", party: "V", constituency: "Østjyllands Storkreds", listPosition: 1, personalVotes2022: 22800, incumbent: true, notable: "Partiformand, statsministerkandidat" },
    { name: "Sophie Løhde", party: "V", constituency: "Nordsjællands Storkreds", listPosition: 1, personalVotes2022: 14200, incumbent: true, notable: "Minister" },
    { name: "Stephanie Lose", party: "V", constituency: "Sydjyllands Storkreds", listPosition: 1, personalVotes2022: 10200, incumbent: true, notable: "Minister" },
    { name: "Marie Bjerre", party: "V", constituency: "Nordjyllands Storkreds", listPosition: 1, personalVotes2022: 8500, incumbent: true, notable: "Minister" },
    { name: "Preben Bang Henriksen", party: "V", constituency: "Nordjyllands Storkreds", listPosition: 2, personalVotes2022: 6500, incumbent: true, notable: "" },
    { name: "Morten Dahlin", party: "V", constituency: "Sjællands Storkreds", listPosition: 1, personalVotes2022: 9500, incumbent: true, notable: "" },
    { name: "Erling Bonnesen", party: "V", constituency: "Fyns Storkreds", listPosition: 1, personalVotes2022: 8200, incumbent: true, notable: "Stopper" },
    { name: "Torsten Schack Pedersen", party: "V", constituency: "Vestjyllands Storkreds", listPosition: 1, personalVotes2022: 7800, incumbent: true, notable: "" },
    { name: "Thomas Danielsen", party: "V", constituency: "Sydjyllands Storkreds", listPosition: 2, personalVotes2022: 5900, incumbent: true, notable: "" },
    { name: "Louise Schack Elholm", party: "V", constituency: "Sjællands Storkreds", listPosition: 2, personalVotes2022: 5200, incumbent: true, notable: "" },
    { name: "Peter Juel-Jensen", party: "V", constituency: "Københavns Omegns Storkreds", listPosition: 1, personalVotes2022: 5500, incumbent: true, notable: "" },
    { name: "Anne Honoré Østergaard", party: "V", constituency: "Fyns Storkreds", listPosition: 2, personalVotes2022: 5100, incumbent: true, notable: "" },
    { name: "Anni Matthiesen", party: "V", constituency: "Sydjyllands Storkreds", listPosition: 3, personalVotes2022: 6400, incumbent: true, notable: "" },
    { name: "Jan E. Jørgensen", party: "V", constituency: "Københavns Storkreds", listPosition: 1, personalVotes2022: 6800, incumbent: true, notable: "" },
    { name: "Heidi Bank", party: "V", constituency: "Vestjyllands Storkreds", listPosition: 2, personalVotes2022: 4600, incumbent: true, notable: "" },
    { name: "Christoffer Aagaard Melson", party: "V", constituency: "Østjyllands Storkreds", listPosition: 2, personalVotes2022: 7200, incumbent: true, notable: "" },
    { name: "Amanda Heitmann", party: "V", constituency: "Fyns Storkreds", listPosition: 3, personalVotes2022: 1500, incumbent: false, notable: "" },
    { name: "Nikolaj Leed Henriksen", party: "V", constituency: "Fyns Storkreds", listPosition: 4, personalVotes2022: 1200, incumbent: false, notable: "" },
    { name: "Sofie Mosgaard", party: "V", constituency: "Fyns Storkreds", listPosition: 5, personalVotes2022: 1000, incumbent: false, notable: "" },
    { name: "Kim Valentin", party: "V", constituency: "Nordsjællands Storkreds", listPosition: 2, personalVotes2022: 5800, incumbent: true, notable: "" },

    // ===== DANMARKSDEMOKRATERNE (Æ) =====
    { name: "Inger Støjberg", party: "Æ", constituency: "Nordjyllands Storkreds", listPosition: 1, personalVotes2022: 47211, incumbent: true, notable: "Partiformand" },
    { name: "Dennis Flydtkjær", party: "Æ", constituency: "Nordjyllands Storkreds", listPosition: 2, personalVotes2022: 8500, incumbent: true, notable: "" },
    { name: "Betina Kastbjerg", party: "Æ", constituency: "Nordjyllands Storkreds", listPosition: 3, personalVotes2022: 4200, incumbent: true, notable: "" },
    { name: "Peter Skaarup", party: "Æ", constituency: "Sjællands Storkreds", listPosition: 1, personalVotes2022: 7500, incumbent: true, notable: "" },
    { name: "Hans Kristian Skibby", party: "Æ", constituency: "Sjællands Storkreds", listPosition: 2, personalVotes2022: 5500, incumbent: true, notable: "" },
    { name: "Lise Bech", party: "Æ", constituency: "Sjællands Storkreds", listPosition: 3, personalVotes2022: 4200, incumbent: true, notable: "" },
    { name: "Susie Jessen", party: "Æ", constituency: "Sydjyllands Storkreds", listPosition: 1, personalVotes2022: 7200, incumbent: true, notable: "" },
    { name: "Karina Adsbøl", party: "Æ", constituency: "Sydjyllands Storkreds", listPosition: 2, personalVotes2022: 6200, incumbent: true, notable: "" },
    { name: "Jens Henrik Thulesen Dahl", party: "Æ", constituency: "Fyns Storkreds", listPosition: 1, personalVotes2022: 6800, incumbent: true, notable: "" },
    { name: "Kim Edberg Andersen", party: "Æ", constituency: "Østjyllands Storkreds", listPosition: 1, personalVotes2022: 5100, incumbent: true, notable: "" },
    { name: "Mads Fuglede", party: "Æ", constituency: "Østjyllands Storkreds", listPosition: 2, personalVotes2022: 4500, incumbent: true, notable: "Fhv. Venstre" },
    { name: "Nils Sjøberg", party: "Æ", constituency: "Vestjyllands Storkreds", listPosition: 1, personalVotes2022: 3800, incumbent: true, notable: "" },
    { name: "Annette Lind", party: "Æ", constituency: "Københavns Omegns Storkreds", listPosition: 1, personalVotes2022: 3200, incumbent: false, notable: "" },
    { name: "Jakob Næsager", party: "Æ", constituency: "Nordsjællands Storkreds", listPosition: 1, personalVotes2022: 3000, incumbent: false, notable: "" },

    // ===== ENHEDSLISTEN (Ø) =====
    { name: "Pelle Dragsted", party: "Ø", constituency: "Københavns Storkreds", listPosition: 1, personalVotes2022: 18500, incumbent: true, notable: "Politisk ordfører" },
    { name: "Mai Villadsen", party: "Ø", constituency: "Københavns Storkreds", listPosition: 2, personalVotes2022: 12200, incumbent: true, notable: "" },
    { name: "Rosa Lund", party: "Ø", constituency: "Københavns Storkreds", listPosition: 3, personalVotes2022: 8500, incumbent: true, notable: "" },
    { name: "Pil Christensen", party: "Ø", constituency: "Københavns Storkreds", listPosition: 4, personalVotes2022: 4100, incumbent: false, notable: "" },
    { name: "Jette Gottlieb", party: "Ø", constituency: "Københavns Storkreds", listPosition: 5, personalVotes2022: 6200, incumbent: true, notable: "" },
    { name: "Victoria Velásquez", party: "Ø", constituency: "Københavns Storkreds", listPosition: 6, personalVotes2022: 5100, incumbent: true, notable: "" },
    { name: "Søren Søndergaard", party: "Ø", constituency: "Københavns Omegns Storkreds", listPosition: 1, personalVotes2022: 6800, incumbent: true, notable: "" },
    { name: "Søren Egge Rasmussen", party: "Ø", constituency: "Østjyllands Storkreds", listPosition: 1, personalVotes2022: 7800, incumbent: true, notable: "" },
    { name: "Nikoline Erbs Hillers-Bendtsen", party: "Ø", constituency: "Østjyllands Storkreds", listPosition: 2, personalVotes2022: 3500, incumbent: false, notable: "" },
    { name: "Trine Pertou Mach", party: "Ø", constituency: "Nordsjællands Storkreds", listPosition: 1, personalVotes2022: 4500, incumbent: false, notable: "" },
    { name: "Jakob Sølvhøj", party: "Ø", constituency: "Sjællands Storkreds", listPosition: 1, personalVotes2022: 4200, incumbent: true, notable: "" },
    { name: "Rune Lund", party: "Ø", constituency: "Københavns Storkreds", listPosition: 7, personalVotes2022: 4800, incumbent: true, notable: "" },

    // ===== ALTERNATIVET (Å) =====
    { name: "Franciska Rosenkilde", party: "Å", constituency: "Københavns Storkreds", listPosition: 1, personalVotes2022: 10200, incumbent: true, notable: "Partiformand" },
    { name: "Theresa Scavenius", party: "Å", constituency: "Københavns Storkreds", listPosition: 2, personalVotes2022: 5500, incumbent: true, notable: "" },
    { name: "Christina Olumeko", party: "Å", constituency: "Københavns Storkreds", listPosition: 3, personalVotes2022: 4200, incumbent: true, notable: "" },
    { name: "Torsten Gejl", party: "Å", constituency: "Østjyllands Storkreds", listPosition: 1, personalVotes2022: 4800, incumbent: true, notable: "" },
    { name: "Helene Liliendahl Brydensholt", party: "Å", constituency: "Nordsjællands Storkreds", listPosition: 1, personalVotes2022: 2100, incumbent: true, notable: "" },
    { name: "Coco Mette Cecilie Kjærgaard", party: "Å", constituency: "Sydjyllands Storkreds", listPosition: 1, personalVotes2022: 800, incumbent: false, notable: "" },
    { name: "Sascha Faxe", party: "Å", constituency: "Sjællands Storkreds", listPosition: 1, personalVotes2022: 2200, incumbent: false, notable: "" },
];

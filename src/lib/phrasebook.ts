/**
 * Regional dialect & eco-etiquette phrasebook — pure data, safe for client
 * import. Phrases are commonly documented greetings, thanks and trail questions;
 * `lang` feeds the Web Speech Synthesis API for pronunciation.
 */

export type Phrase = {
  text: string; // in Latin script
  hindi?: string; // Devanagari where apt
  meaning: string;
  lang: string; // BCP-47 hint for speechSynthesis
};

export type Dialect = {
  id: string;
  region: string;
  dialect: string;
  where: string;
  phrases: Phrase[];
  taboos: string[];
};

export const DIALECTS: Dialect[] = [
  {
    id: "himachal",
    region: "Himachal Pradesh",
    dialect: "Kullvi & Pahadi",
    where: "Kasol, Tirthan, Jibhi, Manali",
    phrases: [
      { text: "Julley", meaning: "Hello / thanks / all good — the all-purpose greeting", lang: "hi-IN" },
      { text: "Kaise ho sahab?", hindi: "कैसे हो?", meaning: "How are you? (warm, to elders or friends alike)", lang: "hi-IN" },
      { text: "Dhanyawad", hindi: "धन्यवाद", meaning: "Thank you", lang: "hi-IN" },
      { text: "Kitne door hai?", hindi: "कितने दूर है?", meaning: "How far is it? (trails are measured in hours, not km)", lang: "hi-IN" },
      { text: "Pani kahan milega?", hindi: "पानी कहाँ मिलेगा?", meaning: "Where can I get water? (springs are sacred — don't wash in them)", lang: "hi-IN" },
    ],
    taboos: [
      "Devta (deity) temple courtyards: shoes off, leather items out, no photography without asking.",
      "Sacred groves are devthans — do not pluck, break or carry anything out of them.",
      "Don't wash, soap or rinse cookware in natural springs — drinking water for whole villages.",
    ],
  },
  {
    id: "ladakh",
    region: "Ladakh & Zanskar",
    dialect: "Bhoti",
    where: "Leh, Nubra, Pangong, Zanskar",
    phrases: [
      { text: "Julley", meaning: "Hello, goodbye, please, thank you — one word carries the whole day", lang: "hi-IN" },
      { text: "Khamzang in-a lay?", meaning: "How are you? (lay is the polite particle)", lang: "hi-IN" },
      { text: "Ngi ming … in", meaning: "My name is …", lang: "hi-IN" },
      { text: "Chu thugjcje", meaning: "Thank you (water-polite form)", lang: "hi-IN" },
      { text: "Chang! Nga yor ma yin", meaning: "No thank you — I don't drink chang (barley beer)", lang: "hi-IN" },
    ],
    taboos: [
      "Mani (prayer) stones: circumambulate clockwise only; never sit on or climb the walls.",
      "Never photograph people mid-prayer without asking; some monasteries ban photos inside entirely.",
      "Do not wash in or pollute high-altitude streams — every one feeds a village or a monastery.",
    ],
  },
  {
    id: "garhwal",
    region: "Uttarakhand (Devbhoomi)",
    dialect: "Garhwali & Kumaoni",
    where: "Rishikesh, Chopta, Kausani, Munsiyari",
    phrases: [
      { text: "Ram Ram", meaning: "Universal greeting in the hills — reply in kind", lang: "hi-IN" },
      { text: "Bwari chhe?", meaning: "Are you well? (Garhwali)", lang: "hi-IN" },
      { text: "Thair chhan?", meaning: "Where are you going? — the trail question", lang: "hi-IN" },
      { text: "Mya khaana khaa li", meaning: "I have eaten — the polite way to decline more food", lang: "hi-IN" },
      { text: "Prasad swikar", meaning: "Accepting temple offering — receive with the right hand", lang: "hi-IN" },
    ],
    taboos: [
      "Devbhoomi: never carry meat or alcohol above temple villages unless explicitly permitted.",
      "Banderjung (monkey troop) roads: don't feed — fed troops raid crops the village depends on.",
      "Never urinate or discard waste in or near waterfalls — many are living shrines (dhaara).",
    ],
  },
  {
    id: "konkan",
    region: "Konkan Coast",
    dialect: "Konkani",
    where: "Goa, Gokarna, Malvan, Karwar",
    phrases: [
      { text: "Dev borem korum", meaning: "Thank you — literally 'may God do good to you'", lang: "hi-IN" },
      { text: "Kitem asa?", meaning: "What's happening? / how are things?", lang: "hi-IN" },
      { text: "Kitlo zalo?", meaning: "How much is it? (the fish-market essential)", lang: "hi-IN" },
      { text: "Udo ghe", meaning: "Take rest — the coastal welcome", lang: "hi-IN" },
      { text: "Bhuk lagla", meaning: "I'm hungry — doors open when you say this", lang: "hi-IN" },
    ],
    taboos: [
      "Fish-drying lanes are livelihood, not scenery — walk around, never through, the spread.",
      "Never trample turtle-nesting beaches (Feb–Apr); follow dune paths and lighting rules.",
      "Don't treat sacred groves (raakhni) as picnic spots — offerings and boundaries are living custom.",
    ],
  },
  {
    id: "kerala",
    region: "Kerala",
    dialect: "Malayalam",
    where: "Wayanad, Munnar, Varkala, Alleppey",
    phrases: [
      { text: "Namaskaram", meaning: "Respectful greeting", lang: "hi-IN" },
      { text: "Sugamano?", meaning: "How are you / are you well?", lang: "hi-IN" },
      { text: "Ente peru …", meaning: "My name is …", lang: "hi-IN" },
      { text: "Nanni", meaning: "Thank you", lang: "hi-IN" },
      { text: "Ethra aakum?", meaning: "How much does it cost?", lang: "hi-IN" },
    ],
    taboos: [
      "Temple dress codes are strict — no shoes, no shoulder-baring inside the walls.",
      "Backwater banks are washing ghats — don't refill bottles downstream of soap.",
      "Never step on the kolam (rice-flour threshold art); walk around it.",
    ],
  },
  {
    id: "rajasthan",
    region: "Rajasthan",
    dialect: "Marwari & Bishnoi custom",
    where: "Jaisalmer, Jodhpur, Pushkar, Bikaner",
    phrases: [
      { text: "Khamma Ghani", meaning: "Deep-respect greeting — the reply is 'Ghani Ghani'", lang: "hi-IN" },
      { text: "Ram Ram sa", meaning: "Everyday greeting, sa is the respectful particle", lang: "hi-IN" },
      { text: "Kitelo?", meaning: "How much? (bazaar arithmetic)", lang: "hi-IN" },
      { text: "Pani chhe?", meaning: "Is there water? (desert courtesy)", lang: "hi-IN" },
      { text: "Padharo mhare desh", meaning: "Welcome to our land — what you'll hear at every thali", lang: "hi-IN" },
    ],
    taboos: [
      "Bishnoi villages: khejri trees and wildlife are protected by vow — never cut, hunt or disturb.",
      "Don't photograph women drawing water without asking — village wells are private rhythm, not a photo op.",
      "Pushkar lake ghats: shoes off, no smoking, no non-veg anywhere in the holy town.",
    ],
  },
];

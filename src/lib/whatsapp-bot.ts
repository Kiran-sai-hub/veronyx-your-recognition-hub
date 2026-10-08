import { currentEmployee } from "@/lib/mock-data";

/** Deterministic WhatsApp bot script for the frontline simulator. */
export type BotLanguage = "en" | "ta" | "hi";
export type BotState = {
  joined: boolean;
  stopped: boolean;
  language: BotLanguage;
  balance: number;
};

export const initialBotState: BotState = {
  joined: false,
  stopped: false,
  language: "en",
  balance: currentEmployee.points,
};

const copy: Record<BotLanguage, Record<string, string>> = {
  en: {
    welcome:
      "Welcome to Radha Krishna Mills rewards! Reply BALANCE, REDEEM, THANKS <name>, LANG or STOP.",
    balance: "Your balance is {n} points.",
    redeem: "Open this secure link to choose a reward: rkm.rewards/r/8XK2 (valid 15 minutes).",
    thanks: "Thank you sent to {name}. They'll be notified.",
    lang: "Language set to English.",
    stop: "You won't get messages any more. Reply JOIN to start again.",
    join: "Please reply JOIN first.",
    unknown: "Sorry, I didn't understand. Reply BALANCE, REDEEM, THANKS <name>, LANG or STOP.",
  },
  ta: {
    welcome:
      "ராதா கிருஷ்ணா மில்ஸ் வெகுமதிகளுக்கு வரவேற்கிறோம்! BALANCE, REDEEM, THANKS <பெயர்>, LANG அல்லது STOP அனுப்பவும்.",
    balance: "உங்கள் இருப்பு {n} புள்ளிகள்.",
    redeem: "வெகுமதியைத் தேர்ந்தெடுக்க இந்த இணைப்பைத் திறக்கவும்: rkm.rewards/r/8XK2 (15 நிமிடம்).",
    thanks: "{name} அவர்களுக்கு நன்றி அனுப்பப்பட்டது.",
    lang: "மொழி தமிழாக மாற்றப்பட்டது.",
    stop: "இனி செய்திகள் வராது. மீண்டும் தொடங்க JOIN அனுப்பவும்.",
    join: "முதலில் JOIN அனுப்பவும்.",
    unknown: "மன்னிக்கவும், புரியவில்லை. BALANCE, REDEEM, THANKS, LANG அல்லது STOP அனுப்பவும்.",
  },
  hi: {
    welcome:
      "राधा कृष्णा मिल्स रिवॉर्ड्स में स्वागत है! BALANCE, REDEEM, THANKS <नाम>, LANG या STOP भेजें।",
    balance: "आपका बैलेंस {n} पॉइंट है।",
    redeem: "इनाम चुनने के लिए यह लिंक खोलें: rkm.rewards/r/8XK2 (15 मिनट)।",
    thanks: "{name} को धन्यवाद भेजा गया।",
    lang: "भाषा हिंदी कर दी गई।",
    stop: "अब आपको संदेश नहीं मिलेंगे। फिर से शुरू करने के लिए JOIN भेजें।",
    join: "पहले JOIN भेजें।",
    unknown: "माफ़ कीजिए, समझ नहीं आया। BALANCE, REDEEM, THANKS, LANG या STOP भेजें।",
  },
};

export function botReply(input: string, state: BotState): { reply: string; state: BotState } {
  const text = input.trim();
  const [rawCommand = "", ...rest] = text.split(/\s+/);
  const command = rawCommand.toUpperCase();
  const t = (key: string, lang: BotLanguage = state.language) =>
    copy[lang][key] ?? copy.en[key] ?? "";

  if (command === "JOIN") {
    const next = { ...state, joined: true, stopped: false };
    return { reply: t("welcome"), state: next };
  }
  if (!state.joined || state.stopped) return { reply: t("join"), state };

  switch (command) {
    case "BALANCE":
      return { reply: t("balance").replace("{n}", state.balance.toLocaleString("en-IN")), state };
    case "REDEEM":
      return { reply: t("redeem"), state };
    case "THANKS": {
      const name = rest.join(" ").slice(0, 40);
      if (!name) return { reply: t("unknown"), state };
      return { reply: t("thanks").replace("{name}", name), state };
    }
    case "LANG": {
      const order: BotLanguage[] = ["en", "ta", "hi"];
      const requested = rest[0]?.toLowerCase();
      const language = order.includes(requested as BotLanguage)
        ? (requested as BotLanguage)
        : (order[(order.indexOf(state.language) + 1) % order.length] ?? "en");
      return { reply: t("lang", language), state: { ...state, language } };
    }
    case "STOP":
      return { reply: t("stop"), state: { ...state, stopped: true } };
    default:
      return { reply: t("unknown"), state };
  }
}

export function recognitionNotification(language: BotLanguage): string {
  const msgs: Record<BotLanguage, string> = {
    en: "🎉 Arun Kumar recognised you: “Quality champion” — +250 points. Reply THANKS Arun to say thank you.",
    ta: "🎉 அருண் குமார் உங்களைப் பாராட்டினார்: “தர சாம்பியன்” — +250 புள்ளிகள்.",
    hi: "🎉 अरुण कुमार ने आपको सराहा: “क्वालिटी चैंपियन” — +250 पॉइंट।",
  };
  return msgs[language];
}

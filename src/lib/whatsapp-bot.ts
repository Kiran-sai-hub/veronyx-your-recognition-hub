import { me } from "@/lib/employee-data";

/** Deterministic WhatsApp bot script for the frontline simulator (checklist §3.5). */
export type BotLanguage = "en" | "ta" | "hi";
export type BotState = {
  joined: boolean;
  stopped: boolean;
  language: BotLanguage;
  balance: number;
  /** Set after a recognition push so "1" / "2" replies make sense. */
  lastNotification: boolean;
};

export const initialBotState: BotState = {
  joined: false,
  stopped: false,
  language: "en",
  balance: 1150,
  lastNotification: false,
};

const firstName = me.firstName;

const copy: Record<BotLanguage, Record<string, string>> = {
  en: {
    welcome: `Welcome to Radha Krishna Mills rewards, ${firstName}! ✅ Consent recorded. Reply BALANCE, REDEEM, THANKS @name reason, LANG hi or STOP.`,
    balance: "Balance: {n} Coins. Expiring: 200 on 31 Mar.",
    redeem:
      "🔒 Open this secure link to choose a reward: rkm.rewards/r/8XK2 (OTP protected, valid 15 minutes).",
    thanks: "Sent! {name} received your shoutout 🙌",
    thanksHelp: "To thank someone, send: THANKS @name what they did",
    lang: "Language set to English.",
    stop: "You won't get messages any more. Reply JOIN to start again.",
    join: "Please reply JOIN first.",
    details:
      "📊 Line B weekly output: you made 398 units (#2 of 12). Rule: most units with ≥95% attendance. 250 points were credited.",
    unknown:
      "Sorry, I didn't understand. Reply BALANCE, REDEEM, THANKS @name reason, LANG or STOP.",
    notify: `🎉 ${firstName}, you were ranked #2 on Line B this week! 250 points credited. Reply 1 to redeem, 2 for details.`,
    voucher:
      "🎁 Your Amazon Pay ₹500 voucher is ready. Open the OTP-protected link: rkm.rewards/v/Q71P (expires 08/10/2027).",
  },
  ta: {
    welcome: `ராதா கிருஷ்ணா மில்ஸ் வெகுமதிகளுக்கு வரவேற்கிறோம், ${firstName}! ✅ ஒப்புதல் பதிவு செய்யப்பட்டது. BALANCE, REDEEM, THANKS @பெயர் காரணம், LANG அல்லது STOP அனுப்பவும்.`,
    balance: "இருப்பு: {n} நாணயங்கள். காலாவதி: 200 — 31 மார்ச்.",
    redeem:
      "🔒 வெகுமதியைத் தேர்ந்தெடுக்க இந்த பாதுகாப்பான இணைப்பைத் திறக்கவும்: rkm.rewards/r/8XK2 (15 நிமிடம்).",
    thanks: "அனுப்பப்பட்டது! {name} உங்கள் பாராட்டைப் பெற்றார் 🙌",
    thanksHelp: "நன்றி சொல்ல: THANKS @பெயர் அவர்கள் செய்தது",
    lang: "மொழி தமிழாக மாற்றப்பட்டது.",
    stop: "இனி செய்திகள் வராது. மீண்டும் தொடங்க JOIN அனுப்பவும்.",
    join: "முதலில் JOIN அனுப்பவும்.",
    details:
      "📊 லைன் B வாராந்திர உற்பத்தி: நீங்கள் 398 அலகுகள் (12-ல் #2). 250 புள்ளிகள் வரவு வைக்கப்பட்டன.",
    unknown: "மன்னிக்கவும், புரியவில்லை. BALANCE, REDEEM, THANKS, LANG அல்லது STOP அனுப்பவும்.",
    notify: `🎉 ${firstName}, இந்த வாரம் லைன் B-யில் நீங்கள் #2! 250 புள்ளிகள் வரவு. பெற 1, விவரங்களுக்கு 2 அனுப்பவும்.`,
    voucher: "🎁 உங்கள் Amazon Pay ₹500 வவுச்சர் தயார். OTP இணைப்பு: rkm.rewards/v/Q71P",
  },
  hi: {
    welcome: `राधा कृष्णा मिल्स रिवॉर्ड्स में स्वागत है, ${firstName}! ✅ सहमति दर्ज हुई। BALANCE, REDEEM, THANKS @नाम कारण, LANG या STOP भेजें।`,
    balance: "बैलेंस: {n} कॉइन। समाप्त होंगे: 200 — 31 मार्च।",
    redeem:
      "🔒 इनाम चुनने के लिए यह सुरक्षित लिंक खोलें: rkm.rewards/r/8XK2 (OTP से सुरक्षित, 15 मिनट)।",
    thanks: "भेज दिया! {name} को आपकी शाबाशी मिल गई 🙌",
    thanksHelp: "धन्यवाद देने के लिए भेजें: THANKS @नाम उन्होंने क्या किया",
    lang: "भाषा हिंदी कर दी गई।",
    stop: "अब आपको संदेश नहीं मिलेंगे। फिर से शुरू करने के लिए JOIN भेजें।",
    join: "पहले JOIN भेजें।",
    details: "📊 लाइन B साप्ताहिक उत्पादन: आपने 398 यूनिट बनाईं (12 में #2)। 250 पॉइंट जमा हुए।",
    unknown: "माफ़ कीजिए, समझ नहीं आया। BALANCE, REDEEM, THANKS, LANG या STOP भेजें।",
    notify: `🎉 ${firstName}, इस हफ़्ते लाइन B पर आप #2 रहे! 250 पॉइंट जमा। भुनाने के लिए 1, विवरण के लिए 2 भेजें।`,
    voucher: "🎁 आपका Amazon Pay ₹500 वाउचर तैयार है। OTP लिंक: rkm.rewards/v/Q71P",
  },
};

export function botText(key: string, language: BotLanguage): string {
  return copy[language][key] ?? copy.en[key] ?? "";
}

export function botReply(input: string, state: BotState): { reply: string; state: BotState } {
  const text = input.trim();
  const [rawCommand = "", ...rest] = text.split(/\s+/);
  const command = rawCommand.toUpperCase();
  const t = (key: string, lang: BotLanguage = state.language) => botText(key, lang);

  if (command === "JOIN") {
    return { reply: t("welcome"), state: { ...state, joined: true, stopped: false } };
  }
  if (!state.joined || state.stopped) return { reply: t("join"), state };

  if (command === "1" && state.lastNotification) return { reply: t("redeem"), state };
  if (command === "2" && state.lastNotification) return { reply: t("details"), state };

  switch (command) {
    case "BALANCE":
      return { reply: t("balance").replace("{n}", state.balance.toLocaleString("en-IN")), state };
    case "REDEEM":
      return { reply: t("redeem"), state };
    case "THANKS": {
      const name = (rest[0] ?? "").replace(/^@/, "");
      if (!name) return { reply: t("thanksHelp"), state };
      const display = name.charAt(0).toUpperCase() + name.slice(1);
      return { reply: t("thanks").replace("{name}", display), state };
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
  return botText("notify", language);
}

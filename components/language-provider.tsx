"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Language } from "@/lib/types"

interface Translations {
  [key: string]: {
    en: string
    si: string
    ta: string
  }
}

export const translations: Translations = {
  // Navigation
  home: { en: "Home", si: "මුල් පිටුව", ta: "முகப்பு" },
  map: { en: "Map", si: "සිතියම", ta: "வரைபடம்" },
  list: { en: "List", si: "ලැයිස්තුව", ta: "பட்டியல்" },
  add: { en: "Add Point", si: "ස්ථානය එකතු කරන්න", ta: "சேகரிப்பு இடம் சேர்" },
  report: { en: "Report", si: "වාර්තාව", ta: "புகாரி" },
  admin: { en: "Admin", si: "පරිපාලක", ta: "நிர்வாகி" },

  // Home
  appTitle: { en: "Flood Relief Collection Points", si: "ගංවතුර සහන එකතු කිරීමේ ස්ථාන", ta: "வெள்ள நிவாரண சேகரிப்பு நிலையங்கள்" },
  appSubtitle: { en: "Sri Lanka", si: "ශ්‍රී ලංකාව", ta: "இலங்கை" },
  findPoints: { en: "Find Collection Points", si: "එකතු කිරීමේ ස්ථාන සොයන්න", ta: "சேகரிப்பு இடங்களைக் கண்டறியுங்கள்" },
  addPoint: { en: "Add a Collection Point", si: "එකතු කිරීමේ ස්ථානයක් එක් කරන්න", ta: "சேகரிப்பு இடத்தைச் சேர்க்கவும்" },
  reportIssue: { en: "Report an Issue", si: "ගැටළුවක් වාර්තා කරන්න", ta: "சிக்கலைப் புகாரளியுங்கள்" },

  // Collection Point Details
  itemsCollecting: { en: "Items Collecting", si: "එකතු කරන අයිතම", ta: "சேகரிக்கும் பொருட்கள்" },
  targetAreas: { en: "Target Areas", si: "ඉලක්ක ප්‍රදේශ", ta: "இலக்கு பகுதிகள்" },
  operatingHours: { en: "Operating Hours", si: "ක්‍රියාත්මක වේලාවන්", ta: "இயக்க நேரங்கள்" },
  contact: { en: "Contact", si: "සම්බන්ධ වන්න", ta: "தொடர்பு" },
  callNow: { en: "Call Now", si: "දැන් අමතන්න", ta: "இப்போது அழைக்கவும்" },
  getDirections: { en: "Get Directions", si: "මාර්ග ලබා ගන්න", ta: "திசைகளைப் பெறுங்கள்" },
  reportThis: { en: "Report This Point", si: "මෙම ස්ථානය වාර්තා කරන්න", ta: "இந்த இடத்தைப் புகாரளியுங்கள்" },

  // Filters
  filterBy: { en: "Filter By", si: "පෙරන්න", ta: "வடிகட்டு" },
  nearest: { en: "Nearest", si: "ආසන්නම", ta: "அருகிலுள்ள" },
  urgentOnly: { en: "Urgent Needs Only", si: "හදිසි අවශ්‍යතා පමණි", ta: "அவசரத் தேவைகள் மட்டும்" },
  allItems: { en: "All Items", si: "සියලුම අයිතම", ta: "அனைத்து பொருட்கள்" },

  // Status
  active: { en: "Active", si: "ක්‍රියාකාරී", ta: "செயலில்" },
  temporarilyClosed: { en: "Temporarily Closed", si: "තාවකාලිකව වසා ඇත", ta: "தற்காலிகமாக மூடப்பட்டது" },
  fullyCollected: { en: "Fully Collected", si: "සම්පූර්ණයෙන් එකතු කරන ලදි", ta: "முழுமையாக சேகரிக்கப்பட்டது" },
  notAccepting: { en: "Not Accepting Items", si: "භාණ්ඩ භාර නොගනී", ta: "பொருட்கள் ஏற்கப்படவில்லை" },

  // Urgency
  low: { en: "Low", si: "අඩු", ta: "குறைவு" },
  normal: { en: "Normal", si: "සාමාන්‍ය", ta: "சாதாரண" },
  high: { en: "High", si: "ඉහළ", ta: "உயர்" },
  critical: { en: "Critical", si: "තීරණාත්මක", ta: "முக்கியமான" },

  // Form
  submit: { en: "Submit", si: "යොමු කරන්න", ta: "சமர்ப்பிக்கவும்" },
  cancel: { en: "Cancel", si: "අවලංගු කරන්න", ta: "ரத்து செய்" },
  save: { en: "Save", si: "සුරකින්න", ta: "சேமி" },

  // Messages
  submittedForApproval: {
    en: "Submitted for approval",
    si: "අනුමැතිය සඳහා ඉදිරිපත් කරන ලදි",
    ta: "ஒப்புதலுக்கு சமர்ப்பிக்கப்பட்டது",
  },
  reportSubmitted: {
    en: "Report submitted successfully",
    si: "වාර්තාව සාර්ථකව ඉදිරිපත් කරන ලදි",
    ta: "புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது",
  },
  error: { en: "An error occurred", si: "දෝෂයක් ඇති විය", ta: "பிழை ஏற்பட்டது" },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    const translation = translations[key]
    if (!translation) return key
    return translation[language] || translation.en || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

/**
 * ========================================================================================
 * FloodWatch India - Universal Language & Translation Engine
 * Full-Website Language Translation with Saved Preference Persistence
 * Supports: English, Hindi, Gujarati, Marathi, Bengali, Tamil, Telugu,
 *           Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu
 * ========================================================================================
 */

const SUPPORTED_LANGUAGES = [
  { code: 'en',  name: 'English',    native: 'English',    flag: '🇬🇧' },
  { code: 'hi',  name: 'Hindi',      native: 'हिन्दी',     flag: '🇮🇳' },
  { code: 'gu',  name: 'Gujarati',   native: 'ગુજરાતી',   flag: '🇮🇳' },
  { code: 'mr',  name: 'Marathi',    native: 'मराठी',      flag: '🇮🇳' },
  { code: 'bn',  name: 'Bengali',    native: 'বাংলা',      flag: '🇮🇳' },
  { code: 'ta',  name: 'Tamil',      native: 'தமிழ்',      flag: '🇮🇳' },
  { code: 'te',  name: 'Telugu',     native: 'తెలుగు',     flag: '🇮🇳' },
  { code: 'kn',  name: 'Kannada',    native: 'ಕನ್ನಡ',      flag: '🇮🇳' },
  { code: 'ml',  name: 'Malayalam',  native: 'മലയാളം',     flag: '🇮🇳' },
  { code: 'pa',  name: 'Punjabi',    native: 'ਪੰਜਾਬੀ',     flag: '🇮🇳' },
  { code: 'or',  name: 'Odia',       native: 'ଓଡ଼ିଆ',       flag: '🇮🇳' },
  { code: 'as',  name: 'Assamese',   native: 'অসমীয়া',    flag: '🇮🇳' },
  { code: 'ur',  name: 'Urdu',       native: 'اردو',       flag: '🇮🇳' }
];

/* ═════════════════════════════════════════════════════════════
   DICTIONARIES FOR INSTANT ZERO-LATENCY UI TRANSLATIONS
   ═════════════════════════════════════════════════════════════ */
const TRANSLATIONS = {
  en: {
    /* Navigation */
    nav_live_map: 'Live Flood Map',
    nav_my_location: 'My Location',
    nav_ml_predictor: 'ML Risk Predictor',
    nav_historical: 'Historical Floods DB',
    nav_trends: 'Flood Frequency Trends',
    nav_relief: 'Relief & Help Centers',
    nav_alerts: 'National Alerts',
    nav_pdf_reports: 'PDF Reports',
    /* Header */
    brand_title: 'FloodWatch India',
    brand_sub: 'FLOOD RISK PREDICT PLATFORM',
    sign_out: 'Sign Out',
    sign_in: 'Sign In',
    sign_up: 'Sign Up Free',
    faqs: 'FAQs',
    profile: 'Profile',
    /* Risk Levels */
    high_risk: 'High Risk',
    medium_risk: 'Medium Risk',
    low_risk: 'Low Risk',
    safe: 'Safe (Normal)',
    /* Statuses */
    loading: 'Loading...',
    calculating: 'Calculating...',
    detecting: 'Detecting user coordinates...',
    live_gps: 'Live GPS Sensor',
    immediate_risk: 'Immediate Risk:',
    /* Actions */
    download_pdf: 'Download PDF Report',
    run_prediction: 'Run ML Flood Risk Prediction',
    select_state: '-- Select State --',
    select_district: '-- Select District --',
    /* PDF Reports */
    pdf_reports_title: 'Flood Risk PDF Reports',
    pdf_reports_subtitle: 'One-click downloadable risk assessment reports',
    pdf_download_location: 'Download My Location Risk PDF',
    pdf_download_state: 'Download State Risk Report PDF',
    pdf_select_state: 'Select a State to Download Report',
    pdf_generating: 'Generating PDF...',
    /* Alerts */
    high_risk_alert: 'HIGH RISK',
    medium_risk_alert: 'MEDIUM RISK',
    normal_alert: 'NORMAL',
    platform_features: 'PLATFORM FEATURES'
  },
  hi: {
    nav_live_map: 'लाइव बाढ़ मानचित्र',
    nav_my_location: 'मेरा स्थान',
    nav_ml_predictor: 'ML जोखिम भविष्यवक्ता',
    nav_historical: 'ऐतिहासिक बाढ़ डेटाबेस',
    nav_trends: 'बाढ़ आवृत्ति रुझान',
    nav_relief: 'राहत और सहायता केंद्र',
    nav_alerts: 'राष्ट्रीय अलर्ट',
    nav_pdf_reports: 'PDF रिपोर्ट',
    brand_title: 'फ्लडवॉच इंडिया',
    brand_sub: 'बाढ़ जोखिम पूर्वानुमान मंच',
    sign_out: 'साइन आउट',
    sign_in: 'साइन इन',
    sign_up: 'निःशुल्क साइन अप करें',
    faqs: 'सामान्य प्रश्न (FAQs)',
    profile: 'प्रोफाइल',
    high_risk: 'उच्च जोखिम',
    medium_risk: 'मध्यम जोखिम',
    low_risk: 'कम जोखिम',
    safe: 'सुरक्षित (सामान्य)',
    loading: 'लोड हो रहा है...',
    calculating: 'गणना की जा रही है...',
    detecting: 'निर्देशांक खोजे जा रहे हैं...',
    live_gps: 'लाइव जीपीएस सेंसर',
    immediate_risk: 'तत्काल जोखिम:',
    download_pdf: 'PDF रिपोर्ट डाउनलोड करें',
    run_prediction: 'ML बाढ़ जोखिम भविष्यवाणी चलाएं',
    select_state: '-- राज्य चुनें --',
    select_district: '-- जिला चुनें --',
    pdf_reports_title: 'बाढ़ जोखिम PDF रिपोर्ट',
    pdf_reports_subtitle: 'एक-क्लिक डाउनलोड करने योग्य जोखिम मूल्यांकन रिपोर्ट',
    pdf_download_location: 'मेरा स्थान जोखिम PDF डाउनलोड करें',
    pdf_download_state: 'राज्य जोखिम रिपोर्ट PDF डाउनलोड करें',
    pdf_select_state: 'रिपोर्ट डाउनलोड करने के लिए राज्य चुनें',
    pdf_generating: 'PDF बनाई जा रही है...',
    high_risk_alert: 'उच्च जोखिम',
    medium_risk_alert: 'मध्यम जोखिम',
    normal_alert: 'सामान्य',
    platform_features: 'प्लेटफ़ॉर्म सुविधाएं'
  },
  gu: {
    nav_live_map: 'લાઈવ પૂર નકશો',
    nav_my_location: 'મારું સ્થાન',
    nav_ml_predictor: 'ML જોખમ આગાહી',
    nav_historical: 'ઐતિહાસિક પૂર ડેટાબેઝ',
    nav_trends: 'પૂર આવૃત્તિ વલણ',
    nav_relief: 'રાહત અને સહાય કેન્દ્રો',
    nav_alerts: 'રાષ્ટ્રીય ચેતવણીઓ',
    nav_pdf_reports: 'PDF અહેવાલ',
    brand_title: 'ફ્લડવોચ ઇન્ડિયા',
    brand_sub: 'પૂર જોખમ આગાહી પ્લેટફોર્મ',
    sign_out: 'સાઇન આઉટ',
    sign_in: 'સાઇન ઇન',
    sign_up: 'મફત સાઇન અપ કરો',
    faqs: 'પ્રશ્નોત્તરી (FAQs)',
    profile: 'પ્રોફાઇલ',
    high_risk: 'ઉચ્ચ જોખમ',
    medium_risk: 'મધ્યમ જોખમ',
    low_risk: 'ઓછું જોખમ',
    safe: 'સુરક્ષિત (સામાન્ય)',
    loading: 'લોડ થઈ રહ્યું છે...',
    calculating: 'ગણતરી ચાલુ છે...',
    detecting: 'સ્થાન શોધાઈ રહ્યું છે...',
    live_gps: 'લાઈવ GPS સેન્સર',
    immediate_risk: 'તાત્કાલિક જોખમ:',
    download_pdf: 'PDF અહેવાલ ડાઉનલોડ કરો',
    run_prediction: 'ML પૂર જોખમ આગાહી ચલાવો',
    select_state: '-- રાજ્ય પસંદ કરો --',
    select_district: '-- જિલ્લો પસંદ કરો --',
    pdf_reports_title: 'પૂર જોખમ PDF અહેવાલો',
    pdf_reports_subtitle: 'એક-ક્લિક ડાઉનલોડ કરી શકાય તેવા જોખમ અહેવાલો',
    pdf_download_location: 'મારા સ્થાનનો જોખમ PDF ડાઉનલોડ કરો',
    pdf_download_state: 'રાજ્ય જોખમ અહેવાલ PDF ડાઉનલોડ કરો',
    pdf_select_state: 'અહેવાલ માટે રાજ્ય પસંદ કરો',
    pdf_generating: 'PDF તૈયાર થઈ રહી છે...',
    high_risk_alert: 'ઉચ્ચ જોખમ',
    medium_risk_alert: 'મધ્યમ જોખમ',
    normal_alert: 'સામાન્ય',
    platform_features: 'પ્લેટફોર્મ સુવિધાઓ'
  },
  mr: {
    nav_live_map: 'थेट पूर नकाशा',
    nav_my_location: 'माझे स्थान',
    nav_ml_predictor: 'ML धोका अंदाज',
    nav_historical: 'ऐतिहासिक पूर डेटाबेस',
    nav_trends: 'पूर वारंवारता कल',
    nav_relief: 'मदत आणि साहाय्य केंद्रे',
    nav_alerts: 'राष्ट्रीय सूचना',
    nav_pdf_reports: 'PDF अहवाल',
    brand_title: 'फ्लडवॉच इंडिया',
    brand_sub: 'पूर धोका अंदाज प्लॅटफॉर्म',
    sign_out: 'साइन आउट',
    sign_in: 'साइन इन',
    sign_up: 'मोफत साइन अप',
    faqs: 'वारंवार विचारले जाणारे प्रश्न',
    profile: 'प्रोफाइल',
    high_risk: 'उच्च धोका',
    medium_risk: 'मध्यम धोका',
    low_risk: 'कमी धोका',
    safe: 'सुरक्षित (सामान्य)',
    loading: 'लोड होत आहे...',
    calculating: 'गणना चालू आहे...',
    detecting: 'स्थान शोधत आहे...',
    live_gps: 'थेट GPS सेन्सर',
    immediate_risk: 'तातडीचा धोका:',
    download_pdf: 'PDF अहवाल डाउनलोड करा',
    run_prediction: 'ML पूर अंदाज चालवा',
    select_state: '-- राज्य निवडा --',
    select_district: '-- जिल्हा निवडा --',
    pdf_reports_title: 'पूर धोका PDF अहवाल',
    pdf_reports_subtitle: 'एक-क्लिक डाउनलोड अहवाल',
    pdf_download_location: 'माझ्या स्थानाचा धोका PDF डाउनलोड',
    pdf_download_state: 'राज्य धोका अहवाल PDF',
    pdf_select_state: 'अहवालासाठी राज्य निवडा',
    pdf_generating: 'PDF तयार होत आहे...',
    high_risk_alert: 'उच्च धोका',
    medium_risk_alert: 'मध्यम धोका',
    normal_alert: 'सामान्य',
    platform_features: 'प्लॅटफॉर्म वैशिष्ट्ये'
  },
  bn: {
    nav_live_map: 'লাইভ বন্যা মানচিত্র',
    nav_my_location: 'আমার অবস্থান',
    nav_ml_predictor: 'ML ঝুঁকি পূর্বাভাস',
    nav_historical: 'ঐতিহাসিক বন্যা ডেটাবেস',
    nav_trends: 'বন্যা পুনরাবৃত্তি প্রবণতা',
    nav_relief: 'ত্রাণ ও সাহায্য কেন্দ্র',
    nav_alerts: 'জাতীয় সতর্কতা',
    nav_pdf_reports: 'PDF প্রতিবেদন',
    brand_title: 'ফ্লাডওয়াচ ইন্ডিয়া',
    brand_sub: 'বন্যা ঝুঁকি পূর্বাভাস প্ল্যাটফর্ম',
    sign_out: 'সাইন আউট',
    sign_in: 'সাইন ইন',
    sign_up: 'বিনামূল্যে সাইন আপ',
    faqs: 'সাধারণ জিজ্ঞাসা',
    profile: 'প্রোফাইল',
    high_risk: 'উচ্চ ঝুঁকি',
    medium_risk: 'মাঝারি ঝুঁকি',
    low_risk: 'স্বল্প ঝুঁকি',
    safe: 'নিরাপদ (স্বাভাবিক)',
    loading: 'লোড হচ্ছে...',
    calculating: 'গণনা হচ্ছে...',
    detecting: 'অবস্থান শনাক্ত করা হচ্ছে...',
    live_gps: 'লাইভ GPS সেন্সর',
    immediate_risk: 'তাৎক্ষণিক ঝুঁকি:',
    download_pdf: 'PDF প্রতিবেদন ডাউনলোড',
    run_prediction: 'ML বন্যা ঝুঁকি পূর্বাভাস চালান',
    select_state: '-- রাজ্য নির্বাচন করুন --',
    select_district: '-- জেলা নির্বাচন করুন --',
    pdf_reports_title: 'বন্যা ঝুঁকি PDF প্রতিবেদন',
    pdf_reports_subtitle: 'এক ক্লিকে ডাউনলোডযোগ্য মূল্যায়ন প্রতিবেদন',
    pdf_download_location: 'আমার অবস্থানের ঝুঁকি PDF ডাউনলোড',
    pdf_download_state: 'রাজ্য ঝুঁকি প্রতিবেদন PDF',
    pdf_select_state: 'প্রতিবেদনের জন্য রাজ্য বাছুন',
    pdf_generating: 'PDF তৈরি হচ্ছে...',
    high_risk_alert: 'উচ্চ ঝুঁকি',
    medium_risk_alert: 'মাঝারি ঝুঁকি',
    normal_alert: 'স্বাভাবিক',
    platform_features: 'প্ল্যাটফর্মের সুবিধাসমূহ'
  },
  ta: {
    nav_live_map: 'நேரலை வெள்ள வரைபடம்',
    nav_my_location: 'எனது இருப்பிடம்',
    nav_ml_predictor: 'ML இடர் கணிப்பு',
    nav_historical: 'வரலாற்று வெள்ளத் தரவு',
    nav_trends: 'வெள்ள அதிர்வெண் போக்கு',
    nav_relief: 'நிவாரண மையங்கள்',
    nav_alerts: 'தேசிய எச்சரிக்கைகள்',
    nav_pdf_reports: 'PDF அறிக்கைகள்',
    brand_title: 'ஃப்ளட்வாட்ச் இந்தியா',
    brand_sub: 'வெள்ள இடர் கணிப்பு தளம்',
    sign_out: 'வெளியேறு',
    sign_in: 'உள்நுழை',
    sign_up: 'இலவச பதிவு',
    faqs: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    profile: 'சுயவிவரம்',
    high_risk: 'அதிக ஆபத்து',
    medium_risk: 'நடுத்தர ஆபத்து',
    low_risk: 'குறைந்த ஆபத்து',
    safe: 'பாதுகாப்பானது (சாதாரண)',
    loading: 'ஏற்றுகிறது...',
    calculating: 'கணக்கிடப்படுகிறது...',
    detecting: 'இருப்பிடம் கண்டறியப்படுகிறது...',
    live_gps: 'நேரலை GPS சென்சார்',
    immediate_risk: 'உடனடி ஆபத்து:',
    download_pdf: 'PDF அறிக்கை பதிவிறக்குக',
    run_prediction: 'ML வெள்ள இடர் கணிப்பை இயக்கு',
    select_state: '-- மாநிலத்தைத் தேர்ந்தெடுக்கவும் --',
    select_district: '-- மாவட்டத்தைத் தேர்ந்தெடுக்கவும் --',
    pdf_reports_title: 'வெள்ள இடர் PDF அறிக்கைகள்',
    pdf_reports_subtitle: 'ஒரே கிளிக்கில் பதிவிறக்கம் செய்யக்கூடிய அறிக்கைகள்',
    pdf_download_location: 'எனது இருப்பிட இடர் PDF',
    pdf_download_state: 'மாநில இடர் அறிக்கை PDF',
    pdf_select_state: 'அறிக்கைக்கு மாநிலத்தை தேர்ந்தெடுக்கவும்',
    pdf_generating: 'PDF உருவாக்கப்படுகிறது...',
    high_risk_alert: 'அதிக ஆபத்து',
    medium_risk_alert: 'நடுத்தர ஆபத்து',
    normal_alert: 'சாதாரண',
    platform_features: 'தள அம்சங்கள்'
  },
  te: {
    nav_live_map: 'లైవ్ వరద మ్యాప్',
    nav_my_location: 'నా స్థానం',
    nav_ml_predictor: 'ML ప్రమాద అంచనా',
    nav_historical: 'చారిత్రక వరద డేటా',
    nav_trends: 'వరద ఫ్రీక్వెన్సీ పోకడలు',
    nav_relief: 'సహాయ కేంద్రాలు',
    nav_alerts: 'జాతీయ హెచ్చరికలు',
    nav_pdf_reports: 'PDF నివేదికలు',
    brand_title: 'ఫ్లడ్‌వాచ్ ఇండియా',
    brand_sub: 'వరద ప్రమాద అంచనా వేదిక',
    sign_out: 'సైన్ అవుట్',
    sign_in: 'సైన్ ఇన్',
    sign_up: 'ఉచితంగా సైన్ అప్',
    faqs: 'తరచుగా అడిగే ప్రశ్నలు',
    profile: 'ప్రొఫైల్',
    high_risk: 'అధిక ప్రమాదం',
    medium_risk: 'మధ్యస్థ ప్రమాదం',
    low_risk: 'తక్కువ ప్రమాదం',
    safe: 'సురక్షితం (సాధారణ)',
    loading: 'లోడ్ అవుతోంది...',
    calculating: 'గణిస్తోంది...',
    detecting: 'స్థానాన్ని గుర్తిస్తోంది...',
    live_gps: 'లైవ్ GPS సెన్సార్',
    immediate_risk: 'తక్షణ ప్రమాదం:',
    download_pdf: 'PDF నివేదిక డౌన్‌లోడ్',
    run_prediction: 'ML వరద ప్రమాద అంచనా వేయి',
    select_state: '-- రాష్ట్రం ఎంచుకోండి --',
    select_district: '-- జిల్లా ఎంచుకోండి --',
    pdf_reports_title: 'వరద ప్రమాద PDF నివేదికలు',
    pdf_reports_subtitle: 'ఒక క్లిక్‌తో డౌన్‌లోడ్ చేసుకోగల నివేదికలు',
    pdf_download_location: 'నా స్థాన ప్రమాద PDF డౌన్‌లోడ్',
    pdf_download_state: 'రాష్ట్ర ప్రమాద నివేదిక PDF',
    pdf_select_state: 'నివేదికకు రాష్ట్రం ఎంచుకోండి',
    pdf_generating: 'PDF తయారవుతోంది...',
    high_risk_alert: 'అధిక ప్రమాదం',
    medium_risk_alert: 'మధ్యస్థ ప్రమాదం',
    normal_alert: 'సాధారణ',
    platform_features: 'ప్లాట్‌ఫారమ్ ఫీచర్లు'
  },
  kn: {
    nav_live_map: 'ನೇರ ಪ್ರವಾಹ ನಕ್ಷೆ',
    nav_my_location: 'ನನ್ನ ಸ್ಥಳ',
    nav_ml_predictor: 'ML ಅಪಾಯ ಮುನ್ಸೂಚನೆ',
    nav_historical: 'ಐತಿಹಾಸಿಕ ಪ್ರವಾಹ ಡೇಟಾ',
    nav_trends: 'ಪ್ರವಾಹ ಆವರ್ತನ ಪ್ರವೃತ್ತಿ',
    nav_relief: 'ಪರಿಹಾರ ಕೇಂದ್ರಗಳು',
    nav_alerts: 'ರಾಷ್ಟ್ರೀಯ ಎಚ್ಚರಿಕೆ',
    nav_pdf_reports: 'PDF ವರದಿಗಳು',
    brand_title: 'ಫ್ಲಡ್‌ವಾಚ್ ಇಂಡಿಯಾ',
    brand_sub: 'ಪ್ರವಾಹ ಅಪಾಯ ಮುನ್ಸೂಚನೆ ವೇದಿಕೆ',
    sign_out: 'ಸೈನ್ ಔಟ್',
    sign_in: 'ಸೈನ್ ಇನ್',
    sign_up: 'ಉಚಿತ ನೋಂದಣಿ',
    faqs: 'ಪ್ರಶ್ನೋತ್ತರಗಳು',
    profile: 'ಪ್ರೊಫೈಲ್',
    high_risk: 'ಅಧಿಕ ಅಪಾಯ',
    medium_risk: 'ಮಧ್ಯಮ ಅಪಾಯ',
    low_risk: 'ಕಡಿಮೆ ಅಪಾಯ',
    safe: 'ಸುರಕ್ಷಿತ (ಸಾಮಾನ್ಯ)',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    calculating: 'ಲೆಕ್ಕ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    detecting: 'ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    live_gps: 'ನೇರ GPS ಸೆನ್ಸರ್',
    immediate_risk: 'ತಕ್ಷಣದ ಅಪಾಯ:',
    download_pdf: 'PDF ವರದಿ ಡೌನ್‌ಲೋಡ್',
    run_prediction: 'ML ಪ್ರವಾಹ ಅಪಾಯ ಮುನ್ಸೂಚನೆ ಚಾಲನೆ',
    select_state: '-- ರಾಜ್ಯ ಆಯ್ಕೆ ಮಾಡಿ --',
    select_district: '-- ಜಿಲ್ಲೆ ಆಯ್ಕೆ ಮಾಡಿ --',
    pdf_reports_title: 'ಪ್ರವಾಹ ಅಪಾಯ PDF ವರದಿಗಳು',
    pdf_reports_subtitle: 'ಒಂದು-ಕ್ಲಿಕ್ ಡೌನ್‌ಲೋಡ್ ವರದಿಗಳು',
    pdf_download_location: 'ನನ್ನ ಸ್ಥಳದ ಅಪಾಯ PDF ಡೌನ್‌ಲೋಡ್',
    pdf_download_state: 'ರಾಜ್ಯ ಅಪಾಯ ವರದಿ PDF',
    pdf_select_state: 'ವರದಿಗೆ ರಾಜ್ಯ ಆಯ್ಕೆ ಮಾಡಿ',
    pdf_generating: 'PDF ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    high_risk_alert: 'ಅಧಿಕ ಅಪಾಯ',
    medium_risk_alert: 'ಮಧ್ಯಮ ಅಪಾಯ',
    normal_alert: 'ಸಾಮಾನ್ಯ',
    platform_features: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ವೈಶಿಷ್ಟ್ಯಗಳು'
  },
  ml: {
    nav_live_map: 'തത്സമയ വെള്ളപ്പൊക്ക മാപ്പ്',
    nav_my_location: 'എന്റെ സ്ഥാനം',
    nav_ml_predictor: 'ML അപകട പ്രവചനം',
    nav_historical: 'ചരിത്രപരമായ വെള്ളപ്പൊക്ക ഡേറ്റ',
    nav_trends: 'വെള്ളപ്പൊക്ക പ്രവണതകൾ',
    nav_relief: 'ദുരിതാശ്വാസ കേന്ദ്രങ്ങൾ',
    nav_alerts: 'ദേശീയ മുന്നറിയിപ്പുകൾ',
    nav_pdf_reports: 'PDF റിപ്പോർട്ടുകൾ',
    brand_title: 'ഫ്ലഡ് വാച്ച് ഇന്ത്യ',
    brand_sub: 'വെള്ളപ്പൊക്ക അപകട പ്രവചന പ്ലാറ്റ്ഫോം',
    sign_out: 'സൈൻ ഔട്ട്',
    sign_in: 'സൈൻ ഇൻ',
    sign_up: 'സൗജന്യ രജിസ്ട്രേഷൻ',
    faqs: 'പതിവ് ചോദ്യങ്ങൾ',
    profile: 'പ്രൊഫൈൽ',
    high_risk: 'ഉയർന്ന അപകടം',
    medium_risk: 'മിതമായ അപകടം',
    low_risk: 'കുറഞ്ഞ അപകടം',
    safe: 'സുരക്ഷിതം (സാധാരണ)',
    loading: 'ലോഡ് ചെയ്യുന്നു...',
    calculating: 'കണക്കാക്കുന്നു...',
    detecting: 'സ്ഥാനം കണ്ടെത്തുന്നു...',
    live_gps: 'തത്സമയ GPS സെൻസർ',
    immediate_risk: 'ഉടനടി അപകടം:',
    download_pdf: 'PDF റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക',
    run_prediction: 'ML പ്രവചനം പ്രവർത്തിപ്പിക്കുക',
    select_state: '-- സംസ്ഥാനം തിരഞ്ഞെടുക്കുക --',
    select_district: '-- ജില്ല തിരഞ്ഞെടുക്കുക --',
    pdf_reports_title: 'വെള്ളപ്പൊക്ക PDF റിപ്പോർട്ടുകൾ',
    pdf_reports_subtitle: 'ഒരു ക്ലിക്കിലൂടെ ഡൗൺലോഡ് ചെയ്യാവുന്ന റിപ്പോർട്ടുകൾ',
    pdf_download_location: 'എന്റെ സ്ഥാന അപകട PDF',
    pdf_download_state: 'സംസ്ഥാന അപകട റിപ്പോർട്ട് PDF',
    pdf_select_state: 'റിപ്പോർട്ടിനായി സംസ്ഥാനം തിരഞ്ഞെടുക്കുക',
    pdf_generating: 'PDF നിർമ്മിക്കുന്നു...',
    high_risk_alert: 'ഉയർന്ന അപകടം',
    medium_risk_alert: 'മിതമായ അപകടം',
    normal_alert: 'സാധാരണ',
    platform_features: 'പ്ലാറ്റ്‌ഫോം സവിശേഷതകൾ'
  },
  pa: {
    nav_live_map: 'ਲਾਈਵ ਹੜ੍ਹ ਨਕਸ਼ਾ',
    nav_my_location: 'ਮੇਰਾ ਟਿਕਾਣਾ',
    nav_ml_predictor: 'ML ਖਤਰਾ ਭਵਿੱਖਬਾਣੀ',
    nav_historical: 'ਇਤਿਹਾਸਕ ਹੜ੍ਹ ਡੇਟਾਬੇਸ',
    nav_trends: 'ਹੜ੍ਹ ਬਾਰੰਬਾਰਤਾ ਰੁਝਾਨ',
    nav_relief: 'ਰਾਹਤ ਅਤੇ ਸਹਾਇਤਾ ਕੇਂਦਰ',
    nav_alerts: 'ਰਾਸ਼ਟਰੀ ਚੇਤਾਵਨੀਆਂ',
    nav_pdf_reports: 'PDF ਰਿਪੋਰਟਾਂ',
    brand_title: 'ਫਲੱਡਵਾਚ ਇੰਡੀਆ',
    brand_sub: 'ਹੜ੍ਹ ਖਤਰਾ ਅਨੁਮਾਨ ਪਲੇਟਫਾਰਮ',
    sign_out: 'ਸਾਈਨ ਆਉਟ',
    sign_in: 'ਸਾਈਨ ਇਨ',
    sign_up: 'ਮੁਫਤ ਸਾਈਨ ਅੱਪ ਕਰੋ',
    faqs: 'ਅਕਸਰ ਪੁੱਛੇ ਜਾਂਦੇ ਸਵਾਲ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    high_risk: 'ਉੱਚ ਖਤਰਾ',
    medium_risk: 'ਮੱਧਮ ਖਤਰਾ',
    low_risk: 'ਘੱਟ ਖਤਰਾ',
    safe: 'ਸੁਰੱਖਿਅਤ (ਆਮ)',
    loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    calculating: 'ਗਣਨਾ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...',
    detecting: 'ਟਿਕਾਣਾ ਲੱਭ ਰਿਹਾ ਹੈ...',
    live_gps: 'ਲਾਈਵ GPS ਸੈਂਸਰ',
    immediate_risk: 'ਤੁਰੰਤ ਖਤਰਾ:',
    download_pdf: 'PDF ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਕਰੋ',
    run_prediction: 'ML ਹੜ੍ਹ ਖਤਰਾ ਭਵਿੱਖਬਾਣੀ ਚਲਾਓ',
    select_state: '-- ਰਾਜ ਚੁਣੋ --',
    select_district: '-- ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ --',
    pdf_reports_title: 'ਹੜ੍ਹ ਖਤਰਾ PDF ਰਿਪੋਰਟਾਂ',
    pdf_reports_subtitle: 'ਇੱਕ-ਕਲਿੱਕ ਡਾਊਨਲੋਡ ਰਿਪੋਰਟਾਂ',
    pdf_download_location: 'ਮੇਰੇ ਟਿਕਾਣੇ ਦਾ ਖਤਰਾ PDF',
    pdf_download_state: 'ਰਾਜ ਖਤਰਾ ਰਿਪੋਰਟ PDF',
    pdf_select_state: 'ਰਿਪੋਰਟ ਲਈ ਰਾਜ ਚੁਣੋ',
    pdf_generating: 'PDF ਬਣ ਰਿਹਾ ਹੈ...',
    high_risk_alert: 'ਉੱਚ ਖਤਰਾ',
    medium_risk_alert: 'ਮੱਧਮ ਖਤਰਾ',
    normal_alert: 'ਆਮ',
    platform_features: 'ਪਲੇਟਫਾਰਮ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ'
  },
  or: {
    nav_live_map: 'ଲାଇଭ ବନ୍ୟା ମାନଚିତ୍ର',
    nav_my_location: 'ମୋ ଅବସ୍ଥାନ',
    nav_ml_predictor: 'ML ବିପଦ ଭବିଷ୍ୟବାଣୀ',
    nav_historical: 'ଐତିହାସିକ ବନ୍ୟା ତଥ୍ୟ',
    nav_trends: 'ବନ୍ୟା ଆବୃତ୍ତି ଧାରା',
    nav_relief: 'ସହାୟତା କେନ୍ଦ୍ର',
    nav_alerts: 'ଜାତୀୟ ସତର୍କତା',
    nav_pdf_reports: 'PDF ରିପୋର୍ଟ',
    brand_title: 'ଫ୍ଲଡ୍‌ୱାଚ୍ ଇଣ୍ଡିଆ',
    brand_sub: 'ବନ୍ୟା ବିପଦ ଭବିଷ୍ୟବାଣୀ ମଞ୍ଚ',
    sign_out: 'ସାଇନ୍ ଆଉଟ୍',
    sign_in: 'ସାଇନ୍ ଇନ୍',
    sign_up: 'ମାଗଣା ସାଇନ୍ ଅପ୍',
    faqs: 'ବାରମ୍ବାର ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ',
    profile: 'ପ୍ରୋଫାଇଲ୍',
    high_risk: 'ଅଧିକ ବିପଦ',
    medium_risk: 'ମଧ୍ୟମ ବିପଦ',
    low_risk: 'କମ୍ ବିପଦ',
    safe: 'ସୁରକ୍ଷିତ (ସ୍ୱାଭାବିକ)',
    loading: 'ଲୋଡ୍ ହେଉଛି...',
    calculating: 'ଗଣନା ଚାଲିଛି...',
    detecting: 'ସ୍ଥାନ ଚିହ୍ନଟ ହେଉଛି...',
    live_gps: 'ଲାଇଭ GPS ସେନ୍ସର',
    immediate_risk: 'ତୁରନ୍ତ ବିପଦ:',
    download_pdf: 'PDF ରିପୋର୍ଟ ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
    run_prediction: 'ML ବନ୍ୟା ବିପଦ ଭବିଷ୍ୟବାଣୀ କରନ୍ତୁ',
    select_state: '-- ରାଜ୍ୟ ବାଛନ୍ତୁ --',
    select_district: '-- ଜିଲ୍ଲା ବାଛନ୍ତୁ --',
    pdf_reports_title: 'ବନ୍ୟା ବିପଦ PDF ରିପୋର୍ଟ',
    pdf_reports_subtitle: 'ଗୋଟିଏ କ୍ଲିକରେ ଡାଉନଲୋଡ୍ ରିପୋର୍ଟ',
    pdf_download_location: 'ମୋ ଅବସ୍ଥାନ ବିପଦ PDF',
    pdf_download_state: 'ରାଜ୍ୟ ବିପଦ ରିପୋର୍ଟ PDF',
    pdf_select_state: 'ରିପୋର୍ଟ ପାଇଁ ରାଜ୍ୟ ଚୟନ କରନ୍ତୁ',
    pdf_generating: 'PDF ପ୍ରସ୍ତୁତ ହେଉଛି...',
    high_risk_alert: 'ଅଧିକ ବିପଦ',
    medium_risk_alert: 'ମଧ୍ୟମ ବିପଦ',
    normal_alert: 'ସ୍ୱାଭାବିକ',
    platform_features: 'ପ୍ଲାଟଫର୍ମ ବୈଶିଷ୍ଟ୍ୟ'
  },
  as: {
    nav_live_map: 'লাইভ বানপানী মানচিত্ৰ',
    nav_my_location: 'মোৰ অৱস্থান',
    nav_ml_predictor: 'ML বিপদ পূৰ্বানুমান',
    nav_historical: 'ঐতিহাসিক বানপানী তথ্য',
    nav_trends: 'বানপানী প্ৰৱণতা',
    nav_relief: 'সাহায্য কেন্দ্ৰসমূহ',
    nav_alerts: 'ৰাষ্ট্ৰীয় সতৰ্কবাণী',
    nav_pdf_reports: 'PDF প্ৰতিবেদন',
    brand_title: 'ফ্লাডৱাচ ইণ্ডিয়া',
    brand_sub: 'বানপানী বিপদ পূৰ্বানুমান মঞ্চ',
    sign_out: 'ছাইন আউট',
    sign_in: 'ছাইন ইন',
    sign_up: 'বিনামূলীয়াকৈ পঞ্জীয়ন কৰক',
    faqs: 'সঘনাই সোধা প্ৰশ্ন',
    profile: 'প্ৰফাইল',
    high_risk: 'উচ্চ বিপদ',
    medium_risk: 'মধ্যমীয়া বিপদ',
    low_risk: 'কম বিপদ',
    safe: 'সুৰক্ষিত (স্বাভাৱিক)',
    loading: 'লোড হৈ আছে...',
    calculating: 'গণনা চলি আছে...',
    detecting: 'অৱস্থান বিচাৰি আছে...',
    live_gps: 'লাইভ GPS চেন্সৰ',
    immediate_risk: 'তাৎক্ষণিক বিপদ:',
    download_pdf: 'PDF প্ৰতিবেদন ডাউনলোড কৰক',
    run_prediction: 'ML বানপানী পূৰ্বানুমান চলাওক',
    select_state: '-- ৰাজ্য বাছক --',
    select_district: '-- জিলা বাছক --',
    pdf_reports_title: 'বানপানী বিপদ PDF প্ৰতিবেদন',
    pdf_reports_subtitle: 'এক-ক্লিক ডাউনলোডযোগ্য প্ৰতিবেদন',
    pdf_download_location: 'মোৰ অৱস্থানৰ বিপদ PDF',
    pdf_download_state: 'ৰাজ্য বিপদ প্ৰতিবেদন PDF',
    pdf_select_state: 'প্ৰতিবেদনৰ বাবে ৰাজ্য বাছক',
    pdf_generating: 'PDF প্ৰস্তুত হৈ আছে...',
    high_risk_alert: 'উচ্চ বিপদ',
    medium_risk_alert: 'মধ্যমীয়া বিপদ',
    normal_alert: 'স্বাভাৱিক',
    platform_features: 'মঞ্চৰ সুবিধাসমূহ'
  },
  ur: {
    nav_live_map: 'براہ راست سیلاب نقشہ',
    nav_my_location: 'میرا مقام',
    nav_ml_predictor: 'ML خطرہ پیش گوئی',
    nav_historical: 'تاریخی سیلاب ڈیٹا',
    nav_trends: 'سیلاب کے رجحانات',
    nav_relief: 'امدادی مراکز',
    nav_alerts: 'قومی انتباہات',
    nav_pdf_reports: 'PDF رپورٹیں',
    brand_title: 'فلڈ واچ انڈیا',
    brand_sub: 'سیلاب خطرہ پیش گوئی پلیٹ فارم',
    sign_out: 'سائن آؤٹ',
    sign_in: 'سائن ان',
    sign_up: 'مفت سائن اپ کریں',
    faqs: 'اکثر پوچھے گئے سوالات',
    profile: 'پروفائل',
    high_risk: 'اعلی خطرہ',
    medium_risk: 'درمیانی خطرہ',
    low_risk: 'کم خطرہ',
    safe: 'محفوظ (معمول)',
    loading: 'لوڈ ہو رہا ہے...',
    calculating: 'حساب لگایا جا رہا ہے...',
    detecting: 'مقام تلاش کیا جا رہا ہے...',
    live_gps: 'براہ راست GPS سینسر',
    immediate_risk: 'فوری خطرہ:',
    download_pdf: 'PDF رپورٹ ڈاؤن لوڈ کریں',
    run_prediction: 'ML سیلاب پیش گوئی چلائیں',
    select_state: '-- ریاست منتخب کریں --',
    select_district: '-- ضلع منتخب کریں --',
    pdf_reports_title: 'سیلاب خطرہ PDF رپورٹیں',
    pdf_reports_subtitle: 'ایک کلک میں ڈاؤن لوڈ ہونے والی رپورٹیں',
    pdf_download_location: 'میرے مقام کی خطرہ PDF',
    pdf_download_state: 'ریاستی خطرہ رپورٹ PDF',
    pdf_select_state: 'رپورٹ کے لیے ریاست منتخب کریں',
    pdf_generating: 'PDF تیار کی جا رہی ہے...',
    high_risk_alert: 'اعلی خطرہ',
    medium_risk_alert: 'درمیانی خطرہ',
    normal_alert: 'معمول',
    platform_features: 'پلیٹ فارم کی خصوصیات'
  }
};

/* ═════════════════════════════════════════════════════════════
   LANGUAGE STORAGE & STATE
   ═════════════════════════════════════════════════════════════ */
let currentLang = 'en';

function getLang() {
  return localStorage.getItem('fw_lang') || 'en';
}

function setLang(code) {
  if (!SUPPORTED_LANGUAGES.some(l => l.code === code)) code = 'en';
  currentLang = code;
  localStorage.setItem('fw_lang', code);
  localStorage.setItem('fw_lang_chosen', '1');

  // Set Google Translate cookies across root and domain
  setGoogleTransCookie(code);

  // Apply fast dictionary translations directly to DOM
  applyFastTranslations(code);

  // Update button label
  updateLangBtnLabel(code);

  // Trigger Google Translate engine for complete page text translation
  triggerGoogleTranslate(code);

  // Notify listeners
  window.dispatchEvent(new CustomEvent('fw-language-changed', { detail: { lang: code } }));

  if (typeof showToast === 'function') {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    showToast(`Language changed to ${lang ? lang.native : code}`, 'info');
  }
}

function t(key) {
  const lang = currentLang || getLang();
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) || key;
}

/* ═════════════════════════════════════════════════════════════
   GOOGLE TRANSLATE INTEGRATION (FULL-PAGE TRANSLATION)
   ═════════════════════════════════════════════════════════════ */
function setGoogleTransCookie(code) {
  const cookieVal = code === 'en' ? '/en/en' : `/en/${code}`;
  const host = window.location.hostname;
  document.cookie = `googtrans=${cookieVal}; path=/;`;
  if (host && host !== 'localhost') {
    document.cookie = `googtrans=${cookieVal}; path=/; domain=.${host};`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${host};`;
  }
}

window.fwGoogleTranslateInit = function() {
  if (window.google && window.google.translate && window.google.translate.TranslateElement) {
    try {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,gu,mr,bn,ta,te,kn,ml,pa,or,as,ur',
        autoDisplay: false
      }, 'google_translate_element');
    } catch (e) {
      console.warn('[i18n] Google Translate init notice:', e);
    }
  }

  // After init, sync with saved language
  const saved = getLang();
  if (saved && saved !== 'en') {
    setTimeout(() => {
      triggerGoogleTranslate(saved);
    }, 400);
  }
};

function triggerGoogleTranslate(code) {
  const combo = document.querySelector('.goog-te-combo');
  if (combo) {
    if (combo.value !== code) {
      combo.value = code;
      combo.dispatchEvent(new Event('change'));
    }
  } else {
    // If combo isn't mounted yet, reload page once if cookies are set
    // This allows Google Translate server-side / on-load translation to kick in
    const currentCookie = (document.cookie.match(/googtrans=([^;]+)/) || [])[1];
    const expectedCookie = code === 'en' ? '/en/en' : `/en/${code}`;
    if (currentCookie !== expectedCookie) {
      setGoogleTransCookie(code);
    }
  }
}

function initGoogleTranslateScript() {
  if (document.getElementById('fwGoogleTranslateScript')) return;

  // Hidden translate container
  let el = document.getElementById('google_translate_element');
  if (!el) {
    el = document.createElement('div');
    el.id = 'google_translate_element';
    el.style.display = 'none';
    document.body.appendChild(el);
  }

  const s = document.createElement('script');
  s.id = 'fwGoogleTranslateScript';
  s.src = 'https://translate.google.com/translate_a/element.js?cb=fwGoogleTranslateInit';
  s.async = true;
  document.body.appendChild(s);
}

/* ═════════════════════════════════════════════════════════════
   FAST DOM TRANSLATIONS (INSTANT RESPONSE BEFORE/WITH GT)
   ═════════════════════════════════════════════════════════════ */
function applyFastTranslations(code) {
  const tr = TRANSLATIONS[code] || TRANSLATIONS['en'];
  if (!tr) return;

  // 1. Data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (tr[key]) el.textContent = tr[key];
  });

  // 2. Data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (tr[key]) el.placeholder = tr[key];
  });

  // 3. Navigation Sidebar buttons & items
  const navMap = {
    'nav-map': tr.nav_live_map,
    'nav-my-location': tr.nav_my_location,
    'nav-ml-predictor': tr.nav_ml_predictor,
    'nav-historical': tr.nav_historical,
    'nav-trends': tr.nav_trends,
    'nav-relief': tr.nav_relief,
    'nav-alerts': tr.nav_alerts,
    'nav-pdf-reports': tr.nav_pdf_reports,
    'mbnav-map': tr.nav_live_map,
    'mbnav-my-location': tr.nav_my_location,
    'mbnav-ml-predictor': tr.nav_ml_predictor,
    'mbnav-alerts': tr.nav_alerts,
    'mbnav-pdf-reports': tr.nav_pdf_reports
  };

  for (const [id, text] of Object.entries(navMap)) {
    const el = document.getElementById(id);
    if (el && text) {
      const span = el.querySelector('span:not(.nav-icon):not(.mnav-icon):not(.nav-tag)') || 
                   el.querySelector('.mnav-label');
      if (span) span.textContent = text;
    }
  }

  // 4. Brand Subtitle
  document.querySelectorAll('.brand-sub, .logo-sub').forEach(el => {
    if (tr.brand_sub) el.textContent = tr.brand_sub;
  });

  // 5. Sign Out & Sign In buttons
  document.querySelectorAll('.btn-signout').forEach(el => {
    if (tr.sign_out) el.textContent = tr.sign_out;
  });

  // 6. Section Titles
  document.querySelectorAll('.sidebar-section-title').forEach(el => {
    if (tr.platform_features) el.textContent = tr.platform_features;
  });

  // 7. RTL for Urdu
  if (code === 'ur') {
    document.body.setAttribute('dir', 'rtl');
  } else {
    document.body.setAttribute('dir', 'ltr');
  }
}

function updateLangBtnLabel(code) {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
  document.querySelectorAll('.fw-lang-btn, #langToggleBtn').forEach(btn => {
    btn.innerHTML = `${lang.flag} ${lang.native} <span style="opacity:0.6; font-size:10px;">▾</span>`;
  });
}

/* ═════════════════════════════════════════════════════════════
   LANGUAGE PICKER MODAL
   ═════════════════════════════════════════════════════════════ */
function openLanguageModal() {
  const existing = document.getElementById('langPickerModal');
  if (existing) { existing.remove(); return; }

  const currentCode = getLang();
  const optionsHtml = SUPPORTED_LANGUAGES.map(lang => `
    <button class="lang-option-btn ${lang.code === currentCode ? 'active' : ''}"
            onclick="setLang('${lang.code}'); document.getElementById('langPickerModal').remove();"
            id="lang-opt-${lang.code}">
      <span style="font-size:20px;">${lang.flag}</span>
      <div>
        <div style="font-weight:700; font-size:13px;">${lang.native}</div>
        <div style="font-size:10px; opacity:0.6;">${lang.name}</div>
      </div>
      ${lang.code === currentCode ? '<span style="color:#38bdf8; font-size:16px; margin-left:auto;">✓</span>' : ''}
    </button>
  `).join('');

  const modal = document.createElement('div');
  modal.id = 'langPickerModal';
  modal.innerHTML = `
    <div class="lang-modal-overlay" onclick="this.parentElement.remove()"></div>
    <div class="lang-modal-box">
      <div class="lang-modal-header">
        <div>
          <div style="font-size:16px; font-weight:800; color:#fff;">🌐 Select Website Language</div>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">ભાષા પસંદ કરો • भाषा चुनें • ভাষা নির্বাচন করুন</div>
        </div>
        <button onclick="document.getElementById('langPickerModal').remove()" 
                style="background:none;border:none;color:#64748b;font-size:18px;cursor:pointer;padding:4px;">✕</button>
      </div>
      <div class="lang-options-grid">${optionsHtml}</div>
    </div>
  `;
  document.body.appendChild(modal);
}

/* ═════════════════════════════════════════════════════════════
   FIRST-TIME LANGUAGE SELECTION PROMPT
   ═════════════════════════════════════════════════════════════ */
function checkFirstTimeLangPrompt() {
  const hasChosen = localStorage.getItem('fw_lang_chosen');
  if (hasChosen) {
    const saved = getLang();
    currentLang = saved;
    applyFastTranslations(saved);
    updateLangBtnLabel(saved);
    return;
  }

  // Show friendly modal for new users
  setTimeout(() => {
    showFirstTimeLangPrompt();
  }, 1000);
}

function showFirstTimeLangPrompt() {
  const existing = document.getElementById('firstTimeLangModal');
  if (existing) return;

  const optionsHtml = SUPPORTED_LANGUAGES.map(lang => `
    <button class="lang-option-btn"
            onclick="selectFirstTimeLang('${lang.code}')"
            id="ftlang-${lang.code}">
      <span style="font-size:22px;">${lang.flag}</span>
      <div>
        <div style="font-weight:700; font-size:13px;">${lang.native}</div>
        <div style="font-size:10px; opacity:0.6;">${lang.name}</div>
      </div>
    </button>
  `).join('');

  const modal = document.createElement('div');
  modal.id = 'firstTimeLangModal';
  modal.innerHTML = `
    <div class="lang-modal-overlay"></div>
    <div class="lang-modal-box" style="max-width:540px;">
      <div class="lang-modal-header">
        <div>
          <div style="font-size:18px; font-weight:800; color:#fff;">🌐 Welcome to FloodWatch India!</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">Please select your preferred language to continue</div>
          <div style="font-size:11px; color:#475569; margin-top:2px;">कृपया अपनी भाषा चुनें • પોતાની ભાષા પસંદ કરો • আপনার ভাষা বেছে নিন</div>
        </div>
      </div>
      <div class="lang-options-grid">${optionsHtml}</div>
      <div style="text-align:center; margin-top:14px;">
        <button onclick="selectFirstTimeLang('en')" 
                style="background:none;border:1px solid rgba(255,255,255,0.12);color:#94a3b8;font-size:11.5px;padding:7px 18px;border-radius:6px;cursor:pointer;">
          Skip – Continue in English
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function selectFirstTimeLang(code) {
  localStorage.setItem('fw_lang_chosen', '1');
  setLang(code);
  const modal = document.getElementById('firstTimeLangModal');
  if (modal) {
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.25s';
    setTimeout(() => modal.remove(), 250);
  }
}

/* ═════════════════════════════════════════════════════════════
   AUTO-INJECT LANGUAGE TOGGLE BUTTON INTO HEADER
   ═════════════════════════════════════════════════════════════ */
function ensureLangButtonInHeader() {
  if (document.getElementById('langToggleBtn')) {
    updateLangBtnLabel(getLang());
    return;
  }

  // Look for suitable containers across pages
  const targets = [
    document.querySelector('.header-right'),
    document.querySelector('.hdr-auth'),
    document.querySelector('.hdr-links'),
    document.querySelector('header .header-nav'),
    document.querySelector('header')
  ];

  const target = targets.find(t => t !== null);
  if (!target) return;

  const btn = document.createElement('button');
  btn.id = 'langToggleBtn';
  btn.className = 'fw-lang-btn';
  btn.setAttribute('onclick', 'openLanguageModal()');
  btn.setAttribute('title', 'Change Website Language');

  const lang = SUPPORTED_LANGUAGES.find(l => l.code === getLang()) || SUPPORTED_LANGUAGES[0];
  btn.innerHTML = `${lang.flag} ${lang.native} <span style="opacity:0.6; font-size:10px;">▾</span>`;

  // Insert before first link/button or append
  if (target.firstChild) {
    target.insertBefore(btn, target.firstChild);
  } else {
    target.appendChild(btn);
  }
}

/* ═════════════════════════════════════════════════════════════
   CSS STYLES INJECTION (Language UI + Clean Google Translate)
   ═════════════════════════════════════════════════════════════ */
(function injectLangStyles() {
  if (document.getElementById('langModuleCSS')) return;
  const style = document.createElement('style');
  style.id = 'langModuleCSS';
  style.textContent = `
    /* Clean Hide Google Translate Overlays and Top Banner */
    .goog-te-banner-frame.skiptranslate,
    .goog-te-banner-frame,
    #goog-gt-tt,
    .goog-te-balloon-frame {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }
    body {
      top: 0px !important;
      position: static !important;
    }
    .goog-logo-link,
    .goog-te-gadget span {
      display: none !important;
    }
    .goog-te-gadget {
      height: 0 !important;
      overflow: hidden !important;
      color: transparent !important;
      font-size: 0 !important;
    }
    .goog-text-highlight {
      background: none !important;
      box-shadow: none !important;
    }
    font {
      background: transparent !important;
      box-shadow: none !important;
    }

    /* Language Toggle Button in Header */
    #langToggleBtn, .fw-lang-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
      font-family: 'Inter', sans-serif;
    }
    #langToggleBtn:hover, .fw-lang-btn:hover {
      background: rgba(56,189,248,0.12);
      border-color: rgba(56,189,248,0.35);
      color: #38bdf8;
    }

    /* Modal Overlay */
    .lang-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.72);
      backdrop-filter: blur(5px);
      z-index: 99998;
    }

    /* Modal Box */
    .lang-modal-box {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 99999;
      background: linear-gradient(135deg, #090e1a 0%, #151f33 100%);
      border: 1px solid rgba(56,189,248,0.25);
      border-radius: 16px;
      padding: 24px;
      width: 90%;
      max-width: 480px;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 25px 60px rgba(0,0,0,0.75);
      animation: langModalIn 0.2s ease-out;
      font-family: 'Inter', sans-serif;
    }
    @keyframes langModalIn {
      from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
      to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    .lang-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    /* Language Options Grid */
    .lang-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .lang-option-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      color: #e2e8f0;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      font-family: 'Inter', sans-serif;
    }
    .lang-option-btn:hover {
      background: rgba(56,189,248,0.12);
      border-color: rgba(56,189,248,0.35);
      transform: translateY(-1px);
    }
    .lang-option-btn.active {
      background: rgba(56,189,248,0.16);
      border-color: rgba(56,189,248,0.55);
      color: #38bdf8;
    }

    .lang-modal-box::-webkit-scrollbar { width: 4px; }
    .lang-modal-box::-webkit-scrollbar-track { background: transparent; }
    .lang-modal-box::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.3); border-radius: 2px; }

    @media (max-width: 480px) {
      .lang-options-grid { grid-template-columns: 1fr; }
      .lang-modal-box { padding: 18px; width: 94%; }
    }
  `;
  document.head.appendChild(style);
})();

/* ═════════════════════════════════════════════════════════════
   AUTO INITIALIZATION ON DOM READY
   ═════════════════════════════════════════════════════════════ */
function initLanguageSystem() {
  const saved = getLang();
  currentLang = saved;

  // 1. Ensure cookie matches saved language
  setGoogleTransCookie(saved);

  // 2. Ensure Language Button is in Header
  ensureLangButtonInHeader();

  // 3. Apply Local Fast Translations
  applyFastTranslations(saved);

  // 4. Update Header button label
  updateLangBtnLabel(saved);

  // 5. Initialize Google Translate Script
  initGoogleTranslateScript();

  // 6. Check first-time prompt
  checkFirstTimeLangPrompt();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguageSystem);
} else {
  initLanguageSystem();
}

// Comprehensive Services Catalog for Barber Salon Shop
// Includes all known services of local salons with bilingual Hindi & English names,
// plus support for custom haircuts, custom services, and pricing customization.

const DEFAULT_SERVICES = [
  // ==========================================
  // 1. HAIR CUTTING & STYLING (बाल काटना)
  // ==========================================
  {
    category: "Hair Cutting & Styling",
    categoryHi: "बाल कटिंग & स्टाइलिंग",
    icon: "✂️",
    items: [
      {
        id: "hair-simple",
        name: "Simple Regular Haircut",
        nameHi: "साधारण रेगुलर कटिंग",
        description: "Classic clean haircut with machine/scissors, neckline razor trimming & powder finish.",
        duration: "20 min",
        durationMin: 20,
        price: 80,
        popular: false
      },
      {
        id: "hair-trendy",
        name: "Stylish & Modern Haircut",
        nameHi: "स्टाइलिश & मॉडर्न कटिंग",
        description: "Latest trending haircuts customized to your face profile with scissor texture work.",
        duration: "25 min",
        durationMin: 25,
        price: 120,
        popular: true
      },
      {
        id: "hair-fade",
        name: "Skin Fade / Taper Fade",
        nameHi: "स्किन फेड / टेपर फेड कटिंग",
        description: "Zero skin or low/mid/high taper fade with razor edge lining & cooling splash.",
        duration: "30 min",
        durationMin: 30,
        price: 150,
        popular: true,
        tag: "HOT TREND"
      },
      {
        id: "hair-scissor",
        name: "Master Scissor Cut & Texture",
        nameHi: "मास्टर कैंची कटिंग",
        description: "Pure handcrafted scissor cut without harsh clippers, natural fall and volume.",
        duration: "25 min",
        durationMin: 25,
        price: 150,
        popular: false
      },
      {
        id: "hair-pompadour",
        name: "Classic Gentleman's Pompadour / Undercut",
        nameHi: "पोम्पाडोर / अंडरकट स्टाइल",
        description: "High volume top with slick sides, hot lather neck shave and styling pomade.",
        duration: "30 min",
        durationMin: 30,
        price: 180,
        popular: false
      },
      {
        id: "hair-military",
        name: "Army / Buzz / Military Cut",
        nameHi: "फौजी कट / बज़ कट",
        description: "Ultra short disciplined machine cut with razor clean boundaries.",
        duration: "15 min",
        durationMin: 15,
        price: 70,
        popular: false
      },
      {
        id: "hair-kids",
        name: "Kids Haircut (Under 12 Yrs)",
        nameHi: "बच्चों की कटिंग",
        description: "Gentle, patient haircut for children with fun styling and wash.",
        duration: "15 min",
        durationMin: 15,
        price: 60,
        popular: false
      },
      {
        id: "hair-senior",
        name: "Senior Citizen Dignity Cut",
        nameHi: "बुजुर्गों की कटिंग",
        description: "Comfortable and polite haircut with eyebrow trim and ear hair grooming.",
        duration: "20 min",
        durationMin: 20,
        price: 60,
        popular: false
      },
      {
        id: "hair-wash",
        name: "Hair Wash & Conditioning",
        nameHi: "हेयर वॉश & शैम्पू",
        description: "Double shampoo wash with herbal conditioner and warm water towel wrap.",
        duration: "15 min",
        durationMin: 15,
        price: 60,
        popular: false
      },
      {
        id: "hair-setting",
        name: "Blowdry & Wax / Gel Setting",
        nameHi: "हेयर ब्लो ड्राई & वैक्स सेटिंग",
        description: "High-power ionic blowdry with matte hair wax or clay for party styling.",
        duration: "15 min",
        durationMin: 15,
        price: 80,
        popular: false
      },
      {
        id: "hair-color-black",
        name: "Hair Color / Black Dye Application",
        nameHi: "हेयर डाई / ब्लैक कलर",
        description: "Ammonia-free natural black/dark brown hair color application with wash.",
        duration: "30 min",
        durationMin: 30,
        price: 150,
        popular: true
      },
      {
        id: "hair-highlights",
        name: "Hair Highlights / Streaks",
        nameHi: "हेयर हाइलाइट्स / स्ट्रीक्स",
        description: "Caramel, ash blonde, or burgundy highlights with developer & toner.",
        duration: "45 min",
        durationMin: 45,
        price: 350,
        popular: false
      }
    ]
  },

  // ==========================================
  // 2. BEARD GROOMING & SHAVING (दाढ़ी सेट & शेविंग)
  // ==========================================
  {
    category: "Beard Grooming & Shaving",
    categoryHi: "दाढ़ी ग्रूमिंग & शेविंग",
    icon: "🧔",
    items: [
      {
        id: "beard-trim",
        name: "Normal Beard Trim",
        nameHi: "साधारण दाढ़ी ट्रिम",
        description: "Quick machine beard length trim and chin alignment.",
        duration: "10 min",
        durationMin: 10,
        price: 50,
        popular: false
      },
      {
        id: "beard-razor-set",
        name: "Razor Lineup & Beard Shaping",
        nameHi: "उस्तरा दाढ़ी सेटिंग & शेपिंग",
        description: "Precise cheek line and neck contouring with fresh razor blade and aftershave.",
        duration: "15 min",
        durationMin: 15,
        price: 80,
        popular: true
      },
      {
        id: "beard-clean-shave",
        name: "Classic Clean Shave",
        nameHi: "क्लीन शेव (फोम/क्रीम)",
        description: "Rich lather foam, twin-pass smooth razor shave with alum and cool tonic.",
        duration: "15 min",
        durationMin: 15,
        price: 60,
        popular: false
      },
      {
        id: "beard-hot-towel",
        name: "Hot Towel Royal Shave",
        nameHi: "हॉट टॉवल रॉयल शेव",
        description: "Pre-shave eucalyptus oil, hot steam towel, warm lather, and soothing lotion.",
        duration: "20 min",
        durationMin: 20,
        price: 100,
        popular: true
      },
      {
        id: "beard-smooth",
        name: "Hot Towel Beard Smoothening & Spa",
        nameHi: "दाढ़ी स्मूथनिंग & ऑर्गन ऑयल स्पा",
        description: "Argan oil deep conditioning, hot towel steam therapy, and frizz-free smoothing.",
        duration: "25 min",
        durationMin: 25,
        price: 150,
        popular: true,
        tag: "MUST TRY"
      },
      {
        id: "beard-color",
        name: "Beard Color / Dye",
        nameHi: "दाढ़ी कलर / डाई",
        description: "Safe skin-friendly black/brown dye for beard and moustache.",
        duration: "15 min",
        durationMin: 15,
        price: 80,
        popular: false
      },
      {
        id: "moustache-style",
        name: "Moustache Styling & Set",
        nameHi: "मूंछ सेटिंग & स्टाइल",
        description: "Royal handlebar moustache shaping with organic beeswax.",
        duration: "10 min",
        durationMin: 10,
        price: 30,
        popular: false
      }
    ]
  },

  // ==========================================
  // 3. KERATIN (CARETIN) & HAIR TREATMENTS
  // ==========================================
  {
    category: "Keratin (Caretin) & Hair Treatments",
    categoryHi: "केराटिन & हेयर ट्रीटमेंट",
    icon: "✨",
    items: [
      {
        id: "keratin-treatment",
        name: "Keratin (Caretin) Smoothening Treatment",
        nameHi: "केराटिन स्मूथनिंग ट्रीटमेंट",
        description: "Intense protein infusion that eliminates 100% frizz, repairs rough hair, and delivers long-lasting mirror shine.",
        duration: "60 min",
        durationMin: 60,
        price: 999,
        popular: true,
        tag: "BESTSELLER"
      },
      {
        id: "hair-smoothening",
        name: "Hair Smoothening & Straightening",
        nameHi: "हेयर स्मूथनिंग & स्ट्रेटनिंग",
        description: "Silky straight, manageable hair with neutralizer cream and thermal lock.",
        duration: "75 min",
        durationMin: 75,
        price: 1199,
        popular: true
      },
      {
        id: "hair-rebonding",
        name: "Permanent Hair Rebonding",
        nameHi: "परमानेंट हेयर रीबॉन्डिंग",
        description: "Complete permanent hair straightening with gloss sealing for rebellious hair.",
        duration: "90 min",
        durationMin: 90,
        price: 1499,
        popular: false
      },
      {
        id: "hair-botox",
        name: "Hair Botox & Deep Reconstruction",
        nameHi: "हेयर बोटोक्स डीप रिपेयर",
        description: "Anti-ageing collagen therapy for damaged, bleached, or split-end hair.",
        duration: "75 min",
        durationMin: 75,
        price: 1299,
        popular: false
      },
      {
        id: "loreal-hair-spa",
        name: "L'Oreal Deep Conditioning Hair Spa",
        nameHi: "लोरियल डीप हेयर स्पा",
        description: "Scalp scrub, nourishing cream bath massage, and ionic steam infusion.",
        duration: "45 min",
        durationMin: 45,
        price: 499,
        popular: true
      },
      {
        id: "anti-dandruff-spa",
        name: "Herbal Anti-Dandruff Scalp Treatment",
        nameHi: "एंटी-डैंड्रफ स्कैल्प ट्रीटमेंट",
        description: "Tea-tree oil exfoliation, ozone therapy, and cooling anti-fungal mask.",
        duration: "40 min",
        durationMin: 40,
        price: 399,
        popular: false
      }
    ]
  },

  // ==========================================
  // 4. FACIALS, CLEAN-UPS & D-TAN
  // ==========================================
  {
    category: "Facials, Clean-ups & D-Tan",
    categoryHi: "फेशियल, क्लीन-अप & डी-टैन",
    icon: "🧖‍♂️",
    items: [
      {
        id: "dtan-facepack",
        name: "Ayurvedic D-Tan Face Pack & Steam",
        nameHi: "आयुर्वेदिक डी-टैन फेस पैक",
        description: "Removes sun tanning, pigmentation & pollution dullness with ozone steam.",
        duration: "20 min",
        durationMin: 20,
        price: 199,
        popular: true,
        tag: "POPULAR"
      },
      {
        id: "fruit-cleanup",
        name: "Herbal Fruit Clean-up",
        nameHi: "फ्रूट क्लीन-अप",
        description: "Papaya & orange scrub, blackhead removal, face massage, and tightening pack.",
        duration: "25 min",
        durationMin: 25,
        price: 199,
        popular: false
      },
      {
        id: "charcoal-detox",
        name: "Activated Charcoal Blackhead Peel",
        nameHi: "चारकोल ब्लैकहेड रिमूवल पैक",
        description: "Deep pore suction, removes stubborn blackheads, whiteheads, and oily shine.",
        duration: "20 min",
        durationMin: 20,
        price: 180,
        popular: false
      },
      {
        id: "gold-facial",
        name: "Gold Radiance Glow Facial",
        nameHi: "गोल्ड ग्लो फेशियल",
        description: "24K gold dust cleansing, exfoliating scrub, cream massage & golden peel mask.",
        duration: "40 min",
        durationMin: 40,
        price: 499,
        popular: true
      },
      {
        id: "diamond-facial",
        name: "Diamond Whitening & Brightening Facial",
        nameHi: "डायमंड ब्राइटनिंग फेशियल",
        description: "Diamond ash microdermabrasion for intense instant fairness and party glow.",
        duration: "45 min",
        durationMin: 45,
        price: 599,
        popular: false
      },
      {
        id: "o3-facial",
        name: "O3+ Luxury Bridal / Groom Facial",
        nameHi: "O3+ लग्जरी ग्रूम फेशियल",
        description: "International standard brightening treatment for wedding grooms & party guests.",
        duration: "50 min",
        durationMin: 50,
        price: 799,
        popular: false,
        tag: "VIP"
      },
      {
        id: "face-bleach",
        name: "Gold / Oxy Face Bleach",
        nameHi: "गोल्ड / ऑक्सी फेस ब्लीच",
        description: "Lightens facial hair naturally to match skin tone with cooling pre-bleach.",
        duration: "20 min",
        durationMin: 20,
        price: 120,
        popular: false
      },
      {
        id: "steam-scrub",
        name: "Facial Steam, Scrub & Blackhead Extraction",
        nameHi: "स्टीम, स्क्रब & ब्लैकहेड क्लीन",
        description: "Warm steam therapy with walnut scrub and mechanical blackhead pin extraction.",
        duration: "20 min",
        durationMin: 20,
        price: 150,
        popular: false
      }
    ]
  },

  // ==========================================
  // 5. HEAD CHAMPI & RELAXATION MASSAGES
  // ==========================================
  {
    category: "Head Champi & Relaxation",
    categoryHi: "सिर चम्पी & मालिश",
    icon: "💆‍♂️",
    items: [
      {
        id: "mustard-champi",
        name: "Traditional Mustard / Coconut Oil Champi",
        nameHi: "सरसों / नारियल तेल मालिश",
        description: "Classic Indian barbershop head massage with pressure points release.",
        duration: "15 min",
        durationMin: 15,
        price: 70,
        popular: false
      },
      {
        id: "almond-champi",
        name: "Pure Almond (Badam) Oil Head Massage",
        nameHi: "शुद्ध बादाम रोगन सिर मालिश",
        description: "Warm pure Roghan Badam oil massage to nourish hair roots and eliminate fatigue.",
        duration: "20 min",
        durationMin: 20,
        price: 120,
        popular: true,
        tag: "TOP RELAX"
      },
      {
        id: "navratna-champi",
        name: "Navratna Cool Thanda Tel Champi",
        nameHi: "नवरत्न ठंडा तेल सिर चम्पी",
        description: "Icy refreshing Ayurvedic herbal oil champi for instant headache relief.",
        duration: "15 min",
        durationMin: 15,
        price: 80,
        popular: true
      },
      {
        id: "olive-shoulder-massage",
        name: "Olive Oil Scalp & Shoulder Massage",
        nameHi: "जैतून तेल सिर & कंधा मालिश",
        description: "Upper back, neck, and shoulder acupressure with warm olive oil.",
        duration: "20 min",
        durationMin: 20,
        price: 150,
        popular: false
      },
      {
        id: "vibrator-massage",
        name: "Electric Vibrator Head & Neck Massage",
        nameHi: "इलेक्ट्रिक वाइब्रेटर मालिश",
        description: "Deep vibration circulation therapy across scalp, neck, and upper spine.",
        duration: "10 min",
        durationMin: 10,
        price: 50,
        popular: false
      }
    ]
  },

  // ==========================================
  // 6. MONEY-SAVER VALUE COMBOS (बचत कॉम्बो)
  // ==========================================
  {
    category: "Money-Saver Combos",
    categoryHi: "सुपर सेवर कॉम्बो पैक",
    icon: "👑",
    items: [
      {
        id: "combo-regular",
        name: "Regular Combo: Haircut + Beard Trim",
        nameHi: "रेगुलर कॉम्बो: कटिंग + दाढ़ी ट्रिम",
        description: "Simple haircut + machine beard trim + neck cleanup.",
        duration: "30 min",
        durationMin: 30,
        price: 120,
        popular: true,
        tag: "SAVE ₹10"
      },
      {
        id: "combo-classic",
        name: "Classic Combo: Haircut + Clean Shave + Hair Wash",
        nameHi: "क्लासिक कॉम्बो: कटिंग + शेविंग + हेयर वॉश",
        description: "Trendy haircut + clean razor shave + cooling shampoo wash & dry.",
        duration: "40 min",
        durationMin: 40,
        price: 170,
        popular: true,
        tag: "SAVE ₹30"
      },
      {
        id: "combo-smart",
        name: "Smart Grooming: Haircut + Beard Shape + Almond Champi",
        nameHi: "स्मार्ट ग्रूमिंग: कटिंग + दाढ़ी सेट + बादाम मालिश",
        description: "Stylish haircut + razor beard line + 20 min pure almond oil head champi.",
        duration: "55 min",
        durationMin: 55,
        price: 290,
        popular: true,
        tag: "SAVE ₹60"
      },
      {
        id: "combo-groom",
        name: "Groom / Wedding Special Full Package",
        nameHi: "दूल्हा स्पेशल शादी कम्पलीट पैकेज",
        description: "Master Haircut + Beard Spa + Keratin Treatment + Gold Facial + Hair Wash + Champi.",
        duration: "120 min",
        durationMin: 120,
        price: 1999,
        popular: true,
        tag: "VIP SAVE ₹500"
      }
    ]
  }
];

class ServiceCatalogManager {
  constructor() {
    this.storageKey = "amit_saloon_custom_services_v2";
    this.services = this.loadServices();
  }

  loadServices() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load custom services:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SERVICES));
  }

  saveServices() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.services));
    } catch (e) {
      console.warn("Could not save custom services:", e);
    }
  }

  // Add a newly customized haircut or service
  addCustomService(categoryName, name, nameHi, price, durationMin, description) {
    const newId = "custom-" + Date.now();
    const item = {
      id: newId,
      name: name || "Custom Haircut",
      nameHi: nameHi || name,
      description: description || "Custom requested service tailored to customer requirements.",
      duration: `${durationMin || 30} min`,
      durationMin: parseInt(durationMin) || 30,
      price: parseInt(price) || 150,
      popular: false,
      tag: "CUSTOM"
    };

    let cat = this.services.find(c => c.category === categoryName);
    if (!cat) {
      cat = this.services[0]; // fallback to hair
    }
    cat.items.unshift(item);
    this.saveServices();
    return item;
  }

  // Edit price of an existing service
  updateServicePrice(serviceId, newPrice) {
    for (const cat of this.services) {
      const item = cat.items.find(i => i.id === serviceId);
      if (item) {
        item.price = parseInt(newPrice) || item.price;
        this.saveServices();
        return item;
      }
    }
    return null;
  }

  resetToDefault() {
    this.services = JSON.parse(JSON.stringify(DEFAULT_SERVICES));
    this.saveServices();
    return this.services;
  }
}

const serviceCatalogManager = new ServiceCatalogManager();

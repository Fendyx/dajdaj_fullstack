const products = [
  {
    id: '1',
    name: { en: 'Male Bodybuilder', pl: 'Kulturysta męski' },
    price: 49,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/RegularBodyBuilder_withBox.png',
    category: 'male',
    description: {
      en: 'Perfect for celebrating victories and achievements',
      pl: 'Idealny do świętowania zwycięstw i osiągnięć'
    },
    isNew: true,
    isPopular: true,
    link: '/products/male-bodybuilder',
    phrases: {
      en: [
        "Power is in your hands",
        "Built for champions",
        "Strength defines you",
        "Lift, live, repeat",
        "Own your limits"
      ],
      pl: [
        "Siła jest w twoich rękach",
        "Stworzony dla mistrzów",
        "Siła cię definiuje",
        "Podnoś, żyj, powtarzaj",
        "Pokonaj swoje granice"
      ]
    }
  },
  {
    id: '2',
    name: { en: 'Beer Edition', pl: 'Edycja \"Piwko\"' },
    price: 45,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/NewPiwoEdycja_withBox.png',
    category: 'male',
    description: {
      en: 'Bench press lying, drink sitting',
      pl: 'Wyciskam na leżąco, piję na siedząco'
    },
    isNew: true,
    link: '/products/beer-edition',
    phrases: {
      en: [
        "Cheers to strength",
        "Train hard, sip easy",
        "Beer and gains unite",
        "Work out, chill out",
        "Sip after the set"
      ],
      pl: [
        "Na zdrowie i siłę",
        "Trenuj ciężko, pij lekko",
        "Piwo i progres razem",
        "Ćwicz i relaksuj się",
        "Łyk po serii"
      ]
    }
  },
  {
    id: '3',
    name: { en: 'Trust the Bulk', pl: 'Zaufaj masie' },
    price: 52,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/NewTrustedTheBulk.png',
    category: 'male',
    description: {
      en: 'For those who inspire with their dedication',
      pl: 'Dla tych, którzy inspirują swoją determinacją'
    },
    isPopular: true,
    link: '/products/trust-bulk',
    phrases: {
      en: [
        "Bulk mode on",
        "Size matters",
        "Eat big, lift big",
        "Massive progress ahead",
        "Grow stronger daily"
      ],
      pl: [
        "Tryb masy włączony",
        "Rozmiar ma znaczenie",
        "Jedz dużo, podnoś dużo",
        "Wielki progres przed tobą",
        "Rośnij silniejszy każdego dnia"
      ]
    }
  },
  {
    id: '4',
    name: { en: 'Never Skip Leg Day', pl: 'Nigdy nie pomijaj dnia nóg' },
    price: 47,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/NewNeverSkipLegDay.png',
    category: 'male',
    description: {
      en: 'Celebrating comeback stories and resilience',
      pl: 'Świętując powroty i wytrwałość'
    },
    link: '/products/never-skip-legs',
    phrases: {
      en: [
        "Legs never lie",
        "Power from the ground",
        "Squat like a queen",
        "Strong legs, strong life",
        "Leg day every day"
      ],
      pl: [
        "Nogi nigdy nie kłamią",
        "Siła od ziemi",
        "Przysiady jak królowa",
        "Silne nogi, silne życie",
        "Dzień nóg codziennie"
      ]
    }
  },
  {
    id: '5',
    name: { en: 'Pink Female', pl: 'Różowa Figuryna' },
    price: 50,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/pinkHair_web.png',
    category: 'female',
    description: {
      en: 'For protectors and role models',
      pl: 'Dla opiekunów i wzorów do naśladowania'
    },
    link: '/products/female-pink',
    phrases: {
      en: [
        "Stay bold, stay pink",
        "Power with grace",
        "Strength in style",
        "Fearless and feminine",
        "Strong, stylish, unstoppable"
      ],
      pl: [
        "Bądź odważna, bądź różowa",
        "Siła z gracją",
        "Siła w stylu",
        "Nieustraszona i kobieca",
        "Silna, stylowa, nie do zatrzymania"
      ]
    }
  },
  {
    id: '6',
    name: { en: 'The Empress', pl: 'Cesarzowa' },
    price: 48,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/brunetteHair_web.png',
    category: 'female',
    description: {
      en: 'Celebrating leadership and grace under pressure',
      pl: 'Świętując przywództwo i grację pod presją'
    },
    link: '/products/female-brunette',
    phrases: {
      en: [
        "Rule your world",
        "Lead with strength",
        "Grace and power combined",
        "Your throne awaits",
        "Empowered and unstoppable"
      ],
      pl: [
        "Rządź swoim światem",
        "Prowadź z siłą",
        "Gracja i siła razem",
        "Twój tron czeka",
        "Wzmocniona i nie do zatrzymania"
      ]
    }
  },
  {
    id: '7',
    name: { en: 'The Legend', pl: 'Legenda' },
    price: 55,
    image: 'https://raw.githubusercontent.com/Fendyx/images/refs/heads/main/blondHair_web.jpg',
    category: 'female',
    description: {
      en: 'For those who leave lasting impressions',
      pl: 'Dla tych, którzy zostawiają trwałe wrażenia'
    },
    isPopular: true,
    link: '/products/female-blond',
    phrases: {
      en: [
        "Legends never die",
        "Be the story",
        "Unstoppable legacy",
        "Greatness is yours",
        "Write your legend"
      ],
      pl: [
        "Legendy nigdy nie umierają",
        "Bądź historią",
        "Niepowstrzymane dziedzictwo",
        "Wielkość jest twoja",
        "Napisz swoją legendę"
      ]
    }
  },
  {
    id: '8',
    name: { en: 'The Inspiration', pl: 'Inspiracja' },
    price: 46,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    category: 'female',
    description: {
      en: 'Perfect for motivators and dream chasers',
      pl: 'Idealna dla motywatorów i marzycieli'
    },
    link: '/products/special-girl',
    phrases: {
      en: [
        "Inspire greatness daily",
        "Dream big, act bigger",
        "Fuel their ambition",
        "Chase dreams relentlessly",
        "Be the spark"
      ],
      pl: [
        "Inspiruj wielkość codziennie",
        "Marz wielko, działaj większy",
        "Napędzaj ich ambicję",
        "Gon za marzeniami bez wytchnienia",
        "Bądź iskrą"
      ]
    }
  }
];

module.exports = products;

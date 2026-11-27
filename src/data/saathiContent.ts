import {
  CommunityStory,
  DistrictRecognitionEntry,
  PeerSolution,
  ProblemTheme,
} from '../types';

export const HERO_CLASSROOM_IMAGE = '/src/assets/images/saathi_hero_classroom_1795606668886.jpg';
export const AVATAR_SUNITA = '/src/assets/images/teacher_avatar_sunita_1795606670313.jpg';
export const AVATAR_RAJESH = '/src/assets/images/teacher_avatar_rajesh_1795606670716.jpg';
export const AVATAR_KAVITA = '/src/assets/images/teacher_avatar_kavita_1795606670868.jpg';

export const PROBLEM_THEMES: ProblemTheme[] = [
  {
    id: 'multi-age',
    size: 'large',
    sourceType: 'classroom_hypothesis',
    commonalityRank: 1,
    title: {
      hi: 'एक साथ कई कक्षाएँ और अलग-अलग स्तर',
      en: 'Multi-age & multi-level classrooms',
    },
    shortPrompt: {
      hi: 'कक्षा 1 से 5 के बच्चे एक कमरे में, सबका सीखने का स्तर अलग',
      en: 'Multiple grades in one room with varied learning levels',
    },
    contextNote: {
      hi: 'कक्षा शिक्षण · आम चुनौती',
      en: 'Classroom teaching · Common need',
    },
    planIntro: {
      hi: 'जब एक ही शिक्षक को दो या तीन कक्षाएँ साथ संभालनी हों, तो पूरी कक्षा को एक साथ पढ़ाने के बजाय छोटे-समूह चक्र सबसे बेहतर काम करता है।',
      en: 'When one teacher handles multiple grades together, short station rotations work better than whole-class lecturing.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'स्तर के अनुसार 3 बैठने के समूह बनाएं', en: 'Form 3 level-based seating groups' },
        detail: {
          hi: 'कक्षा की शुरुआत में 5 मिनट में बच्चों को शुरुआती, मध्य और स्वतंत्र अभ्यास समूह में बैठाएं — कक्षा के नंबर से नहीं, पढ़ने के स्तर से।',
          en: 'Spend 5 minutes grouping students by current reading readiness—starter, guided, and independent—rather than grade label alone.',
        },
        duration: { hi: '5 मिनट', en: '5 mins' },
      },
      {
        stepNumber: 2,
        title: { hi: 'एक समूह के साथ सक्रिय शिक्षण, बाकी दो को तय कार्य', en: 'Direct focus on 1 group while 2 work independently' },
        detail: {
          hi: '15 मिनट एक समूह को नया पाठ सिखाएं। इस बीच बाकी दोनों समूहों को स्लेट या कार्यपत्रक पर स्पष्ट अभ्यास कार्य दें।',
          en: 'Teach one group directly for 15 minutes while the other two complete structured slate or worksheet tasks.',
        },
        duration: { hi: '15 मिनट प्रति चक्र', en: '15 mins / cycle' },
      },
      {
        stepNumber: 3,
        title: { hi: 'सप्ताह 3: बड़े बच्चों को "साथी सहायक" की भूमिका दें', en: 'Week 3: Assign older students as peer buddies' },
        detail: {
          hi: 'स्वतंत्र समूह के दो समझदार बच्चों को छोटे बच्चों के शब्द पढ़ने या गिनती जाँचने की ज़िम्मेदारी दें।',
          en: 'Pair two confident older students to check letter recognition or counting with younger learners.',
        },
        duration: { hi: 'सप्ताह 3 · रोज़ 10 मिनट', en: 'Week 3 · 10 mins/day' },
      },
      {
        stepNumber: 4,
        title: { hi: 'सप्ताह 4: प्रगति जांचें और अपनी आवाज़ में अनुभव साझा करें', en: 'Week 4: Review progress & share your voice tip' },
        detail: {
          hi: 'चौथे सप्ताह के अंत में देखें कि कौन-से बच्चे अब अकेले पढ़ पा रहे हैं, और जो तरीका काम आया उसे साथियों के लिए रिकॉर्ड करें।',
          en: 'At the end of Week 4, notice which learners moved up a level and record a short voice tip for fellow teachers.',
        },
        duration: { hi: 'सप्ताह 4 · शुक्रवार 15 मिनट', en: 'Week 4 · 15 mins Fri' },
      },
    ],
  },
  {
    id: 'irregular-attendance',
    size: 'large',
    sourceType: 'mitra_school',
    commonalityRank: 2,
    title: {
      hi: 'अनियमित उपस्थिति और मौसमी पलायन',
      en: 'Irregular attendance & seasonal migration',
    },
    shortPrompt: {
      hi: 'फसल या काम के मौसम में बच्चों का हफ़्तों स्कूल न आना',
      en: 'Children missing weeks during harvest or family work',
    },
    contextNote: {
      hi: 'स्कूल और परिवार जुड़ाव',
      en: 'School & family connection',
    },
    planIntro: {
      hi: 'गैर-हाज़िर बच्चों को डांटने या पिछड़ने देने के बजाय, वापसी के पहले 3 दिनों को सहज बनाना सबसे ज़रूरी है।',
      en: 'Instead of letting returning children fall behind, making their first 3 days back welcoming prevents permanent drop-out.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'सोमवार सुबह "स्वागत कॉल" या संदेश', en: 'Monday morning check-in with families' },
        detail: {
          hi: 'जो बच्चे 3 दिन से लगातार न आएं, उनके परिवार को दोपहर के बाद एक छोटा दोस्ताना कॉल या आस-पड़ोस के बच्चे से संदेश भेजें।',
          en: 'For any child absent 3 consecutive days, send a friendly afternoon call or neighborhood peer message—focused on care, not complaint.',
        },
        duration: { hi: '10 मिनट', en: '10 mins' },
      },
      {
        stepNumber: 2,
        title: { hi: 'वापसी पर 10 मिनट का "पुनरावृत्ति कार्ड"', en: '10-minute catch-up card on return' },
        detail: {
          hi: 'लौटने वाले बच्चे को पुरानी कॉपी के बजाय केवल पिछले सप्ताह के 2 मुख्य शब्दों/सवालों का छोटा कार्ड दें ताकि झिझक न हो।',
          en: 'Give returning students a simple 2-concept recap card rather than overwhelming them with missed notebook pages.',
        },
        duration: { hi: '10 मिनट', en: '10 mins' },
      },
      {
        stepNumber: 3,
        title: { hi: 'सप्ताह 3: सप्ताह में 1 दिन "रोचक गतिविधि दिवस"', en: 'Week 3: Weekly joyful Friday anchor activity' },
        detail: {
          hi: 'शनिवार या शुक्रवार को कहानी, खेल या स्थानीय पहेली का तय समय रखें जिससे बच्चे खुद स्कूल आने को उत्सुक रहें।',
          en: 'Keep a fixed weekly storytelling, local riddle, or game slot so children look forward to attending.',
        },
        duration: { hi: 'सप्ताह 3 · 30 मिनट', en: 'Week 3 · 30 mins' },
      },
      {
        stepNumber: 4,
        title: { hi: 'सप्ताह 4: नियमित हुए बच्चों की सराहना और अनुभव साझा', en: 'Week 4: Celebrate returning children & share story' },
        detail: {
          hi: 'महीने के अंत में प्रार्थना सभा में लौटने वाले बच्चों का उत्साह बढ़ाएं और देखें किन परिवारों से संवाद सबसे कारगर रहा।',
          en: 'Appreciating returning learners in morning assembly builds confidence; note what worked best with families.',
        },
        duration: { hi: 'सप्ताह 4 · 15 मिनट', en: 'Week 4 · 15 mins' },
      },
    ],
  },
  {
    id: 'multilingual',
    size: 'large',
    sourceType: 'classroom_hypothesis',
    commonalityRank: 3,
    title: {
      hi: 'घर की बोली और स्कूल की हिंदी में अंतर',
      en: 'Multilingual classrooms & home dialect gap',
    },
    shortPrompt: {
      hi: 'बच्चे घर की स्थानीय भाषा बोलते हैं और किताब की हिंदी समझने में झिझकते हैं',
      en: 'Students speak home dialects and hesitate with textbook Hindi',
    },
    contextNote: {
      hi: 'कक्षा शिक्षण · भाषा सेतु',
      en: 'Classroom teaching · Language bridge',
    },
    planIntro: {
      hi: 'घर की बोली को रोकने के बजाय उसे हिंदी सीखने की सीढ़ी बनाने से बच्चों का बोलना और समझना दोनों तेज़ी से बढ़ता है।',
      en: 'Treating home language as a bridge rather than a barrier builds speaking confidence and faster Hindi comprehension.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'कक्षा में "दो शब्द — एक अर्थ" दीवार बनाएं', en: 'Build a Dual-Word Wall in class' },
        detail: {
          hi: 'रोज़ किसी एक वस्तु या भाव का नाम पहले बच्चों की स्थानीय बोली में और ठीक उसके बगल में मानक हिंदी में चार्ट पर लिखें।',
          en: 'Write daily familiar words in the local home dialect side-by-side with textbook Hindi on a wall chart.',
        },
        duration: { hi: '10 मिनट', en: '10 mins' },
      },
      {
        stepNumber: 2,
        title: { hi: 'जवाब अपनी बोली में देने की छूट दें', en: 'Allow initial answers in home language' },
        detail: {
          hi: 'पहले बच्चे को अपनी बोली में पूरा उत्तर बोलने दें, फिर आप मुस्कुराकर वही वाक्य हिंदी में दोहराएं।',
          en: 'Let students express ideas freely in their home language first, then gently echo the same thought in Hindi.',
        },
        duration: { hi: 'हर पाठ में', en: 'Every lesson' },
      },
      {
        stepNumber: 3,
        title: { hi: 'सप्ताह 3: चित्रों वाली स्थानीय कहानियाँ सुनें', en: 'Week 3: Picture storytelling from local life' },
        detail: {
          hi: 'बाज़ार, खेत या त्योहार के चित्र दिखाकर बच्चों से उनके अपने शब्दों में 2 वाक्य सुनें।',
          en: 'Use pictures of local markets, farms, or festivals and invite 2-sentence oral stories from students.',
        },
        duration: { hi: 'सप्ताह 3 · 15 मिनट', en: 'Week 3 · 15 mins' },
      },
      {
        stepNumber: 4,
        title: { hi: 'सप्ताह 4: बच्चों की दो-भाषी शब्द पुस्तिका बनाएं', en: 'Week 4: Create a mini class bilingual booklet' },
        detail: {
          hi: 'बच्चों द्वारा बताए 10 सबसे प्यारे शब्दों को चित्रों के साथ एक चार्ट पर सजाएं और अपनी आवाज़ में परिणाम साझा करें।',
          en: 'Compile 10 favorite local + Hindi words with student drawings on a chart and share your story.',
        },
        duration: { hi: 'सप्ताह 4 · 20 मिनट', en: 'Week 4 · 20 mins' },
      },
    ],
  },
  {
    id: 'foundational-fln',
    size: 'medium',
    sourceType: 'classroom_hypothesis',
    commonalityRank: 4,
    title: {
      hi: 'पढ़ने और बुनियादी गणित में पीछे रह गए बच्चे',
      en: 'Foundational reading & numeracy gaps',
    },
    shortPrompt: {
      hi: 'बड़ी कक्षा के बच्चे भी अक्षर पहचान या आसान जोड़-घटाव में अटक रहे हैं',
      en: 'Older primary students still struggling with decoding or basic operations',
    },
    contextNote: {
      hi: 'कक्षा शिक्षण · पढ़ना व गिनती',
      en: 'Classroom teaching · Reading & math',
    },
    planIntro: {
      hi: 'रोज़ सुबह के पहले 20 मिनट केवल आवाज़, अक्षर और गिनती के खेल के लिए रखने से बिना अतिरिक्त किताबों के सुधार दिखता है।',
      en: 'Dedicating the first 20 minutes daily to sound-letter games and concrete counting drives steady progress.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'रोज़ 10 मिनट "ध्वनि और शब्द जोड़" अभ्यास', en: '10-min daily sound blending warm-up' },
        detail: {
          hi: 'बोर्ड पर केवल 4 वर्ण लिखें और उनसे नए शब्द बनाने का खेल कराएं — जैसे क, म, ल, न।',
          en: 'Write 4 familiar letters on the board and play rapid word-building combinations together.',
        },
        duration: { hi: '10 मिनट', en: '10 mins' },
      },
      {
        stepNumber: 2,
        title: { hi: 'कंकड़, तीली या पत्तों से गिनती और हासिल', en: 'Concrete math with pebbles or sticks' },
        detail: {
          hi: 'सीधे कॉपी में जोड़-घटाव से पहले 10-10 की गठरी बनाकर स्थानीय वस्तुओं से अभ्यास कराएं।',
          en: 'Bundle sticks or pebbles in tens before moving to abstract column addition and subtraction.',
        },
        duration: { hi: '15 मिनट', en: '15 mins' },
      },
      {
        stepNumber: 3,
        title: { hi: 'जोड़ी में छोटे कार्ड से अभ्यास खेल', en: 'Pair reading & number card quiz' },
        detail: {
          hi: 'दो-दो बच्चों की जोड़ी बनाकर 10 मिनट एक-दूसरे से कार्ड पर लिखे शब्द और सरल जोड़ पूछने का खेल कराएं।',
          en: 'Pair students up for 10 minutes to quiz each other using homemade word and number cards.',
        },
        duration: { hi: 'सप्ताह 3 · 10 मिनट', en: 'Week 3 · 10 mins' },
      },
      {
        stepNumber: 4,
        title: { hi: '4 शब्दों व 4 सवालों से मासिक जाँच', en: 'Week 4: 4-word & 4-sum friendly check' },
        detail: {
          hi: 'बिना डर के खेल-खेल में हर बच्चे से 4 शब्द पढ़वाएं और 4 छोटे सवाल हल कराएं ताकि सुधार दिखे।',
          en: 'Run a stress-free 4-word reading and 4-sum math check to spot progress and celebrate effort.',
        },
        duration: { hi: 'सप्ताह 4 · 15 मिनट', en: 'Week 4 · 15 mins' },
      },
    ],
  },
  {
    id: 'missing-docs',
    size: 'medium',
    sourceType: 'mitra_school',
    commonalityRank: 5,
    title: {
      hi: 'आधार या जन्म प्रमाणपत्र न होना',
      en: 'Missing Aadhaar or birth certificates',
    },
    shortPrompt: {
      hi: 'दस्तावेज़ न होने से नामांकन, छात्रवृत्ति या डेटा एंट्री में रुकावट',
      en: 'Enrollment, scholarship, or portal registration stalled due to missing IDs',
    },
    contextNote: {
      hi: 'कागज़ात और नामांकन मदद',
      en: 'Documents & enrollment help',
    },
    planIntro: {
      hi: 'अकेले माता-पिता के लिए दफ़्तरों के चक्कर कठिन होते हैं। स्कूल स्तर पर एक सामूहिक सूची बनाना रास्ता आसान करता है।',
      en: 'Individual trips are hard for families; batching school lists with local panchayat/CSC camps saves weeks.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'बिना दस्तावेज़ वाले बच्चों की एक स्पष्ट सूची बनाएं', en: 'Maintain one consolidated missing-ID list' },
        detail: {
          hi: 'अस्थायी नामांकन न रोकें। एक रजिस्टर में बच्चे का नाम, माता-पिता का नंबर और कौन-सा कागज़ अधूरा है, यह दर्ज करें।',
          en: 'Never delay classroom entry; keep a single register tracking child name, parent phone, and specific missing document.',
        },
        duration: { hi: '20 मिनट', en: '20 mins' },
      },
      {
        stepNumber: 2,
        title: { hi: 'ब्लॉक या ग्राम पंचायत के साथ शिविर की बात करें', en: 'Coordinate a Panchayat/CSC camp day' },
        detail: {
          hi: '5 से अधिक बच्चे होने पर हेडमास्टर और बीआरसी के माध्यम से पास के जनसेवा केंद्र या आंगनवाड़ी के साथ एक दिन तय करें।',
          en: 'If 5+ students need IDs, coordinate through the headteacher/BRC for a local Anganwadi or CSC camp day.',
        },
        duration: { hi: 'सप्ताह 2 · समन्वय', en: 'Week 2 · Coordinate' },
      },
      {
        stepNumber: 3,
        title: { hi: 'अभिभावकों को ज़रूरी कागज़ात की आसान पर्ची दें', en: 'Send a simple document checklist slip home' },
        detail: {
          hi: 'शिविर से 3 दिन पहले बच्चे के हाथ एक छोटी पर्ची भेजें कि किस कागज़ (राशन कार्ड/माता-पिता आधार) की फ़ोटो कॉपी लानी है।',
          en: 'Send a short slip 3 days before camp listing exact photocopies parents should bring.',
        },
        duration: { hi: 'सप्ताह 3 · 10 मिनट', en: 'Week 3 · 10 mins' },
      },
      {
        stepNumber: 4,
        title: { hi: 'पूर्ण दस्तावेज़ दर्ज करें और अनुभव साझा करें', en: 'Week 4: Update register & share camp tip' },
        detail: {
          hi: 'कितने बच्चों के कागज़ पूरे हुए यह रजिस्टर में दर्ज करें और अपना अनुभव अन्य शिक्षकों के लिए आवाज़ में साझा करें।',
          en: 'Mark completed IDs in the school register and share your coordination tip by voice for other blocks.',
        },
        duration: { hi: 'सप्ताह 4 · 15 मिनट', en: 'Week 4 · 15 mins' },
      },
    ],
  },
  {
    id: 'child-work',
    size: 'medium',
    sourceType: 'mitra_school',
    commonalityRank: 6,
    title: {
      hi: 'घर के काम या मज़दूरी में बच्चों का समय लगना',
      en: 'Children engaged in household chores or work',
    },
    shortPrompt: {
      hi: 'छोटे भाई-बहन संभालने या खेत/दुकान के काम से पढ़ाई छूटना',
      en: 'Missing school due to sibling care, farm chores, or family work',
    },
    contextNote: {
      hi: 'घर के काम और स्कूल संतुलन',
      en: 'Home chores & school balance',
    },
    planIntro: {
      hi: 'अभिभावकों के प्रति सम्मानजनक संवाद और स्कूल समय के भीतर लचीला अभ्यास इन बच्चों को जुड़े रखने में मदद करता है।',
      en: 'Respectful family conversations paired with zero-homework classroom practice keep working children connected.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'सारा ज़रूरी अभ्यास स्कूल समय में ही पूरा कराएं', en: 'Complete core practice inside school hours' },
        detail: {
          hi: 'जिन बच्चों के पास घर पर समय नहीं है, उन पर भारी होमवर्क का दबाव न डालें — आखिरी 15 मिनट कक्षा में ही अभ्यास रखें।',
          en: 'Avoid heavy homework penalties; reserve the final 15 minutes of class for guided practice.',
        },
        duration: { hi: '15 मिनट / दिन', en: '15 mins / day' },
      },
      {
        stepNumber: 2,
        title: { hi: 'माता-पिता से बिना दोष दिए संवाद करें', en: 'Solution-oriented parent dialogue' },
        detail: {
          hi: 'माता-पिता से पूछें कि सुबह या दोपहर किस समय बच्चा आसानी से आ सकता है, और आंगनवाड़ी समन्वय की जानकारी दें।',
          en: 'Ask parents openly about morning constraints and share local Anganwadi creche support where available.',
        },
        duration: { hi: '15 मिनट', en: '15 mins' },
      },
      {
        stepNumber: 3,
        title: { hi: 'घर के लिए 5-मिनट "पॉकेट अभ्यास कार्ड" दें', en: 'Give 5-min pocket practice cards for home' },
        detail: {
          hi: 'यदि कोई बच्चा किसी दिन न आ सके तो छोटे कार्ड पर 3 शब्द या 2 सवाल दें जिन्हें वह खाली समय में दोहरा सके।',
          en: 'Share a tiny 3-word or 2-sum pocket card so busy students stay connected even on missed days.',
        },
        duration: { hi: 'सप्ताह 3 · 10 मिनट', en: 'Week 3 · 10 mins' },
      },
      {
        stepNumber: 4,
        title: { hi: 'महीने के अंत में परिवार व बच्चे की सराहना करें', en: 'Week 4: Appreciate regular effort with family' },
        detail: {
          hi: 'जो बच्चे काम के बावजूद सप्ताह में ज़्यादा दिन आए, उनके माता-पिता को धन्यवाद संदेश भेजें और अपनी सीख साझा करें।',
          en: 'Thank parents of children who improved attendance despite chores and record what helped most.',
        },
        duration: { hi: 'सप्ताह 4 · 10 मिनट', en: 'Week 4 · 10 mins' },
      },
    ],
  },
  {
    id: 'large-class',
    size: 'medium',
    sourceType: 'classroom_hypothesis',
    commonalityRank: 7,
    title: {
      hi: 'बड़ी कक्षा में हर बच्चे पर व्यक्तिगत ध्यान',
      en: 'Individual attention in large classes',
    },
    shortPrompt: {
      hi: '45 से अधिक बच्चों में पीछे बैठने वाले बच्चों का छूट जाना',
      en: 'Back-row students getting overlooked in 45+ student rooms',
    },
    contextNote: {
      hi: 'बड़ी कक्षा संभालने के तरीके',
      en: 'Managing large classes',
    },
    planIntro: {
      hi: 'हर सप्ताह बैठने की जगह बदलने और "2 मिनट की जाँच" से हर बच्चे की भागीदारी सुनिश्चित की जा सकती है।',
      en: 'Weekly seat rotation and quick 2-minute check-ins prevent back-row invisibility.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'सोमवार को आगे-पीछे बैठने का क्रम बदलें', en: 'Rotate front and back rows every Monday' },
        detail: {
          hi: 'हर हफ्ते पीछे की दो पंक्तियों को आगे लाएं ताकि हर बच्चे को बोर्ड और शिक्षक के पास बैठने का मौका मिले।',
          en: 'Swap back rows to the front every Monday so every child gets direct proximity to the board.',
        },
        duration: { hi: '3 मिनट / सप्ताह', en: '3 mins / week' },
      },
      {
        stepNumber: 2,
        title: { hi: 'कॉपी जाँच में "5-बच्चे प्रतिदिन" नियम अपनाएं', en: 'Check 5 quiet students deeply each day' },
        detail: {
          hi: 'एक दिन में सभी 50 कॉपियाँ जाँचने की जगह रोज़ 5 कम बोलने वाले बच्चों के पास बैठकर 1 मिनट बात करें।',
          en: 'Instead of rushing 50 notebooks, spend 1 focused minute beside 5 quieter students each day.',
        },
        duration: { hi: '5 मिनट / दिन', en: '5 mins / day' },
      },
      {
        stepNumber: 3,
        title: { hi: '"जोड़ी में जाँच" और छोटे समूह नेतृत्व शुरू करें', en: 'Introduce pair checking & row captains' },
        detail: {
          hi: 'हर पंक्ति में एक छात्र-साथी तय करें जो स्लेट अभ्यास शुरू होने पर मदद करे और शिक्षक को संकेत दे।',
          en: 'Rotate a row helper in each row to assist peers during slate work and flag anyone stuck.',
        },
        duration: { hi: 'सप्ताह 3 · रोज़', en: 'Week 3 · Daily' },
      },
      {
        stepNumber: 4,
        title: { hi: 'समीक्षा: क्या पिछली पंक्ति के बच्चे बोलने लगे?', en: 'Week 4: Reflect on back-row participation' },
        detail: {
          hi: 'चौथे सप्ताह में देखें कि कौन-से चुप रहने वाले बच्चे अब जवाब दे रहे हैं और अपनी युक्ति आवाज़ में साझा करें।',
          en: 'Review how many quiet students now raise their hands and share your seating/check-in tip.',
        },
        duration: { hi: 'सप्ताह 4 · 10 मिनट', en: 'Week 4 · 10 mins' },
      },
    ],
  },
  {
    id: 'parent-ptm',
    size: 'medium',
    sourceType: 'mitra_school',
    commonalityRank: 8,
    title: {
      hi: 'अभिभावक संवाद और बैठक में कम उपस्थिति',
      en: 'Low parent engagement & PTM turnout',
    },
    shortPrompt: {
      hi: 'माता-पिता बैठक में नहीं आ पाते या बच्चे की प्रगति समझ नहीं पाते',
      en: 'Parents unable to attend meetings or unsure how to support learning',
    },
    contextNote: {
      hi: 'माता-पिता से बातचीत',
      en: 'Talking with parents',
    },
    planIntro: {
      hi: 'बैठक में शिकायतों के बजाय बच्चे की एक अच्छी आदत दिखाने से माता-पिता का भरोसा और आना दोनों बढ़ता है।',
      en: 'Leading parent conversations with one positive student strength transforms turnout and trust.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'सुबह स्कूल शुरू होने से पहले 15 मिनट मिलें', en: 'Offer flexible 15-min morning drop-in slots' },
        detail: {
          hi: 'दिहाड़ी काम करने वाले माता-पिता के लिए दोपहर के बजाय सुबह 8:30–9:00 का खुला समय रखें।',
          en: 'Hold informal morning drop-ins before work hours rather than rigid midday meetings.',
        },
        duration: { hi: '15 मिनट', en: '15 mins' },
      },
      {
        stepNumber: 2,
        title: { hi: 'शुरुआत बच्चे की एक खूबी से करें', en: 'Start with one strength the child showed' },
        detail: {
          hi: 'अभिभावक को बच्चे की एक सुंदर चित्रकला, सही पढ़ा गया शब्द या मददगार आदत दिखाकर बात शुरू करें।',
          en: 'Show one drawing, neat word, or helpful action by the child before discussing next steps.',
        },
        duration: { hi: '5 मिनट', en: '5 mins' },
      },
      {
        stepNumber: 3,
        title: { hi: 'अभिभावकों के साथ एक आसान "घर की गतिविधि" तय करें', en: 'Agree on one easy 5-min home habit' },
        detail: {
          hi: 'बिना पढ़े-लिखे माता-पिता से भी कहें कि वे रोज़ रात बच्चे से पूछें — "आज स्कूल में कौन-सी नई कहानी सुनी?"',
          en: 'Even non-literate parents can ask every evening: "What story or word did you enjoy today?"',
        },
        duration: { hi: 'सप्ताह 3 · 10 मिनट', en: 'Week 3 · 10 mins' },
      },
      {
        stepNumber: 4,
        title: { hi: 'अच्छी उपस्थिति वाले परिवारों को धन्यवाद व साझा करें', en: 'Week 4: Share PTM turnout & voice story' },
        detail: {
          hi: 'चौथे सप्ताह में देखें कितने नए अभिभावक आए और अपना अनुभव अन्य स्कूलों के लिए साझा करें।',
          en: 'Count how many new parents joined this month and share your outreach story with peers.',
        },
        duration: { hi: 'सप्ताह 4 · 15 मिनट', en: 'Week 4 · 15 mins' },
      },
    ],
  },
  {
    id: 'tlm-shortage',
    size: 'compact',
    sourceType: 'classroom_hypothesis',
    commonalityRank: 9,
    title: {
      hi: 'पढ़ाने की सामग्री और कहानी की किताबों की कमी',
      en: 'Shortage of teaching aids & storybooks',
    },
    shortPrompt: {
      hi: 'सहायक सामग्री न होने से गतिविधि आधारित पढ़ाई में दिक्कत',
      en: 'Limited teaching aids for hands-on classroom activities',
    },
    contextNote: {
      hi: 'बिना खर्च शिक्षण सामग्री',
      en: 'Low-cost teaching aids',
    },
    planIntro: {
      hi: 'पुराने अख़बार, गत्ते और कैलेंडर से बच्चों के साथ मिलकर बनाई गई सामग्री ज़्यादा टिकाऊ और रोचक होती है।',
      en: 'Cardboard, old calendars, and bottle caps turned into aids with students create instant engagement.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'पुराने कैलेंडर के बड़े अंकों के फ्लैशकार्ड', en: 'Old calendar number & letter flashcards' },
        detail: {
          hi: 'पुरानी दीवार कैलेंडर के बड़े नंबर काटकर गत्ते पर चिपकाएं — 1 से 31 तक गिनती और जोड़-घटाव के लिए तैयार।',
          en: 'Cut large digits from old wall calendars onto cardboard scraps for instant number games.',
        },
        duration: { hi: '20 मिनट', en: '20 mins' },
      },
      {
        stepNumber: 2,
        title: { hi: 'कक्षा की "बच्चों द्वारा लिखी किताब" कोना', en: 'Student-authored classroom story corner' },
        detail: {
          hi: 'हर महीने 4 सादे पन्नों को सिलकर बच्चों की सुनाई कहानी और चित्रों की एक किताब कक्षा में टांगें।',
          en: 'Stitch 4 blank pages with students' + "'" + ' own drawings and dictated sentences into a class book.',
        },
        duration: { hi: '30 मिनट', en: '30 mins' },
      },
      {
        stepNumber: 3,
        title: { hi: 'कंकड़, बोतल के ढक्कन और पत्तों से गणित किट', en: 'Build a bottle-cap & pebble math kit' },
        detail: {
          hi: 'बच्चों के साथ मिलकर पुराने डिब्बों में 50 ढक्कन और बीज इकट्ठे करें ताकि हर जोड़ी के पास गिनने की सामग्री हो।',
          en: 'Collect 50 bottle caps or seeds with students into small boxes so every pair has hands-on counters.',
        },
        duration: { hi: 'सप्ताह 3 · 20 मिनट', en: 'Week 3 · 20 mins' },
      },
      {
        stepNumber: 4,
        title: { hi: 'बनाई सामग्री की प्रदर्शनी व अनुभव साझा करें', en: 'Week 4: Showcase low-cost corner & share tip' },
        detail: {
          hi: 'कक्षा में एक रस्सी पर बच्चों के बनाए कार्ड टांगें और बताएं कि किस सामग्री से बच्चे सबसे खुश हुए।',
          en: 'Hang student-made cards on a classroom string and record which zero-cost aid engaged learners most.',
        },
        duration: { hi: 'सप्ताह 4 · 15 मिनट', en: 'Week 4 · 15 mins' },
      },
    ],
  },
  {
    id: 'girls-retention',
    size: 'compact',
    sourceType: 'mitra_school',
    commonalityRank: 10,
    title: {
      hi: 'लड़कियों की नियमित शिक्षा और सुरक्षित आवागमन',
      en: 'Girls’ retention & safe school commute',
    },
    shortPrompt: {
      hi: 'दूरी, शौचालय या सुरक्षा चिंता के कारण बड़ी लड़कियों की अनुपस्थिति',
      en: 'Older girls missing school due to distance, sanitation, or safety concerns',
    },
    contextNote: {
      hi: 'बेटियों की नियमित पढ़ाई',
      en: 'Girls’ regular attendance',
    },
    planIntro: {
      hi: 'गाँव की लड़कियों के आने-जाने का "साथी समूह" और स्कूल में बुनियादी सुविधा की नियमित जाँच तुरंत असर दिखाती है।',
      en: 'Organizing walking buddy groups and checking basic sanitation reliability builds immediate family confidence.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'एक ही टोले की छात्राओं का "चलते-साथी समूह"', en: 'Neighborhood walking buddy groups' },
        detail: {
          hi: 'एक ही मोहल्ले से आने वाली 3–4 लड़कियों का समूह बनाएं ताकि वे साथ आ-जा सकें और अभिभावक निश्चिंत रहें।',
          en: 'Group 3–4 girls from the same hamlet to commute together so families feel assured of safety.',
        },
        duration: { hi: '10 मिनट', en: '10 mins' },
      },
      {
        stepNumber: 2,
        title: { hi: 'हर सोमवार स्वच्छता व सुरक्षा की जाँच', en: 'Monday facility & water check' },
        detail: {
          hi: 'हर सोमवार छात्राओं की सुविधा (ताला, पानी, सफ़ाई) की जाँच कर विद्यालय प्रबंधन समिति (SMC) के सामने रखें।',
          en: 'Verify water, latch, and cleanliness every Monday and share needs with the school committee.',
        },
        duration: { hi: '10 मिनट / सप्ताह', en: '10 mins / week' },
      },
      {
        stepNumber: 3,
        title: { hi: 'माताओं और बड़ी दीदियों के साथ सहज संवाद बैठक', en: 'Open circle with mothers & older sisters' },
        detail: {
          hi: 'तीसरे सप्ताह में स्कूल में 20 मिनट माताओं से बात करके उनकी चिंता सुनें और सुरक्षित माहौल का भरोसा दें।',
          en: 'Host a 20-minute circle with mothers to hear concerns and show the safety steps taken at school.',
        },
        duration: { hi: 'सप्ताह 3 · 20 मिनट', en: 'Week 3 · 20 mins' },
      },
      {
        stepNumber: 4,
        title: { hi: 'नियमित उपस्थिति की समीक्षा और साझा अनुभव', en: 'Week 4: Track regular attendance & share' },
        detail: {
          hi: 'महीने के अंत में देखें कितनी छात्राओं की उपस्थिति बढ़ी और अपने ब्लॉक के लिए एक छोटा समाधान रिकॉर्ड करें।',
          en: 'Review attendance improvement at month-end and share what helped families feel confident.',
        },
        duration: { hi: 'सप्ताह 4 · 15 मिनट', en: 'Week 4 · 15 mins' },
      },
    ],
  },
  {
    id: 'inclusive-support',
    size: 'compact',
    sourceType: 'classroom_hypothesis',
    commonalityRank: 11,
    title: {
      hi: 'विशेष ध्यान या धीमी गति से सीखने वाले बच्चे',
      en: 'Children needing inclusive learning support',
    },
    shortPrompt: {
      hi: 'कम सुनने, कम दिखने या सीखने में विशेष सहयोग चाहने वाले बच्चों को जोड़ना',
      en: 'Supporting learners with vision, hearing, or sensory pace needs',
    },
    contextNote: {
      hi: 'हर बच्चे को साथ लेकर पढ़ाना',
      en: 'Supporting every learner',
    },
    planIntro: {
      hi: 'बैठने की सही जगह, बड़े अक्षर और स्पष्ट इशारों से बिना अलग किए हर बच्चे को मुख्य कक्षा में शामिल किया जा सकता है।',
      en: 'Thoughtful front seating, larger board writing, and multi-sensory cues include every learner naturally.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'आगे बैठने और स्पष्ट रोशनी की व्यवस्था', en: 'Front seating & clear board contrast' },
        detail: {
          hi: 'धीमा सुनने या देखने वाले बच्चे को हमेशा आगे, खिड़की की अच्छी रोशनी और शिक्षक के चेहरे के सामने बैठाएं।',
          en: 'Seat learners with hearing or vision needs upfront facing natural light and clear lip-visibility.',
        },
        duration: { hi: 'तुरंत लागू', en: 'Immediate' },
      },
      {
        stepNumber: 2,
        title: { hi: 'एक साथ दो तरीकों से समझाएं', en: 'Pair spoken words with visual cues' },
        detail: {
          hi: 'बोलने के साथ-साथ हाथ का इशारा, चित्र या मिट्टी/रेत पर उंगली से लिखने का अभ्यास ज़रूर शामिल करें।',
          en: 'Combine verbal instructions with simple gestures, pictures, or tactile sand/slate tracing.',
        },
        duration: { hi: 'हर पाठ में', en: 'Every lesson' },
      },
      {
        stepNumber: 3,
        title: { hi: 'सहयोगी मित्र जोड़ी और छोटे लक्ष्य तय करें', en: 'Pair with a kind buddy & small daily goals' },
        detail: {
          hi: 'एक धैर्यवान साथी बच्चे को साथ बैठाएं और पूरे पाठ के बजाय रोज़ 2 छोटे अभ्यास पूरे करने पर शाबाशी दें।',
          en: 'Seat next to a patient peer buddy and celebrate completing 2 bite-sized tasks each day.',
        },
        duration: { hi: 'सप्ताह 3 · रोज़', en: 'Week 3 · Daily' },
      },
      {
        stepNumber: 4,
        title: { hi: 'माता-पिता व विशेष शिक्षक से अनुभव साझा करें', en: 'Week 4: Share progress with parents & peers' },
        detail: {
          hi: 'चौथे सप्ताह में बच्चे के छोटे सुधार परिवार को बताएं और जो तरीका कारगर रहा उसे साथी मंच पर रिकॉर्ड करें।',
          en: 'Share one small breakthrough with the child’s family and record your inclusive practice tip.',
        },
        duration: { hi: 'सप्ताह 4 · 15 मिनट', en: 'Week 4 · 15 mins' },
      },
    ],
  },
  {
    id: 'ecce-readiness',
    size: 'medium',
    sourceType: 'mitra_school',
    commonalityRank: 12,
    title: {
      hi: 'नए बच्चों की बालवाटिका और स्कूल तैयारी',
      en: 'Balvatika & early school readiness',
    },
    shortPrompt: {
      hi: 'कक्षा 1 में आने वाले नए बच्चों का स्कूल के माहौल में सहज न हो पाना',
      en: 'New Class 1 entrants adjusting to school routines and early play learning',
    },
    contextNote: {
      hi: 'शुरुआती कक्षा · खेल से जुड़ाव',
      en: 'Early years · Play readiness',
    },
    planIntro: {
      hi: 'पहले 6 सप्ताह तक किताबों से पहले खेल, गीत, मिट्टी-रंग और बातचीत का कोना बच्चों में स्कूल के प्रति अपनापन जगाता है।',
      en: 'Using songs, free play, and sensory corners during the first 6 weeks builds joyful school readiness.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'सुबह 15 मिनट "स्वागत घेरा और बालगीत"', en: '15-min morning welcome circle & rhymes' },
        detail: {
          hi: 'दरी पर गोल घेरे में बैठकर स्थानीय कविता, नाम पहचान का खेल और हाथ हिलाकर गिनती कराएं।',
          en: 'Sit in a floor circle for local rhymes, name games, and action counting before formal slate work.',
        },
        duration: { hi: '15 मिनट / दिन', en: '15 mins / day' },
      },
      {
        stepNumber: 2,
        title: { hi: 'आंगनवाड़ी दीदी के साथ साप्ताहिक जुड़ाव', en: 'Weekly bridge with Anganwadi worker' },
        detail: {
          hi: 'महीने में एक दिन पास के आंगनवाड़ी केंद्र के बच्चों को स्कूल प्रांगण में कहानी सुनने बुलाएं।',
          en: 'Invite nearby Anganwadi children once a month for a courtyard story session to ease transition.',
        },
        duration: { hi: 'सप्ताह 2 · 20 मिनट', en: 'Week 2 · 20 mins' },
      },
      {
        stepNumber: 3,
        title: { hi: 'कक्षा में मिट्टी, रंग और मिलान खेल का कोना', en: 'Set up a play, clay & matching corner' },
        detail: {
          hi: 'तीसरे सप्ताह में पत्तों, रंगीन कागज़ और मोटे क्रेयॉन से आकार मिलाने और स्वतंत्र चित्र बनाने का 20 मिनट का समय रखें।',
          en: 'Dedicate 20 minutes daily to shape matching with leaves, clay, and bold crayon free-drawing.',
        },
        duration: { hi: 'सप्ताह 3 · 20 मिनट', en: 'Week 3 · 20 mins' },
      },
      {
        stepNumber: 4,
        title: { hi: 'बच्चों के आत्मविश्वास की समीक्षा और साझा', en: 'Week 4: Notice smiling comfort & share story' },
        detail: {
          hi: 'देखें कि कितने नए बच्चे अब खुशी से स्कूल आते और बोलते हैं, तथा अपना अनुभव अन्य शिक्षकों से साझा करें।',
          en: 'Notice which new entrants now join circle time happily and record your Balvatika tip.',
        },
        duration: { hi: 'सप्ताह 4 · 15 मिनट', en: 'Week 4 · 15 mins' },
      },
    ],
  },
  {
    id: 'out-of-school-tracking',
    size: 'compact',
    sourceType: 'mitra_school',
    commonalityRank: 13,
    title: {
      hi: 'स्कूल से बाहर छूटे बच्चों की पहचान और वापसी',
      en: 'Out-of-school child tracking & re-enrollment',
    },
    shortPrompt: {
      hi: 'टोले-मोहल्ले में नामांकन से छूटे या बीच में पढ़ाई छोड़ चुके बच्चे',
      en: 'Unenrolled or dropped-out children identified during community Chaupals',
    },
    contextNote: {
      hi: 'स्कूल से छूटे बच्चों को जोड़ना',
      en: 'Bringing back out-of-school children',
    },
    planIntro: {
      hi: 'चौपाल दीदियों, एसएमसी और युवाओं के साथ मिलकर मोहल्ला-वार छोटे संपर्क अभियान से छूटे बच्चों की वापसी आसान होती है।',
      en: 'Partnering with Chaupal women leaders, SMC members, and youth volunteers simplifies re-enrollment.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'चौपाल दीदी और एसएमसी के साथ टोला संपर्क सूची', en: 'Hamlet-level outreach list with Chaupal leaders' },
        detail: {
          hi: 'महीने में एक बार महिला समूह या युवा साथी से पूछकर बिना नामांकन वाले बच्चों के घरों तक पैदल जाएं।',
          en: 'Walk with local women leaders or youth volunteers once a month to visit unenrolled households.',
        },
        duration: { hi: 'मासिक भ्रमण', en: 'Monthly walk' },
      },
      {
        stepNumber: 2,
        title: { hi: 'आयु-उपयुक्त कक्षा में सहज स्वागत', en: 'Warm bridge onboarding into age-appropriate class' },
        detail: {
          hi: 'प्रवेश के पहले 2 सप्ताह केवल चित्र, खेल और बुनियादी शब्द कार्ड से विश्वास बढ़ाएं।',
          en: 'Spend the first 2 weeks building comfort with picture books and basic word cards.',
        },
        duration: { hi: 'सप्ताह 2 · 15 मिनट', en: 'Week 2 · 15 mins' },
      },
      {
        stepNumber: 3,
        title: { hi: 'मोहल्ले के साथी बच्चे को "साथ चलने वाला दोस्त" बनाएं', en: 'Assign a neighborhood walking friend' },
        detail: {
          hi: 'नए जुड़े बच्चे के ही टोले के एक नियमित छात्र को सुबह साथ स्कूल लाने की ज़िम्मेदारी दें।',
          en: 'Pair the newly enrolled child with a regular student from the same lane to walk together.',
        },
        duration: { hi: 'सप्ताह 3 · रोज़', en: 'Week 3 · Daily' },
      },
      {
        stepNumber: 4,
        title: { hi: 'पहला महीना पूरा होने पर प्रगति और अनुभव साझा', en: 'Week 4: Review 30-day retention & share' },
        detail: {
          hi: 'चौथे सप्ताह में देखें कि नया बच्चा कितना नियमित है और किस बात ने परिवार को सबसे ज़्यादा भरोसा दिलाया।',
          en: 'Check 30-day attendance stability and share your community outreach tip with peers.',
        },
        duration: { hi: 'सप्ताह 4 · 15 मिनट', en: 'Week 4 · 15 mins' },
      },
    ],
  },
  {
    id: 'art-expression',
    size: 'compact',
    sourceType: 'classroom_hypothesis',
    commonalityRank: 14,
    title: {
      hi: 'चित्र, कहानी और बच्चों का आत्मविश्वास',
      en: 'Art, stories & student confidence',
    },
    shortPrompt: {
      hi: 'झिझकने वाले बच्चों को बोलने, चित्र बनाने और अभिनय से जोड़ना',
      en: 'Helping shy learners open up through drawing, theatre, and expression',
    },
    contextNote: {
      hi: 'समग्र विकास · बच्चों की अभिव्यक्ति',
      en: 'Creative confidence & expression',
    },
    planIntro: {
      hi: 'सप्ताह में एक 30-मिनट का "मेरा मंच" समय चुप रहने वाले बच्चों की आवाज़ और रचनात्मकता दोनों खोल देता है।',
      en: 'A weekly 30-minute expression circle unlocks voice and confidence in quiet learners.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'शनिवार "चित्र बनाओ — कहानी सुनाओ" कोना', en: 'Week 1: Saturday Draw & Tell showcase' },
        detail: {
          hi: 'हर बच्चे से अपनी पसंद की किसी भी चीज़ का चित्र स्लेट या पन्ने पर बनवाएं और 2 वाक्य बोलने को कहें।',
          en: 'Invite every child to draw one favorite thing and share two sentences about it with peers.',
        },
        duration: { hi: 'सप्ताह 1 · 30 मिनट', en: 'Week 1 · 30 mins' },
      },
      {
        stepNumber: 2,
        title: { hi: 'छोटे समूह में बिना डर के अभिनय और गीत', en: 'Week 2: Small-group action songs & roleplay' },
        detail: {
          hi: 'अकेले मंच पर बुलाने की जगह 4-4 बच्चों के समूह में किसी कविता या कहानी का छोटा अभिनय कराएं।',
          en: 'Instead of solo stage pressure, have groups of 4 enact a short rhyme or market scene together.',
        },
        duration: { hi: 'सप्ताह 2 · 20 मिनट', en: 'Week 2 · 20 mins' },
      },
      {
        stepNumber: 3,
        title: { hi: 'दीवार पर "सभी बच्चों की कला" प्रदर्शनी', en: 'Week 3: Display every child’s artwork on wall' },
        detail: {
          hi: 'केवल सबसे सुंदर नहीं, बल्कि कक्षा के हर बच्चे का चित्र नाम लिखकर दीवार पर सजाएं ताकि सबको गर्व महसूस हो।',
          en: 'Pin up drawings from every student with their name—not only the neatest ones—so all feel proud.',
        },
        duration: { hi: 'सप्ताह 3 · 20 मिनट', en: 'Week 3 · 20 mins' },
      },
      {
        stepNumber: 4,
        title: { hi: 'चुप रहने वाले बच्चों में बदलाव देखें व साझा करें', en: 'Week 4: Celebrate new voices & share tip' },
        detail: {
          hi: 'देखें कौन-से संकोची बच्चे अब खुलकर बोलने लगे हैं और अपना गतिविधि विचार आवाज़ में साझा करें।',
          en: 'Notice which shy learners opened up this month and share your activity idea by voice.',
        },
        duration: { hi: 'सप्ताह 4 · 15 मिनट', en: 'Week 4 · 15 mins' },
      },
    ],
  },
  {
    id: 'school-wash-infra',
    size: 'compact',
    sourceType: 'mitra_school',
    commonalityRank: 15,
    title: {
      hi: 'पीने का पानी, स्वच्छता और स्कूल माहौल सुधार',
      en: 'Clean water, sanitation & welcoming school upkeep',
    },
    shortPrompt: {
      hi: 'हाथ धोने, स्वच्छ शौचालय और सुरक्षित प्रांगण में छोटे सुधार',
      en: 'Micro-improvements for handwashing, clean toilets, and safe school grounds',
    },
    contextNote: {
      hi: 'साफ़ पानी और स्वच्छ स्कूल',
      en: 'Clean water & welcoming school',
    },
    planIntro: {
      hi: 'बड़े बजट का इंतज़ार किए बिना बाल-संसद और एसएमसी के छोटे साझा कदम स्कूल को साफ और आकर्षक बना देते हैं।',
      en: 'Without waiting for large grants, Bal Sansad routines and SMC micro-actions transform daily upkeep.',
    },
    planSteps: [
      {
        stepNumber: 1,
        title: { hi: 'बाल संसद के साथ दैनिक जल व स्वच्छता देखरेख', en: 'Week 1: Bal Sansad daily water & handwash check' },
        detail: {
          hi: 'मध्याह्न भोजन से पहले 2 छात्र-नेता साबुन और पानी की उपलब्धता जाँचकर चार्ट पर सही का निशान लगाएं।',
          en: 'Assign two rotating student leaders to verify soap and water before midday meal.',
        },
        duration: { hi: 'सप्ताह 1 · 5 मिनट/दिन', en: 'Week 1 · 5 mins/day' },
      },
      {
        stepNumber: 2,
        title: { hi: '"साफ़ हाथ और पानी की बचत" गतिविधि कोना', en: 'Week 2: Handwashing & water-saving routine' },
        detail: {
          hi: 'नल के पास बाल्टी रखकर सिखाएं कि बिना पानी बहाए 20 सेकंड हाथ कैसे धोएं और बचे पानी को पौधों में डालें।',
          en: 'Place a bucket under the handwash tap to reuse rinse water for school garden plants.',
        },
        duration: { hi: 'सप्ताह 2 · 10 मिनट', en: 'Week 2 · 10 mins' },
      },
      {
        stepNumber: 3,
        title: { hi: 'एसएमसी व समुदाय के साथ प्रांगण सफाई पहल', en: 'Week 3: Joint clean-courtyard drive with SMC' },
        detail: {
          hi: 'शनिवार को 30 मिनट स्कूल समिति सदस्यों के साथ मिलकर टूटी चिटखनी, कूड़ादान और पानी की टंकी साफ करें।',
          en: 'Spend 30 minutes on Saturday with SMC members fixing small latches, bins, and water storage.',
        },
        duration: { hi: 'सप्ताह 3 · 30 मिनट', en: 'Week 3 · 30 mins' },
      },
      {
        stepNumber: 4,
        title: { hi: 'स्वच्छ विद्यालय समीक्षा व अनुभव साझा', en: 'Week 4: Review upkeep & share your story' },
        detail: {
          hi: 'चौथे सप्ताह में स्वच्छता चार्ट की समीक्षा करें और बताएं कि बाल संसद का कौन-सा कदम सबसे टिकाऊ रहा।',
          en: 'Review the 4-week upkeep chart with students and share what worked best in your school.',
        },
        duration: { hi: 'सप्ताह 4 · 15 मिनट', en: 'Week 4 · 15 mins' },
      },
    ],
  },
];

export const INITIAL_PEER_SOLUTIONS: PeerSolution[] = [
  {
    id: 'sol-1',
    themeId: 'multi-age',
    teacherName: { hi: 'सुनीता शर्मा', en: 'Sunita Sharma' },
    blockDistrict: { hi: 'देवा ब्लॉक, बाराबंकी', en: 'Dewa Block, Barabanki' },
    avatarUrl: AVATAR_SUNITA,
    audioDurationSec: 38,
    summary: {
      hi: 'रंगीन चटाई कोनों से कक्षा 1, 2 और 3 का अलग काम आसानी से चलता है',
      en: 'Color-coded mat corners keep Grades 1, 2, and 3 running smoothly together',
    },
    transcript: {
      hi: 'मेरी कक्षा में 38 बच्चे तीन कक्षाओं के हैं। मैंने दरी के तीन कोने बनाए — लाल (अक्षर), पीला (शब्द), हरा (कहानी)। मैं 15 मिनट लाल कोने में बैठती हूँ तब तक हरे कोने का एक बड़ा बच्चा पीले कोने की स्लेट जाँचता है। शोर भी कम हुआ और सब सीखते हैं।',
      en: 'I have 38 children across three grades. I divided our floor mat into three zones—Red (letters), Yellow (words), Green (stories). While I teach Red for 15 minutes, a student helper from Green checks Yellow slates. Noise dropped and everyone stays engaged.',
    },
    helpfulCount: 19,
  },
  {
    id: 'sol-2',
    themeId: 'multi-age',
    teacherName: { hi: 'राजेश कुमार वर्मा', en: 'Rajesh Kumar Verma' },
    blockDistrict: { hi: 'सिधौली ब्लॉक, सीतापुर', en: 'Sidhauli Block, Sitapur' },
    avatarUrl: AVATAR_RAJESH,
    audioDurationSec: 44,
    summary: {
      hi: 'बोर्ड को 3 हिस्सों में बाँटकर हर सुबह पूरे दिन का अभ्यास पहले लिख देता हूँ',
      en: 'Splitting the blackboard into 3 columns sets clear tasks before teaching starts',
    },
    transcript: {
      hi: 'सुबह प्रार्थना के तुरंत बाद मैं ब्लैकबोर्ड को चाक से तीन कॉलम में बाँट देता हूँ। हर समूह को पता रहता है कि मेरी बारी आने तक उन्हें क्या करना है। इससे बार-बार पूछने में समय नहीं जाता।',
      en: 'Right after morning assembly, I divide the blackboard into three chalk columns. Each group knows their independent task while waiting for their turn with me, saving 20 minutes daily.',
    },
    helpfulCount: 14,
  },
  {
    id: 'sol-3',
    themeId: 'multilingual',
    teacherName: { hi: 'कविता यादव', en: 'Kavita Yadav' },
    blockDistrict: { hi: 'महमूदाबाद, सीतापुर', en: 'Mahmudabad, Sitapur' },
    avatarUrl: AVATAR_KAVITA,
    audioDurationSec: 32,
    summary: {
      hi: 'कहानी सुनाने में बच्चों की अवधी बोली और हिंदी दोनों शब्दों का इस्तेमाल',
      en: 'Using both local Awadhi and standard Hindi words during story time',
    },
    transcript: {
      hi: 'पहले कक्षा 1 के बच्चे चुप रहते थे क्योंकि घर में अवधी बोलते थे। मैंने "मेरा गाँव" चार्ट बनाया जिसमें बच्चों ने खुद चीज़ों के नाम अपनी बोली में बताए और मैंने बगल में हिंदी शब्द लिखा। अब वही बच्चे सबसे आगे हाथ उठाते हैं।',
      en: 'Class 1 children used to stay quiet because they spoke Awadhi at home. We made a "My Village" chart with their own words next to Hindi words. Now those same children raise their hands first.',
    },
    helpfulCount: 23,
  },
  {
    id: 'sol-4',
    themeId: 'irregular-attendance',
    teacherName: { hi: 'राजेश कुमार वर्मा', en: 'Rajesh Kumar Verma' },
    blockDistrict: { hi: 'सिधौली ब्लॉक, सीतापुर', en: 'Sidhauli Block, Sitapur' },
    avatarUrl: AVATAR_RAJESH,
    audioDurationSec: 35,
    summary: {
      hi: 'कटाई के समय लौटने वाले बच्चों के लिए "स्वागत साथी" जोड़ी बनाई',
      en: 'Created "Welcome Buddy" pairs for children returning after harvest break',
    },
    transcript: {
      hi: 'जो बच्चे ईंट-भट्ठे या कटाई से एक महीने बाद लौटते थे, वे शर्म से पीछे बैठ जाते थे। अब कक्षा का एक दोस्त 3 दिन तक उनके साथ बैठकर पुराने खेल और शब्द दोहराता है। पिछले सत्र में 4 बच्चे वापस नियमित हो गए।',
      en: 'Children returning after harvest used to sit shyly at the back. Now a classmate sits beside them for 3 days to play catch-up word games. Four irregular students became regular last term.',
    },
    helpfulCount: 17,
  },
  {
    id: 'sol-5',
    themeId: 'foundational-fln',
    teacherName: { hi: 'सुनीता शर्मा', en: 'Sunita Sharma' },
    blockDistrict: { hi: 'देवा ब्लॉक, बाराबंकी', en: 'Dewa Block, Barabanki' },
    avatarUrl: AVATAR_SUNITA,
    audioDurationSec: 29,
    summary: {
      hi: 'माचिस की तीलियों की 10-10 की गड्डी से हासिल वाला जोड़ आसान हुआ',
      en: 'Bundles of 10 matchsticks made carry-over addition click immediately',
    },
    transcript: {
      hi: 'बच्चे हासिल वाले जोड़ में रटते थे। हमने 10-10 तीलियों पर रबर बैंड लगाकर बंडल बनाए। जब 10 खुली तीलियाँ होतीं तो बच्चे खुद उसे एक बंडल में बदलकर दहाई वाले डिब्बे में रखते।',
      en: 'Students used to memorize carry-over mechanically. We tied 10 matchsticks with rubber bands. Whenever 10 loose sticks formed, children bundled them into the tens box themselves.',
    },
    helpfulCount: 21,
  },
];

export const INITIAL_COMMUNITY_STORIES: CommunityStory[] = [
  {
    id: 'story-1',
    teacherName: { hi: 'कविता यादव', en: 'Kavita Yadav' },
    blockDistrict: { hi: 'महमूदाबाद, सीतापुर', en: 'Mahmudabad, Sitapur' },
    avatarUrl: AVATAR_KAVITA,
    themeId: 'multilingual',
    themeLabel: { hi: 'बहुभाषी कक्षा', en: 'Multilingual Class' },
    storyType: 'solution',
    headline: {
      hi: '"दो शब्द — एक अर्थ" चार्ट से कक्षा 1 के बच्चों की झिझक टूटी',
      en: '"Dual-Word" wall chart helped Class 1 children speak up confidently',
    },
    body: {
      hi: 'तीन हफ़्ते पहले पाँच बच्चे बिल्कुल नहीं बोलते थे। अपनी बोली के शब्दों को चार्ट पर जगह मिलने से अब वे कहानी के चित्र देखकर खुद वाक्य बनाते हैं।',
      en: 'Three weeks ago five children barely spoke. Seeing their home words respected on the wall chart encouraged them to form full sentences from story pictures.',
    },
    timeAgo: { hi: '2 दिन पहले', en: '2 days ago' },
    applauseCount: 28,
    hasVoice: true,
    audioDurationSec: 32,
  },
  {
    id: 'story-2',
    teacherName: { hi: 'सुनीता शर्मा', en: 'Sunita Sharma' },
    blockDistrict: { hi: 'देवा ब्लॉक, बाराबंकी', en: 'Dewa Block, Barabanki' },
    avatarUrl: AVATAR_SUNITA,
    themeId: 'multi-age',
    themeLabel: { hi: 'बहु-आयु कक्षा', en: 'Multi-age Group' },
    storyType: 'plan_tried',
    headline: {
      hi: 'तीन रंगों के समूह चक्र की योजना अपनाई — शोर और भटकाव दोनों कम हुए',
      en: 'Tried the 3-group rotation plan — classroom calm improved within a week',
    },
    body: {
      hi: 'कक्षा 1 और 3 को एक साथ संभालना मुश्किल था। 15 मिनट के चक्र और साथी सहायक से अब हर समूह के पास साफ काम रहता है।',
      en: 'Managing Class 1 and 3 together felt chaotic. The 15-minute cycle with peer buddies gave every group clear purpose.',
    },
    timeAgo: { hi: '4 दिन पहले', en: '4 days ago' },
    applauseCount: 22,
    hasVoice: true,
    audioDurationSec: 38,
  },
  {
    id: 'story-3',
    teacherName: { hi: 'राजेश कुमार वर्मा', en: 'Rajesh Kumar Verma' },
    blockDistrict: { hi: 'सिधौली ब्लॉक, सीतापुर', en: 'Sidhauli Block, Sitapur' },
    avatarUrl: AVATAR_RAJESH,
    themeId: 'missing-docs',
    themeLabel: { hi: 'दस्तावेज़ सहयोग', en: 'Missing Documents' },
    storyType: 'plan_tried',
    headline: {
      hi: 'ग्राम पंचायत और जनसेवा केंद्र के साथ मिलकर 9 बच्चों के जन्म प्रमाणपत्र बने',
      en: 'Coordinated with Panchayat & CSC to complete 9 birth certificates',
    },
    body: {
      hi: 'अलग-अलग अभिभावकों को भेजने के बजाय एक सूची बनाकर शनिवार को स्कूल प्रांगण में ही फॉर्म भरवाए।',
      en: 'Instead of sending parents one by one, we compiled one school list and organized a Saturday camp in the courtyard.',
    },
    timeAgo: { hi: '1 सप्ताह पहले', en: '1 week ago' },
    applauseCount: 31,
    hasVoice: false,
  },
];

export const DISTRICT_RECOGNITION_LIST: DistrictRecognitionEntry[] = [
  {
    id: 'leader-1',
    rank: 1,
    teacherName: { hi: 'कविता यादव', en: 'Kavita Yadav' },
    schoolAndBlock: { hi: 'प्राथमिक विद्यालय बिसवाँ, महमूदाबाद', en: 'PS Biswan, Mahmudabad' },
    district: { hi: 'सीतापुर (उदाहरण)', en: 'Sitapur (Example)' },
    avatarUrl: AVATAR_KAVITA,
    solutionsShared: 6,
    teachersHelped: 47,
    xp: 285,
    streakDays: 7,
    weeksCompleted: 10,
    honorTitle: { hi: 'भाषा सेतु मार्गदर्शक', en: 'Language Bridge Mentor' },
  },
  {
    id: 'leader-2',
    rank: 2,
    teacherName: { hi: 'सुनीता शर्मा', en: 'Sunita Sharma' },
    schoolAndBlock: { hi: 'कंपोजिट स्कूल कुर्सी, देवा', en: 'Composite School Kursi, Dewa' },
    district: { hi: 'बाराबंकी (उदाहरण)', en: 'Barabanki (Example)' },
    avatarUrl: AVATAR_SUNITA,
    solutionsShared: 5,
    teachersHelped: 41,
    xp: 235,
    streakDays: 6,
    weeksCompleted: 8,
    honorTitle: { hi: 'बहु-कक्षा सहयोगी', en: 'Multi-Grade Peer Guide' },
  },
  {
    id: 'leader-3',
    rank: 3,
    teacherName: { hi: 'राजेश कुमार वर्मा', en: 'Rajesh Kumar Verma' },
    schoolAndBlock: { hi: 'प्राथमिक विद्यालय अटरिया, सिधौली', en: 'PS Ataria, Sidhauli' },
    district: { hi: 'सीतापुर (उदाहरण)', en: 'Sitapur (Example)' },
    avatarUrl: AVATAR_RAJESH,
    solutionsShared: 4,
    teachersHelped: 36,
    xp: 190,
    streakDays: 5,
    weeksCompleted: 7,
    honorTitle: { hi: 'उपस्थिति संवाहक', en: 'Attendance Champion' },
  },
  {
    id: 'leader-4',
    rank: 4,
    teacherName: { hi: 'मीना देवी', en: 'Meena Devi' },
    schoolAndBlock: { hi: 'प्राथमिक विद्यालय बंकी, देवा', en: 'PS Banki, Dewa' },
    district: { hi: 'बाराबंकी (उदाहरण)', en: 'Barabanki (Example)' },
    avatarUrl: AVATAR_SUNITA,
    solutionsShared: 3,
    teachersHelped: 24,
    xp: 135,
    streakDays: 4,
    weeksCompleted: 5,
    honorTitle: { hi: 'बुनियादी शिक्षा सारथी', en: 'FLN Peer Helper' },
  },
  {
    id: 'leader-5',
    rank: 5,
    teacherName: { hi: 'अरुण कुमार', en: 'Arun Kumar' },
    schoolAndBlock: { hi: 'उच्च प्राथमिक विद्यालय सफदरगंज', en: 'UPS Safdarganj' },
    district: { hi: 'बाराबंकी (उदाहरण)', en: 'Barabanki (Example)' },
    avatarUrl: AVATAR_RAJESH,
    solutionsShared: 2,
    teachersHelped: 15,
    xp: 95,
    streakDays: 3,
    weeksCompleted: 3,
    honorTitle: { hi: 'सक्रिय कक्षा साथी', en: 'Active Classroom Peer' },
  },
];

export const VINDHYA_FIELD_QUESTIONS = [
  {
    number: 1,
    questionHi: 'सबसे पहले (प्रोटोटाइप दिखाने से पहले): आप आज अपने काम या पढ़ाई में AI का उपयोग कैसे करते हैं?',
    questionEn: 'First, before any product: how do you use AI today? (Baseline check)',
  },
  {
    number: 2,
    questionHi: 'समस्या मानचित्र पर आपने सबसे पहले कौन-सा बॉक्स दबाया, और क्यों?',
    questionEn: 'Which tile would you tap first on the Problem Map, and why?',
  },
  {
    number: 3,
    questionHi: 'क्या आप अपनी आवाज़ में कोई समाधान रिकॉर्ड करेंगे? अगर नहीं, तो क्या बात आपको रोकेगी?',
    questionEn: 'Would you record a solution in your own voice? What would stop you?',
  },
  {
    number: 4,
    questionHi: 'क्या आप यहाँ अपनी कक्षा की कोई चुनौती साझा करेंगे? किसके साथ साझा करना सहज लगेगा?',
    questionEn: 'Would you share a classroom challenge here? With whom would you feel comfortable sharing?',
  },
  {
    number: 5,
    questionHi: 'क्या ज़िला-स्तरीय सम्मान या बैज आपके लिए मायने रखता है?',
    questionEn: 'Does a badge or district-level recognition matter to you?',
  },
];

export const UI_COPY = {
  brandName: { hi: 'साथी', en: 'Saathi' },
  nav: {
    welcome: { hi: 'शुरुआत', en: 'Home' },
    map: { hi: 'विषय सूची', en: 'Themes' },
    plan: { hi: '4-सप्ताह पथ', en: '4-Week Path' },
    share: { hi: 'बात रखें', en: 'Share' },
    community: { hi: 'समुदाय', en: 'Community' },
  },
  langToggle: { hi: 'English', en: 'हिंदी' },
  listen: { hi: 'सुनें', en: 'Listen' },
  stopListening: { hi: 'रोकें', en: 'Stop' },
};

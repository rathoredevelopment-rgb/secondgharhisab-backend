const Expense = require('../models/Expense');
const Income = require('../models/Income');

// श्रेणी पहचानने के लिए कीवर्ड मैपिंग (हिंदी + अंग्रेजी)
const CATEGORY_KEYWORDS = {
  Grocery: ['राशन', 'किराना', 'grocery'],
  Vegetables: ['सब्जी', 'सब्जियां', 'vegetable', 'vegetables'],
  Milk: ['दूध', 'milk'],
  Transport: ['यात्रा', 'टैक्सी', 'ऑटो', 'बस', 'पेट्रोल', 'transport', 'taxi', 'bus', 'fuel', 'petrol'],
  Rent: ['किराया', 'rent'],
  Electricity: ['बिजली', 'बिल', 'electricity', 'bill'],
  Medical: ['दवा', 'अस्पताल', 'डॉक्टर', 'medical', 'hospital', 'doctor', 'medicine'],
  Salary: ['वेतन', 'सैलरी', 'salary'],
  Business: ['व्यापार', 'बिज़नेस', 'business'],
  Investment: ['निवेश', 'investment'],
  Freelance: ['फ्रीलांस', 'freelance'],
};

// आय बताने वाले कीवर्ड
const INCOME_KEYWORDS = ['आय', 'मिला', 'मिले', 'मिली', 'income', 'received', 'इनकम', 'जमा'];
// खर्च बताने वाले कीवर्ड
const EXPENSE_KEYWORDS = ['खर्च', 'खरीदा', 'खरीदी', 'दिया', 'दिए', 'expense', 'spent', 'paid', 'pay'];

// बोले गए टेक्स्ट से राशि, श्रेणी और प्रकार (आय/खर्च) निकालने वाला फ़ंक्शन
const parseVoiceText = (text) => {
  const normalizedText = text.trim();
  const lowerText = normalizedText.toLowerCase();

  // 1. राशि निकालें (जैसे "500", "1,200.50")
  const amountMatch = normalizedText.match(/([0-9]+(?:[.,][0-9]+)?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : null;

  // 2. प्रकार तय करें (income / expense) - डिफ़ॉल्ट expense
  let type = 'expense';
  if (INCOME_KEYWORDS.some((word) => lowerText.includes(word.toLowerCase()))) {
    type = 'income';
  }
  if (EXPENSE_KEYWORDS.some((word) => lowerText.includes(word.toLowerCase()))) {
    type = 'expense';
  }

  // 3. श्रेणी पहचानें
  let category = 'Other';
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((word) => lowerText.includes(word.toLowerCase()))) {
      category = cat;
      break;
    }
  }

  // आय वाली श्रेणियों के लिए प्रकार स्वतः ठीक करें
  if (['Salary', 'Business', 'Investment', 'Freelance'].includes(category)) {
    type = 'income';
  }

  return {
    amount,
    category,
    type,
    description: normalizedText,
  };
};

// @desc    वॉइस टेक्स्ट पार्स करें (केवल प्रीव्यू, सेव नहीं होगा)
// @route   POST /api/voice/parse
// @access  Private
const parseVoice = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'कृपया वॉइस टेक्स्ट भेजें' });
    }

    const parsed = parseVoiceText(text);

    if (!parsed.amount) {
      return res.status(400).json({
        success: false,
        message: 'राशि नहीं मिली, कृपया साफ़ बोलें (जैसे: "500 रुपये किराने का खर्च")',
      });
    }

    res.status(200).json({ success: true, data: parsed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    वॉइस टेक्स्ट से सीधे ट्रांज़ैक्शन (खर्च/आय) बनाएं
// @route   POST /api/voice
// @access  Private
const createFromVoice = async (req, res) => {
  try {
    const { text, paymentMethod } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'कृपया वॉइस टेक्स्ट भेजें' });
    }

    const parsed = parseVoiceText(text);

    if (!parsed.amount) {
      return res.status(400).json({
        success: false,
        message: 'राशि नहीं मिली, कृपया साफ़ बोलें (जैसे: "500 रुपये किराने का खर्च")',
      });
    }

    let record;
    if (parsed.type === 'income') {
      record = await Income.create({
        user: req.user._id,
        category: parsed.category,
        amount: parsed.amount,
        description: parsed.description,
        receivedVia: paymentMethod || 'Cash',
      });
    } else {
      record = await Expense.create({
        user: req.user._id,
        category: parsed.category,
        amount: parsed.amount,
        description: parsed.description,
        paymentMethod: paymentMethod || 'Cash',
      });
    }

    res.status(201).json({
      success: true,
      message: `${parsed.type === 'income' ? 'आय' : 'खर्च'} सफलतापूर्वक जोड़ा गया`,
      parsed,
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { parseVoice, createFromVoice };

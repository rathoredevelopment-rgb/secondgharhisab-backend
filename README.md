# GharHisab Backend 🏠

घर का हिसाब (Household Expense, Income & Credit Tracker) के लिए Node.js + Express + MongoDB बैकएंड API।

## 🚀 Setup

```bash
npm install
```

`.env` फ़ाइल में अपनी वैल्यू भरें:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/gharhisab
JWT_SECRET=change_this_to_a_long_random_secret_key
JWT_EXPIRE=30d
```

चलाने के लिए:

```bash
npm run dev     # nodemon के साथ (development)
npm start        # production
```

सर्वर डिफ़ॉल्ट रूप से `http://localhost:5000` पर चलेगा।

---

## 📡 API Reference

सभी प्रोटेक्टेड रूट्स के लिए हेडर में भेजें:
`Authorization: Bearer <token>`

### 🔐 Auth — `/api/auth`
| Method | Route | विवरण |
|---|---|---|
| POST | `/signup` | साइन अप (name, email, password) |
| POST | `/login` | लॉग इन (email, password) |
| GET | `/me` | वर्तमान यूज़र (Private) |
| POST | `/forgot-password` | रीसेट टोकन जनरेट करें (email) |
| PUT | `/reset-password/:resetToken` | नया पासवर्ड सेट करें |

### 💸 Expenses — `/api/expenses` (Private)
| Method | Route | विवरण |
|---|---|---|
| GET | `/` | सूची (query: category, startDate, endDate, search, page, limit) |
| GET | `/categories` | डिफ़ॉल्ट + इस्तेमाल की गई श्रेणियां |
| GET | `/:id` | एक खर्च |
| POST | `/` | नया खर्च जोड़ें (category, amount, description, date, paymentMethod) |
| PUT | `/:id` | अपडेट करें |
| DELETE | `/:id` | हटाएं |

### 💰 Incomes — `/api/incomes` (Private)
ऊपर जैसा ही, फ़ील्ड: category, amount, description, date, receivedVia

### 🤝 Credits (उधार) — `/api/credits` (Private)
| Method | Route | विवरण |
|---|---|---|
| GET | `/` | सूची (query: type=lent\|borrowed, status=pending\|paid) |
| GET | `/summary` | Lent बनाम Borrowed कुल योग |
| GET | `/:id` | एक रिकॉर्ड |
| POST | `/` | नया रिकॉर्ड (personName, amount, type, date, notes) |
| PUT | `/:id` | अपडेट करें |
| PUT | `/:id/mark-paid` | "paid" चिह्नित करें |
| DELETE | `/:id` | हटाएं |

### 📊 Reports — `/api/reports` (Private)
| Method | Route | विवरण |
|---|---|---|
| GET | `/?period=week\|month\|year` | कुल आय, खर्च, बचत, बचत दर, श्रेणी-वार ब्रेकडाउन |
| GET | `/?startDate=...&endDate=...` | कस्टम तारीख रेंज |

### 👤 Profile — `/api/profile` (Private)
| Method | Route | विवरण |
|---|---|---|
| GET | `/` | प्रोफाइल + आंकड़े (totalTransactions, totalExpense, activeMonths) |
| PUT | `/` | अपडेट करें (name, email, avatar) |

### ⚙️ Settings — `/api/settings` (Private)
| Method | Route | विवरण |
|---|---|---|
| GET | `/` | सेटिंग्स प्राप्त करें |
| PUT | `/` | अपडेट करें (notifications, darkMode, language) |
| PUT | `/change-password` | पासवर्ड बदलें (currentPassword, newPassword) |

### 🎤 Voice — `/api/voice` (Private)
| Method | Route | विवरण |
|---|---|---|
| POST | `/parse` | टेक्स्ट पार्स करें, प्रीव्यू दिखाए (सेव नहीं करता) `{ text }` |
| POST | `/` | टेक्स्ट से सीधे खर्च/आय बनाएं `{ text, paymentMethod }` |

उदाहरण: `"500 रुपये किराने का खर्च"` → `{ amount: 500, category: "Grocery", type: "expense" }`

---

## 📁 Folder Structure

```
gharhisab-backend/
├── config/db.js
├── controllers/
├── middleware/authMiddleware.js
├── models/
├── routes/
├── .env
├── .gitignore
├── package.json
└── server.js
```

## ⚠️ नोट
- `forgotPassword` अभी resetToken को सीधे response में भेजता है (डेवलपमेंट सुविधा हेतु)। प्रोडक्शन में इसे Nodemailer/Twilio से ईमेल/SMS पर भेजें और response से हटा दें।
- JWT_SECRET को प्रोडक्शन में मज़बूत रैंडम स्ट्रिंग से बदलें।

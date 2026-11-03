# Stallion Connect chatbot: questions and answers

This file lists everything the website chatbot says. To change any wording, edit `src/content/chatbot.ts` (answers) or the top of `src/components/chat/ChatBot.tsx` (questions asked in the quote and job flows).

## 1. Greeting

> Hi! I'm the Stallion Connect assistant. I can answer common questions, take a quote request or help you apply for a job. What would you like to do?

Buttons shown with the greeting: What services do you offer? · How much does it cost? · Can we start with a small pilot? · Get a quote · Apply for a job · Talk to a person

## 2. Frequently asked questions (13)

Visitors can tap these or type a question in their own words; the chatbot matches the keywords.

### 1. What services do you offer?

We run outsourced operations under one roof:

- Call centre (domestic and international voice)
- Banking & financial services: card and loan sales, onboarding, KYC, collections
- Inbound and outbound sales
- BPO & ITES: email and chat support, L1 helpdesk, data processing
- Customer support and lead generation
- Recruitment and training
- Back-office and admin
  If your process is different, we can design a team around it.

_Matches words like:_ service, services, offer, provide, do you do, what do you

_Buttons after the answer:_ Which industries do you work with? · Can we start with a small pilot? · Get a quote

### 2. How much does it cost?

Pricing depends on the process, team size, shifts, languages and the reports you need, so we quote for each client. Share a few details and our team will send you a plan and a quote, usually within one working day.

_Matches words like:_ price, pricing, cost, rate, rates, charge, budget, quote, fees, how much

_Buttons after the answer:_ Get a quote · Can we start with a small pilot? · Main menu

### 3. Can we start with a small pilot?

Yes. Most clients start with a small team for a few weeks, review the results together, then scale up.

_Matches words like:_ pilot, trial, small team, start small, test

_Buttons after the answer:_ How quickly can a team go live? · Get a quote · Main menu

### 4. How quickly can a team go live?

It depends on team size and training needs. A small pilot can usually go live within a few weeks of the process being agreed. Hiring and training are handled by us.

_Matches words like:_ how quickly, how soon, go live, start, timeline, ramp, launch, time to

_Buttons after the answer:_ Get a quote · Main menu

### 5. Do you handle international processes?

Yes. We run domestic and international voice and non-voice processes, with shifts planned around your customers' time zones.

_Matches words like:_ international, overseas, abroad, uk, us, usa, australia, global, time zone, timezone

_Buttons after the answer:_ Which languages do you support? · Get a quote · Main menu

### 6. Which languages do you support?

Our teams work in English, Hindi and regional languages. Tell us which ones your customers use.

_Matches words like:_ language, languages, hindi, english, regional, multilingual

_Buttons after the answer:_ Get a quote · Main menu

### 7. Which industries do you work with?

Banking and financial services, insurance, telecom and internet, e-commerce and retail, healthcare, travel and hospitality, education and real estate. We specialise in BFSI.

_Matches words like:_ industry, industries, sector, bank, banking, insurance, telecom, ecommerce, e-commerce, healthcare, travel, education, real estate, bfsi

_Buttons after the answer:_ What services do you offer? · Get a quote · Main menu

### 8. How do you protect our data?

Access is limited to the people working on your process, staff sign confidentiality agreements, and we follow your data-handling rules.

_Matches words like:_ data, security, secure, privacy, confidential, protect, nda, compliance

_Buttons after the answer:_ How will we track performance? · Get a quote · Main menu

### 9. How will we track performance?

You get regular reports on the KPIs we agree at the start, such as calls handled, conversion, quality scores and turnaround times. We also run call audits and refine the process every month.

_Matches words like:_ report, reports, kpi, kpis, track, performance, quality, sla, audit

_Buttons after the answer:_ Get a quote · Main menu

### 10. Do you offer 24x7 support?

Yes, 24x7 coverage is available, and shifts can be planned around your customers' hours.

_Matches words like:_ 24x7, 24/7, night, shift, shifts, weekend, hours, round the clock

_Buttons after the answer:_ Get a quote · Main menu

### 11. Are you hiring?

Yes. We hire for customer support, international voice, tele-sales (BFSI), back-office, team leaders and trainers. Freshers are trained from day one.

_Matches words like:_ job, jobs, hiring, career, careers, vacancy, vacancies, opening, fresher, work with you, apply

_Buttons after the answer:_ Apply for a job · How do I send my CV? · Main menu

### 12. How do I send my CV?

Apply here in the chat first, then email your CV to careers@stallionconnect.in with your name and the role in the subject line.

_Matches words like:_ cv, resume, résumé, biodata

_Buttons after the answer:_ Apply for a job · Main menu

### 13. How can I contact you?

You can reach us by email, phone or WhatsApp. Choose an option below.

_Matches words like:_ contact, phone, call, email, address, location, office, where, whatsapp, reach

_Buttons after the answer:_ Talk to a person · Get a quote · Main menu

## 3. Get a quote flow

The chatbot asks one question at a time and checks each answer with the same rules as the website form.

| #   | Question                                                                                           | Answer type                                                                                                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Great, let's get you a quote. What's your full name?                                               | Text (at least 2 letters)                                                                                                                                                                              |
| 2   | Thanks, {first name}. Which company are you with?                                                  | Text, or Skip                                                                                                                                                                                          |
| 3   | What's the best email address to reach you?                                                        | Valid email                                                                                                                                                                                            |
| 4   | And a phone number? Add the country code if you're outside India.                                  | Valid phone number                                                                                                                                                                                     |
| 5   | Which service do you need?                                                                         | Buttons: Call Centre Operations, Banking & Financial Services, Inbound & Outbound Sales, BPO & ITES Operations, Support & Lead Generation, Recruitment & Training, Back-Office & Admin, Custom process |
| 6   | Roughly how big a team do you have in mind?                                                        | Buttons: 1 to 10, 11 to 50, 51 to 200, 200+, Not sure yet                                                                                                                                              |
| 7   | Tell me a little about your process: volumes, languages, hours and when you'd like to start.       | Text (at least 10 characters)                                                                                                                                                                          |
| 8   | Can we store these details and contact you about this enquiry, as described in our privacy policy? | Yes, I agree / No                                                                                                                                                                                      |

Then: a summary of the answers with **Send enquiry** or **Start over**.

> Thank you, {first name}! Your enquiry is registered. Our team will get back to you within one working day.

## 4. Apply for a job flow

| #   | Question                                                                                                              | Answer type                                                                                                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Happy to help you apply. What's your full name?                                                                       | Text                                                                                                                                                                |
| 2   | Thanks, {first name}. What's your email address?                                                                      | Valid email                                                                                                                                                         |
| 3   | And your phone number?                                                                                                | Valid phone number                                                                                                                                                  |
| 4   | Which role are you interested in?                                                                                     | Buttons: Customer Support Executive, International Voice Process Associate, Tele-sales Executive (BFSI), Back-Office Executive, Team Leader, Process Trainer, Other |
| 5   | How much work experience do you have?                                                                                 | Buttons: Fresher, Less than 1 year, 1 to 3 years, 3 to 5 years, 5+ years                                                                                            |
| 6   | Which city are you in?                                                                                                | Text, or Skip                                                                                                                                                       |
| 7   | Which languages do you speak?                                                                                         | Text, or Skip                                                                                                                                                       |
| 8   | Can we store your details for recruitment and contact you about this application, as described in our privacy policy? | Yes, I agree / No                                                                                                                                                   |

Then: a summary with **Send application** or **Start over**.

> Thank you, {first name}! Your application is registered. Please email your CV to careers@stallionconnect.in with your name and the role in the subject line.

## 5. Other replies

**Talk to a person:** "You can reach our team directly:" followed by WhatsApp, call and email links.

**When nothing matches:** "I'm not sure about that one. I can answer common questions, take a quote request, or connect you with our team." with buttons Get a quote · Talk to a person · Main menu.

**If the visitor says No to consent:** "No problem, nothing has been saved. You can still reach us directly."

**If sending fails:** "Sorry, I couldn't send that just now. Please try again in a moment, or email us at info@stallionconnect.in."

## 6. Please review before launch

- Pricing answer: we never quote a number; confirm the "within one working day" reply time.
- Go-live time: "within a few weeks" for a small pilot.
- 24x7 coverage: confirm this is offered.
- Hiring roles and languages: confirm they are current.

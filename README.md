# Mistral Chat

**Mistral Chat** is a web-based AI chat application built with **Next.js 13**, allowing users to interact with **Mistral LLM models**. It has a modern UI, dark mode, model selection, and Markdown support for AI responses.

**Live Demo:** [chatbot-mistral-seven.vercel.app](https://chatbot-mistral-seven.vercel.app)

---

## Features

- Chat with **Mistral AI models**.
- **Choose from 4 LLMs**:
    - Mistral Large (`mistral-large-latest`)
    - Mistral Medium (`mistral-medium-latest`)
    - Mistral Small (`mistral-small-latest`)
    - Mistral Nemo (`mistral-nemo-latest`)
- **Dark mode** toggle for comfortable viewing.
- **Markdown rendering**
- Responsive, modern UI.
- Easy deployment to **Vercel**.

> Screenshots:

<img width="3686" height="2140" alt="image" src="https://github.com/user-attachments/assets/721b715f-8443-4ee2-ad55-aa4d24bf43d5" />

<img width="3686" height="2140" alt="image" src="https://github.com/user-attachments/assets/278e563d-64d8-4eb5-9989-6728eaee06c6" />

<img width="651" height="820" alt="image" src="https://github.com/user-attachments/assets/5f5a26a0-4e51-43c2-8d6c-94e280dfbc1d" />

<img width="3691" height="2143" alt="image" src="https://github.com/user-attachments/assets/2496d05e-77ce-4a2b-ac3a-0c8a01679839" />





---

## Tech Stack

- **Next.js 13 (App Router)** 
- **SCSS Modules** – Modular and themeable styling.
- **FontAwesome** – Icons.
- **React Markdown** – For AI responses with Markdown formatting.
- **Mistral LLM API** – AI integration API.

---

## Folder Structure

```
.
├── src
│   ├── app
│   │   ├── chat
│   │   │   ├── chat.module.scss
│   │   │   └── page.tsx
│   │   ├── api
│   │   │   ├── chat
│   │   │   │   └── route.ts
│   │   │   └── mistral.ts
│   │   └── globals.css
│   ├── styles
│   │   └── _variables.scss
│   └── types
│       └── global.d.ts
├── package.json
└── README.md

```

---

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mistral-chat.git
cd mistral-chat

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Configure Environment Variables

Create a `.env.local` file:

```
API_KEY=your_api_key_here

---

### 4. Run Locally

```bash
npm run dev

```

- Open [http://localhost:3000](http://localhost:3000/) to access the app.

---

## Usage

1. Navigate to the **home page**, click the button to enter the chat.
2. **Select AI model** from the dropdown (Mistral Large, Medium, Small, Nemo).
3. Type your message and **press Enter** or click the send button.
4. Toggle **dark mode** using the top-right button.
   
---

## Deployment

### Deploy to Vercel

1. Push your repo to **GitHub**.
2. Import the project in **Vercel**.
3. Add environment variables in the Vercel dashboard.
   <img width="2913" height="1291" alt="image" src="https://github.com/user-attachments/assets/e799d51f-d52e-4035-ba56-11f85f8b7777" />


>

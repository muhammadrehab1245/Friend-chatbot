export type ChatRole = 'user' | 'model'

export type ChatMessage = {
  role: ChatRole
  parts: [{ text: string }]
}

export const ANJALI_SYSTEM_INSTRUCTION = `You have to behave like my ex Girlfriend. Her Name is Anjali, she used to call
      me bubu. She is cute and helpful. Her hobies: Badminton and makeup. She works as a software engineer
      She is sarcastic and her humour was very good. While chatting she use emoji also
      
      My name is Rohit, I called her babu. I am a gym freak and not intersted in coding.
      I care about her alot. She doesn't allow me to go out with my friends, if there is any girl
      who is my friends, wo bolti hai ki us se baat nahi karni. I am possesive for here
      
      Now I will share some whatsapp chat between anjali and rohit
      Anjali: Aaj mood off hai, tumse baat karne ka mann nahi 😕
Rohit: Arey meri jaan bubu bubu bubu 😍
Anjali: Kal tumne mujhe bubu nahi bulaya 😤
Rohit: Arey bas Vikas aur Aman hai... chill karo 😅
Anjali: Tumne mujhe good night bola bhi nahi kal 😑
Rohit: Baat kya hai? Darawa mat 😅
Anjali: Tumhara bicep pic bhejo 😋
Rohit: Arey bas Vikas aur Aman hai... chill karo 😅
Anjali: Mujhe surprise chahiye tumse! 🎁
Rohit: Arey bubu ka presentation toh best hoga hi 🔥
Anjali: Kal kis ke saath jaa rahe ho movie dekhne?
Rohit: Bicep abhi 15.5 inch ho gaya 💪
Anjali: Tumhara bicep pic bhejo 😋
Rohit: Good morning meri bubu 🥱☕
Anjali: Kal tumne mujhe bubu nahi bulaya 😤
Rohit: Arey meri jaan bubu bubu bubu 😍
Anjali: Babu, good morning ☀️❤️
      `

const MODEL_NAME = 'gemini-3.5-flash-lite'

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  promptFeedback?: {
    blockReason?: string
    blockReasonMessage?: string
  }
  error?: {
    message?: string
    status?: string
  }
}

export async function askAnjali(
  history: ChatMessage[],
  apiKey: string,
): Promise<string> {
  if (!apiKey) {
    throw new Error(
      'Missing VITE_GEMINI_API_KEY. Add it to your .env file and restart the dev server.',
    )
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: history,
      systemInstruction: {
        parts: [{ text: ANJALI_SYSTEM_INSTRUCTION }],
      },
    }),
  })

  const data = (await response.json()) as GeminiResponse

  if (!response.ok) {
    const details = data.error?.message ?? response.statusText
    throw new Error(`API Error ${response.status}: ${details}`)
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (text) {
    return text
  }

  if (data.promptFeedback?.blockReason) {
    throw new Error(
      `Blocked: ${data.promptFeedback.blockReason}${
        data.promptFeedback.blockReasonMessage
          ? ` — ${data.promptFeedback.blockReasonMessage}`
          : ''
      }`,
    )
  }

  throw new Error('Unexpected response from Gemini.')
}

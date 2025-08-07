import { useEffect, useRef, useState } from 'react'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'
import { generateBotResponse } from '../utils/aiIntegrations'

interface ChatMsg { id?: string; messageText: string; sender: 'user' | 'bot'; timestamp?: any; userId: string }

export default function AIAssistant() {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'ai_messages'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as ChatMsg[]
      setMessages(rows)
      // scroll to bottom
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50)
    })
    return () => unsub()
  }, [user])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    const text = input.trim()
    if (!text) return

    await addDoc(collection(db, 'ai_messages'), {
      messageText: text,
      sender: 'user',
      timestamp: serverTimestamp(),
      userId: user.uid,
    })
    setInput('')

    // AI Integration Point: Bot response via LLM
    const bot = await generateBotResponse(text)
    await addDoc(collection(db, 'ai_messages'), {
      messageText: bot,
      sender: 'bot',
      timestamp: serverTimestamp(),
      userId: user.uid,
    })
  }

  return (
    <section className="mx-auto max-w-3xl">
      <h2 className="mb-4 text-2xl font-semibold text-gray-100">Asistent AI - Colectare simptome</h2>
      <div className="rounded-xl border border-white/10 bg-[#3f455a] p-4 shadow-md">
        <div ref={listRef} className="max-h-[60vh] space-y-3 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-sm text-gray-300">Spuneți-mi pe scurt simptomele: de când au apărut, intensitate, ce le agravează sau ameliorează.</div>
          )}
          {messages.map((m) => (
            <div key={m.id || Math.random()} className={m.sender === 'user' ? 'text-right' : 'text-left'}>
              <div className={m.sender === 'user' ? 'inline-block max-w-[80%] rounded-xl bg-[var(--medflow-primary)] px-3 py-2 text-sm text-white shadow' : 'inline-block max-w-[80%] rounded-xl bg-white/10 px-3 py-2 text-sm text-gray-100 shadow'}>
                {m.messageText}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="mt-3 flex gap-2">
          <input className="input" placeholder="Descrieți simptomele (în limba română)" value={input} onChange={(e)=>setInput(e.target.value)} />
          <button className="btn-primary" aria-label="Trimite">
            <span className="inline-block">Trimite</span>
          </button>
        </form>
      </div>
    </section>
  )
}
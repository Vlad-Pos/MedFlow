import { useEffect, useRef, useState } from 'react'

interface ChatMessage { role: 'user' | 'assistant'; content: string; ts: number }

export default function ChatbotPlaceholder() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try { return JSON.parse(localStorage.getItem('medflow-chat') || '[]') } catch { return [] }
  })
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem('medflow-chat', JSON.stringify(messages))
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    const newMessages = [...messages, { role: 'user' as const, content: text, ts: Date.now() }]
    // Placeholder assistant response
    const reply: ChatMessage = { role: 'assistant', content: 'Mulțumim. Această zonă va fi conectată la un model AI pentru intake medical și sumarizare.', ts: Date.now() + 1 }
    setMessages([...newMessages, reply])
    setInput('')
  }

  return (
    <section className="mx-auto max-w-3xl">
      <h2 className="mb-4 text-2xl font-semibold">Chat intake pacient (placeholder)</h2>
      <div className="card">
        <div ref={listRef} className="max-h-96 space-y-3 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-sm text-gray-500">Introduceți simptomele și istoricul medical. Exemplu: "durere în piept de 2 zile".</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={m.role === 'user' ? 'inline-block rounded-lg bg-blue-600 px-3 py-2 text-white' : 'inline-block rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-800'}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="mt-3 flex gap-2">
          <input className="input" placeholder="Descrieți simptomele (în limba română)" value={input} onChange={e => setInput(e.target.value)} />
          <button className="btn-primary">Trimite</button>
        </form>
      </div>
    </section>
  )
}
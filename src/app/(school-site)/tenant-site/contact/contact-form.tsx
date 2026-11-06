'use client'

import { useState } from 'react'

export function ContactForm({ schoolId }: { schoolId: number }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone') || undefined,
      subject: fd.get('subject') || undefined,
      message: fd.get('message'),
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/schools/${schoolId}/contact`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to send')
      }
      setSuccess(true)
      form.reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        name="name"
        required
        placeholder="Your name *"
        className="w-full border rounded px-3 py-2"
      />
      <input
        name="email"
        required
        type="email"
        placeholder="Email *"
        className="w-full border rounded px-3 py-2"
      />
      <input
        name="phone"
        placeholder="Phone (optional)"
        className="w-full border rounded px-3 py-2"
      />
      <input
        name="subject"
        placeholder="Subject (optional)"
        className="w-full border rounded px-3 py-2"
      />
      <textarea
        name="message"
        required
        rows={5}
        placeholder="Message *"
        className="w-full border rounded px-3 py-2"
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm">Message sent successfully!</p>
      )}

      <button
        disabled={loading}
        className="px-6 py-2 rounded text-white font-semibold disabled:opacity-60"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
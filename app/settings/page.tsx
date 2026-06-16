'use client'

import { useState, useEffect } from 'react'
import { Settings, Key, Bell, Database, RefreshCw, Save, CheckCircle, Trash2, Download, Upload, Wifi, WifiOff, Loader2, Cpu } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [pokemonKey, setPokemonKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState('60')
  const [aiProvider, setAiProvider] = useState<'kimi' | 'gemma'>('kimi')
  const [lmOnline, setLmOnline] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('pokemon_dashboard_settings')
    if (stored) {
      const s = JSON.parse(stored)
      setCurrency(s.currency || 'USD')
      setAutoRefresh(s.autoRefresh || false)
      setRefreshInterval(s.refreshInterval || '60')
      setAiProvider(s.aiProvider || 'kimi')
    }
    // Check LM Studio status
    fetch('/api/lmstudio')
      .then(r => r.json())
      .then(d => setLmOnline(d.online))
      .catch(() => setLmOnline(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    localStorage.setItem('pokemon_dashboard_settings', JSON.stringify({
      currency, autoRefresh, refreshInterval, aiProvider
    }))
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    setSaved(true)
    toast.success('Settings saved!')
    setTimeout(() => setSaved(false), 2000)
  }

  const handleRefreshPrices = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/prices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await res.json()
      toast.success(`Updated ${data.updated} card prices!`)
    } catch {
      toast.error('Failed to refresh prices')
    }
    setRefreshing(false)
  }

  const handleExport = async () => {
    try {
      const res = await fetch('/api/collection')
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pokemon-collection-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Collection exported!')
    } catch {
      toast.error('Export failed')
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const cards = JSON.parse(text)
        if (!Array.isArray(cards)) throw new Error('Invalid format')
        for (const card of cards) {
          await fetch('/api/collection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(card),
          })
        }
        toast.success(`Imported ${cards.length} cards!`)
      } catch {
        toast.error('Import failed — invalid JSON')
      }
    }
    input.click()
  }

  const statCard = (icon: React.ReactNode, label: string, value: string, sub?: string) => (
    <div className="glass-card p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
        {icon}
      </div>
      <div>
        <div className="text-xs text-text-muted uppercase tracking-wider">{label}</div>
        <div className="text-lg font-bold font-mono text-text-primary">{value}</div>
        {sub && <div className="text-xs text-text-muted">{sub}</div>}
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-text-primary flex items-center gap-3">
          <Settings className="text-accent" size={32} />
          Settings
        </h1>
        <p className="text-text-muted mt-1">Configure your dashboard preferences and API keys</p>
      </div>

      {/* API Keys */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Key size={20} className="text-accent" />
          <h2 className="text-lg font-bold font-display text-text-primary">API Keys</h2>
        </div>
        <p className="text-sm text-text-muted -mt-4">
          API keys are stored in <code className="bg-bg-secondary px-1 rounded text-accent">.env.local</code> on your machine for security. Edit that file directly.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Pokémon TCG API Key</label>
            <div className="flex gap-3">
              <input
                type="password"
                value={pokemonKey}
                onChange={e => setPokemonKey(e.target.value)}
                placeholder="Set in .env.local as POKEMON_TCG_API_KEY"
                className="flex-1 bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-text-muted font-mono cursor-not-allowed"
                readOnly
              />
              <a href="https://dev.pokemontcg.io/" target="_blank" rel="noopener noreferrer"
                className="btn-secondary text-sm px-4 py-2.5 rounded-lg whitespace-nowrap">
                Get Key →
              </a>
            </div>
            <p className="text-xs text-text-muted mt-1">Free tier: 1000 req/day. Powers card search and price data.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Anthropic API Key</label>
            <div className="flex gap-3">
              <input
                type="password"
                value={anthropicKey}
                onChange={e => setAnthropicKey(e.target.value)}
                placeholder="Set in .env.local as ANTHROPIC_API_KEY"
                className="flex-1 bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-text-muted font-mono cursor-not-allowed"
                readOnly
              />
              <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer"
                className="btn-secondary text-sm px-4 py-2.5 rounded-lg whitespace-nowrap">
                Get Key →
              </a>
            </div>
            <p className="text-xs text-text-muted mt-1">Powers the AI card scanner. Uses Claude Vision.</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 text-sm text-text-secondary">
          <strong className="text-accent">How to set API keys:</strong>
          <pre className="mt-2 text-xs text-text-muted font-mono bg-bg-primary p-3 rounded-lg overflow-x-auto">{`# In your project root, create .env.local:
POKEMON_TCG_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Then restart: npm run dev`}</pre>
        </div>
      </div>

      {/* AI Provider */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Cpu size={20} className="text-[#00ff9d]" />
          <h2 className="text-lg font-bold font-display text-text-primary">AI Provider</h2>
        </div>
        <p className="text-sm text-text-muted -mt-4">Choose which AI model powers the card scanner.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Kimi K2.5 option */}
          <button
            onClick={() => setAiProvider('kimi')}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              aiProvider === 'kimi'
                ? 'border-[#00e5ff] bg-[#00e5ff08]'
                : 'border-border hover:border-[#2a4a6a] bg-bg-secondary'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              aiProvider === 'kimi' ? 'bg-[#00e5ff22]' : 'bg-bg-primary'
            }`}>
              <span className="text-xl">⚡</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary text-sm">Kimi K2.5</span>
                {aiProvider === 'kimi' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00e5ff22] text-[#00e5ff] border border-[#00e5ff33] font-medium">Active</span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5">Synthetic AI · Cloud</p>
              <p className="text-xs text-text-muted mt-1">Fast, high-accuracy vision model for card identification.</p>
            </div>
          </button>

          {/* Gemma / LM Studio option */}
          <button
            onClick={() => lmOnline && setAiProvider('gemma')}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              aiProvider === 'gemma'
                ? 'border-[#00ff9d] bg-[#00ff9d08]'
                : lmOnline === false
                ? 'border-border bg-bg-secondary opacity-50 cursor-not-allowed'
                : 'border-border hover:border-[#2a4a6a] bg-bg-secondary'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              aiProvider === 'gemma' ? 'bg-[#00ff9d22]' : 'bg-bg-primary'
            }`}>
              <span className="text-xl">🖥️</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-text-primary text-sm">Gemma 4 E4B</span>
                {aiProvider === 'gemma' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00ff9d22] text-[#00ff9d] border border-[#00ff9d33] font-medium">Active</span>
                )}
                {/* Status badge */}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium flex items-center gap-1 ${
                  lmOnline === null
                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                    : lmOnline
                    ? 'bg-[#00ff9d11] text-[#00ff9d] border-[#00ff9d33]'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {lmOnline === null ? (
                    <Loader2 size={9} className="animate-spin" />
                  ) : lmOnline ? (
                    <Wifi size={9} />
                  ) : (
                    <WifiOff size={9} />
                  )}
                  {lmOnline === null ? 'Checking…' : lmOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">LM Studio · Local · 192.168.1.103</p>
              <p className="text-xs text-text-muted mt-1">Private, runs on your local network. Requires LM Studio running.</p>
            </div>
          </button>
        </div>

        {lmOnline === false && (
          <p className="text-xs text-yellow-500/80 flex items-center gap-1.5">
            <WifiOff size={12} /> LM Studio is not reachable at 192.168.1.103:3000. Start LM Studio and load the Gemma model to enable local inference.
          </p>
        )}
      </div>

      {/* Preferences */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Bell size={20} className="text-violet-400" />
          <h2 className="text-lg font-bold font-display text-text-primary">Preferences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Currency Display</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary">
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="JPY">JPY — Japanese Yen</option>
              <option value="CAD">CAD — Canadian Dollar</option>
              <option value="AUD">AUD — Australian Dollar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Auto Price Refresh</label>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative w-12 h-6 rounded-full transition-colors ${autoRefresh ? 'bg-accent' : 'bg-bg-secondary border border-border'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm text-text-secondary">{autoRefresh ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>

          {autoRefresh && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Refresh Interval (minutes)</label>
              <select
                value={refreshInterval}
                onChange={e => setRefreshInterval(e.target.value)}
                className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary">
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every hour</option>
                <option value="360">Every 6 hours</option>
                <option value="720">Every 12 hours</option>
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium">
          {saved ? <CheckCircle size={16} /> : saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Preferences'}
        </button>
      </div>

      {/* Data Management */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Database size={20} className="text-green-400" />
          <h2 className="text-lg font-bold font-display text-text-primary">Data Management</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={handleRefreshPrices} disabled={refreshing}
            className="btn-secondary flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh All Prices'}
          </button>

          <button onClick={handleExport}
            className="btn-secondary flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium">
            <Download size={16} />
            Export Collection
          </button>

          <button onClick={handleImport}
            className="btn-secondary flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium">
            <Upload size={16} />
            Import Collection
          </button>
        </div>

        <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-medium text-sm">
            <Trash2 size={16} />
            Danger Zone
          </div>
          <p className="text-xs text-text-muted">These actions are irreversible. Your data is stored in <code className="bg-bg-secondary px-1 rounded text-accent">/data/</code> directory.</p>
          <button
            onClick={() => {
              if (confirm('Delete your ENTIRE collection? This cannot be undone.')) {
                fetch('/api/collection?id=__ALL__', { method: 'DELETE' })
                  .then(() => toast.success('Collection cleared'))
                  .catch(() => toast.error('Failed'))
              }
            }}
            className="text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors">
            Clear Entire Collection
          </button>
        </div>
      </div>

      {/* About */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-text-primary">Pokédex Portfolio</h2>
            <p className="text-sm text-text-muted mt-1">Local-first Pokémon TCG investment dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-text-muted">Version</div>
            <div className="text-accent font-mono font-bold">v1.0.0</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-text-muted">
          <span>Built with Next.js 14</span>
          <span>·</span>
          <span>Data: pokemontcg.io</span>
          <span>·</span>
          <span>AI: Claude Vision</span>
          <span>·</span>
          <span>Local storage: JSON files</span>
        </div>
      </div>
    </div>
  )
}

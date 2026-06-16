'use client'

import { useState, useEffect } from 'react'
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { PriceAlert } from '@/lib/types'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ cardName: '', cardId: '', targetPrice: '', alertType: 'above' as 'above' | 'below' })

  useEffect(() => { loadAlerts() }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/alerts')
      const data = await res.json()
      setAlerts(data.data || [])
    } catch { setAlerts([]) }
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!form.cardName || !form.targetPrice) return toast.error('Fill in card name and target price')
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cardId: form.cardId || 'manual', targetPrice: parseFloat(form.targetPrice) }),
      })
      const data = await res.json()
      setAlerts(prev => [...prev, data.data])
      setShowAdd(false)
      setForm({ cardName: '', cardId: '', targetPrice: '', alertType: 'above' })
      toast.success('Alert created!')
    } catch { toast.error('Failed to create alert') }
  }

  const handleToggle = async (alert: PriceAlert) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alert.id, active: !alert.active }),
      })
      const data = await res.json()
      setAlerts(prev => prev.map(a => a.id === alert.id ? data.data : a))
    } catch { toast.error('Failed to update alert') }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' })
      setAlerts(prev => prev.filter(a => a.id !== id))
      toast.success('Alert removed')
    } catch { toast.error('Failed to delete alert') }
  }

  const activeAlerts = alerts.filter(a => a.active && !a.triggeredAt)
  const triggeredAlerts = alerts.filter(a => !!a.triggeredAt)
  const inactiveAlerts = alerts.filter(a => !a.active && !a.triggeredAt)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-text-primary flex items-center gap-3">
            <Bell className="text-accent" size={32} />
            Price Alerts
          </h1>
          <p className="text-text-muted mt-1">Get notified when cards hit your target prices</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus size={16} />
          New Alert
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active', value: activeAlerts.length, color: 'text-accent', icon: <Bell size={18} /> },
          { label: 'Triggered', value: triggeredAlerts.length, color: 'text-green-400', icon: <CheckCircle size={18} /> },
          { label: 'Paused', value: inactiveAlerts.length, color: 'text-text-muted', icon: <ToggleLeft size={18} /> },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <span className={s.color}>{s.icon}</span>
            <div>
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-text-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Alert Form */}
      {showAdd && (
        <div className="glass-card p-6 border-accent/30 space-y-4">
          <h3 className="font-bold font-display text-text-primary text-lg">Create Price Alert</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">Card Name</label>
              <input value={form.cardName} onChange={e => setForm(f => ({ ...f, cardName: e.target.value }))}
                placeholder="e.g. Charizard ex 199/198" className="w-full input-field" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">Target Price (USD)</label>
              <input type="number" value={form.targetPrice} onChange={e => setForm(f => ({ ...f, targetPrice: e.target.value }))}
                placeholder="0.00" step="0.01" className="w-full input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">Alert When Price Is</label>
              <div className="flex gap-2">
                {(['above', 'below'] as const).map(d => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, alertType: d }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-colors border ${form.alertType === d ? 'bg-accent/20 border-accent text-accent' : 'border-border text-text-muted hover:border-accent/50'}`}>
                    {d === 'above' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {d === 'above' ? 'Above target (sell signal)' : 'Below target (buy signal)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="btn-primary px-6 py-2.5 rounded-lg text-sm font-medium">Create Alert</button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary px-6 py-2.5 rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-green-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle size={14} /> Triggered — Take Action
          </h3>
          {triggeredAlerts.map(alert => (
            <div key={alert.id} className="glass-card p-4 border-green-500/30 flex items-center gap-4">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-text-primary">{alert.cardName}</div>
                <div className="text-xs text-text-muted mt-0.5">
                  Target: ${alert.targetPrice} {alert.alertType} · Triggered {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleDateString() : ''}
                </div>
              </div>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Triggered</span>
              <button onClick={() => handleDelete(alert.id)} className="text-text-muted hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active Alerts */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-accent uppercase tracking-wider flex items-center gap-2">
          <Bell size={14} /> Active Alerts
        </h3>
        {loading ? (
          <div className="glass-card p-8 text-center text-text-muted">Loading alerts…</div>
        ) : activeAlerts.length === 0 ? (
          <div className="glass-card p-8 text-center space-y-3">
            <AlertTriangle size={32} className="text-text-muted mx-auto" />
            <p className="text-text-muted">No active alerts. Create one above!</p>
          </div>
        ) : (
          activeAlerts.map(alert => (
            <div key={alert.id} className="glass-card p-4 flex items-center gap-4 hover:border-accent/30 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${alert.alertType === 'above' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {alert.alertType === 'above' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
              <div className="flex-1">
                <div className="font-medium text-text-primary">{alert.cardName}</div>
                <div className="text-xs text-text-muted mt-0.5">
                  Alert when price goes <span className={alert.alertType === 'above' ? 'text-green-400' : 'text-red-400'}>{alert.alertType}</span> <span className="text-accent font-mono">${alert.targetPrice}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggle(alert)} className="text-accent hover:text-accent/70 transition-colors">
                  <ToggleRight size={22} />
                </button>
                <button onClick={() => handleDelete(alert.id)} className="text-text-muted hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paused Alerts */}
      {inactiveAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
            <ToggleLeft size={14} /> Paused
          </h3>
          {inactiveAlerts.map(alert => (
            <div key={alert.id} className="glass-card p-4 flex items-center gap-4 opacity-60">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-text-muted/10 text-text-muted">
                <Bell size={16} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-text-secondary">{alert.cardName}</div>
                <div className="text-xs text-text-muted mt-0.5">Target: ${alert.targetPrice} {alert.alertType}</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggle(alert)} className="text-text-muted hover:text-accent transition-colors">
                  <ToggleLeft size={22} />
                </button>
                <button onClick={() => handleDelete(alert.id)} className="text-text-muted hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

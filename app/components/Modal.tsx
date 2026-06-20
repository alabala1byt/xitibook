'use client'
interface Props { title: string; onClose: () => void; children: React.ReactNode }

export default function Modal({ title, onClose, children }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white w-full max-w-[480px] max-h-[92vh] overflow-y-auto px-5 pt-6 pb-10"
        style={{ borderRadius: '24px 24px 0 0' }}>
        <h3 className="text-lg font-bold mb-5">{title}</h3>
        {children}
      </div>
    </div>
  )
}

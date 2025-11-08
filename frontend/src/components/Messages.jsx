import React from 'react'
export default function Messages(){
  return (
    <div className="card p-6">
      <h3 className="text-2xl font-semibold text-slate-900 mb-4">Customer Messages</h3>
      <div className="mt-4 text-slate-600 text-lg py-10 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50">
        No new messages yet. Check back later!
      </div>
    </div>
  )
}
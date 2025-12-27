export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 pixel-font text-white">Internal Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="pixel-border-dark p-6">
          <h3 className="text-slate-400 text-sm font-semibold uppercase mb-2 font-mono">System Status</h3>
          <div className="text-xl font-bold text-success pixel-font">OPERATIONAL</div>
        </div>

        <div className="pixel-border-dark p-6">
          <h3 className="text-slate-400 text-sm font-semibold uppercase mb-2 font-mono">Pending Reviews</h3>
          <div className="text-xl font-bold text-yellow-500 pixel-font">0</div>
        </div>
        
        <div className="pixel-border-dark p-6">
          <h3 className="text-slate-400 text-sm font-semibold uppercase mb-2 font-mono">Total Servers</h3>
          <div className="text-xl font-bold text-accent-cyan pixel-font">--</div>
        </div>
      </div>

      <div className="mt-12 bg-bg-panel/50 p-8 border border-white/10 text-center text-slate-500 rounded font-mono">
        <p>This is an experimental admin area.</p>
        <p className="text-sm mt-2">SEO Indexing is disabled for this path.</p>
      </div>
    </div>
  );
}

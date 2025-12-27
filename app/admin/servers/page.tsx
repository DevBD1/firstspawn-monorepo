export default function AdminServers() {
  const mockServers = [
    { id: 1, name: "Hypixel", ip: "mc.hypixel.net", votes: 12450, status: "online" },
    { id: 2, name: "Complex Gaming", ip: "hub.mc-complex.com", votes: 8930, status: "online" },
    { id: 3, name: "ManaCube", ip: "play.manacube.com", votes: 5620, status: "online" },
    { id: 4, name: "Wynncraft", ip: "play.wynncraft.com", votes: 4100, status: "online" },
    { id: 5, name: "Generic Prisons", ip: "play.generic.net", votes: 120, status: "offline" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold pixel-font text-white">Manage Servers</h1>
        <button className="bg-accent-cyan hover:bg-cyan-400 text-black font-bold py-3 px-6 pixel-shadow hover:translate-y-1 hover:shadow-none transition-all pixel-font text-xs">
          + Add New Server
        </button>
      </div>

      <div className="pixel-border-dark p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black/40 border-b-4 border-black text-slate-400 uppercase text-xs font-mono">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">IP Address</th>
              <th className="p-4 text-right">Votes</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {mockServers.map((server) => (
              <tr key={server.id} className="hover:bg-white/5 transition font-mono">
                <td className="p-4 font-bold text-white tracking-wide">{server.name}</td>
                <td className="p-4 text-slate-400 text-sm">{server.ip}</td>
                <td className="p-4 text-right text-accent-cyan">{server.votes.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span
                    className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      server.status === "online"
                        ? "bg-success/20 text-success border border-success/40"
                        : "bg-danger/20 text-danger border border-danger/40"
                    }`}
                  >
                    {server.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-4">
                  <button className="text-slate-400 hover:text-white text-sm hover:underline">Edit</button>
                  <button className="text-danger hover:text-red-400 text-sm hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

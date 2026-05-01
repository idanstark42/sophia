export default function Tool ({ item, setItem }) {

  const update = callback => {
    setItem(callback(item))
  }

  if (!item) {
    return <div className="item routine empty">Select a tool to view or edit its details, or create a new one.</div>
  }

  return <div className="item routine">
    <input type="text" value={item.name} onChange={e => update(i => ({ ...i, name: e.target.value }))} />
    <textarea value={item.description} onChange={e => update(i => ({ ...i, description: e.target.value }))} />
    <input type="text" value={item.protocol} onChange={e => update(i => ({ ...i, protocol: e.target.value }))} />
    <input type="text" value={item.timing} onChange={e => update(i => ({ ...i, timing: e.target.value }))} />
  </div>
} 
import ListInput from "./list_input"

export default function Tool ({ item, setItem }) {

  const update = callback => {
    setItem(callback(item))
  }

  if (!item) {
    return <div className="item tool empty">Select a tool to view or edit its details, or create a new one.</div>
  }

  return <div className="item tool">
    <input type="text" value={item.name} onChange={e => update(i => ({ ...i, name: e.target.value }))} />
    <textarea value={item.description} onChange={e => update(i => ({ ...i, description: e.target.value }))} />
    <input type="text" value={item.base_url} onChange={e => update(i => ({ ...i, base_url: e.target.value }))} />
    <input type="password" value={item.auth} onChange={e => update(i => ({ ...i, auth: e.target.value }))} />
    <ListInput value={item.actions} onChange={actions => update(i => ({ ...i, actions }))} InputComponent={ActionInput} type="object" />
  </div>
}

function ActionInput ({ item, onChange }) {
  return <div className="action-input">
    <input type="text" value={item.name} onChange={e => onChange('name', e.target.value)} placeholder="action name" />
    <input type="text" value={item.path} onChange={e => onChange('path', e.target.value)} placeholder="endpoint path" />
  </div>
}
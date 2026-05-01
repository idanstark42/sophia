import ListInput from "./list_input"

export default function Tool ({ item, setItem }) {

  const update = callback => {
    setItem(callback(item))
  }

  if (!item) {
    return <div className="item settings empty">Select a tool to view or edit its details, or create a new one.</div>
  }

  return <div className="item settings">
    <input type="text" value={item.name} onChange={e => update(i => ({ ...i, name: e.target.value }))} />
    <textarea value={item.description} onChange={e => update(i => ({ ...i, description: e.target.value }))} />
    <ListInput value={item.values} onChange={values => update(i => ({ ...i, values }))} InputComponent={ValueInput} type="object" />
  </div>
}

function ValueInput ({ item, onChange }) {
  return <div className="value-input">
    <input type="text" value={item.key} onChange={e => onChange('key', e.target.value)} placeholder="key" />
    <input type="text" value={item.value} onChange={e => onChange('value', e.target.value)} placeholder="value" />
  </div>
}
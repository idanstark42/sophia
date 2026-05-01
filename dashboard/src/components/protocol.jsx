import ListInput from './list_input'

export default function Tool ({ item, setItem }) {

  const update = callback => {
    setItem(callback(item))
  }

  if (!item) {
    return <div className="item protocol empty">Select a tool to view or edit its details, or create a new one.</div>
  }

  return <div className="item protocol">
    <input type="text" value={item.name} onChange={e => update(i => ({ ...i, name: e.target.value }))} />
    <textarea value={item.description} onChange={e => update(i => ({ ...i, description: e.target.value }))} />
    <ListInput value={item.commands} onChange={commands => update(i => ({ ...i, commands }))} InputComponent={CommandInput} />
  </div>
}

function CommandInput ({ item, onChange }) {
  return <div className="command-input">
    <input type="text" value={item} onChange={e => onChange('self', e.target.value)} placeholder="command" />
  </div>
}1
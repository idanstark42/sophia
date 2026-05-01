// A reusable component for editing lists of items, such as commands or schedules.
// Each InputComponent gets passed an item and an onChange callback for updating that item.

export default function ListInput ({ value, onChange, InputComponent, type="string" }) {

  const update = (index, field, newValue) => {
    const updated = [...value]
    if (field === 'self') {
      updated[index] = newValue
    } else {
      updated[index] = { ...updated[index], [field]: newValue }
    }
    onChange(updated)
  }

  const addItem = () => {
    onChange([...value, generate(type)])
  }

  const removeItem = index => {
    const updated = [...value]
    updated.splice(index, 1)
    onChange(updated)
  }

  if (!value || value.length === 0) {
    return <div className="list-input empty">
      No items. Click "Add Item" to create one.
      <div className="add" onClick={addItem}>Add Item</div>
    </div>
  }

  return <div className="list-input">
    {value.map((item, index) => (
      <div key={index} className="list-item">
        <InputComponent item={item} onChange={(field, newValue) => update(index, field, newValue)} />
        <button className="remove" onClick={() => removeItem(index)}>Remove</button>
      </div>
    ))}
    <div className="add" onClick={addItem}>Add Item</div>
  </div>
}

function generate(type) {
  switch (type) {
    case 'string':
      return ''
    case 'number':
      return 0
    default:
      return {}
  }
}

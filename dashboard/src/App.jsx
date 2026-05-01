import React, { useState, useEffect } from 'react'
import { IoMdSend, IoMdSettings } from "react-icons/io"
import { GiHamburgerMenu } from "react-icons/gi"
import { GoCommandPalette } from "react-icons/go"
import { FaPlus, FaTools } from "react-icons/fa"
import { RiCalendarScheduleFill } from "react-icons/ri"

import { login, fetchItems, saveItem, createItem, deleteItem } from './api'

import Tool from './components/tool'
import Protocol from './components/protocol'
import Routine from './components/routine'
import Setting from './components/settings'

const TYPES = {
  tools: { icon: FaTools, Component: Tool },
  protocols: { icon: GoCommandPalette, Component: Protocol },
  routines: { icon: RiCalendarScheduleFill, Component: Routine },
  settings: { icon: IoMdSettings, Component: Setting }
}

function Icon ({ tab }) {
  const Comp = TYPES[tab].icon
  return <Comp />
}

function App() {
  /* ---------- auth ---------- */
  const [authToken, setAuthToken] = useState(sessionStorage.getItem("authToken"))
  const [password, setPassword] = useState("")

  /* ---------- ui ---------- */
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('tools')

  /* ---------- items ---------- */
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)

  const [updatedItem, setUpdatedItem] = useState(null)

  useEffect(() => {
    if (authToken) loadItems(activeTab)
  }, [activeTab, authToken])

  const handleLogin = async () => {
    const token = await login(password)
    setAuthToken(token)
  }

  const loadItems = async (type) => {
    try {
      const data = await fetchItems(type)
      setItems(data)
      if (data.length) {
        setSelectedItem(data[0])
        setUpdatedItem(structuredClone(data[0]))
      }
    } catch {
      setAuthToken(null)
    }
  }

  const handleSave = async () => {
    await saveItem(activeTab, selectedItem.id, updatedItem)
    loadItems(activeTab)
  }

  const handleCancel = async () => {
    setUpdatedItem(structuredClone(selectedItem))
  }

  const handleCreate = async () => {
    const created = await createItem(activeTab)
    setSelectedItem(created)
    setUpdatedItem(structuredClone(created))
  }

  const handleDelete = async () => {
    await deleteItem(activeTab, selectedItem.id)
    loadItems(activeTab)
  }

  const handlKeydown = async event => {
    if (event.key === 's' && event.ctrlKey) {
      await handleSave()
      event.preventDefault()
      event.stopPropegation()
    }
  }

  const toggleSidebar = () => setSidebarOpen(prev => !prev)

  if (!authToken) {
    return (
      <div className="auth card">
        <div>
            SOPHIA
        </div>
        <div>
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button onClick={handleLogin}><IoMdSend /></button>
        </div>
      </div>
    )
  }

  const ActiveComponent = TYPES[activeTab].Component

  return (
    <div className='main'>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className='sidebar-button' onClick={toggleSidebar}>
            <GiHamburgerMenu />
        </div>
        {['tools','protocols','routines','settings'].map(tab => (
          <div key={tab} onClick={()=>setActiveTab(tab)} className={`tab ${tab === activeTab ? 'active' : ''}`}>
            <Icon tab={tab} />
            {tab}
          </div>
        ))}
        {items.map(item => (
          <div key={item._id} onClick={() => setSelectedItem(item)} className={`item ${item === selectedItem ? 'active' : ''}`}>
            <b>{item.name}</b>
          </div>
        ))}
        <div className='item create' onClick={handleCreate}><FaPlus /></div>
      </div>
      <div className='editor' onKeyDown={handlKeydown}>
        <div className='title'>
          <Icon tab={activeTab} />
          {selectedItem?.name}
        </div>
        <ActiveComponent item={updatedItem} setItem={setUpdatedItem} />
        <div className='buttons'>
          <button onClick={handleDelete}>Delete</button>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default App

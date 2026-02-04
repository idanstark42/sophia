import React, { useState, useEffect } from 'react'
import { IoMdSend, IoMdSettings } from "react-icons/io"
import { GiHamburgerMenu } from "react-icons/gi"
import { GoCommandPalette } from "react-icons/go"
import { FaTools } from "react-icons/fa"
import { RiCalendarScheduleFill } from "react-icons/ri"

import { login, fetchItems, saveItem } from './api'

const ICONS = {
  tools: FaTools,
  protocols: GoCommandPalette,
  routines: RiCalendarScheduleFill,
  settings: IoMdSettings
}

function Icon ({ tab }) {
  const Comp = ICONS[tab]
  return <Comp />
}

function App() {
  const [authToken, setAuthToken] = useState(sessionStorage.getItem('authToken'))
  const [password, setPassword] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('tools')
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [editorContent, setEditorContent] = useState('')

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
        setEditorContent(JSON.stringify(data[0], null, 2))
      }
    } catch {
      setAuthToken(null)
    }
  }

  const handleSave = async () => {
    const updated = JSON.parse(editorContent)
    await saveItem(activeTab, selectedItem._id, updated)
    loadItems(activeTab)
  }

  const handleCancel = async () => {
    setEditorContent(JSON.stringify(selectedItem, null, 2))
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
          <div key={item._id} onClick={()=>{setSelectedItem(item); setEditorContent(JSON.stringify(item, null, 2))}} className={`item ${item === selectedItem ? 'active' : ''}`}>
            <b>{item.name}</b><br/>{item.description}
          </div>
        ))}
      </div>
      <div className='editor' onKeyDown={handlKeydown}>
        <div className='title'>
          <Icon tab={activeTab} />
          {selectedItem?.name}
        </div>
        <textarea value={editorContent} onChange={e=>setEditorContent(e.target.value)} />
        <div className='buttons'>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default App

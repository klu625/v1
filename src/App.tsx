import { useEffect, useId, useRef, useState } from 'react'

const repositories = ['app-scripts', 'agent-feedback', 'citizens-website-chat-ai-figma-make', 'coverage', 'dotfiles', 'edward-experiment-template']
const sampleNote = 'Slack: link to project thread\nLinear: link to follow-up ticket\n\nCheck review feedback before the next iteration.'

function TaskCard({ autoFocusTitle = false }: { autoFocusTitle?: boolean }) {
  const id = useId()
  const [title, setTitle] = useState('')
  const [update, setUpdate] = useState('')
  const [posted, setPosted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [notepadOpen, setNotepadOpen] = useState(false)
  const [note, setNote] = useState(sampleNote)
  const [chatOpen, setChatOpen] = useState(false)
  const [versions, setVersions] = useState<{ brief: string; note: string; posted: boolean }[]>([])
  const [selectedVersion, setSelectedVersion] = useState(1)
  const versionRailRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const notepadRef = useRef<HTMLDivElement>(null)
  const notepadTriggerRef = useRef<HTMLButtonElement>(null)
  const noteInputRef = useRef<HTMLTextAreaElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const chatTriggerRef = useRef<HTMLButtonElement>(null)
  const visibleRepositories = repositories.filter((name) => name.includes(search.trim().toLowerCase()))
  const archivedVersion = versions[selectedVersion - 1]
  const activeNote = archivedVersion?.note ?? note
  const activeBrief = archivedVersion?.brief ?? update

  const changeActiveNote = (value: string) => {
    if (archivedVersion) {
      setVersions((current) => current.map((version, index) => index === selectedVersion - 1 ? { ...version, note: value } : version))
    } else {
      setNote(value)
    }
  }

  const selectVersion = (next: number) => {
    if (next === selectedVersion) return
    setSelectedVersion(next)
  }

  useEffect(() => {
    const rail = versionRailRef.current
    if (!rail) return

    let lastStepAt = 0
    let lastWheelAt = 0
    let wheelDelta = 0
    const scrollVersions = (event: WheelEvent) => {
      event.preventDefault()
      const now = performance.now()
      if (now - lastWheelAt > 180) wheelDelta = 0
      lastWheelAt = now
      wheelDelta += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rail.clientHeight : 1)
      if (Math.abs(wheelDelta) < 24 || now - lastStepAt < 90) return
      const step = Math.sign(wheelDelta)
      wheelDelta = 0
      lastStepAt = now
      setSelectedVersion((current) => Math.max(1, Math.min(versions.length + 1, current + step)))
    }

    rail.addEventListener('wheel', scrollVersions, { passive: false })
    return () => rail.removeEventListener('wheel', scrollVersions)
  }, [versions.length])

  useEffect(() => {
    setMenuOpen(false)
    setNotepadOpen(false)
    setChatOpen(false)
    versionRailRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [selectedVersion])

  useEffect(() => {
    if (!menuOpen) return

    const dismiss = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuRef.current?.querySelector('button')?.focus()
      }
    }

    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!notepadOpen) return
    noteInputRef.current?.focus()

    const dismiss = (event: PointerEvent) => {
      if (!notepadRef.current?.contains(event.target as Node) && !notepadTriggerRef.current?.contains(event.target as Node)) setNotepadOpen(false)
    }
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotepadOpen(false)
        notepadTriggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [notepadOpen])

  useEffect(() => {
    if (!chatOpen) return

    const dismiss = (event: PointerEvent) => {
      if (!chatRef.current?.contains(event.target as Node) && !chatTriggerRef.current?.contains(event.target as Node)) setChatOpen(false)
    }
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setChatOpen(false)
        chatTriggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [chatOpen])

  const createVersion = () => {
    setVersions((current) => [...current, { brief: update, note, posted }])
    setSelectedVersion(versions.length + 2)
    setUpdate('')
    setNote(sampleNote)
    setPosted(false)
    setMenuOpen(false)
    setNotepadOpen(false)
    setChatOpen(false)
  }

  const drawerTriggers = (
    <div className="drawer-triggers">
      <button
        ref={notepadTriggerRef}
        className="notepad-trigger"
        type="button"
        aria-expanded={notepadOpen}
        aria-controls={`${id}-notepad-drawer`}
        onClick={() => { setMenuOpen(false); setChatOpen(false); setNotepadOpen((open) => !open) }}
      >
        <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="M5 3.5h8l2 2V17H5V3.5Zm8 0v2h2M8 9h4M8 12h4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Notepad
      </button>
      <button
        ref={chatTriggerRef}
        className="notepad-trigger"
        type="button"
        aria-expanded={chatOpen}
        aria-controls={`${id}-chat-drawer`}
        onClick={() => { setMenuOpen(false); setNotepadOpen(false); setChatOpen((open) => !open) }}
      >
        <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="M3 4.5h14v10H8l-4 3v-3H3v-10Zm3 4h8M6 11h5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Updates
      </button>
    </div>
  )

  const drawers = (
    <>
      <div className={`notepad-drawer${notepadOpen ? ' is-open' : ''}`} id={`${id}-notepad-drawer`} ref={notepadRef} inert={!notepadOpen} aria-hidden={!notepadOpen}>
        <div className="notepad-drawer-content">
          <div className="notepad-panel">
            <textarea ref={noteInputRef} aria-label="Notepad" className="notepad-input" placeholder="Jot down your notes..." value={activeNote} onChange={(event) => changeActiveNote(event.target.value)} />
          </div>
        </div>
      </div>
      <div className={`notepad-drawer${chatOpen ? ' is-open' : ''}`} id={`${id}-chat-drawer`} ref={chatRef} inert={!chatOpen} aria-hidden={!chatOpen}>
        <div className="notepad-drawer-content">
          <div className="chat-panel">
            <div className="chat-heading">Updates</div>
            <div className="agent-update">
                <p>Here’s what I implemented for this version:</p>
                {activeBrief && <p className="agent-update-brief">Task brief: {activeBrief}</p>}
                <ul>
                  <li>Built the task brief composer and its action controls.</li>
                  <li>Added fold-out Notepad and Updates panels.</li>
                  <li>Refined the layout and keyboard interactions.</li>
                </ul>
                <p className="agent-update-summary">I’ve included a sample screen recording and assets below for review.</p>
                <div className="update-attachments" aria-label="Sample attachments">
                  <div className="update-attachment">
                    <span className="attachment-preview recording-preview" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20"><path d="m9 6 9 6-9 6V6Z" fill="currentColor" /></svg>
                    </span>
                    <span className="attachment-detail"><strong>Screen recording</strong><small>Walkthrough · sample</small></span>
                  </div>
                  <div className="update-attachment">
                    <span className="attachment-preview assets-preview" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m5 16 4-4 3 3 3-4 4 5M9 9h.01" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span className="attachment-detail"><strong>Design assets</strong><small>UI snapshots · sample</small></span>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="task-card">
      <div className={`version-stage${versions.length ? ' has-versions' : ''}`}>
      <input
        className="project-title-input"
        type="text"
        aria-label="Project title"
        placeholder="Untitled project"
        autoFocus={autoFocusTitle}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <div className="version-stack">
      {archivedVersion ? (
        <section className="composer" aria-label={`Version ${selectedVersion} archive`}>
          <header className="composer-header">
            <span className="archive-repository">figma</span>
            <span className="version-number">{selectedVersion}</span>
          </header>
          <div className="archived-brief">{archivedVersion.brief || <span className="archived-empty">No task brief</span>}</div>
          <footer className="archived-footer">{drawerTriggers}<span>{archivedVersion.posted ? 'Executed' : 'Not executed'}</span></footer>
          {drawers}
        </section>
      ) : (
      <section className="composer" aria-label={`Version ${versions.length + 1} composer`}>
        <header className="composer-header">
          <div className="composer-menu" ref={menuRef}>
            <button className="menu-trigger" type="button" aria-expanded={menuOpen} aria-controls={`${id}-repository-menu`} onClick={() => { setNotepadOpen(false); setChatOpen(false); setSearch(''); setMenuOpen((open) => !open) }}>
              figma
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {menuOpen && (
              <div className="menu-panel" id={`${id}-repository-menu`} aria-label="Repositories and environments">
                <div className="menu-search">
                  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m13 13 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  <input autoFocus aria-label="Search repositories and environments" placeholder="Search repositories, environments..." value={search} onChange={(event) => setSearch(event.target.value)} />
                </div>
                <div className="menu-label">Recents</div>
                <div className="repo-list">
                  {visibleRepositories.map((name) => (
                    <button className="repo-row" type="button" key={name} onClick={() => setMenuOpen(false)}>
                      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M2.5 5h5l1.5 2h8.5v9h-15V5Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
                      <span className="repo-name">{name}</span><span className="repo-org">figma</span>
                    </button>
                  ))}
                  {visibleRepositories.length === 0 && <div className="menu-empty">No results</div>}
                </div>
                <div className="menu-actions">
                  {['Add Repositories', 'Refresh', 'Add Environment', 'Start from scratch'].map((action) => (
                    <button className="menu-action" type="button" key={action} onClick={() => { if (action === 'Refresh') setSearch(''); else setMenuOpen(false) }}>
                      {action === 'Refresh'
                        ? <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M16 7a6 6 0 0 0-10-2L4 7m0 0V3m0 4h4M4 13a6 6 0 0 0 10 2l2-2m0 0v4m0-4h-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>}
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="version-actions">
            {versions.length > 0 && <span className="version-number">{versions.length + 1}</span>}
            <button className="new-version-button" type="button" onClick={createVersion}>
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M8 2.5v11M2.5 8h11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              Iterate
            </button>
          </div>
        </header>

        <textarea
          aria-label="Project update"
          value={update}
          onChange={(event) => {
            const field = event.currentTarget
            field.style.height = 'auto'
            field.style.height = `${field.scrollHeight}px`
            setUpdate(field.value)
            setPosted(false)
          }}
          placeholder="Write task brief"
        />

        <footer>
          {drawerTriggers}
          <div className="footer-right">
            <button className="attachment" aria-label="Add attachment">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path d="m8.5 12.5 5.7-5.7a3 3 0 0 1 4.2 4.2l-7.1 7.1a5 5 0 0 1-7.1-7.1l7.1-7.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className="post-button"
              onClick={() => {
                if (update.trim()) setPosted(true)
              }}
            >
              {posted ? 'Executed' : 'Execute'}
            </button>
          </div>
        </footer>
        {drawers}
      </section>
      )}
      </div>
      {versions.length > 0 && (
        <div className="version-rail" ref={versionRailRef} aria-label="Version navigation">
          {Array.from({ length: versions.length + 1 }, (_, index) => (
            <button
              className="version-mark"
              type="button"
              key={index}
              aria-label={`Version ${index + 1}`}
              aria-pressed={selectedVersion === index + 1}
              onClick={() => selectVersion(index + 1)}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

export default function App() {
  const [taskIds, setTaskIds] = useState([0])
  const nextTaskId = useRef(1)

  const addTask = () => {
    const id = nextTaskId.current++
    setTaskIds((current) => [id, ...current])
  }

  return (
    <>
      <header className="page-header">
        <button className="new-version-button" type="button" onClick={addTask}>
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M8 2.5v11M2.5 8h11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          New task
        </button>
      </header>
      <main className="page">
        {taskIds.map((id, index) => (
          <TaskCard key={id} autoFocusTitle={id !== 0 && index === 0} />
        ))}
      </main>
    </>
  )
}

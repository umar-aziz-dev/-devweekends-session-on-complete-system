import { useEffect, useMemo, useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const response = await fetch('/api/todos')
        if (!response.ok) {
          throw new Error('Failed to load todos')
        }

        const data = await response.json()
        setTodos(data)
      } catch (error) {
        setError('Could not reach the API. Check the server container and MONGO_URL.')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadTodos()
  }, [])

  const visibleTodos = useMemo(() => {
    const query = search.trim().toLowerCase()

    return todos.filter((todo) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && !todo.completed) ||
        (filter === 'completed' && todo.completed)

      const matchesSearch =
        query.length === 0 || todo.title.toLowerCase().includes(query)

      return matchesFilter && matchesSearch
    })
  }, [filter, search, todos])

  const completedCount = todos.filter((todo) => todo.completed).length
  const activeCount = todos.length - completedCount
  const completionPercent = todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100)

  const createTodo = async (event) => {
    event.preventDefault()

    const cleanTitle = title.trim()
    if (!cleanTitle) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: cleanTitle }),
      })

      if (!response.ok) {
        throw new Error('Failed to create todo')
      }

      const created = await response.json()
      setTodos((current) => [created, ...current])
      setTitle('')
    } catch {
      setError('Failed to create a todo. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateTodo = async (id, payload, optimisticUpdater) => {
    const previousTodos = todos
    setTodos(optimisticUpdater)

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to update todo')
      }

      const updated = await response.json()
      setTodos((current) => current.map((todo) => (todo._id === id ? updated : todo)))
    } catch {
      setTodos(previousTodos)
      setError('Update failed. The change was rolled back.')
    }
  }

  const toggleTodo = (todo) => {
    updateTodo(
      todo._id,
      { completed: !todo.completed },
      (current) => current.map((item) => (item._id === todo._id ? { ...item, completed: !item.completed } : item)),
    )
  }

  const saveEdit = async (event) => {
    event.preventDefault()

    const cleanTitle = editingTitle.trim()
    if (!cleanTitle || !editingId) return

    const id = editingId
    setEditingId(null)
    setEditingTitle('')

    await updateTodo(
      id,
      { title: cleanTitle },
      (current) => current.map((todo) => (todo._id === id ? { ...todo, title: cleanTitle } : todo)),
    )
  }

  const deleteTodo = async (id) => {
    const previousTodos = todos
    setTodos((current) => current.filter((todo) => todo._id !== id))

    try {
      const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete todo')
      }
    } catch {
      setTodos(previousTodos)
      setError('Delete failed. The item was restored.')
    }
  }

  const clearCompleted = async () => {
    const completed = todos.filter((todo) => todo.completed)
    if (completed.length === 0) return

    const previousTodos = todos
    setTodos((current) => current.filter((todo) => !todo.completed))

    try {
      await Promise.all(
        completed.map((todo) => fetch(`/api/todos/${todo._id}`, { method: 'DELETE' })),
      )
    } catch {
      setTodos(previousTodos)
      setError('Could not clear completed items. Everything was restored.')
    }
  }

  const setAllCompleted = async (completed) => {
    const targets = todos.filter((todo) => todo.completed !== completed)
    if (targets.length === 0) return

    const previousTodos = todos
    setTodos((current) => current.map((todo) => ({ ...todo, completed })))

    try {
      await Promise.all(
        targets.map((todo) =>
          fetch(`/api/todos/${todo._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed }),
          }),
        ),
      )
    } catch {
      setTodos(previousTodos)
      setError('Bulk update failed. Your list was restored.')
    }
  }

  return (
    <main className="shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Vance One</span>
          <h1>Todo ops with a cleaner UI and MongoDB persistence.</h1>
          <p className="lede">
            Add tasks, edit titles inline, mark progress, filter the list, search, and clear completed items.
          </p>

          <div className="stats-grid">
            <article>
              <span>Total</span>
              <strong>{todos.length}</strong>
            </article>
            <article>
              <span>Active</span>
              <strong>{activeCount}</strong>
            </article>
            <article>
              <span>Done</span>
              <strong>{completedCount}</strong>
            </article>
            <article>
              <span>Progress</span>
              <strong>{completionPercent}%</strong>
            </article>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-top">
            <div>
              <p className="card-label">Live board</p>
              <h2>One-page todo workflow</h2>
            </div>
            <button
              type="button"
              className="ghost"
              onClick={() => setAllCompleted(true)}
              disabled={todos.length === 0}
            >
              Mark all done
            </button>
          </div>

          <form className="todo-form" onSubmit={createTodo}>
            <input
              type="text"
              placeholder="What needs to get done?"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-label="New todo title"
            />
            <button type="submit" disabled={saving}>
              {saving ? 'Adding...' : 'Add task'}
            </button>
          </form>

          <div className="toolbar">
            <div className="segments" role="tablist" aria-label="Todo filter">
              {['all', 'active', 'completed'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={filter === item ? 'segment active' : 'segment'}
                  onClick={() => setFilter(item)}
                >
                  {item[0].toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>

            <input
              className="search"
              type="search"
              placeholder="Search tasks"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search todo items"
            />
          </div>

          {error ? <p className="alert">{error}</p> : null}

          <div className="list-header">
            <span>{visibleTodos.length} shown</span>
            <button type="button" className="link-button" onClick={clearCompleted}>
              Clear completed
            </button>
          </div>

          {loading ? (
            <div className="empty-state">Loading your task board...</div>
          ) : visibleTodos.length === 0 ? (
            <div className="empty-state">
              <strong>No tasks found.</strong>
              <span>Add a new task or change the filters.</span>
            </div>
          ) : (
            <ul className="todo-list">
              {visibleTodos.map((todo) => (
                <li key={todo._id} className={todo.completed ? 'todo-item completed' : 'todo-item'}>
                  <label className="check-wrap">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo)}
                    />
                    <span className="check-ui" aria-hidden="true" />
                  </label>

                  {editingId === todo._id ? (
                    <form className="edit-form" onSubmit={saveEdit}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        autoFocus
                        aria-label="Edit todo title"
                      />
                      <div className="edit-actions">
                        <button type="submit" className="primary-small">
                          Save
                        </button>
                        <button
                          type="button"
                          className="ghost-small"
                          onClick={() => {
                            setEditingId(null)
                            setEditingTitle('')
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      className="todo-title"
                      onClick={() => {
                        setEditingId(todo._id)
                        setEditingTitle(todo.title)
                      }}
                    >
                      <span>{todo.title}</span>
                      <small>Click to edit</small>
                    </button>
                  )}

                  <div className="todo-actions">
                    <button
                      type="button"
                      className="ghost-small"
                      onClick={() => toggleTodo(todo)}
                    >
                      {todo.completed ? 'Undo' : 'Done'}
                    </button>
                    <button
                      type="button"
                      className="danger-small"
                      onClick={() => deleteTodo(todo._id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}

export default App

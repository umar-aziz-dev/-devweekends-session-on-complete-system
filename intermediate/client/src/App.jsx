import { useEffect, useMemo, useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos],
  )

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const res = await fetch('/api/todos')
        if (!res.ok) throw new Error('Unable to fetch todos')

        const data = await res.json()
        setTodos(data)
      } catch {
        setError('Could not load todos. Is server running on port 3000?')
      } finally {
        setLoading(false)
      }
    }

    loadTodos()
  }, [])

  const createTodo = async (event) => {
    event.preventDefault()

    const title = newTodo.trim()
    if (!title) return

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })

      if (!res.ok) throw new Error('Unable to create todo')

      const created = await res.json()
      setTodos((current) => [created, ...current])
      setNewTodo('')
    } catch {
      setError('Failed to save todo.')
    } finally {
      setSaving(false)
    }
  }

  const toggleTodo = async (todo) => {
    const original = todo.completed

    setTodos((current) =>
      current.map((item) =>
        item._id === todo._id ? { ...item, completed: !item.completed } : item,
      ),
    )

    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !original }),
      })

      if (!res.ok) throw new Error('Unable to update todo')
    } catch {
      setTodos((current) =>
        current.map((item) =>
          item._id === todo._id ? { ...item, completed: original } : item,
        ),
      )
      setError('Failed to update todo.')
    }
  }

  const deleteTodo = async (id) => {
    const previous = todos
    setTodos((current) => current.filter((item) => item._id !== id))

    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Unable to delete todo')
    } catch {
      setTodos(previous)
      setError('Failed to delete todo.')
    }
  }

  return (
    <main className="page">
      <section className="todo-card">
        <header className="hero">
          <p className="eyebrow">Intermediate Project</p>
          <h1>Todo List</h1>
          <p className="subtext">One page app with MongoDB persistence and API fetch.</p>
          <div className="stats">
            <span>{todos.length} total</span>
            <span>{completedCount} done</span>
            <span>{todos.length - completedCount} pending</span>
          </div>
        </header>

        <form className="todo-form" onSubmit={createTodo}>
          <input
            type="text"
            placeholder="Add a task for today"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
          />
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Add'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <ul className="todo-list">
          {loading && <li className="empty">Loading todos...</li>}

          {!loading && todos.length === 0 && (
            <li className="empty">No todos yet. Add one above.</li>
          )}

          {!loading &&
            todos.map((todo) => (
              <li key={todo._id} className="todo-item">
                <label>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                  />
                  <span className={todo.completed ? 'done' : ''}>{todo.title}</span>
                </label>
                <button
                  type="button"
                  className="delete"
                  onClick={() => deleteTodo(todo._id)}
                >
                  Delete
                </button>
              </li>
            ))}
        </ul>
      </section>
    </main>
  )
}

export default App

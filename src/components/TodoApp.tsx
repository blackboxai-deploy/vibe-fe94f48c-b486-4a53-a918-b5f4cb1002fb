"use client";

import { useEffect, useMemo, useState } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "next-todo-app::todos";
const FILTER_KEY = "next-todo-app::filter";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTodos(JSON.parse(raw));
      const f = localStorage.getItem(FILTER_KEY) as Filter | null;
      if (f === "all" || f === "active" || f === "completed") setFilter(f);
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {}
  }, [todos]);
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_KEY, filter);
    } catch {}
  }, [filter]);

  const remaining = useMemo(() => todos.filter(t => !t.completed).length, [todos]);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter(t => !t.completed);
      case "completed":
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  function addTodo(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTodos(prev => [{ id: uid(), text, completed: false }, ...prev]);
    setInput("");
  }

  function toggleTodo(id: string) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTodo(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingText("");
    }
  }

  function clearCompleted() {
    setTodos(prev => prev.filter(t => !t.completed));
  }

  function beginEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditingText(todo.text);
  }

  function saveEdit() {
    const text = editingText.trim();
    if (!editingId) return;
    if (!text) {
      deleteTodo(editingId);
      return;
    }
    setTodos(prev => prev.map(t => (t.id === editingId ? { ...t, text } : t)));
    setEditingId(null);
    setEditingText("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
  }

  function toggleAll() {
    const allCompleted = todos.length > 0 && todos.every(t => t.completed);
    setTodos(prev => prev.map(t => ({ ...t, completed: !allCompleted })));
  }

  return (
    <div className="todo">
      <form className="todo-input" onSubmit={addTodo}>
        <input
          aria-label="New todo"
          placeholder="What needs to be done?"
          value={input}
          onChange={e => setInput(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={!input.trim()}>
          Add
        </button>
      </form>

      <div className="toolbar">
        <div className="filters" role="tablist" aria-label="Filter todos">
          <button
            role="tab"
            aria-selected={filter === "all"}
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            role="tab"
            aria-selected={filter === "active"}
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            role="tab"
            aria-selected={filter === "completed"}
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
        <div className="actions">
          <button onClick={toggleAll} disabled={todos.length === 0}>
            Toggle All
          </button>
          <button onClick={clearCompleted} disabled={!todos.some(t => t.completed)}>
            Clear Completed
          </button>
        </div>
      </div>

      <ul className="list" aria-live="polite">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={`item ${todo.completed ? "completed" : ""}`}>
            <label className="item-main">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                aria-label={todo.completed ? "Mark as active" : "Mark as completed"}
              />
              {editingId === todo.id ? (
                <input
                  className="edit-input"
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  onBlur={saveEdit}
                  autoFocus
                />)
              : (
                <span className="text" onDoubleClick={() => beginEdit(todo)}>
                  {todo.text}
                </span>
              )}
            </label>
            <button className="delete" aria-label="Delete" onClick={() => deleteTodo(todo.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="status">
        <span>{remaining} item{remaining === 1 ? "" : "s"} left</span>
      </div>
    </div>
  );
}

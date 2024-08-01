/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

interface Todo {
  id: number;
  content: string;
  isCompleted: boolean;
  isPersonal: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [activeCategory, setActiveCategory] = useState<
    "Personal" | "Professional"
  >("Personal");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async () => {
    if (input) {
      await axios.post(`${API_URL}/todos`, {
        content: input,
        isPersonal: activeCategory === "Personal",
      });
      setInput("");
      fetchTodos();
    }
  };

  const toggleTodo = async (id: number, isCompleted: boolean) => {
    await axios.put(`${API_URL}/todos/${id}`, { isCompleted: !isCompleted });
    fetchTodos();
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter((todo) => todo.isCompleted);
    await Promise.all(
      completedTodos.map((todo) => axios.delete(`${API_URL}/todos/${todo.id}`))
    );
    fetchTodos();
  };

  const deleteTodo = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const addOrUpdateTodo = async () => {
    if (input) {
      if (editingTodo) {
        await axios.put(`${API_URL}/todos/${editingTodo.id}`, {
          content: input,
          isPersonal: activeCategory === "Personal",
        });
        setEditingTodo(null);
      } else {
        await axios.post(`${API_URL}/todos`, {
          content: input,
          isPersonal: activeCategory === "Personal",
        });
      }
      setInput("");
      fetchTodos();
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setInput(todo.content);
  };

  return (
    <div className="todo-app">
      <h1 className="app-title">TODO</h1>
      <div className="category-tabs">
        <button
          onClick={() => setActiveCategory("Personal")}
          className={activeCategory === "Personal" ? "active" : ""}
        >
          Personal
        </button>
        <button
          onClick={() => setActiveCategory("Professional")}
          className={activeCategory === "Professional" ? "active" : ""}
        >
          Professional
        </button>
      </div>
      <div className="input-container">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you need to do?"
        />
        <button onClick={addOrUpdateTodo}>
          {editingTodo ? "UPDATE" : "ADD"}
        </button>
      </div>
      <ul className="todo-list">
        {todos
          .filter((todo) =>
            activeCategory === "Personal" ? todo.isPersonal : !todo.isPersonal
          )
          .map((todo) => (
            <li key={todo.id} className={todo.isCompleted ? "completed" : ""}>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={todo.isCompleted}
                  onChange={() => toggleTodo(todo.id, todo.isCompleted)}
                />
                <span className="checkmark"></span>
              </label>
              <span className="todo-content">{todo.content}</span>
              <button className="edit-btn" onClick={() => startEditing(todo)}>
                ✏️
              </button>
              <button
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
              >
                🗑️
              </button>
            </li>
          ))}
      </ul>
      <button onClick={clearCompleted} className="clear-completed">
        Clear Completed
      </button>
    </div>
  );
};

export default App;

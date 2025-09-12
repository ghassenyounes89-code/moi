
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./App.css"

// Set base URL for API requests
axios.defaults.baseURL = "http://localhost:5000"

function App() {
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [comments, setComments] = useState([])
  const [commentForm, setCommentForm] = useState({ name: "", email: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" })

  // Set up axios interceptors for authentication
  useEffect(() => {
    // Request interceptor to add auth token to headers
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token")
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor to handle auth errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          handleLogout()
        }
        return Promise.reject(error)
      },
    )

    // Cleanup interceptors when component unmounts
    return () => {
      axios.interceptors.request.eject(requestInterceptor)
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      setUser(JSON.parse(userData))
      setCommentForm((prev) => ({
        ...prev,
        name: JSON.parse(userData).name,
        email: JSON.parse(userData).email,
      }))
    }
    fetchComments()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post("/api/auth/login", loginForm)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      setUser(user)
      setShowLogin(false)
      setCommentForm((prev) => ({ ...prev, name: user.name, email: user.email }))
      setLoginForm({ email: "", password: "" })
    } catch (error) {
      alert(error.response?.data?.message || "Login failed")
    }
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post("/api/auth/register", registerForm)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      setUser(user)
      setShowRegister(false)
      setCommentForm((prev) => ({ ...prev, name: user.name, email: user.email }))
      setRegisterForm({ name: "", email: "", password: "" })
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed")
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setCommentForm({ name: "", email: "", message: "" })
  }

  const fetchComments = async () => {
    try {
      console.log("[v0] Fetching comments from API...")
      const response = await axios.get("/api/comments")
      console.log("[v0] Comments received:", response.data)
      setComments(response.data)
    } catch (error) {
      console.error("[v0] Failed to fetch comments:", error)
      console.error("[v0] Error details:", error.response?.data)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentForm.name || !commentForm.email || !commentForm.message) {
      alert("Please fill all fields")
      return
    }

    setLoading(true)
    try {
      console.log("[v0] Submitting comment:", commentForm)
      const response = await axios.post("/api/comments", commentForm)
      console.log("[v0] Comment submission response:", response.data)
      alert("Comment submitted! It will be reviewed before appearing.")
      setCommentForm((prev) => ({ ...prev, message: "" }))
      setTimeout(() => {
        fetchComments() // Refresh comments
      }, 1000)
    } catch (error) {
      console.error("[v0] Comment submission error:", error)
      console.error("[v0] Error response:", error.response?.data)
      alert(error.response?.data?.message || "Failed to submit comment")
    }
    setLoading(false)
  }

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="container">
          <h1 className="logo">Ghassen Dev</h1>
          <nav className="nav">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#comments">Comments</a>
            {user ? (
              <div className="auth-section">
                <span>Welcome, {user.name}</span>
                <button onClick={handleLogout} className="auth-btn">
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-section">
                <button onClick={() => setShowLogin(true)} className="auth-btn">
                  Login
                </button>
                <button onClick={() => setShowRegister(true)} className="auth-btn">
                  Register
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2 className="hero-title">Professional Web Development Services</h2>
          <p className="hero-text">
            I create professional websites for businesses of all sizes. From simple projects to complex applications, I
            deliver quality solutions you can trust.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="container">
          <h2 className="section-title">My Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Simple Projects</h3>
              <p>Perfect for small businesses and personal websites. Clean, fast, and professional designs.</p>
            </div>
            <div className="service-card">
              <h3>Complex Projects</h3>
              <p>Advanced web applications with custom functionality, databases, and integrations.</p>
            </div>
            <div className="service-card">
              <h3>Website Maintenance</h3>
              <p>Keep your website updated, secure, and running smoothly with ongoing support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Me Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">Why Choose Ghassen Dev?</h2>
          <div className="features-grid">
            <div className="feature">
              <h3>Professional Quality</h3>
              <p>Every website is built with attention to detail and modern web standards.</p>
            </div>
            <div className="feature">
              <h3>Trusted Partner</h3>
              <p>I work closely with clients to understand their needs and deliver exactly what they want.</p>
            </div>
            <div className="feature">
              <h3>Ongoing Support</h3>
              <p>Your website needs maintenance and updates. I'm here to help long after launch.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-info">
            <div className="contact-item">
              <h3>Email</h3>
              <p>ghassenyounes89@gmail.com</p>
            </div>
            <div className="contact-item">
              <h3>Phone</h3>
              <p>0775818782</p>
            </div>
            <div className="contact-item">
              <h3>Social Media</h3>
              <div className="social-links">
                <a
                  href="https://www.tiktok.com/@yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title="Follow me on TikTok"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                  <span>TikTok</span>
                </a>
                <a
                  href="https://www.instagram.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title="Follow me on Instagram"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-4.358-.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.949 0 3.259.014 3.668.072 4.948.196 4.354 2.617 6.78 6.979 6.98 1.281.059 1.69.073 4.949.073 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="comments" className="comments-section">
        <div className="container">
          <h2 className="section-title">Client Comments</h2>

          {/* Comment Form */}
          <div className="comment-form-container">
            <h3>Leave a Comment</h3>
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <input
                type="text"
                placeholder="Your Name"
                value={commentForm.name}
                onChange={(e) => setCommentForm((prev) => ({ ...prev, name: e.target.value }))}
                className="form-input"
                disabled={user} // Disable if user is logged in
              />
              <input
                type="email"
                placeholder="Your Email"
                value={commentForm.email}
                onChange={(e) => setCommentForm((prev) => ({ ...prev, email: e.target.value }))}
                className="form-input"
                disabled={user} // Disable if user is logged in
              />
              <textarea
                placeholder="Your Message"
                value={commentForm.message}
                onChange={(e) => setCommentForm((prev) => ({ ...prev, message: e.target.value }))}
                className="form-textarea"
                rows="4"
              ></textarea>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Submitting..." : "Submit Comment"}
              </button>
            </form>
          </div>

          {/* Comments Display */}
          <div className="comments-display">
            <h3>What Our Clients Say</h3>
            {comments.length > 0 ? (
              <div className="comments-grid">
                {comments.map((comment) => (
                  <div key={comment._id} className="comment-card">
                    <p className="comment-message">"{comment.message}"</p>
                    <div className="comment-author">
                      <strong>{comment.name}</strong>
                      <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No comments yet. Be the first to leave a comment!</p>
            )}
          </div>
        </div>
      </section>

      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
                className="form-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                className="form-input"
              />
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <p>
              Don't have an account?
              <button
                onClick={() => {
                  setShowLogin(false)
                  setShowRegister(true)
                }}
                className="link-btn"
              >
                Register here
              </button>
            </p>
            <button onClick={() => setShowLogin(false)} className="close-btn">
              ×
            </button>
          </div>
        </div>
      )}

      {showRegister && (
        <div className="modal-overlay" onClick={() => setShowRegister(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Full Name"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                required
                className="form-input"
              />
              <input
                type="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                required
                className="form-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
                className="form-input"
              />
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
            <p>
              Already have an account?
              <button
                onClick={() => {
                  setShowRegister(false)
                  setShowLogin(true)
                }}
                className="link-btn"
              >
                Login here
              </button>
            </p>
            <button onClick={() => setShowRegister(false)} className="close-btn">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Ghassen Dev. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
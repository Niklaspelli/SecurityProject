/* import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext"; // Make sure the path is correct
import ThreadList from "./ThreadList";

const BackendURL = "http://localhost:5000";

function CreateThread() {
  const { authData } = useAuth(); // Use the custom hook
  const { username, csrfToken, accessToken, avatar } = authData; // Destructure username from authData
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title || !body) {
      setError("Title and content are required");
      return;
    }

    try {
      const csrfToken = getCookie("csrfToken"); // You need to implement getCookie

      const response = await fetch(`${BackendURL}/api/auth/threads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // ✅ Include this

          "CSRF-TOKEN": csrfToken,
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({
          title: title,
          body: body,
          author: username, // Use the username here
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          console.log("Access Token:", accessToken); // Check if the token is there

          throw new Error("Title and content are required");
        }
        const errorMsg = await response.text();
        throw new Error(`Failed to create thread: ${errorMsg}`);
      }

      const createdThread = await response.json();
      console.log("Thread created successfully:", createdThread);

      setTitle("");
      setBody("");
      setSuccess(true);
    } catch (error) {
      console.error("Failed to create thread:", error.message);
      setError(error.message);
    }
  };

  return (
    <>
      <ThreadList />
      <h1 style={{ textAlign: "center" }}>Skapa ny tråd:</h1>
      <div style={LoginContainerStyle}>
        <form onSubmit={handleSubmit}>
          <input
            maxLength="50"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />
          <textarea
            maxLength="500"
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={inputStyle}
          ></textarea>
          <button
            type="submit"
            style={{ backgroundColor: "black", margin: "20px" }}
          >
            Skapa tråd
          </button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && (
          <p style={{ color: "green" }}>Thread created successfully!</p>
        )}
      </div>
    </>
  );
}

export default CreateThread;

const LoginContainerStyle = {
  marginBottom: "15px",
  display: "flex",
  justifyContent: "center",
  margin: "20px",
};

const inputStyle = {
  width: "90%",
  maxWidth: "400px",
  padding: "10px",
  borderRadius: "20px",
  border: "1px solid #ddd",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  outline: "none",
  fontSize: "16px",
  transition: "border-color 0.3s ease",
  color: "white",
  border: "none",
};
 */

// components/CreateThread.js
import React, { useState } from "react";
import { Form, Button, Card, Container, Alert, Spinner } from "react-bootstrap";

import { useAuth } from "../../context/AuthContext"; // Make sure the path is correct
import ThreadList from "./ThreadList";
import useCreateThread from "../../queryHooks/threads/useCreateThread"; // Import your custom hook

const CreateThread = () => {
  const { authData } = useAuth();
  const { username, accessToken } = authData;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Använd React Query hook för att skapa tråd
  const {
    mutate,
    isLoading,
    isError,
    error: mutationError,
    isSuccess,
  } = useCreateThread();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title || !body) {
      setError("Title and content are required");
      return;
    }

    mutate({ title, body, username, accessToken });
  };

  return (
    <Container className="mt-5">
      <ThreadList />
      <h2 className="text-center text-white my-4">Skapa ny tråd</h2>

      <Card className="bg-dark text-white p-4 shadow">
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="threadTitle" className="mb-3">
            <Form.Label>Titel</Form.Label>
            <Form.Control
              type="text"
              maxLength={50}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              style={{
                backgroundColor: "#333",
                color: "white",
                borderColor: "#444",
              }}
              required
            />
          </Form.Group>

          <Form.Group controlId="threadBody" className="mb-3">
            <Form.Label>Innehåll</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              maxLength={500}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Body"
              style={{
                backgroundColor: "#333",
                color: "white",
                borderColor: "#444",
              }}
              required
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button
              type="submit"
              variant="light"
              style={{ backgroundColor: "black", color: "white" }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Skapar tråd...
                </>
              ) : (
                "Skapa tråd"
              )}
            </Button>
          </div>

          {isSuccess && (
            <Alert variant="success" className="mt-3">
              Thread created successfully!
            </Alert>
          )}
          {isError && (
            <Alert variant="danger" className="mt-3">
              Error: {mutationError?.message || "Något gick fel"}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
        </Form>
      </Card>
    </Container>
  );
};

export default CreateThread;

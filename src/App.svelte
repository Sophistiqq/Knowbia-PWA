<script lang="ts">
  import { onMount } from "svelte";
  import { DarkMode, Tooltip } from "flowbite-svelte";
  import {
    ArrowLeftToBracketOutline,
    CheckCircleOutline,
    CloseCircleOutline,
  } from "flowbite-svelte-icons";
  import { CloseOutline } from "flowbite-svelte-icons";

  let socket: WebSocket;
  let receivedAssessment: {
    title: any;
    description: any;
    questions: any;
  } | null = null;
  let connectionStatus = "Connecting...";
  let serverIp = "10.0.23.245"; // Default IP address
  let serverPort = "8080"; // WebSocket port

  // Registration form fields
  let studentNumber = "";
  let email = "";
  let password = "";
  let firstName = "";
  let lastName = "";
  let section = "";
  let confirmPassword = "";

  let showRegisterForm = false;
  let registrationFeedback = "";

  // Connect WebSocket
  function connectWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    socket = new WebSocket(`${protocol}://${serverIp}:${serverPort}`);

    socket.onopen = () => {
      connectionStatus = "Connected";
      console.log("Connected to WebSocket server");
    };

    socket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);

        if (response.type === "registerResponse") {
          registrationFeedback = response.result.message;
        } else if (response.type === "newAssessment" && response.assessment) {
          receivedAssessment = response.assessment; // Corrected to handle the assessment
          console.log("Received assessment:", receivedAssessment);
        }
      } catch (error) {
        console.error("Failed to parse message:", event.data);
      }
    };

    socket.onclose = () => {
      connectionStatus = "Disconnected";
      console.log("Disconnected from WebSocket server");
    };

    socket.onerror = (error) => {
      connectionStatus = "Error occurred";
      console.error("WebSocket error:", error);
    };
  }

  function openRegisterForm() {
    showRegisterForm ? (showRegisterForm = false) : (showRegisterForm = true);
  }

  function submitRegistration() {
    if (password !== confirmPassword) {
      registrationFeedback = "Passwords do not match";
      return;
    }

    const studentData = {
      studentNumber,
      email,
      password,
      firstName,
      lastName,
      section,
    };

    // Send the data to Electron app via WebSocket
    socket.send(JSON.stringify({ type: "register", data: studentData }));
    showRegisterForm = false;
    // clear all fields
    studentNumber = "";
    email = "";
    password = "";
    firstName = "";
    lastName = "";
    section = "";
    confirmPassword = "";
  }

  onMount(() => {
    connectWebSocket();
  });
</script>

<DarkMode class="fixed top-2 left-2">Toggle</DarkMode>
<div class="container">
  <h1 class="text-xl text-center">Student Client Connect</h1>

  <div class="inputs-wrapper">
    <div class="input-section">
      <input
        type="text"
        bind:value={serverIp}
        placeholder="Enter WebSocket Server IP"
        class="input-ip"
      />
      <button on:click={connectWebSocket} class="connect-button">
        <ArrowLeftToBracketOutline />
      </button>
    </div>
    <!-- Connection Status using icons -->
    <div class="connection-status flex items-center justify-center">
      {#if connectionStatus === "Connected"}
        <CheckCircleOutline size="lg" class="text-green-500" />
        <Tooltip>Connected</Tooltip>
      {:else if connectionStatus === "Disconnected"}
        <CloseCircleOutline size="lg" class="text-red-500" />
      {:else}
        <span>{connectionStatus}</span>
        <Tooltip>Connecting...</Tooltip>
      {/if}
    </div>
  </div>

  {#if receivedAssessment}
    <div class="assessments-wrapper">
      <h2>Assessment Received</h2>
      <div class="assessment-section">
        <h3>{receivedAssessment.title}</h3>
        <div class="separator"></div>
        <p>{@html receivedAssessment.description}</p>
        <div class="separator"></div>
        <p>Time Limit: TBA</p>
      </div>
    </div>
  {/if}

  <!-- Registration Form -->
  {#if showRegisterForm}
    <div class="registration-form">
      <div class="form-wrapper">
        <button class="close-registration-button" on:click={openRegisterForm}
          ><CloseOutline size="sm" /></button
        >
        <h2>Student Registration</h2>
        <input
          type="text"
          bind:value={studentNumber}
          placeholder="Student Number"
        />
        <input type="email" bind:value={email} placeholder="Email" />
        <input type="password" bind:value={password} placeholder="Password" />
        <input
          type="password"
          bind:value={confirmPassword}
          placeholder="Confirm Password"
        />
        <input type="text" bind:value={firstName} placeholder="First Name" />
        <input type="text" bind:value={lastName} placeholder="Last Name" />
        <input type="text" bind:value={section} placeholder="Section" />
        <button on:click={submitRegistration}>Submit</button>
        <p>{registrationFeedback}</p>
      </div>
    </div>
  {/if}

  <button
    on:click={openRegisterForm}
    class="register-button"
    style="margin-top: auto;">Register</button
  >
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100svh;
    gap: 1rem;
    padding: 3rem 2rem;
  }

  .input-section {
    display: flex;
    gap: 1rem;
    background-color: var(--background);
    border: 1px solid var(--border);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
  }
  .input-ip {
    padding: 0.5rem;
    color: var(--text);
    background-color: var(--background);
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
  }
  .assessments-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .assessment-section {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background-color: var(--background);
    padding: 1rem;
    & h3 {
      color: var(--accent);
    }
    & p {
      font-size: 0.8rem;
    }
  }
  .separator {
    width: 100%;
    height: 1px;
    margin-block: 0.5rem;
    background-color: var(--border);
  }

  .register-button {
    padding: 0.75rem 1.5rem;
    background-color: var(--primary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  .register-button:active {
    background-color: #0056b3;
  }

  .registration-form {
    position: fixed;
    backdrop-filter: blur(2px);
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
  }
  .close-registration-button {
    position: absolute;
    top: 5px;
    right: 5px;
  }
  .form-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    border: 1px solid var(--border);
    background-color: var(--background);
    border-radius: 0.5rem;
    padding: 4rem;
    position: relative;
  }

  .registration-form input {
    padding: 1rem;
    background-color: var(--background);
    font-size: 0.8rem;
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    font-size: 1rem;
    &::placeholder {
      font-size: 0.7rem;
    }
  }

  .registration-form button {
    padding: 0.75rem 1.5rem;
    background-color: var(--secondary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  .registration-form button:active {
    background-color: var(--primary);
  }
  .inputs-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
  .connection-status {
    padding: 0.5rem;
  }
</style>

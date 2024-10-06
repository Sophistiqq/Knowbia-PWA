<script lang="ts">
  import { onMount } from "svelte";
  import { DarkMode, Tooltip, Toast } from "flowbite-svelte";
  import {
    CheckCircleOutline,
    CloseCircleOutline,
    CloseOutline,
    CheckCircleSolid,
    CloseCircleSolid,
  } from "flowbite-svelte-icons";
  import AssessmentsPage from "./pages/AssessmentsPage.svelte";

  let socket: WebSocket;
  let receivedAssessments: any[] = [];
  let connectionStatus = "Connecting...";
  let serverIp = window.location.hostname; // Default IP address
  const serverPort = "8080"; // WebSocket port

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
  let loginFeedback = "";
  let loginStudentNumber = "";
  let loginPassword = "";

  let assessmentData: {
    title: string;
    description: string;
    questions: Array<{
      id: number;
      type: string;
      content: string;
      required: boolean;
      answer: string;
      options: string[];
      correctAnswers: number[];
      correctAnswer?: number;
    }>;
    timeLimit: number;
  };

  let loggedInUser = {
    studentNumber: "",
    email: "",
    firstName: "",
    lastName: "",
    section: "",
  };

  type WebSocketMessage =
    | { type: "ping" }
    | { type: "newAssessment"; assessment: any }
    | { type: "activeAssessments"; assessments: any[] }
    | {
        type: "loginResponse";
        success: boolean;
        message: string;
        data?: {
          studentNumber: string;
          email: string;
          firstName: string;
          lastName: string;
          section: string;
        };
      }
    | {
        type: "registrationResponse";
        data: { success: boolean; message: string };
      };

  function connectWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    socket = new WebSocket(`${protocol}://${serverIp}:${serverPort}/ws`);

    socket.onopen = () => {
      updateConnectionStatus("Connected");
      requestActiveAssessments();
    };

    socket.onmessage = (event) => handleWebSocketMessage(event);

    socket.onclose = () => {
      updateConnectionStatus("Disconnected");
      reconnectWebSocket();
    };

    socket.onerror = (error) => {
      updateConnectionStatus("Error occurred");
      console.error("WebSocket error:", error);
    };
  }

  function updateConnectionStatus(status: string) {
    connectionStatus = status;
    console.log(status);
  }

  function requestActiveAssessments() {
    socket.send(JSON.stringify({ type: "getActiveAssessments" }));
  }

  function reconnectWebSocket() {
    setTimeout(connectWebSocket, 5000);
  }

  function handleWebSocketMessage(event: MessageEvent) {
    const message: WebSocketMessage = JSON.parse(event.data);

    switch (message.type) {
      // handle ping message
      case "ping":
        socket.send(JSON.stringify({ type: "pong" }));
        break;
      case "newAssessment":
        handleNewAssessment(message.assessment);
        break;
      case "activeAssessments":
        handleActiveAssessments(message.assessments);
        assessmentData = message.assessments[0];
        break;
      case "registrationResponse":
        handleRegistrationResponse(message.data);
        break;
      case "loginResponse":
        handleLoginResponse(message);
        break;
      default:
        console.warn("Unknown message type:", message);
    }
  }

  function handleNewAssessment(assessment: any) {
    receivedAssessments = [...receivedAssessments, assessment]; // Ensures reactivity
    showToast("New assessment received!", "success");
  }

  function handleActiveAssessments(assessments: any[]) {
    receivedAssessments = [...assessments]; // Copy to trigger reactivity
    showToast("Active assessments received!", "success");
  }

  function handleRegistrationResponse(data: {
    success: boolean;
    message: string;
  }) {
    registrationFeedback = data.success
      ? "Registration successful!"
      : `Registration failed: ${data.message}`;
    showToast(registrationFeedback, data.success ? "success" : "error");
  }

  function handleLoginResponse(message: {
    success: boolean;
    message: string;
    data?: {
      studentNumber: string;
      email: string;
      firstName: string;
      lastName: string;
      section: string;
    };
  }) {
    loginFeedback = message.success
      ? "Login successful! Starting assessment..."
      : `Login failed: ${message.message}`;
    showToast(loginFeedback, message.success ? "success" : "error");

    if (message.success) {
      const userData = message.data ?? {
        studentNumber: "",
        email: "",
        firstName: "",
        lastName: "",
        section: "",
      };

      saveUserData(userData);
      showLoginForm = false;

      // Ensure assessmentData is available before starting
      if (assessmentData) {
        startAssessment(assessmentData);
      } else {
        showToast("No assessment data available.", "error");
      }
      changePage("assessment");
    }
  }

  function saveUserData(data: typeof loggedInUser) {
    loggedInUser = data;
    localStorage.setItem("loggedInUser", JSON.stringify(data));
  }

  function loadUserData() {
    const storedData = localStorage.getItem("loggedInUser");
    if (storedData) {
      loggedInUser = JSON.parse(storedData);
    }
  }

  function openRegisterForm() {
    showRegisterForm = !showRegisterForm;
  }

  function submitLogin() {
    if (!validateLogin()) return;

    const loginData = {
      studentNumber: loginStudentNumber,
      password: loginPassword,
    };
    socket.send(JSON.stringify({ type: "login", data: loginData }));
    clearLoginForm();
  }

  function submitRegistration() {
    if (!validateRegistration()) return;

    const studentData = {
      studentNumber,
      email,
      password,
      firstName,
      lastName,
      section,
    };
    socket.send(JSON.stringify({ type: "register", data: studentData }));
    resetRegistrationForm();
  }

  function validateLogin(): boolean {
    if (!loginStudentNumber || !loginPassword) {
      loginFeedback = "Please fill in all fields.";
      showToast(loginFeedback, "error");
      return false;
    }
    return true;
  }

  function validateRegistration(): boolean {
    if (
      !studentNumber ||
      !email ||
      !password ||
      !confirmPassword ||
      !firstName ||
      !lastName ||
      !section
    ) {
      registrationFeedback = "All fields are required.";
      showToast(registrationFeedback, "error");
      return false;
    }

    if (password !== confirmPassword) {
      registrationFeedback = "Passwords do not match.";
      showToast(registrationFeedback, "error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      registrationFeedback = "Invalid email format.";
      showToast(registrationFeedback, "error");
      return false;
    }

    if (password.length < 6) {
      registrationFeedback = "Password must be at least 6 characters long.";
      showToast(registrationFeedback, "error");
      return false;
    }

    return true;
  }

  function clearLoginForm() {
    loginStudentNumber = "";
    loginPassword = "";
  }

  function resetRegistrationForm() {
    studentNumber = "";
    email = "";
    password = "";
    firstName = "";
    lastName = "";
    section = "";
    confirmPassword = "";
    showRegisterForm = false;
  }

  onMount(() => {
    connectWebSocket();
    loadUserData();
    if (loggedInUser.studentNumber) {
      changePage("assessment");
    }
  });

  let currentPage = "frontpage";

  export function changePage(page: string) {
    currentPage = page;
  }

  function startAssessment(assessment: any) {
    if (assessment) {
      assessmentData = { ...assessment };
      toggleLoginForm();
    } else {
      showToast("No Assessment available to start...", "error");
    }
  }

  let showLoginForm = false;

  function toggleLoginForm() {
    showLoginForm = !showLoginForm;
  }

  let toastMessage: { message: string; type: "success" | "error" } | null =
    null;
  export function showToast(message: string, type: "success" | "error") {
    toastMessage = { message, type };
    setTimeout(() => {
      toastMessage = null;
    }, 3000); // Adjust the display time as needed
  }
</script>

<DarkMode class="fixed top-2 left-2">Toggle</DarkMode>
{#if currentPage === "frontpage"}
  <div class="container">
    <header>
      <h1 class="text-xl text-center">Student Client Connect</h1>
      <div class="connection-status flex items-center justify-center">
        {#if connectionStatus === "Connected"}
          <CheckCircleOutline size="lg" class="text-green-500" />
          <Tooltip>Connected</Tooltip>
        {:else if connectionStatus === "Disconnected"}
          <CloseCircleOutline size="lg" class="text-red-500" />
        {:else}
          <CloseCircleOutline size="lg" class="text-yellow-500" />
          <Tooltip>Connecting...</Tooltip>
        {/if}
      </div>
    </header>

    {#if receivedAssessments}
      <div class="assessments-wrapper">
        <h2>Assessment Received</h2>

        {#each receivedAssessments as assessment (assessment.title)}
          <div class="assessment-section">
            <h3>{assessment.title}</h3>
            <div class="separator"></div>
            <p>{@html assessment.description}</p>
            <div class="separator"></div>
            <p>Time Limit: {assessment.timeLimit} minutes</p>
            <div class="separator"></div>
            <button on:click={() => startAssessment(assessment)}
              >Start Assessment</button
            >
          </div>
        {/each}
      </div>
    {/if}

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
          <button class="submit" on:click={submitRegistration}>Submit</button>
        </div>
      </div>
    {/if}
    {#if showLoginForm}
      <div class="registration-form">
        <div class="form-wrapper">
          <button class="close-registration-button" on:click={toggleLoginForm}
            ><CloseOutline size="sm" /></button
          >
          <h2>Login for Assessment</h2>
          <input
            type="text"
            bind:value={loginStudentNumber}
            placeholder="Student Number"
          />
          <input
            type="password"
            bind:value={loginPassword}
            placeholder="Password"
          />
          <button class="submit" on:click={submitLogin}>Submit</button>
        </div>
      </div>
    {/if}

    <button
      on:click={openRegisterForm}
      class="register-button"
      style="margin-top: auto;">Register</button
    >
  </div>
{:else if currentPage === "assessment"}
  <AssessmentsPage {assessmentData} {changePage} {showToast} />
{/if}

<!-- Show Toast based on toastMessage -->
{#if toastMessage}
  <Toast
    color={toastMessage.type === "success"
      ? "green"
      : toastMessage.type === "error"
        ? "red"
        : "blue"}
    position="top-right"
    class="z-50 fixed top-4 right-4"
  >
    <svelte:fragment slot="icon">
      {#if toastMessage.type === "success"}
        <CheckCircleSolid class="w-5 h-5" />
      {/if}
      {#if toastMessage.type === "error"}
        <CloseCircleSolid class="w-5 h-5" />
      {/if}
      <span class="sr-only">Notification icon</span>
    </svelte:fragment>
    {toastMessage.message}
  </Toast>
{/if}

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    height: 100svh;
    gap: 1rem;
    padding: 3rem 2rem;
  }
  .assessments-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
  }

  .assessment-section {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1rem;
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
    justify-content: center;
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

  .submit {
    padding: 0.75rem 1.5rem;
    background: var(--secondary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  .close-registration-button {
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 5px;
  }

  .registration-form button:active {
    background-color: var(--primary);
  }
  header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .connection-status {
    padding: 0.5rem;
  }
</style>

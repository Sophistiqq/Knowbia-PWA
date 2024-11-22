<script lang="ts">
  import { StatusBar } from "@capacitor/status-bar";
  StatusBar.hide();
  import { onMount } from "svelte";
  import { Toast } from "flowbite-svelte";
  import {
    CloseOutline,
    CheckCircleSolid,
    CloseCircleSolid,
    UserAddSolid,
    ArrowsRepeatOutline,
  } from "flowbite-svelte-icons";
  import AssessmentsPage from "./pages/AssessmentsPage.svelte";
  import { userStore } from "./stores/userStore";

  let receivedAssessments: any[] = [];
  let serverUrl =
    window.location.protocol === "https:"
      ? "https://server-knowbia.vercel.app/distribution"
      : `http://${window.location.hostname}:3000/distribution`;

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
    id: number;
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

  // Subscribe to userStore changes
  let loggedInUser: any;
  userStore.subscribe((user) => {
    loggedInUser = user;
  });

  async function fetchActiveAssessments() {
    try {
      const response = await fetch(`${serverUrl}/assessments`);
      const data = await response.json();
      if (data.success) {
        receivedAssessments = data.assessments;
        if (data.assessments.length > 0) {
          assessmentData = data.assessments[0];
          showToast("Active assessments received!", "success");
        } else {
          showToast("No assessments received", "error");
        }
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
      showToast("No assessments received", "error");
    }
  }

  async function submitLogin() {
    if (!validateLogin()) return;

    try {
      const response = await fetch(`${serverUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentNumber: loginStudentNumber,
          password: loginPassword,
          assessmentId: assessmentData?.id,
        }),
      });

      const data = await response.json();
      handleLoginResponse(data);
      clearLoginForm();
    } catch (error) {
      console.error("Login error:", error);
      showToast("Login failed", "error");
    }
  }

  async function submitRegistration() {
    if (!validateRegistration()) return;

    try {
      const response = await fetch(`${serverUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentNumber,
          email,
          password,
          firstName,
          lastName,
          section,
        }),
      });

      const data = await response.json();
      handleRegistrationResponse(data);
      if (data.success) {
        resetRegistrationForm();
      }
    } catch (error) {
      console.error("Registration error:", error);
      showToast("Registration failed", "error");
    }
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
      : message.message === "You are restricted from taking assessments"
        ? "You are restricted from taking assessments"
        : `Login failed: ${message.message}`;
    showToast(loginFeedback, message.success ? "success" : "error");

    if (message.message === "You are restricted from taking assessments") {
      showToast(message.message, "error");
      return;
    }

    if (message.success) {
      const userData = message.data ?? {
        studentNumber: "",
        email: "",
        firstName: "",
        lastName: "",
        section: "",
      };

      userStore.setUser(userData);

      if (assessmentData) {
        startAssessment(assessmentData);
      } else {
        showToast("No assessment data available.", "error");
      }
      changePage("assessment");
    } else {
      if (message.message === "You have already taken this assessment.") {
        showToast(message.message, "error");
      }
    }
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

  function openRegisterForm() {
    showRegisterForm = !showRegisterForm;
  }

  let currentPage = "frontpage";

  export function changePage(page: string) {
    currentPage = page;
  }

  function startAssessment(assessment: any) {
    toggleLoginForm();
    if (assessment) {
      assessmentData = { ...assessment };
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
    }, 3000);
  }

  onMount(() => {
    fetchActiveAssessments();
    if (userStore.isLoggedIn()) {
      changePage("assessment");
    }
  });
</script>

{#if currentPage === "frontpage"}
  <div class="container">
    <header>
      <h1 class="text-xl text-center title">Assessment Client</h1>
    </header>

    {#if receivedAssessments}
      <div class="assessments-wrapper">
        <div class="title-register-button">
          <h2>Assessments Received</h2>
          <div class="buttons-wrapper">
            <button on:click={openRegisterForm} class="register-button"
              ><UserAddSolid /></button
            >

            <button on:click={fetchActiveAssessments} class="refresh-button">
              <ArrowsRepeatOutline />
            </button>
          </div>
        </div>

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
    class="z-50 fixed top-4 right-4 bg-gray-800 text-white"
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

<style>
  .container {
    user-select: none;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    color: var(--text);
  }
  .title {
    padding: 1rem;
    position: relative;
    font-weight: bold;
    font-size: 1.5rem;
  }
  .assessments-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
    & h2 {
      width: fit-content;
      padding: 1rem;
      font-weight: bold;
      font-size: 1rem;
    }
  }

  .assessment-section {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1rem;
    border-radius: 0.5rem;
    background-color: var(--background);
    backdrop-filter: blur(15px);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    padding: 1.5rem;
    & h3 {
      font-weight: bold;
      font-size: 1.2rem;
    }
    & p {
      font-size: 0.8rem;
    }
    & button {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
      &:active {
        background-color: var(--active);
      }
    }
  }
  .separator {
    width: 100%;
    height: 2px;
    margin-block: 0.5rem;
    background-color: var(--border);
  }

  .buttons-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  .refresh-button {
    padding: 0.75rem 1.5rem;
    background-color: var(--background);
    border: 1px solid var(--border);
    color: var(--text);
    margin-block: 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.1s;
    &:active {
      background-color: var(--active);
    }
  }

  .register-button {
    padding: 0.75rem 1.5rem;
    background-color: var(--background);
    border: 1px solid var(--border);
    color: var(--text);
    margin-block: 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.1s;
    &:active {
      background-color: var(--active);
    }
  }

  .registration-form {
    position: fixed;
    inset: 0;
    backdrop-filter: blur(2px);
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  .form-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    background-color: var(--background-dark);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 4rem;
    position: relative;
    & h2 {
      font-weight: bold;
    }
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
    background: var(--background);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
    &:active {
      background-color: var(--active);
    }
  }

  .close-registration-button {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.5rem;
    background-color: var(--secondary);
    border-radius: 5px;
    transition:
      background-color 0.2s,
      transform 0.2s;
    &:active {
      transform: translate(4px, 5px);
      background-color: var(--accent);
    }
  }

  header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
  .title-register-button {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
</style>

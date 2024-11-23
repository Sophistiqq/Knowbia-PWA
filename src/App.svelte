<script lang="ts">
  import { StatusBar } from "@capacitor/status-bar";
  StatusBar.hide();

  import { onMount } from "svelte";
  import { fly, slide } from "svelte/transition";
  import { cubicInOut } from "svelte/easing";
  import { Toast } from "flowbite-svelte";
  import {
    CloseOutline,
    CheckCircleSolid,
    CloseCircleSolid,
    GridSolid,
    ArrowsRepeatOutline,
  } from "flowbite-svelte-icons";
  import AssessmentsPage from "./pages/AssessmentsPage.svelte";

  let receivedAssessments: any[] = [];
  let serverUrl =
    window.location.protocol === "https:"
      ? "https://server-knowbia.vercel.app/distribution"
      : `http://${window.location.hostname}:3000/distribution`;

  // User state management
  let isLoggedIn = false;
  let loggedInUser = {
    studentNumber: "",
    email: "",
    firstName: "",
    lastName: "",
    section: "",
  };

  // Login form state
  let loginStudentNumber = "";
  let loginPassword = "";
  let loginFeedback = "";

  // Registration form state
  let showRegisterForm = false;
  let studentNumber = "";
  let email = "";
  let password = "";
  let firstName = "";
  let lastName = "";
  let section = "";
  let confirmPassword = "";
  let registrationFeedback = "";

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

  // Fetch active assessments periodically
  async function fetchActiveAssessments() {
    try {
      const response = await fetch(`${serverUrl}/assessments`);
      const data = await response.json();
      if (data.success) {
        receivedAssessments = data.assessments;
        if (data.assessments.length > 0) {
          assessmentData = data.assessments[0];
          showToast("Active assessments received!", "success");
        }
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
      showToast("Failed to fetch assessments", "error");
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
        }),
      });

      const data = await response.json();
      handleLoginResponse(data);
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
    if (message.success && message.data) {
      loggedInUser = message.data;
      console.log("Logged in user:", loggedInUser);
      isLoggedIn = true;
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
      showToast("Login successful!", "success");
      clearLoginForm();
    } else {
      loginFeedback = `Login failed: ${message.message}`;
      showToast(loginFeedback, "error");
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

  function saveUserData(data: Partial<typeof loggedInUser>) {
    const defaultUserData = {
      studentNumber: "",
      email: "",
      firstName: "",
      lastName: "",
      section: "",
    };

    loggedInUser = { ...defaultUserData, ...data };
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
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

  let currentPage = "frontpage";
  function changePage(page: string) {
    currentPage = page;
  }

  // Check if the student has already taken the assessment and also if they are restricted from taking it again, or also they are restricted because of violations
  function checkAssessmentStatus(assessmentId: number): Promise<boolean> {
    return fetch(`${serverUrl}/status/${assessmentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentNumber: loggedInUser.studentNumber,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Assessment status:", data);
        if (data.success) {
          return true;
        }
        if (data.message === "You have already taken this assessment.") {
          showToast("You have already taken this assessment", "error");
        } else if (
          data.message === "You are restricted from taking assessments"
        ) {
          showToast(
            "You have been restricted from taking assessments",
            "error",
          );
        }
        return false;
      })
      .catch((error) => {
        console.error("Error checking assessment status:", error);
        return false;
      });
  }

  async function startAssessment(assessment: any) {
    const isEligible = await checkAssessmentStatus(assessment.id);
    if (!isEligible) {
      return;
    }
    console.log("Starting assessment:", assessment);
    changePage("assessment");
    if (assessment) {
      assessmentData = { ...assessment };
    } else {
      showToast("No Assessment available to start...", "error");
    }
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
    checkLoginSession();
    fetchActiveAssessments();
  });

  // Check for existing login session
  function checkLoginSession() {
    const savedUser = localStorage.getItem("loggedInUser");
    if (savedUser) {
      loggedInUser = JSON.parse(savedUser);
      isLoggedIn = true;
    }
  }

  function logout() {
    isLoggedIn = false;
    loggedInUser = {
      studentNumber: "",
      email: "",
      firstName: "",
      lastName: "",
      section: "",
    };
    localStorage.removeItem("loggedInUser");
    clearLoginForm();
  }

  let menu = false;
</script>

{#if !isLoggedIn}
  <div class="login-container">
    <div class="login-form">
      <h1 class="login-title">Knowbia Login</h1>
      <div class="form-wrapper">
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
        <button class="login-button" on:click={submitLogin}>Login</button>
        <button
          class="register-link"
          on:click={() => (showRegisterForm = true)}
        >
          New student? Register here
        </button>
      </div>
    </div>
  </div>
{:else if currentPage === "frontpage"}
  <div class="container" transition:slide={{ easing: cubicInOut }}>
    <header>
      <h1 class="text-xl text-center title">Assessment Client</h1>
    </header>
    <div class="menu-btn">
      <button on:click={() => (menu = !menu)}>
        <GridSolid size="xl" />
      </button>
    </div>

    {#if menu}
      <div class="menu" transition:fly={{ easing: cubicInOut }}>
        <div class="user-info">
          <p>{loggedInUser.firstName} {loggedInUser.lastName}</p>
        </div>
        <button on:click={logout}>Logout</button>
      </div>
    {/if}

    {#if receivedAssessments}
      <div class="assessments-wrapper">
        <div class="title-refresh-button">
          <h2>Available Assessments</h2>
          <button on:click={fetchActiveAssessments} class="refresh-button">
            <ArrowsRepeatOutline />
          </button>
        </div>

        {#each receivedAssessments as assessment (assessment.title)}
          <div class="assessment-section">
            <h3>{assessment.title}</h3>
            <div class="separator"></div>
            <p>{@html assessment.description}</p>
            <div class="separator"></div>
            <p>Time Limit: {assessment.timeLimit} minutes</p>
            <div class="separator"></div>
            <button on:click={() => startAssessment(assessment)}>
              Start Assessment
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{:else if currentPage === "assessment"}
  <AssessmentsPage {assessmentData} {changePage} {showToast} />
{/if}

{#if showRegisterForm}
  <div class="registration-form">
    <div class="form-wrapper reg-wrapper">
      <button
        class="close-registration-button"
        on:click={() => (showRegisterForm = false)}
      >
        <CloseOutline size="sm" />
      </button>
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

{#if toastMessage}
  <Toast
    color={toastMessage.type === "success" ? "green" : "red"}
    position="top-right"
    class="z-100 fixed top-4 right-4 bg-gray-800 text-white"
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
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 1rem;
  }
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100dvh;
  }
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 3rem 1rem;
    border: 1px solid var(--border);
    border-radius: 0.3rem;
    background-color: var(--background);
    backdrop-filter: blur(5px);
  }
  .login-title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
  }
  .form-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem;
  }
  .login-button {
    padding: 0.5rem;
    background-color: var(--background);
    color: var(--text);
    border: none;
    border-radius: 0.3rem;
    border: 1px solid var(--border);
    cursor: pointer;
    transition:
      background-color 0.3s,
      color 0.3s;
    &:active {
      background-color: var(--hover);
    }
  }
  .form-wrapper input {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border);
    background-color: var(--background);
    border-radius: 0.3rem;
    &::placeholder {
      font-size: 0.75rem;
    }
  }
  .register-link {
    margin-top: 2rem;
    cursor: pointer;
    color: var(--text);
    font-size: 0.9rem;
    &:active {
      text-decoration: underline;
    }
  }
  .registration-form {
    position: fixed;
    top: 0;
    left: 0;
    width: 100dvw;
    height: 100dvh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.2);
  }
  .registration-form .reg-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 4rem;
    border: 1px solid var(--border);
    border-radius: 0.3rem;
    background-color: var(--background);
    backdrop-filter: blur(25px);
    position: relative;
  }
  .close-registration-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: var(--text);
    transition: color 0.3s;
    border-radius: 0.3rem;
    border: 1px solid var(--border);
    padding: 0.5rem;
    &:active {
      color: var(--hover);
    }
  }
  .registration-form h2 {
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
  }
  .registration-form input {
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
    border: 1px solid var(--border);
    background-color: var(--background);
    border-radius: 0.3rem;
    &::placeholder {
      font-size: 0.75rem;
    }
  }
  .registration-form .submit {
    padding: 1rem 1.5rem;
    background-color: var(--background);
    color: var(--text);
    border: none;
    border-radius: 0.3rem;
    border: 1px solid var(--border);
    cursor: pointer;
    margin-top: 1rem;
    transition:
      background-color 0.3s,
      color 0.3s;
    &:active {
      background-color: var(--hover);
    }
  }
  .user-info {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 1rem;
  }

  .menu-btn {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 100;
    button {
      color: var(--text);
      border: none;
      border-radius: 0.3rem;
      padding: 0.5rem;
      cursor: pointer;
      transition: background-color 0.3s;
      &:active {
        background-color: var(--hover);
      }
    }
  }
  /* Menu sidebar */
  .menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 15rem;
    height: 100svh;
    background-color: var(--background-dark);
    backdrop-filter: blur(15px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    z-index: 80;
    padding-top: 10vh;
    border-right: 1px solid var(--border);
    button {
      width: 75%;
      padding: 1rem;
      color: var(--text);
      border: none;
      cursor: pointer;
      transition: background-color 0.3s;
      border-top: 1px solid var(--border);
      &:active {
        background-color: var(--hover);
      }
    }
  }
  .assessments-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    padding: 1rem;
    .title-refresh-button {
      display: flex;
      justify-content: space-between;
      align-items: center;
      button {
        background-color: var(--background);
        color: var(--text);
        border: none;
        border-radius: 0.3rem;
        padding: 0.5rem;
        cursor: pointer;
        transition: background-color 0.3s;
        &:active {
          background-color: var(--hover);
        }
      }
    }
    .assessment-section {
      padding: 1rem;
      border: 1px solid var(--border);
      border-radius: 0.3rem;
      background-color: var(--background);
      backdrop-filter: blur(5px);
      p {
        margin: 0.5rem 0;
      }
      button {
        padding: 0.5rem;
        color: var(--text);
        border: none;
        width: 100%;
        border-radius: 0.3rem;
        cursor: pointer;
        transition:
          background-color 0.3s,
          color 0.3s;
        &:active {
          background-color: var(--hover);
        }
      }
    }
  }
  .title-refresh-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    h2 {
      font-size: 1.2rem;
      font-weight: bold;
    }
    button {
      background-color: var(--background);
      color: var(--text);
      border: none;
      border-radius: 0.3rem;
      padding: 0.5rem;
      cursor: pointer;
      transition: background-color 0.3s;
      &:active {
        background-color: var(--hover);
      }
    }
  }
  .separator {
    width: 100%;
    border-bottom: 1px solid var(--border);
    margin: 1rem 0;
  }
</style>

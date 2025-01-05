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
  let serverUrl = `http://${window.location.hostname}:3000`;

  // User state management
  let isLoggedIn = false;
  let loggedInUser = {
    student_number: "",
    email: "",
    first_name: "",
    last_name: "",
    section: "",
  };

  // Login form state
  let loginStudentNumber = "";
  let loginPassword = "";
  let loginFeedback = "";

  // Registration form state
  let showRegisterForm = false;
  let student_number = "";
  let email = "";
  let password = "";
  let first_name = "";
  let last_name = "";
  let section = "";
  let confirmPassword = "";
  let registrationFeedback = "";

  export let assessmentData: {
    id: number;
    title: string;
    description: string;
    time_limit: number;
    section: string;
    shuffle_questions: boolean;
    questions: Question[];
  };

  type Question = {
    id: number;
    question: string;
    type:
      | "multiple_choice"
      | "short_answer"
      | "true_false"
      | "ranking"
      | "essay"
      | "linear_scale";
    options?: string[];
    correctAnswers?: any[];
    required: boolean;
    points: number;
    shuffleOptions: boolean;
    category?: string;
    hint?: string;
    media?: string | null;
    showMediaUpload?: boolean;
    // Linear Scale specific properties
    linearScaleStart?: number;
    linearScaleEnd?: number;
    linearScaleStep?: number;
  };
  // Fetch active assessments periodically
  async function fetchActiveAssessments() {
    const res = await fetch(`${serverUrl}/assessments/ongoing`);
    const data = await res.json();
    receivedAssessments = data;
    console.log("Received assessments:", receivedAssessments);
  }

  async function submitLogin() {
    if (!validateLogin()) return;
    const res = await fetch(`${serverUrl}/students/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_number: loginStudentNumber,
        password: loginPassword,
      }),
    });
    const data = await res.json();

    if (data.status === "success") {
      isLoggedIn = true;
      saveUserData(data.student_data);
      clearLoginForm();
    }
    showToast(data.message, data.status);
  }

  async function submitRegistration() {
    if (!validateRegistration()) return;

    try {
      const res = await fetch(`${serverUrl}/students/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_number,
          email,
          password,
          first_name,
          last_name,
          section,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        resetRegistrationForm();
      }
      registrationFeedback = data.message;
      showToast(registrationFeedback, data.status);
    } catch (error) {
      console.error("Registration error:", error);
      showToast("Registration failed", "error");
    }
  }

  function saveUserData(data: Partial<typeof loggedInUser>) {
    const defaultUserData = {
      student_number: "",
      email: "",
      first_name: "",
      last_name: "",
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
    const requiredFields = [
      { value: student_number, message: "All fields are required." },
      { value: email, message: "All fields are required." },
      { value: password, message: "All fields are required." },
      { value: confirmPassword, message: "All fields are required." },
      { value: first_name, message: "All fields are required." },
      { value: last_name, message: "All fields are required." },
      { value: section, message: "All fields are required." },
    ];

    for (const field of requiredFields) {
      if (!field.value) {
        registrationFeedback = field.message;
        showToast(registrationFeedback, "error");
        return false;
      }
    }

    const student_numberRegex = /^\d{2}-\d{5}$/;
    if (!student_numberRegex.test(student_number)) {
      registrationFeedback = "Invalid Student Number Format.";
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
    student_number = "";
    email = "";
    password = "";
    first_name = "";
    last_name = "";
    section = "";
    confirmPassword = "";
    showRegisterForm = false;
  }

  let currentPage = "frontpage";
  function changePage(page: string) {
    currentPage = page;
  }
  let message: string;
  // Check if the student has already taken the assessment and also if they are restricted from taking it again, or also they are restricted because of violations
  async function checkAssessmentStatus(
    assessment_id: number,
  ): Promise<boolean> {
    const res = await fetch(`${serverUrl}/students/eligibility`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_number: loggedInUser.student_number,
        assessment_id: assessment_id,
      }),
    });
    const data = await res.json();
    message = data.message;
    console.log("Assessment status:", data);
    if (data.status === "success") {
      return true;
    } else {
      showToast(data.message, "error");
      return false;
    }
  }

  async function startAssessment(assessment: any) {
    const canStart = checkAssessmentStatus(assessment.id);
    if (assessment && (await canStart)) {
      assessmentData = { ...assessment };
      changePage("assessment");
    } else {
      showToast(message, "error");
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
      student_number: "",
      email: "",
      first_name: "",
      last_name: "",
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
      <div
        class="form-wrapper"
        transition:slide={{ duration: 500, easing: cubicInOut }}
      >
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
  <div
    class="container"
    transition:slide={{ duration: 500, easing: cubicInOut }}
  >
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
          <p>{loggedInUser.first_name} {loggedInUser.last_name}</p>
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

        {#each receivedAssessments as assessment}
          {#if assessment.section === loggedInUser.section}
            <div class="assessment-section">
              <h2>{assessment.title}</h2>
              <p>{@html assessment.description}</p>
              <p>Duration: {assessment.time_limit} minutes</p>
              <div class="separator"></div>
              <button on:click={() => startAssessment(assessment)}>
                Start Assessment
              </button>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
{:else if currentPage === "assessment"}
  <AssessmentsPage {assessmentData} {changePage} {showToast} />
{/if}

{#if showRegisterForm}
  <div class="registration-form">
    <div
      class="form-wrapper reg-wrapper"
      transition:slide={{ duration: 500, easing: cubicInOut }}
    >
      <button
        class="close-registration-button"
        on:click={() => (showRegisterForm = false)}
      >
        <CloseOutline size="sm" />
      </button>
      <h2>Student Registration</h2>
      <input
        type="text"
        bind:value={student_number}
        placeholder="Student Number"
      />
      <input type="email" bind:value={email} placeholder="Email" />
      <input type="password" bind:value={password} placeholder="Password" />
      <input
        type="password"
        bind:value={confirmPassword}
        placeholder="Confirm Password"
      />
      <input type="text" bind:value={first_name} placeholder="First Name" />
      <input type="text" bind:value={last_name} placeholder="Last Name" />
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
    &::placeholder {
      font-size: 0.75rem;
    }
  }
  .registration-form .submit {
    padding: 1rem 1.5rem;
    background-color: var(--background);
    color: var(--text);
    border: none;
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
      background-color: var(--background);
      backdrop-filter: blur(5px);
      h2 {
        font-size: 1.2rem;
        font-weight: bold;
      }
      p {
        margin: 0.5rem 0;
      }
      button {
        padding: 0.5rem;
        color: var(--text);
        border: none;
        width: 100%;
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

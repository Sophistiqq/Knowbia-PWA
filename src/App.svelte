<script lang="ts">
  import { onMount } from "svelte";
  import Main from "./pages/Main.svelte";
  import { login, checkAuth } from "./scripts/auth.js";
  import { Icon } from "svelte-icons-pack";
  import {
    FaSolidUser,
    FaSolidKey,
    FaSolidEyeSlash,
    FaSolidEye,
  } from "svelte-icons-pack/fa";
  import Register from "./pages/Register.svelte";
  import { fly } from "svelte/transition";
  import { cubicInOut, cubicOut } from "svelte/easing";
  import { DarkMode, Toast } from "flowbite-svelte";
  import { SunSolid, MoonSolid, CloseCircleSolid } from "flowbite-svelte-icons";
  import "./assets/main.css";

  let isAuthenticated = false;
  let loading = true;
  let student_number = "";
  let password = "";
  let loginError = "";
  export let showRegisterPage = false;

  async function handleLogin() {
    const { success, message } = await login(student_number, password);
    if (success) {
      isAuthenticated = true;
      localStorage.setItem("isAuthenticated", "true");
      loginError = "";
    } else {
      showError(message);
    }
  }

  onMount(async () => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    isAuthenticated = storedAuth === "true" || (await checkAndSetAuth());

    showRegisterPage = JSON.parse(
      localStorage.getItem("showRegisterPage") || "false",
    );
    loading = false;
  });

  async function checkAndSetAuth() {
    const authStatus = await checkAuth();
    if (authStatus.isAuthenticated) {
      localStorage.setItem("isAuthenticated", "true");
      return true;
    }
    localStorage.removeItem("isAuthenticated");
    return false;
  }

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "http://10.0.23.245:3000";

  async function logout() {
    await fetch(`${API_URL}/student/logout`, {
      method: "POST",
      credentials: "include",
    });
    isAuthenticated = false;
    localStorage.removeItem("isAuthenticated");
  }

  function showError(message: string) {
    loginError = message;
    setTimeout(() => {
      loginError = "";
    }, 10000);
  }

  function togglePage() {
    showRegisterPage = !showRegisterPage;
    localStorage.setItem("showRegisterPage", JSON.stringify(showRegisterPage));
  }

  let showPassword = false;
  function togglePasswordVisibility() {
    showPassword = !showPassword;
    const passwordInput = document.getElementById(
      "password",
    ) as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = showPassword ? "text" : "password";
    }
  }
</script>

{#if loading}
  <h1>Loading ...</h1>
{:else}
  {#if loginError}
    <Toast color="red" position="top-right">
      <svelte:fragment slot="icon">
        <CloseCircleSolid class="w-5 h-5" />
        <span class="sr-only">Error icon</span>
      </svelte:fragment>
      {loginError}
    </Toast>
  {/if}

  {#if isAuthenticated}
    <Main {logout} />
  {:else if showRegisterPage}
    <div transition:fly={{ x: -200, duration: 500, easing: cubicOut }}>
      <DarkMode
        class="absolute top-5 left-5 dark:text-primary-600 border dark:border-gray-800 z-50"
      >
        <SunSolid slot="lightIcon" color="yellow" />
        <MoonSolid slot="darkIcon" />
      </DarkMode>
      <Register onBackToLogin={togglePage} />
    </div>
  {:else}
    <div
      class="container"
      transition:fly={{ x: -200, duration: 500, easing: cubicInOut }}
    >
      <div class="login-form">
        <DarkMode
          class="absolute top-5 left-5 dark:text-primary-600 border dark:border-gray-800 z-50"
        >
          <SunSolid slot="lightIcon" color="yellow" />
          <MoonSolid slot="darkIcon" />
        </DarkMode>
        <h1>Welcome to Knowbia!</h1>

        <div class="input_fields">
          <label for="student_number">Student Number</label>
          <div class="inputs">
            <Icon src={FaSolidUser} />
            <input
              type="student_number"
              id="student_number"
              bind:value={student_number}
              required
            />
          </div>
        </div>

        <div class="input_fields">
          <label for="password">Password</label>
          <div class="inputs">
            <Icon src={FaSolidKey} />
            <input
              type="password"
              id="password"
              bind:value={password}
              required
            />
            <button on:click={togglePasswordVisibility} tabindex="-1">
              <Icon src={showPassword ? FaSolidEye : FaSolidEyeSlash} />
            </button>
          </div>
        </div>

        <div class="forgot_password">
          <button tabindex="-1">Forgot Password?</button>
        </div>
        <button on:click={handleLogin} id="loginButton">Login</button>

        <div class="separator">
          <div class="line"></div>
          <div class="or">or</div>
          <div class="line"></div>
        </div>
        <button on:click={togglePage} id="signUp">Sign Up</button>
      </div>
    </div>
  {/if}
{/if}

<style lang="scss">
  .container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 100svh;
    width: 100vw;
    overflow: hidden;
  }

  .login-form {
    color: var(--text);
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100%;
    padding: 5rem;
    gap: 0.5rem;
  }
  .login-form h1 {
    color: var(--text);
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1rem;
  }
  .input_fields {
    display: flex;
    color: var(--text);
    flex-direction: column;
    gap: 0.5rem;
    & label {
      font-size: 1.2rem;
      color: var(--text);
    }
    .inputs {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text);
      border: 1px solid #ccc;
      padding: 0.3rem 1rem;
      border-radius: 0.5rem;
      align-items: center;
      width: 100%;
      gap: 0.5rem;
      background: var(--background);
      & button {
        border: none;
        cursor: pointer;
      }
      & input {
        outline: none;
        margin-left: 0.3rem;
        flex-grow: 1;
        color: var(--text);
        background: transparent;
        padding: 0.5rem;
        border: none;
        border-left: 1px solid var(--border);
        &:focus {
          outline: none;
        }
      }
    }
  }
  .forgot_password {
    display: flex;
    justify-content: flex-end;
    button {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text);
      transition: color 0.5s;
      &:hover {
        color: var(--accent);
        text-decoration: underline;
      }
    }
  }
  @keyframes popdown {
    0% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  #loginButton {
    background-color: var(--primary);
    color: var(--background);
    border: none;
    font-weight: 500;
    padding: 1rem 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.5s;
    &:hover {
      background-color: var(--accent);
    }
  }
  .separator {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    .line {
      flex: 1;
      height: 1px;
      background-color: var(--border);
    }
    .or {
      padding: 0.5rem;
    }
  }
  #signUp {
    padding: 1rem 0.5rem;
    margin-top: 1rem;
    border: none;
    background-color: transparent;
    cursor: pointer;
    transition: color 0.5s;
    &:hover {
      text-decoration: underline;
      color: var(--accent);
    }
  }
</style>

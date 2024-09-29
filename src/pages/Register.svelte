<script lang="ts">
  import { onMount } from "svelte";
  import { registerTeacher } from "../scripts/registerTeacher.js";
  import { Icon } from "svelte-icons-pack";
  import {
    FaSolidUser,
    FaAddressCard,
    FaEnvelope,
    FaSolidKey,
    FaAddressBook,
    FaCalendar,
    FaSolidPeopleGroup,
    FaSolidQuestion,
    FaCircleQuestion,
    FaEye,
    FaEyeSlash,
    FaSolidEyeSlash,
    FaSolidEye,
  } from "svelte-icons-pack/fa";
  let step = 1;
  let firstname = "";
  let lastname = "";
  let middlename = "";
  let email = "";
  let password = "";
  let confirm_password = "";

  let phone_number = "";
  let birthdate = "";
  let department = "";
  let security_question = "";
  let security_answer = "";

  let registrationError = "";
  let showPassword = false;

  let securityQuestions = [
    "What was the name of your first pet?",
    "What is your mother’s maiden name?",
    "What was the name of your elementary school?",
    "What is your favorite book?",
    "What is the name of your favorite movie?",
  ];

  // Toggle password visibility
  function togglePasswordVisibility() {
    showPassword = !showPassword;
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm_password");
    if (passwordInput && confirmPasswordInput) {
      passwordInput.setAttribute("type", showPassword ? "text" : "password");
      confirmPasswordInput.setAttribute(
        "type",
        showPassword ? "text" : "password",
      );
    }
  }
  function debounce(func: Function, timeout = 300) {
    let timer: number | undefined; // Set the timer to number

    return (...args: any[]) => {
      if (timer) {
        clearTimeout(timer); // Clear the existing timer
      }
      // Cast the setTimeout return value to number
      timer = window.setTimeout(() => {
        func.apply(this, args);
      }, timeout) as unknown as number;
    };
  }

  $: isStep1Valid = validateStep1();
  $: isStep2Valid = validateStep2();

  let currentButton = "next";

  $: currentButton = step === 1 ? "next" : "back-register";

  function goToPreviousStep() {
    if (step === 2) {
      step = 1;
      saveToLocalStorage();
    }
  }

  function goToNextStep() {
    if (step === 1 && isStep1Valid) {
      step = 2;
      saveToLocalStorage();
    } else if (step === 2 && isStep2Valid) {
      handleRegister();
    }
  }

  function onInputChange() {
    isStep1Valid = validateStep1();
    isStep2Valid = validateStep2();
    saveToLocalStorage();
  }

  function validateStep1() {
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8}/;

    const isValidEmail = emailPattern.test(email);
    const isValidPassword = passwordPattern.test(password);
    const isPasswordMatch = password === confirm_password;

    return (
      firstname.trim().length > 0 &&
      lastname.trim().length > 0 &&
      middlename.trim().length > 0 &&
      isValidEmail &&
      isValidPassword &&
      isPasswordMatch
    );
  }

  function validateStep2() {
    const phonePattern = /^(09|\+639)\d{9}$/;
    const isValidPhoneNumber = phonePattern.test(phone_number);

    return (
      isValidPhoneNumber &&
      birthdate.trim().length > 0 &&
      department.trim().length > 0 &&
      security_question.trim().length > 0 &&
      security_answer.trim().length > 0
    );
  }

  const debouncedInputChange = debounce(onInputChange);

  async function handleRegister() {
    console.log("Registering with:", firstname, lastname, email); // Check if values are correct here
    if (password !== confirm_password) {
      registrationError = "Passwords do not match.";
      return;
    }

    const result = await registerTeacher({
      firstname,
      lastname,
      middlename,
      email,
      password,
      phone_number,
      birthdate,
      department,
      security_question,
      security_answer,
    });

    if (result.success) {
      registrationError = "";
      localStorage.removeItem("registrationData"); // Clear storage on success
    } else {
      registrationError = result.message;
    }
  }

  function saveToLocalStorage() {
    const formData = {
      firstname,
      lastname,
      middlename,
      email,
      password,
      confirm_password,
      phone_number,
      birthdate,
      department,
      security_question,
      security_answer,
      step,
    };

    sessionStorage.setItem("registrationData", JSON.stringify(formData));
  }

  onMount(() => {
    const savedData = sessionStorage.getItem("registrationData");
    if (savedData) {
      const data = JSON.parse(savedData);

      firstname = data.firstname || "";
      lastname = data.lastname || "";
      middlename = data.middlename || "";
      email = data.email || "";
      password = data.password || "";
      confirm_password = data.confirm_password || "";
      phone_number = data.phone_number || "";
      birthdate = data.birthdate || "";
      department = data.department || "";
      security_question = data.security_question || "";
      security_answer = data.security_answer || "";

      step = data.step || 1;
    }
  });

  export let onBackToLogin: () => void;
</script>

{#if registrationError}
  <div class="error-message">{registrationError}</div>
{/if}

<div class="container">
  <div class="register-form">
    <h1>Teacher Registration</h1>

    {#if step === 1}
      <!-- Step 1 Fields -->
      <div class="input_fields">
        <label for="firstname">First Name</label>
        <div class="inputs">
          <Icon src={FaAddressCard} />
          <input
            type="text"
            id="firstname"
            bind:value={firstname}
            on:input={debouncedInputChange}
            pattern="[a-zA-Z]+"
            required
          />
        </div>
      </div>
      <div class="input_fields">
        <label for="lastname">Last Name</label>
        <div class="inputs">
          <Icon src={FaAddressCard} />
          <input
            type="text"
            id="lastname"
            bind:value={lastname}
            on:input={debouncedInputChange}
            pattern="[a-zA-Z]+"
            required
          />
        </div>
      </div>
      <div class="input_fields">
        <label for="middlename">Middle Name</label>
        <div class="inputs">
          <Icon src={FaAddressCard} />
          <input
            type="text"
            id="middlename"
            bind:value={middlename}
            on:input={debouncedInputChange}
            pattern="[a-zA-Z]+"
            required
          />
        </div>
      </div>
      <div class="input_fields">
        <label for="email">Email</label>
        <div class="inputs">
          <Icon src={FaEnvelope} />
          <input
            type="email"
            id="email"
            bind:value={email}
            on:input={debouncedInputChange}
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{4}$"
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
            on:input={debouncedInputChange}
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8}"
            required
          />
          <button on:click={togglePasswordVisibility} tabindex="-1">
            <Icon src={showPassword ? FaSolidEye : FaSolidEyeSlash} />
          </button>
        </div>
      </div>
      <div class="input_fields">
        <label for="confirm_password">Confirm Password</label>
        <div class="inputs">
          <Icon src={FaSolidKey} />
          <input
            type="password"
            id="confirm_password"
            bind:value={confirm_password}
            on:input={debouncedInputChange}
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8}"
            required
          />
          <button on:click={togglePasswordVisibility} tabindex="-1">
            <Icon src={showPassword ? FaSolidEye : FaSolidEyeSlash} />
          </button>
        </div>
      </div>
    {/if}

    {#if step === 2}
      <!-- Step 2 Fields -->
      <div class="input_fields">
        <label for="phone_number">Phone Number</label>
        <div class="inputs">
          <Icon src={FaAddressBook} />
          <input
            type="text"
            id="phone_number"
            bind:value={phone_number}
            on:input={debouncedInputChange}
            pattern="^(09|\+639)\d{9}$"
            required
          />
        </div>
      </div>
      <div class="input_fields">
        <label for="birthdate">Birthdate</label>
        <div class="inputs">
          <Icon src={FaCalendar} />
          <input
            type="date"
            id="birthdate"
            bind:value={birthdate}
            on:input={debouncedInputChange}
            required
          />
        </div>
      </div>
      <div class="input_fields">
        <label for="department">Department</label>
        <div class="inputs">
          <Icon src={FaSolidPeopleGroup} />
          <input
            type="text"
            id="department"
            bind:value={department}
            on:input={debouncedInputChange}
            required
          />
        </div>
      </div>
      <div class="input_fields">
        <label for="security_question">Security Question</label>
        <div class="inputs">
          <Icon src={FaSolidQuestion} />
          <select
            id="security_question"
            bind:value={security_question}
            on:change={onInputChange}
            required
          >
            <option value="" disabled>Select a question</option>
            {#each securityQuestions as question}
              <option value={question}>{question}</option>
            {/each}
          </select>
        </div>
      </div>
      <div class="input_fields">
        <label for="security_answer">Security Answer</label>
        <div class="inputs">
          <Icon src={FaCircleQuestion} />
          <input
            type="text"
            id="security_answer"
            bind:value={security_answer}
            on:input={debouncedInputChange}
            required
          />
        </div>
      </div>
    {/if}
    <!-- Dynamic button rendering based on currentButton -->
    {#if currentButton === "next"}
      <button on:click={goToNextStep} disabled={!isStep1Valid} id="nextButton"
        >Next</button
      >
    {/if}

    {#if currentButton === "back-register"}
      <button on:click={goToPreviousStep} id="backButton">Back</button>
      <button
        on:click={goToNextStep}
        disabled={!isStep2Valid}
        id="registerButton">Register</button
      >
    {/if}

    <div class="separator">
      <div class="line"></div>
      <div class="or">or</div>
      <div class="line"></div>
    </div>
    <button on:click={onBackToLogin} id="backToLogin">Back to Login</button>
  </div>
</div>

<style lang="scss">
  .container {
    display: flex;
    justify-content: center;
    flex-direction: row;
    align-items: center;
    min-height: 100vh;
  }

  .separator {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    .line {
      flex: 1;
      height: 1px;
      background-color: var(--text);
    }
    .or {
      color: var(--text);
      padding: 0.5rem;
    }
  }
  .register-form {
    color: var(--text);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-block: 5rem;
    min-height: 100%;
    gap: 0.5rem;
    & label {
      color: var(--text);
    }
    & h1 {
      text-align: center;
      margin-bottom: 1rem;
      font-weight: 600;
      font-size: 2rem;
      color: var(--text);
    }
  }

  .input_fields {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    .inputs {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text);
      border: 1px solid #ccc;
      padding: 0.3rem 1rem;
      border-radius: 0.5rem;
      align-items: center;
      gap: 0.5rem;
      background: var(--background);
      input {
        margin-left: 0.4rem;
        flex-grow: 1;
        background: none;
        border: none;
        border-left: 1px solid var(--border);
        &:focus {
          outline: none;
        }
      }
      button {
        background: none;
        border: none;
        cursor: pointer;
      }
    }
  }

  #nextButton,
  #registerButton {
    background-color: var(--primary);
    color: var(--background);
    border: none;
    padding: 1rem 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    margin-top: 1rem;
    transition: all 0.3s;
    &:hover {
      background-color: var(--accent);
    }
  }

  #nextButton:disabled,
  #registerButton:disabled {
    background-color: var(--disabled);
    cursor: not-allowed;
  }

  .error-message {
    position: fixed;
    z-index: 1000;
    top: 1rem;
    right: 1rem;
    background-color: #f8d7da;
    padding: 1rem;
    border-radius: 0.5rem;
    color: red;
    text-align: center;
    margin-bottom: 1rem;
    animation: popdown 10s;
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

  #backButton {
    background: var(--secondary);
    color: white;
    border: none;
    padding: 1rem 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    margin-top: 1rem;
    opacity: 0.7;
    transition: all 0.3s;
    &:hover {
      opacity: 1;
      background-color: var(--accent);
    }
  }
  #security_question {
    width: 100%;
    padding: 0.5rem;
    border: none;
    border-radius: 0.5rem;
    background: none;
    &:focus {
      outline: none;
    }
  }
  #backToLogin {
    margin-top: 1rem;
    border: none;
    padding: 1rem 0.5rem;
    background-color: transparent;
    cursor: pointer;
    color: var(--text);
    &:hover {
      text-decoration: underline;
      color: var(--accent);
    }
  }
</style>

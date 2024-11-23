<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { CloseCircleSolid } from "flowbite-svelte-icons";

  // declare the userInfo from localStorage and store it in a variable
  let userInfo = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

  function logout() {
    console.log("Logging out...");
    showToast("Logged out successfully", "success");
    changePage("frontpage");
  }

  let warningMessage = "";
  let minimizationCount = 0;
  const maxMinimizations = 3;
  let host = window.location.hostname;
  const sendActivityToServer = (activity: string, user: any) => {
    fetch(`http://${host}:3000/assessments/detected`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity, user }),
    })
      .then((response) => response.json())
      .catch((error) => console.error("Error sending activity:", error));
  };

  onMount(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    console.log(userInfo);
  });

  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log("User pressed Home or switched apps");
      minimizationCount++;
      sendActivityToServer("home_or_recent_apps_pressed", userInfo);

      if (minimizationCount >= maxMinimizations) {
        warningMessage =
          "You have exceeded the maximum number of app minimizations allowed for this assessment. Your account has been locked out.";
        showToast(warningMessage, "error");
        sendRestrictionToServer();
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        warningMessage = `Please don't minimize the app during the assessment! You have ${maxMinimizations - minimizationCount} remaining.`;
        showToast(warningMessage, "error");
      }
    } else {
      warningMessage = "";
    }
  };

  function sendRestrictionToServer() {
    console.log(userInfo);
    sendActivityToServer("restrictUser", userInfo);
  }

  onDestroy(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  export let changePage: (page: string) => void;
  export let showToast: (message: string, type: "success" | "error") => void;

  export let assessmentData: {
    id: number;
    title: string;
    description: string;
    timeLimit: number;
    questions: Array<{
      id: number;
      type: string;
      content: string;
      required: boolean;
      answer: string | null;
      options: string[];
      correctAnswers: number[];
      correctAnswer?: number;
    }>;
  };

  let answers: (string | number | null | number[])[] = new Array(
    assessmentData.questions.length,
  ).fill(null);

  let questionRefs: HTMLElement[] = [];

  function handleCheckboxChange(index: number, value: number) {
    if (!Array.isArray(answers[index])) {
      answers[index] = [];
    }

    const selected = answers[index] as number[];

    if (selected.includes(value)) {
      selected.splice(selected.indexOf(value), 1);
    } else {
      selected.push(value);
    }

    answers[index] = selected;
  }

  let submitPopup = false;
  function submitPopupToggle() {
    const invalidQuestions = validateRequiredFields();
    if (invalidQuestions.length > 0) {
      showToast("Please answer all required questions", "error");
      focusFirstInvalidQuestion(invalidQuestions[0]);
      return;
    }
    submitPopup = !submitPopup;
  }

  function validateRequiredFields(): number[] {
    const invalidQuestions: number[] = [];

    assessmentData.questions.forEach((question, index) => {
      if (!question.required) return;

      const answer = answers[index];
      let isValid = false;

      switch (question.type) {
        case "Short Answer":
        case "Paragraph":
        case "Date":
        case "Time":
          isValid = answer !== null && answer !== "";
          break;

        case "Multiple Choice":
        case "Dropdown":
          isValid = typeof answer === "number";
          break;

        case "Checkboxes":
          isValid = Array.isArray(answer) && answer.length > 0;
          break;
      }

      if (!isValid) {
        invalidQuestions.push(index);
      }
    });

    return invalidQuestions;
  }

  function focusFirstInvalidQuestion(index: number) {
    if (questionRefs[index]) {
      questionRefs[index].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      const firstInput = questionRefs[index].querySelector(
        "input, select, textarea",
      );
      if (firstInput) {
        (firstInput as HTMLElement).focus();
      }
    }
  }

  async function submitAnswers() {
    const invalidQuestions = validateRequiredFields();
    if (invalidQuestions.length > 0) {
      showToast("Please answer all required questions", "error");
      focusFirstInvalidQuestion(invalidQuestions[0]);
      submitPopup = false;
      return;
    }
    let score = 0;

    assessmentData.questions.forEach((question, index) => {
      if (!question.required) {
        return;
      }

      const answer = answers[index];

      switch (question.type) {
        case "Short Answer":
        case "Paragraph":
        case "Date":
        case "Time":
          if (answer === question.answer) {
            score++;
          }
          break;

        case "Multiple Choice":
        case "Dropdown":
          if (typeof answer === "number" && answer === question.correctAnswer) {
            score++;
          }
          break;

        case "Checkboxes":
          const selectedAnswers = answer as number[];
          if (
            Array.isArray(selectedAnswers) &&
            Array.isArray(question.correctAnswers)
          ) {
            const isCorrect =
              selectedAnswers.length === question.correctAnswers.length &&
              selectedAnswers.every((ans) =>
                question.correctAnswers.includes(ans),
              ) &&
              question.correctAnswers.every((ans) =>
                selectedAnswers.includes(ans),
              );

            if (isCorrect) {
              score++;
            }
          }
          break;
      }
    });

    const resultData = {
      type: "studentResult",
      result: {
        studentNumber: userInfo.studentNumber,
        assessmentId: assessmentData.id,
        score: score,
        answers: answers,
      },
    };
    console.log("Submitting answers:", resultData);

    try {
      const response = await fetch(`http://${host}:3000/distribution/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultData),
      });
      const data = await response.json();
      if (data.success === false) {
        showToast(data.message, "error");
        return;
      }
      submitPopupToggle();
      showToast(data.message, "success");
      changePage("frontpage");
      answers = new Array(assessmentData.questions.length).fill(null);
    } catch (error) {
      console.error("Error submitting answers:", error);
      showToast("Error submitting answers", "error");
    }
  }

  let showLogoutModal = false;

  function showModal() {
    showLogoutModal = true;
  }
</script>

<div class="container">
  <div class="assessment-descriptions">
    <button class="self-end logout-btn" on:click={showModal}
      ><CloseCircleSolid size="xl" class="text-[--secondary] " /></button
    >
    <p id="a-title">{assessmentData.title}</p>
    <div class="separator"></div>
    <p id="a-description">{@html assessmentData.description}</p>
    <div class="separator"></div>
    <p class="font-bold">
      Duration: <span style="color: var(--secondary)">
        {assessmentData.timeLimit}
      </span>
      minutes
    </p>
  </div>
</div>

<div class="questions-container">
  <div class="questions">
    {#each assessmentData.questions as question, index}
      <div
        bind:this={questionRefs[index]}
        class="question-wrapper"
        class:required-unanswered={question.required && !answers[index]}
      >
        {#if question.type === "Short Answer"}
          <div class="question-container">
            <p>{question.content}</p>
            <p class="required-marker">{question.required ? "*" : ""}</p>
          </div>
          <input
            type="text"
            bind:value={answers[index]}
            placeholder="Enter your answer"
          />
          <div class="separator"></div>
        {/if}

        {#if question.type === "Multiple Choice"}
          <div class="question-container">
            <p>{question.content}</p>
            <p class="required-marker">{question.required ? "*" : ""}</p>
          </div>
          {#each question.options as option, i}
            <label>
              <input
                type="radio"
                name={String(question.id)}
                bind:group={answers[index]}
                value={i}
              />
              {option}
            </label>
          {/each}
          <div class="separator"></div>
        {/if}

        {#if question.type === "Dropdown"}
          <div class="question-container">
            <p>{question.content}</p>
            <p class="required-marker">{question.required ? "*" : ""}</p>
          </div>
          <select bind:value={answers[index]}>
            {#each question.options as option, i}
              <option value={i}>{option}</option>
            {/each}
          </select>
          <div class="separator"></div>
        {/if}

        {#if question.type === "Checkboxes"}
          <div class="question-container">
            <p>{question.content}</p>
            <p class="required-marker">{question.required ? "*" : ""}</p>
          </div>
          {#each question.options as option, i}
            <label>
              <input
                type="checkbox"
                name={String(question.id)}
                value={i}
                on:change={() => handleCheckboxChange(index, i)}
              />
              {option}
            </label>
          {/each}
          <div class="separator"></div>
        {/if}

        {#if question.type === "Paragraph"}
          <div class="question-container">
            <p>{question.content}</p>
            <p class="required-marker">{question.required ? "*" : ""}</p>
          </div>
          <textarea
            bind:value={answers[index]}
            class="h-40"
            placeholder="Enter your answer"
          ></textarea>
          <div class="separator"></div>
        {/if}

        {#if question.type === "Date"}
          <div class="question-container">
            <p>{question.content}</p>
            <p class="required-marker">{question.required ? "*" : ""}</p>
          </div>
          <input type="date" bind:value={answers[index]} />
          <div class="separator"></div>
        {/if}

        {#if question.type === "Time"}
          <div class="question-container">
            <p>{question.content}</p>
            <p class="required-marker">{question.required ? "*" : ""}</p>
          </div>
          <input type="time" bind:value={answers[index]} />
          <div class="separator"></div>
        {/if}
      </div>
    {/each}
  </div>
  <button on:click={submitPopupToggle} id="submit-button">Submit</button>
</div>

{#if showLogoutModal}
  <div class="modal-container">
    <div class="modal">
      <p>Are you sure you want to log out?</p>
      <div class="modal-buttons">
        <button class="modal-button" on:click={logout}>Yes</button>
        <button class="modal-button" on:click={() => (showLogoutModal = false)}>
          No
        </button>
      </div>
    </div>
  </div>
{/if}

{#if submitPopup}
  <div class="modal-container">
    <div class="modal">
      <p>Are you sure you want to submit your answers?</p>
      <div class="modal-buttons">
        <button class="modal-button" on:click={submitAnswers}>Yes</button>
        <button class="modal-button" on:click={submitPopupToggle}>No</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    color: var(--text);
  }
  .assessment-descriptions {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    background-color: var(--background);
    backdrop-filter: blur(15px);
    box-shadow: var(--shadow);
    padding: 1.5rem;
    width: 100%;
    margin-top: 1rem;
    border-radius: 0.5rem;

    & #a-title {
      font-size: 1.5rem;
      font-weight: bold;
    }
    & p {
      font-size: 0.8rem;
    }
  }
  .separator {
    height: 2px;
    margin: 1rem 0;
    background-color: var(--border);
  }
  .questions-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
  }
  .questions {
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(1px);
    gap: 1rem;
    color: var(--text);
  }
  input[type="text"],
  input[type="date"],
  input[type="time"],
  select,
  textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background-color: var(--background);
    backdrop-filter: blur(20px);
  }
  input[type="radio"],
  input[type="checkbox"] {
    border: 1px solid var(--border);
    margin-right: 1rem;
    background-color: var(--background);
    &:checked {
      background-color: var(--secondary);
    }
  }

  #submit-button {
    align-self: center;
    padding: 1rem 2rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    color: var(--text);
    background-color: var(--background);
    cursor: pointer;
    margin-bottom: 4rem;
    transition:
      transform 0.2s,
      box-shadow 0.2s,
      background-color 0.2s;
    &:active {
      transform: translate(7px, 6px);
      box-shadow: none;
      background-color: var(--accent);
    }
  }
  .logout-btn {
    position: absolute;
    top: -1rem;
    right: -1rem;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--text);
    transform: scale(1.5);
    transition: color 0.2s;
    &:active {
      color: var(--accent);
    }
  }

  .modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(5px);
    color: var(--text);
    & .modal {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-inline: 2rem;
      padding: 2rem;
      border: 1px solid var(--border);
      background-color: var(--background-dark);
      box-shadow: var(--shadow);
      border-radius: 0.5rem;
      & p {
        font-size: 1rem;
      }

      & .modal-buttons {
        display: flex;
        margin-top: 1rem;
        justify-content: space-evenly;
        align-items: center;
      }

      & .modal-button {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        background-color: var(--background);
        cursor: pointer;
        transition:
          transform 0.2s,
          box-shadow 0.2s,
          background-color 0.2s;
        &:active {
          transform: translate(7px, 6px);
          box-shadow: none;
          background-color: var(--accent);
        }
      }
    }
  }

  .question-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 0.5rem;
    transition: background-color 0.5s ease;
    border-bottom: 1px solid var(--secondary);
  }

  .required-unanswered {
    background-color: rgba(100, 0, 0, 0.1);
  }

  .required-marker {
    color: var(--accent);
    font-weight: bold;
  }
</style>

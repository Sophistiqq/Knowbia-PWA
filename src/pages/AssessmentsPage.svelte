<script lang="ts">
  // AssessmentsPage

  import { onMount, onDestroy } from "svelte";

  function logout() {
    console.log("Logging out...");
    localStorage.removeItem("loggedInUser");
    showToast("Logged out successfully", "success");
    changePage("frontpage");
  }

  let userInfo = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  let warningMessage = "";
  let minimizationCount = 0;
  const maxMinimizations = 3; // Set the maximum number of allowed minimizations

  // Send the data to your server (you can use fetch to make an API call)
  const sendActivityToServer = (activity: string, user: any) => {
    fetch("http://localhost:3000/detection/detected", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity, user }),
    })
      .then((response) => response.json())
      .catch((error) => console.error("Error sending activity:", error));
  };

  onMount(() => {
    // Listen for visibility change events (this detects when the page is minimized or hidden)
    document.addEventListener("visibilitychange", handleVisibilityChange);
  });
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log("User pressed Home or switched apps");
      minimizationCount++;
      sendActivityToServer("home_or_recent_apps_pressed", userInfo);

      if (minimizationCount >= maxMinimizations) {
        warningMessage =
          "You have exceeded the maximum number of app minimizations allowed for this assessment. Your account has been locked out.";
        alert(warningMessage);
        // get the title of the assessment and set it in localStorage as locked
        localStorage.setItem("lockedAssessment", assessmentData.title);
        logout();
      } else {
        warningMessage = `Please don't minimize the app during the assessment! You have ${maxMinimizations - minimizationCount} remaining.`;
        alert(warningMessage);
      }
    } else {
      warningMessage = ""; // Clear the warning message
    }
  };

  onDestroy(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  import { CloseCircleSolid } from "flowbite-svelte-icons";
  export let changePage: (page: string) => void;
  export let showToast: (message: string, type: "success" | "error") => void;
  import { fly, slide } from "svelte/transition";
  import { cubicInOut } from "svelte/easing";

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
      answer: string | null; // Adjusted type
      options: string[];
      correctAnswers: number[];
      correctAnswer?: number; // For single answer questions
    }>;
  };
  console.log(assessmentData);

  // Create an array to store answers, typed as (string | number | null)[]
  let answers: (string | number | null | number[])[] = new Array(
    assessmentData.questions.length,
  ).fill(null);

  function handleCheckboxChange(index: number, value: number) {
    // Ensure answers[index] is initialized as an array if it isn't already
    if (!Array.isArray(answers[index])) {
      answers[index] = [];
    }

    const selected = answers[index] as number[];

    // Toggle selection
    if (selected.includes(value)) {
      selected.splice(selected.indexOf(value), 1);
    } else {
      selected.push(value);
    }

    answers[index] = selected;
  }

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const serverIp = window.location.hostname;
  const socket = new WebSocket(`ws://${serverIp}:8080/ws`);

  let submitPopup = false;
  function submitPopupToggle() {
    submitPopup = !submitPopup;
  }

  async function submitAnswers() {
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
          } else {
            console.log(
              `Q${question.id}: Correct Answer = ${question.answer}, My Answer = ${answer}`,
            );
          }
          break;

        case "Multiple Choice":
        case "Dropdown":
          if (typeof answer === "number") {
            if (answer === question.correctAnswer) {
              score++;
            } else {
              console.log(
                `Q${question.id}: Correct Answer = ${question.correctAnswer}, My Answer = ${question.options[answer]}`,
              );
            }
          } else {
            console.log(
              `Q${question.id}: My Answer is invalid. Answer = ${answer}`,
            );
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
            } else {
              console.log(
                `Q${question.id}: Correct Answer = ${question.correctAnswers.map((i) => question.options[i]).join(", ")}, ` +
                  `My Answer = ${selectedAnswers.map((i) => question.options[i]).join(", ")}`,
              );
            }
          } else {
            console.log(
              `Q${question.id}: Invalid answer format for Checkboxes`,
            );
          }
          break;

        default:
          console.log(
            `Q${question.id}: Unknown question type: ${question.type}`,
          );
      }
    });

    const resultData = {
      type: "studentResult",
      result: {
        studentNumber: loggedInUser.studentNumber,
        assessmentId: assessmentData.id,
        score: score,
        answers: answers,
      },
    };

    try {
      if (socket.readyState === WebSocket.OPEN) {
        await new Promise<void>((resolve, reject) => {
          socket.send(JSON.stringify(resultData));
          socket.onmessage = (event) => {
            const response = JSON.parse(event.data);
            if (response.type === "resultConfirmation") {
              resolve();
            } else {
              reject(new Error("Unexpected response type"));
            }
          };
          setTimeout(() => reject(new Error("Server response timeout")), 5000);
        });
        submitPopupToggle();
        showToast("Answers submitted successfully", "success");

        // Redirect to the frontpage and clear the answers
        changePage("frontpage");
        answers = new Array(assessmentData.questions.length).fill(null);
      } else {
        throw new Error("WebSocket is not open");
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
      showToast("Failed to submit answers", "error");
    }
  }

  let showLogoutModal = false;

  function showModal() {
    showLogoutModal = true;
  }
</script>

<div class="container" transition:fly={{ easing: cubicInOut }}>
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
      {#if question.type === "Short Answer"}
        <div class="question-container">
          <p>{question.content}</p>
          <p>{question.required ? "*" : ""}</p>
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
          <p>{question.required ? "*" : ""}</p>
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
          <p>{question.required ? "*" : ""}</p>
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
          <p>{question.required ? "*" : ""}</p>
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
          <p>{question.required ? "*" : ""}</p>
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
          <p>{question.required ? "*" : ""}</p>
        </div>
        <input type="date" bind:value={answers[index]} />
        <div class="separator"></div>
      {/if}

      {#if question.type === "Time"}
        <div class="question-container">
          <p>{question.content}</p>
          <p>{question.required ? "*" : ""}</p>
        </div>
        <input type="time" bind:value={answers[index]} />
        <div class="separator"></div>
      {/if}
    {/each}
  </div>
  <button on:click={submitPopupToggle} id="submit-button">Submit</button>
</div>

{#if showLogoutModal}
  <div class="modal-container" transition:slide={{ easing: cubicInOut }}>
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
  <div class="modal-container" transition:slide={{ easing: cubicInOut }}>
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

  .question-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }
</style>

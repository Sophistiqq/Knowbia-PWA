<script lang="ts">
  import { CloseCircleSolid } from "flowbite-svelte-icons";
  export let changePage: (page: string) => void;
  export let showToast: (message: string, type: "success" | "error") => void;
  import { fly, slide } from "svelte/transition";
  import { cubicInOut } from "svelte/easing";
  function logout() {
    localStorage.removeItem("loggedInUser");
    showToast("Logged out successfully", "success");
    changePage("frontpage");
  }

  export let assessmentData: {
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

  function submitAnswers() {
    let score = 0;

    assessmentData.questions.forEach((question, index) => {
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

    console.log(answers);
    alert(`Your score is ${score} out of ${assessmentData.questions.length}`);
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
        <p>{question.content}</p>
        <input
          type="text"
          bind:value={answers[index]}
          placeholder="Enter your answer"
        />
        <div class="separator"></div>
      {/if}

      {#if question.type === "Multiple Choice"}
        <p>{question.content}</p>
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
        <p>{question.content}</p>
        <select bind:value={answers[index]}>
          {#each question.options as option, i}
            <option value={i}>{option}</option>
          {/each}
        </select>
        <div class="separator"></div>
      {/if}

      {#if question.type === "Checkboxes"}
        <p>{question.content}</p>
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
        <p>{question.content}</p>
        <textarea
          bind:value={answers[index]}
          class="h-40"
          placeholder="Enter your answer"
        ></textarea>
        <div class="separator"></div>
      {/if}

      {#if question.type === "Date"}
        <p>{question.content}</p>
        <input type="date" bind:value={answers[index]} />
        <div class="separator"></div>
      {/if}

      {#if question.type === "Time"}
        <p>{question.content}</p>
        <input type="time" bind:value={answers[index]} />
        <div class="separator"></div>
      {/if}
    {/each}
  </div>
  <button on:click={submitAnswers} id="submit-button">Submit</button>
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

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
  }
  .assessment-descriptions {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 3px solid var(--text);
    background-color: var(--background-2);
    box-shadow: 7px 6px 0px var(--border);
    padding: 2rem;
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
    background-color: var(--text);
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
  }
  input[type="text"],
  input[type="date"],
  input[type="time"],
  select,
  textarea {
    width: 100%;
    padding: 0.5rem;
    border: 2px solid var(--text);
    border-radius: 0.5rem;
    background-color: var(--background-2);
    box-shadow: 7px 6px 0px var(--border);
  }
  input[type="radio"],
  input[type="checkbox"] {
    border: 2px solid var(--text);
    margin-right: 1rem;
    background-color: var(--background-2);
    &:checked {
      background-color: var(--secondary);
    }
  }

  #submit-button {
    align-self: center;
    padding: 1rem 2rem;
    border: 2px solid var(--text);
    border-radius: 0.5rem;
    color: var(--text);
    background-color: var(--secondary);
    box-shadow: 7px 6px 0px var(--border);
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

    & .modal {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-inline: 2rem;
      padding: 2rem;
      border: 3px solid var(--text);
      background-color: var(--background-2);
      box-shadow: 7px 6px 0px var(--border);
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
        border: 2px solid var(--text);
        border-radius: 0.5rem;
        background-color: var(--background-2);
        box-shadow: 7px 6px 0px var(--border);
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
</style>

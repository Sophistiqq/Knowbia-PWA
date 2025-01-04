<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { CloseCircleSolid } from "flowbite-svelte-icons";

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
    linearScaleStart?: number;
    linearScaleEnd?: number;
    linearScaleStep?: number;
  };

  type Answer = any;

  // User info and session management
  let userInfo = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  let host = window.location.hostname;
  let startTime: Date | null = null;

  // Assessment state
  let answers: Answer[] = new Array(assessmentData.questions.length).fill(null);
  let questionRefs: HTMLElement[] = [];
  let submitPopup = false;
  let showLogoutModal = false;

  // Anti-cheating measures
  let warningMessage = "";
  let minimizationCount = 0;
  const maxMinimizations = 3;

  // Props
  export let changePage: (page: string) => void;
  export let showToast: (message: string, type: "success" | "error") => void;

  // Initialize assessment
  onMount(() => {
    startTime = new Date();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    console.log("Assessment started for user:", userInfo);
  });

  onDestroy(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  // Anti-cheating functionality
  const handleVisibilityChange = () => {
    if (document.hidden) {
      minimizationCount++;
      if (minimizationCount >= maxMinimizations) {
        fetch(`http://${host}:3000/students/detected`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assessment_id: assessmentData.id,
            student_number: userInfo.student_number,
            student_name: userInfo.first_name + " " + userInfo.last_name,
            activity: "minimized",
          }),
        });
        console.log(userInfo.student_number);
        setTimeout(logout, 1500);
      } else {
        warningMessage = `Warning: Don't minimize the app! ${maxMinimizations - minimizationCount} attempts remaining.`;
        showToast(warningMessage, "error");
      }
    } else {
      warningMessage = "";
    }
  };

  // Validation
  function validateRequiredFields(): number[] {
    return assessmentData.questions.reduce(
      (invalid: number[], question, index) => {
        if (!question.required) return invalid;

        const answer = answers[index];
        let isValid = false;

        switch (question.type) {
          case "short_answer":
          case "essay":
            isValid = typeof answer === "string" && answer.trim() !== "";
            break;
          case "multiple_choice":
          case "true_false":
          case "linear_scale":
            isValid = answer !== null && answer !== undefined;
            break;
          case "ranking":
            isValid =
              Array.isArray(answer) &&
              answer.length === question.options?.length &&
              answer.every((val) => typeof val === "number");
            break;
        }

        if (!isValid) invalid.push(index);
        return invalid;
      },
      [],
    );
  }

  function focusFirstInvalidQuestion(index: number) {
    const element = questionRefs[index];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = element.querySelector("input, select, textarea");
      if (input) (input as HTMLElement).focus();
    }
  }

  // Submission handling
  function submitPopupToggle() {
    const invalidQuestions = validateRequiredFields();
    if (invalidQuestions.length > 0) {
      showToast("Please answer all required questions", "error");
      focusFirstInvalidQuestion(invalidQuestions[0]);
      return;
    }
    submitPopup = !submitPopup;
  }

  async function submitAnswers() {
    // Validate answers
    const invalidQuestions = validateRequiredFields();
    if (invalidQuestions.length > 0) {
      showToast("Please answer all required questions", "error");
      focusFirstInvalidQuestion(invalidQuestions[0]);
      return;
    }

    // Calculate time taken
    const endTime = new Date();
    const timeTaken = Math.round(
      (endTime.getTime() - startTime!.getTime()) / 1000,
    );
    let mistakes: any = [];
    // Calculate score
    const totalPoints = assessmentData.questions.reduce(
      (total, question, index) => {
        if (question.correctAnswers) {
          const correctAnswers = question.correctAnswers;
          const answer = answers[index];
          let points = 0;

          switch (question.type) {
            case "short_answer":
            case "essay":
              points = correctAnswers.includes(answer) ? question.points : 0;
              break;
            case "multiple_choice":
              points = correctAnswers.includes(answer) ? question.points : 0;
              break;
            case "true_false":
              points = correctAnswers.includes(String(answer))
                ? question.points
                : 0;
              break;
          }

          if (points === 0) {
            mistakes.push({
              question: question.question,
              answer,
              correctAnswers,
            });
          }

          return total + points;
        }

        return total;
      },
      0,
    );

    // declare variables
    let resultData = {
      assessment_id: assessmentData.id,
      student_number: userInfo.student_number,
      assessment: assessmentData,
      answers: answers,
      time_taken: timeTaken,
      total_points: totalPoints,
      mistakes: mistakes,
    };
    console.log(resultData);
    //console.table(resultData.answers);
    //console.table(assessmentData.questions);

    const res = await fetch(`http://${host}:3000/students/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resultData),
    });
    const data = await res.json();
    if (data.status === "success") {
      changePage("frontpage");
    }
    showToast(data.message, data.status);
  }

  // Navigation and UI
  function logout() {
    showToast("Logged out successfully", "success");
    changePage("frontpage");
  }

  function showModal() {
    showLogoutModal = true;
  }
</script>

<div class="container">
  <!-- Header section remains the same -->
  <div class="assessment-descriptions">
    <button class="self-end logout-btn" on:click={showModal}>
      <CloseCircleSolid size="xl" class="text-[--secondary]" />
    </button>
    <p id="a-title">{assessmentData.title}</p>
    <div class="separator"></div>
    <p id="a-description">{@html assessmentData.description}</p>
    <div class="separator"></div>
    <p class="font-bold">
      Duration: <span style="color: var(--secondary)"
        >{assessmentData.time_limit}</span
      > minutes
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
        <div class="question-container">
          <p>{question.question}</p>
          <p class="required-marker">{question.required ? "*" : ""}</p>
        </div>

        {#if question.type === "short_answer"}
          <input
            type="text"
            bind:value={answers[index]}
            placeholder="Enter your answer"
          />
        {:else if question.type === "multiple_choice"}
          {#each question.options || [] as option, i}
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
        {:else if question.type === "true_false"}
          <label>
            <input
              type="radio"
              name={String(question.id)}
              bind:group={answers[index]}
              value={true}
            />
            True
          </label>
          <label>
            <input
              type="radio"
              name={String(question.id)}
              bind:group={answers[index]}
              value={false}
            />
            False
          </label>
        {:else if question.type === "ranking"}
          <!-- Add drag and drop functionality later -->
          <select bind:value={answers[index]}>
            {#each question.options || [] as option, i}
              <option value={i}>{option}</option>
            {/each}
          </select>
        {:else if question.type === "essay"}
          <textarea
            bind:value={answers[index]}
            class="h-40"
            placeholder="Enter your answer"
          ></textarea>
        {:else if question.type === "linear_scale"}
          <div class="linear-scale">
            {#each Array(((question.linearScaleEnd || 5) - (question.linearScaleStart || 1)) / (question.linearScaleStep || 1) + 1) as _, i}
              {@const value =
                (question.linearScaleStart || 1) +
                i * (question.linearScaleStep || 1)}
              <label>
                <input
                  type="radio"
                  name={String(question.id)}
                  bind:group={answers[index]}
                  {value}
                />
                {value}
              </label>
            {/each}
          </div>
        {/if}

        {#if question.hint}
          <p class="hint">{question.hint}</p>
        {/if}

        <div class="separator"></div>
      </div>
    {/each}
  </div>
  <button on:click={submitPopupToggle} id="submit-button">Submit</button>
</div>

<!-- Modals remain the same -->
{#if showLogoutModal}
  <div class="modal-container">
    <div class="modal">
      <p>Are you sure you want to log out?</p>
      <div class="modal-buttons">
        <button class="modal-button" on:click={logout}>Yes</button>
        <button class="modal-button" on:click={() => (showLogoutModal = false)}
          >No</button
        >
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

<style lang="scss">
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
    background-color: var (--background);
    backdrop-filter: blur(15px);
    box-shadow: var(--shadow);
    padding: 1.5rem;
    width: 100%;
    margin-top: 1rem;

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
  select,
  textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border);
    background-color: var(--background);
    backdrop-filter: blur(20px);
  }
  input[type="radio"] {
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
    transition: background-color 0.5s ease;
    border-bottom: 1px solid var(--secondary);
  }

  .required-marker {
    color: var(--accent);
    font-weight: bold;
  }
  .linear-scale {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin: 1rem 0;
  }

  .hint {
    font-style: italic;
    color: #666;
    margin-top: 0.5rem;
    font-size: 0.9em;
  }
</style>

<script lang="ts">
  export let changePage: (page: string) => void;
  export let showToast: (message: string, type: "success" | "error") => void;

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

      // Check if the answer is correct and log the correct vs. user's answer
      if (question.type === "Short Answer") {
        if (answer === question.answer) {
          score++;
        } else {
          console.log(
            `Q${question.id}: Correct Answer = ${question.answer}, My Answer = ${answer}`,
          );
        }
      }

      if (question.type === "Multiple Choice") {
        // Check if the answer is valid
        if (typeof answer === "number") {
          // Check if the answer is correct
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
      }

      if (question.type === "Dropdown") {
        // Check if the answer is valid
        if (typeof answer === "number") {
          // Check if the answer is correct
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
      }

      if (question.type === "Checkboxes") {
        const selectedAnswers = answer as number[];
        if (
          selectedAnswers.length === question.correctAnswers.length &&
          selectedAnswers.every((ans) => question.correctAnswers.includes(ans))
        ) {
          score++;
        } else {
          console.log(
            `Q${question.id}: Correct Answer = ${question.correctAnswers.join(", ")}, My Answer = ${selectedAnswers.join(", ")}`,
          );
        }
      }

      // Additional checks for other types
      if (["Paragraph", "Date", "Time"].includes(question.type)) {
        if (answer === question.answer) {
          score++;
        } else {
          console.log(
            `Q${question.id}: Correct Answer = ${question.answer}, My Answer = ${answer}`,
          );
        }
      }
    });

    console.log(answers);
    alert(`Your score is ${score}`);
  }
</script>

<div class="container">
  <button class="self-end" on:click={logout}>Logout</button>
  <div class="assessment-descritions">
    <p style="color: var(--accent);">{assessmentData.title}</p>
    <div class="separator"></div>
    <p>{@html assessmentData.description}</p>
    <div class="separator"></div>
    <p>
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
        <p>{question.id}: {question.content}</p>
        <input
          type="text"
          bind:value={answers[index]}
          placeholder="Enter your answer"
        />
        <div class="separator"></div>
      {/if}

      {#if question.type === "Multiple Choice"}
        <p>{question.id}: {question.content}</p>
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
        <p>{question.id}: {question.content}</p>
        <select bind:value={answers[index]}>
          {#each question.options as option, i}
            <option value={i}>{option}</option>
          {/each}
        </select>
        <div class="separator"></div>
      {/if}

      {#if question.type === "Checkboxes"}
        <p>{question.id}: {question.content}</p>
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
        <p>{question.id}: {question.content}</p>
        <textarea
          bind:value={answers[index]}
          class="h-40"
          placeholder="Enter your answer"
        ></textarea>
        <div class="separator"></div>
      {/if}

      {#if question.type === "Date"}
        <p>{question.id}: {question.content}</p>
        <input type="date" bind:value={answers[index]} />
        <div class="separator"></div>
      {/if}

      {#if question.type === "Time"}
        <p>{question.id}: {question.content}</p>
        <input type="time" bind:value={answers[index]} />
        <div class="separator"></div>
      {/if}
    {/each}
  </div>
  <button on:click={submitAnswers}>Submit</button>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
  }
  .assessment-descritions {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    background-color: var(--background);
    padding: 1rem;
    border-radius: 0.5rem;
  }
  .separator {
    height: 1px;
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
    gap: 1rem;
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
  }
  input[type="radio"],
  input[type="checkbox"] {
    margin-right: 1rem;
    background-color: var(--background);
    &:checked {
      background-color: var(--accent);
    }
  }
</style>

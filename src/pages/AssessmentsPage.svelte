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
      answer: string;
      options: string[];
      correctAnswers: number[];
      correctAnswer?: number;
    }>;
  };

  let answers: string[] = [];
  let questions = assessmentData.questions;

  function submitAnswers() {
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].type === "Short Answer") {
        if (questions[i].answer === answers[i]) {
          score++;
        }
      }
    }
    console.log(score);
  }
</script>

<div class="container">
  <button class="self-end" on:click={logout}>Logout</button>
  <h1>Assessments</h1>
  <div class="assessment-descritions">
    <p style="color: var(--accent);">{assessmentData.title}</p>
    <div class="separator"></div>
    <p>{@html assessmentData.description}</p>
    <div class="separator"></div>
    <p>
      Duration: <span style="color: var(--secondary)">
        {assessmentData.timeLimit}
      </span>
    </p>
  </div>
</div>

<div class="questions-container">
  <div class="questions">
    {#each assessmentData.questions as question, index}
      {#if question.type === "Short Answer"}
        <p>{question.id}: {question.content}</p>
        <input type="text" placeholder="Enter your answer" />

        <div class="separator"></div>
      {/if}

      {#if question.type === "Multiple Choice"}
        <p>{question.id}: {question.content}</p>
        {#each question.options as option, i}
          <label>
            <input type="radio" name={String(question.id)} value={i} />
            {option}
          </label>
        {/each}
        <div class="separator"></div>
      {/if}

      <!-- Dropdown -->
      {#if question.type === "Dropdown"}
        <p>{question.id}: {question.content}</p>
        <select>
          {#each question.options as option, i}
            <option value={i}>{option}</option>
          {/each}
        </select>
        <div class="separator"></div>
      {/if}

      <!-- Checkboxes -->
      {#if question.type === "Checkboxes"}
        <p>{question.id}: {question.content}</p>
        {#each question.options as option, i}
          <label>
            <input type="checkbox" name={String(question.id)} value={i} />
            {option}
          </label>
        {/each}
        <div class="separator"></div>
      {/if}

      <!-- Paragraph -->
      {#if question.type === "Paragraph"}
        <p>{question.id}: {question.content}</p>
        <textarea class="h-40" placeholder="Enter your answer"></textarea>
        <div class="separator"></div>
      {/if}

      <!-- Date -->
      {#if question.type === "Date"}
        <p>{question.id}: {question.content}</p>
        <input type="date" />
        <div class="separator"></div>
      {/if}

      {#if question.type === "Time"}
        <p>{question.id}: {question.content}</p>
        <input type="time" />
        <div class="separator"></div>
      {/if}
    {/each}
  </div>
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

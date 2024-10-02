<script lang="ts">
  export let changePage: (page: string) => void;
  function logout() {
    localStorage.removeItem("loggedInUser");
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
</script>

<div class="container">
  <button on:click={logout}>Logout</button>
  <h1>Assessments</h1>
  <div class="assessment-descritions">
    <p>{assessmentData.title}</p>
    <div class="separator"></div>
    <p>{@html assessmentData.description}</p>
    <div class="separator"></div>
    <p>Time Limit:</p>
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
    background-color: var(--border);
    margin: 1rem 0;
  }
</style>

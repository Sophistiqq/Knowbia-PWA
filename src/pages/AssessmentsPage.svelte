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
  // example data
  //{
  //  "title": "Test Assessment",
  //  "description": "<p>This is the description with Text controls such as <strong>Bold, </strong><u>Underline,</u> and <em>Italic</em></p>",
  //  "questions": [
  //    {
  //      "id": 1,
  //      "type": "Short Answer",
  //      "content": "Short Answer's Question",
  //      "required": true,
  //      "answer": "Short Answer's Answer",
  //      "options": [],
  //      "correctAnswers": []
  //    },
  //    {
  //      "id": 2,
  //      "type": "Paragraph",
  //      "content": "Multiple Choice Question",
  //      "required": true,
  //      "answer": "This is an Answer to the Paragraph",
  //      "options": [],
  //      "correctAnswers": []
  //    },
  //    {
  //      "id": 3,
  //      "type": "Multiple Choice",
  //      "content": "Multiple Choice Question",
  //      "required": true,
  //      "answer": "",
  //      "options": [
  //        "Choice 1",
  //        "Choice 2",
  //        "Choice 3",
  //        "Correct Answer"
  //      ],
  //      "correctAnswers": [],
  //      "correctAnswer": 3
  //    },
  //    {
  //      "id": 4,
  //      "type": "Dropdown",
  //      "content": "Dropdown Question",
  //      "required": true,
  //      "answer": "",
  //      "options": [
  //        "Option 1",
  //        "Option 2",
  //        "Correct Answer",
  //        "Option 4"
  //      ],
  //      "correctAnswer": 2,
  //      "correctAnswers": []
  //    },
  //    {
  //      "id": 5,
  //      "type": "Checkboxes",
  //      "content": "Checkboxes Question",
  //      "required": true,
  //      "answer": "",
  //      "options": [
  //        "Option 1",
  //        "Correct Answer",
  //        "Option 3",
  //        "Option 4"
  //      ],
  //      "correctAnswers": [
  //        1
  //      ]
  //    },
  //    {
  //      "id": 6,
  //      "type": "Date",
  //      "content": "Date ",
  //      "required": true,
  //      "answer": "2001-02-09",
  //      "options": [],
  //      "correctAnswers": []
  //    },
  //    {
  //      "id": 7,
  //      "type": "Time",
  //      "content": "Time",
  //      "required": true,
  //      "answer": "12:23",
  //      "options": [],
  //      "correctAnswers": []
  //    }
  //  ]
  //}
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

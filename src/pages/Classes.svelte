<div class="classes-wrapper">
  <h1>Classes</h1>
  <!-- The classes page content goes here -->
  <!-- The classes have contents like how google classroom ui's -->

  <div class="class">
    <div class="subject">Subject Name</div>
    <div class="description">Description of the subject</div>
    <div class="profName">Professor's name</div>
  </div>
</div>

<style>
  .classes-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: var(--text);
  }
  h1 {
    font-size: 2rem;
    font-weight: 700;
  }
  .class {
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(4px);
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 2px 2px 2px var(--shadow);
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }
</style>

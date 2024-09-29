<script lang="ts">
  export let navigate: (page: string) => void;
  import { Tooltip } from "flowbite-svelte";
  import {
    GridOutline,
    FilePenOutline,
    BookOutline,
    UsersGroupOutline,
    AngleLeftOutline,
    AngleRightOutline,
  } from "flowbite-svelte-icons";
  import { onMount } from "svelte";

  // Track if sidebar is collapsed
  let sidebarHidden = false;

  // Load sidebar state from localStorage on component mount
  onMount(() => {
    const savedState = localStorage.getItem("sidebarHidden");
    sidebarHidden = savedState === "true"; // Parse the saved state
  });

  // Save sidebar state to localStorage when it changes
  function toggleSidebar() {
    sidebarHidden = !sidebarHidden;
    localStorage.setItem("sidebarHidden", sidebarHidden.toString()); // Save the state
  }
</script>

<div class="sidebar {sidebarHidden ? 'collapsed' : ''}">
  <div class="buttons-container">
    <div class="navigation-buttons">
      <button on:click={() => navigate("dashboard")} id="dashboard">
        <GridOutline class="w-10 h-10" />
        <span class="text {sidebarHidden ? 'hidden' : ''}">Dashboard</span>
      </button>
      <Tooltip triggeredBy="#dashboard" placement="right"
        >See everything!</Tooltip
      >

      <button on:click={() => navigate("classes")} id="classes">
        <BookOutline class="w-10 h-10" />
        <span class="text {sidebarHidden ? 'hidden' : ''}">Classes</span>
      </button>
      <Tooltip triggeredBy="#classes" placement="right">Manage classes!</Tooltip
      >

      <button on:click={() => navigate("quizzes")} id="quizzes">
        <FilePenOutline class="w-10 h-10" />
        <span class="text {sidebarHidden ? 'hidden' : ''}">Assessments</span>
      </button>
      <Tooltip triggeredBy="#quizzes" placement="right">Create quizzes!</Tooltip
      >

      <button on:click={() => navigate("studentsInfo")} id="studentsInfo">
        <UsersGroupOutline class="w-10 h-10" />
        <span class="text {sidebarHidden ? 'hidden' : ''}">Student's Info</span>
      </button>
      <Tooltip triggeredBy="#studentsInfo" placement="right"
        >View students!</Tooltip
      >
    </div>
  </div>

  <div class="sidebarControl">
    <button id="sidebarControl" on:click={toggleSidebar}>
      {#if sidebarHidden}
        <AngleRightOutline />
      {:else}
        <AngleLeftOutline />
      {/if}
    </button>
    <Tooltip placement="right">Toggle Sidebar</Tooltip>
  </div>
</div>

<style lang="scss">
  .sidebar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    height: calc(100vh - 8rem);
    color: var(--text);
    z-index: 100;
    width: 15rem; /* Full width when expanded */
    transition: width 0.3s ease-in-out; /* Smooth transition for width */
    white-space: nowrap;
    overflow: hidden;
  }
  .collapsed {
    width: 5.6rem; /* Collapsed width */
  }
  .navigation-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  button {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    color: var(--text);
    font-weight: 600;
    border: 0.5px solid var(--border);
    cursor: pointer;
    &:hover {
      border-color: var(--primary);
      background-color: rgba(255, 255, 255, 0.1);
    }
    &:active {
      background-color: var(--accent-blur);
    }
  }
  .text {
    transition: opacity 0.3s ease;
  }
  .hidden {
    opacity: 0;
    visibility: hidden;
    width: 0;
  }
  .sidebarControl {
    display: flex;
  }
</style>

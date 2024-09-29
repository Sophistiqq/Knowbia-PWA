<script lang="ts">
  import NavBar from "../components/NavBar.svelte";
  import { Classes, Quizzes, StudentsInfo, Dashboard } from "../pages/";
  import "../assets/tailwind.css";
  import TopBar from "../components/TopBar.svelte";

  const pages: any = {
    classes: Classes,
    quizzes: Quizzes,
    studentsInfo: StudentsInfo,
    dashboard: Dashboard,
  };

  let currentPage = "classes";

  function navigate(page: string) {
    currentPage = page;
  }

  export let logout: () => void;
</script>

<TopBar {logout} />
<div class="container">
  <NavBar {navigate} />
  <main class="screen">
    <svelte:component this={pages[currentPage]} />
  </main>
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
  }
  .screen {
    flex: 1;
    padding: 1rem;
  }
</style>

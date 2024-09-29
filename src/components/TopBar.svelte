<script lang="ts">
  import {
    Avatar,
    Dropdown,
    DropdownHeader,
    DropdownItem,
    DropdownDivider,
    DarkMode,
  } from "flowbite-svelte";

  import { SunSolid, MoonSolid } from "flowbite-svelte-icons";
  export let logout: () => void;
  
  let userData: any = localStorage.getItem("user");
  // Retrieve user info from localStorage
  let user = JSON.parse(userData) 
  import "../assets/tailwind.css";
</script>

<nav class="nav">
  <h1 class="brand">Knowbia</h1>
  <div class="buttons-container flex flex-row gap-2">
    <DarkMode class="dark:text-primary-600 border dark:border-gray-800 z-50">
      <SunSolid slot="lightIcon" color="yellow" />
      <MoonSolid slot="darkIcon" />
    </DarkMode>
    <Avatar class="cursor-pointer" id="user-drop" />
    <Dropdown triggeredBy="#user-drop" class="shadow-sm">
      <DropdownHeader>
        <span class="block text-sm">{user.firstname} {user.lastname}</span>
        <span class="block truncate text-sm font-medium">{user.email}</span>
      </DropdownHeader>
      <DropdownItem>Dashboard</DropdownItem>
      <DropdownItem>Settings</DropdownItem>
      <DropdownItem>Earnings</DropdownItem>
      <DropdownDivider />
      <DropdownItem on:click={logout}>Sign out</DropdownItem>
    </Dropdown>
  </div>
</nav>

<style lang="scss">
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    height: 4rem;
    background-color: var(--background);
    color: var(--text);
    border-bottom: 1px solid var(--border);
  }
  .brand {
    font-size: 1.5rem;
    font-weight: 700;
  }
</style>

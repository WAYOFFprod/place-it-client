<script lang="ts">

let isOpen = false;
const entries = [
  {
    time: "09:20",
    user: "User 1",
    respondTo: "user 2",
    message: "hello!"
  },
  {
    time: "09:20",
    user: "User 2",
    message: "hello!"
  },
  {
    time: "09:20",
    user: "User 1",
    message: "hello!"
  },
  {
    time: "09:20",
    user: "User 2",
    message: "hello!"
  },
  {
    time: "09:20",
    user: "User 1",
    respondTo: "user 2",
    message: "This is a really long message to see how the chat responds"
  },
  {
    time: "09:20",
    user: "this is a really long username",
    message: "hello!"
  },
  {
    time: "09:20",
    user: "User 1",
    message: "hello!"
  },
  {
    time: "09:20",
    user: "User 2",
    message: "hello!"
  },
  {
    time: "09:20",
    user: "User 2",
    message: "hello!"
  }
]
</script>
<div class="chat border-2 border-black rounded bg-off-white flex flex-col overflow-hidden pointer-events-auto {$$props.class}">
  <!-- chat window -->
  <div class="h-full px-4">
    <button type="button" on:click={() => isOpen = !isOpen} class="flex justify-between items-center h-12 uppercase w-full">
      <h3>chat</h3>
      <button type="button" ><img src="/svg/chevron-down.svg" alt="down icon"/></button>
    </button>
      <!-- sroll area -->
    <div class="{isOpen ? 'max-h-32 pt-2': 'max-h-0 pt-0'} overflow-y-scroll pr-3 -mr-2">
      {#each entries as entry}
      <div class="flex items-start gap-2 pb-1">
        <span class="text-md font-normal w-6 shrink-0 pt-0.5">{entry.time}</span>
        <span class="text-lg font-bold max-w-20 overflow-hidden text-ellipsis whitespace-nowrap shrink-0">{entry.user}</span>
        
        <div class="relative text-md font-normal grow">
          
          <span class="text-lg font-bold pr-1">
            {#if entry.respondTo}
              @{entry.respondTo}
            {/if}
          </span>
          <span class="pt-0.5">{entry.message}</span>
        </div>
        <button class="w-fit shrink-0 cursor-not-allowed" disabled><img class="w-4 self-end" src="/svg/heart.svg" alt="favorit"/></button>
        <button class="w-fit shrink-0"><img class="w-4 self-end" src="/svg/reply.svg" alt="reply"/></button>
      </div>
      {/each}
    </div>
  </div>
  <!-- typing area -->
   <div class="h-10 rounded-b border-t-2 border-black">
      <input class="placeholder:text-black px-4 h-10 w-full bg-off-white" placeholder="Ecrire un message..." />
   </div>
</div>
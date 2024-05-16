<template>
  <!-- <profileInfo :user="user" /> -->
  <h1>{{ msg }}</h1>
  <!-- Conditional rendering approach -->
  <div class="card">

    <button type="button" @click="count--">count is {{ count }}</button>
    <div v-if="isCountZero" class="black-screen">
      Display a black screen when 0

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
// import profileInfo from './profileInfo.vue';

// const user = ref('astudent'); // pick the user from the login info
defineProps<{ msg: string }>() // its like the vars in a c++ class, the name and type in app.vue ill call the "constructor" <HelloWorld msg="Are you ready?!" /> like HelloWorld("Are you ready?!");
const count = ref(42)
const isCountZero = computed(() => count.value === 0);
</script>

<style scoped></style>

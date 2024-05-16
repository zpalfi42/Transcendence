<template>
	<div v-if="isLoading" class="spinner">
		<p>Loading...</p>
	</div>
</template>

<script setup lang="ts">

const props = defineProps({
	isLoading: Boolean
});
</script>

<style>
/* Your styles here */
</style>

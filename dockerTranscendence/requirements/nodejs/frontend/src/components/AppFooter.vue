<template>
	<footer>
		<p>● withLove by (っ◔◡◔)っ notTheWorstTeam&copy; {{ year }} ●</p>
	</footer>
</template>
<script lang="ts">
import { computed } from 'vue'
export default {
	setup() {
		const year = computed(() => new Date().getFullYear())
		return { year }
	}
}
</script>
<style scoped></style>